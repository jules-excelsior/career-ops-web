import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function getSessionUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const { data: { user } } = await supabase.auth.getUser(token)
  return user || null
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { job_id, user_id } = await req.json()
    if (user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: job } = await supabase.from('career_jobs').select('jd_text, role, company').eq('id', job_id).eq('user_id', user_id).single()
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const { data: profile } = await supabase.from('career_profiles').select('skills, resume_text, target_role').eq('user_id', user_id).single()

    const resumeExcerpt = profile?.resume_text?.substring(0, 2000) || ''
    const candidateSkills = profile?.skills?.join?.(', ') || ''
    const jdText = (job.jd_text || '').substring(0, 1500)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY!}` },
      body: JSON.stringify({
        model: 'deepseek-chat', max_tokens: 1500,
        messages: [
          { role: 'system', content: 'Analyze the skills gap between a candidate and a job. Return ONLY a JSON object:\n{"match_percent":85,"matching_skills":["skill1","skill2"],"missing_skills":["skill3","skill4"],"nice_to_have":["skill5"],"recommendation":"brief advice","learning_resources":["suggestion1","suggestion2"]}' },
          { role: 'user', content: `Candidate Skills: ${candidateSkills}\nResume: ${resumeExcerpt}\n\nJob: ${job.role} at ${job.company}\nDescription: ${jdText}\n\nAnalyze the skills gap.` },
        ],
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: 'Service unavailable' }, { status: 500 })
    const text = data.choices?.[0]?.message?.content || ''
    let parsed: any = null
    try { parsed = JSON.parse(text.trim()) } catch {}
    if (!parsed) { try { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]) } catch {} }

    if (!parsed) return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    return NextResponse.json(parsed)
  } catch (e: any) {
    if (e.name === 'AbortError') return NextResponse.json({ error: 'Request timed out' }, { status: 504 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
