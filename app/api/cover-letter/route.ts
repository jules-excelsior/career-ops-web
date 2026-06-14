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

    const { data: profile } = await supabase.from('career_profiles').select('name, target_role, skills, resume_text').eq('user_id', user_id).single()

    const resumeExcerpt = profile?.resume_text?.substring(0, 1500) || ''
    const name = profile?.name || 'Applicant'
    const skills = profile?.skills?.join?.(', ') || ''

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY!}` },
      body: JSON.stringify({
        model: 'deepseek-chat', max_tokens: 2000,
        messages: [
          { role: 'system', content: 'You are a professional cover letter writer. Write a concise, compelling cover letter based on the candidate profile and job description. Use a professional tone. Include: opening hook, 2-3 body paragraphs matching skills to job requirements, closing with call to action. Maximum 350 words. Sign as the candidate name.' },
          { role: 'user', content: `Candidate: ${name}\nSkills: ${skills}\nResume: ${resumeExcerpt}\n\nJob: ${job.role} at ${job.company}\nDescription: ${(job.jd_text || '').substring(0, 1500)}\n\nWrite a tailored cover letter for this job.` },
        ],
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: 'Service unavailable' }, { status: 500 })
    const letter = data.choices?.[0]?.message?.content || ''

    return NextResponse.json({ letter })
  } catch (e: any) {
    if (e.name === 'AbortError') return NextResponse.json({ error: 'Request timed out' }, { status: 504 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
