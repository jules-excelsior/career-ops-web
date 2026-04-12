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
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: `You are an HR consultant. Evaluate job descriptions. Return ONLY a JSON object. No text outside the JSON. Keep all string values under 150 characters each.

JSON structure:
{"grade":"A","score":4.5,"company":"Name","role":"Title","location":"City or Remote","salary_range":"amount or null","role_summary":"Brief summary under 120 chars","cv_match":"Match analysis under 120 chars","green_flags":"Point 1. Point 2. Point 3.","red_flags":"Concern 1. Concern 2.","compensation":"Brief comp analysis under 120 chars","recommendation":"Clear recommendation under 120 chars"}

Grades: A=4.5-5, B=3.5-4.4, C=2.5-3.4, D=1.5-2.4, F=0-1.4`,
        messages: [{ role: 'user', content: `Evaluate this job and return JSON only:\n\n${jd_text.substring(0, 2000)}` }],
      }),
    })

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: `API error: ${data.error.message}` }, { status: 500 })

    const text = data.content?.[0]?.text || ''
    let parsed: any = null

    try { parsed = JSON.parse(text.trim()) } catch {}
    if (!parsed) { try { parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) } catch {} }
    if (!parsed) { try { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]) } catch {} }

    if (!parsed) return NextResponse.json({ error: `Parse failed. Raw: ${text.substring(0, 300)}` }, { status: 500 })

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

    if (evalError) return NextResponse.json({ error: `DB: ${evalError.message}` }, { status: 500 })

    await supabase.from('career_jobs').update({
      company: parsed.company || 'Unknown',
      role: parsed.role || 'Unknown',
      location: parsed.location || null,
      salary_range: parsed.salary_range || null,
    }).eq('id', job_id)

    return NextResponse.json({ evaluation, parsed })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
