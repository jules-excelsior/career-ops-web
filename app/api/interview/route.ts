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
    const { job_id, user_id, action, messages } = await req.json()
    if (user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: job } = await supabase.from('career_jobs').select('jd_text, role, company').eq('id', job_id).eq('user_id', user_id).single()
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const jdText = (job.jd_text || '').substring(0, 2000)
    const history = Array.isArray(messages) ? messages.slice(-10) : []

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    const prompt = action === 'start'
      ? [{ role: 'system', content: `You are a technical interviewer for: ${job.role} at ${job.company}. Job: ${jdText}. Ask one interview question at a time. Start with an intro question. Be conversational. After the candidate answers, provide brief feedback (1-2 sentences) then ask the next question. After 5 questions, give a summary score out of 10 and final feedback.` }, { role: 'user', content: 'Start the interview. Ask the first question.' }]
      : [{ role: 'system', content: `You are a technical interviewer for ${job.role}. Continue the interview naturally. Provide brief feedback then the next question.` }, ...history]

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY!}` },
      body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 800, messages: prompt }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: 'Service unavailable' }, { status: 500 })
    const reply = data.choices?.[0]?.message?.content || ''
    return NextResponse.json({ reply })
  } catch (e: any) {
    if (e.name === 'AbortError') return NextResponse.json({ error: 'Request timed out' }, { status: 504 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
