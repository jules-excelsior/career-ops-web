import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { jd_text, job_id, user_id } = await req.json()
    if (!jd_text?.trim()) return NextResponse.json({ error: 'Job description required' }, { status: 400 })
    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 1500,
        system: `You are a senior HR consultant evaluating job offers. Return ONLY valid JSON: {"grade":"A|B|C|D|F","score":0.0,"company":"string","role":"string","location":"string","salary_range":"string or null","role_summary":"string","cv_match":"string","green_flags":"string","red_flags":"string","compensation":"string","recommendation":"string"}. Grading: A=4.5-5, B=3.5-4.4, C=2.5-3.4, D=1.5-2.4, F=0-1.4. No markdown.`,
        messages: [{ role: 'user', content: `Evaluate this job:\n\n${jd_text}` }],
      }),
    })
    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    let parsed: any
    try { parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) }
    catch { return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 }) }

    const { data: evaluation, error: evalError } = await supabase
      .from('career_evaluations')
      .insert({ job_id, user_id, grade: parsed.grade, score: parsed.score, role_summary: parsed.role_summary, cv_match: parsed.cv_match, green_flags: parsed.green_flags, red_flags: parsed.red_flags, compensation: parsed.compensation, recommendation: parsed.recommendation, raw_response: text })
      .select().single()

    if (evalError) return NextResponse.json({ error: evalError.message }, { status: 500 })

    await supabase.from('career_jobs').update({ company: parsed.company || 'Unknown', role: parsed.role || 'Unknown', location: parsed.location || null, salary_range: parsed.salary_range || null }).eq('id', job_id)

    return NextResponse.json({ evaluation, parsed })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
