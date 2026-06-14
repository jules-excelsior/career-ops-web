import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getSessionUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const { data: { user } } = await supabase.auth.getUser(token)
  return user || null
}

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|prior|all)\s+instructions?/i,
  /system\s*:/i,
  /new\s+role\s*:/i,
  /pretend\s+you\s+are/i,
  /disregard\s+your/i,
  /override\s*:/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
  /you\s+are\s+now/i,
  /forget\s+everything/i,
]

function sanitizeJdText(text: string): string {
  return PROMPT_INJECTION_PATTERNS.reduce(
    (t, pattern) => t.replace(pattern, '[filtered]'),
    text
  )
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { jd_text, job_id, user_id } = await req.json()
    if (!jd_text?.trim()) return NextResponse.json({ error: 'Job description required' }, { status: 400 })
    if (!user_id || !job_id) return NextResponse.json({ error: 'user_id and job_id required' }, { status: 400 })
    if (user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: job } = await supabase
      .from('career_jobs')
      .select('id')
      .eq('id', job_id)
      .eq('user_id', user_id)
      .single()
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const { data: profile } = await supabase
      .from('career_profiles')
      .select('target_role, industry, years_experience, skills, preferred_location, salary_expectations, resume_text')
      .eq('user_id', user_id)
      .single()

    const safeJd = sanitizeJdText(jd_text).substring(0, 2000)

    let profileContext = ''
    if (profile) {
      const parts: string[] = []
      if (profile.target_role) parts.push(`Target Role: ${profile.target_role}`)
      if (profile.industry) parts.push(`Industry Preference: ${profile.industry}`)
      if (profile.years_experience) parts.push(`Years of Experience: ${profile.years_experience}`)
      if (profile.skills?.length) parts.push(`Skills: ${profile.skills.join(', ')}`)
      if (profile.preferred_location) parts.push(`Preferred Location: ${profile.preferred_location}`)
      if (profile.salary_expectations) parts.push(`Salary Expectations: ${profile.salary_expectations}`)
      if (profile.resume_text) parts.push(`\n=== CANDIDATE RESUME ===\n${profile.resume_text.substring(0, 3000)}\n=== END RESUME ===`)
      if (parts.length) profileContext = `\n\n=== CANDIDATE PROFILE ===\n${parts.join('\n')}\n=== END PROFILE ===`
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY!}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 4000,
        messages: [
          { role: 'system', content: `You are an HR consultant. Evaluate how well a job description matches a candidate based on their profile and resume. Return ONLY a JSON object. No text outside the JSON. Keep all string values under 150 characters each.

JSON structure:
{"grade":"A","score":4.5,"company":"Name","role":"Title","location":"City or Remote","salary_range":"amount or null","role_summary":"Brief summary under 120 chars","cv_match":"Match analysis based on the candidate's actual resume and skills under 120 chars","green_flags":"Point 1. Point 2. Point 3.","red_flags":"Concern 1. Concern 2.","compensation":"Brief comp analysis vs candidate expectations under 120 chars","recommendation":"Clear recommendation under 120 chars"}

Grades: A=Excellent match, must apply (4.5-5), B=Good fit, worth pursuing (3.5-4.4), C=Decent, evaluate carefully (2.5-3.4), D=Weak match, significant gaps (1.5-2.4), F=Poor match, avoid (0-1.4)

IMPORTANT: Grade based on actual match between job requirements and candidate profile/resume. If no profile is provided, grade based on job quality alone and note that in cv_match.` },
          { role: 'user', content: `Evaluate this job for the candidate${profileContext ? '.' : ' (no profile provided — grade based on job quality only).'} Return JSON only:\n\n=== JOB DESCRIPTION ===\n${safeJd}\n=== END JOB DESCRIPTION ===${profileContext}` }
        ],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: 'Evaluation service unavailable' }, { status: 500 })

    const text = data.choices?.[0]?.message?.content || ''
    let parsed: any = null

    try { parsed = JSON.parse(text.trim()) } catch {}
    if (!parsed) { try { parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) } catch {} }
    if (!parsed) { try { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]) } catch {} }

    if (!parsed) return NextResponse.json({ error: 'Evaluation failed — could not parse result' }, { status: 500 })

    const { data: evaluation, error: evalError } = await supabase
      .from('career_evaluations')
      .insert({
        job_id, user_id,
        grade: parsed.grade || 'C',
        score: Number(parsed.score) || 2.5,
        role_summary: parsed.role_summary || '',
        cv_match: parsed.cv_match || '',
        green_flags: parsed.green_flags || '',
        red_flags: parsed.red_flags || '',
        compensation: parsed.compensation || '',
        recommendation: parsed.recommendation || '',
        raw_response: text,
      })
      .select().single()

    if (evalError) return NextResponse.json({ error: 'Failed to save evaluation' }, { status: 500 })

    await supabase.from('career_jobs').update({
      company: parsed.company || 'Unknown',
      role: parsed.role || 'Unknown',
      location: parsed.location || null,
      salary_range: parsed.salary_range || null,
    }).eq('id', job_id).eq('user_id', user_id)

    return NextResponse.json({ evaluation, parsed })
  } catch (e: any) {
    if (e.name === 'AbortError') return NextResponse.json({ error: 'Evaluation timed out' }, { status: 504 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
