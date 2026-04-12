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
        max_tokens: 1500,
        system: `You are a senior HR consultant evaluating job offers. You MUST return ONLY a valid JSON object. No text before or after. No markdown. No backticks. Just the raw JSON object starting with { and ending with }.

Use this exact structure:
{
  "grade": "A",
  "score": 4.5,
  "company": "Company Name",
  "role": "Role Title",
  "location": "City or Remote",
  "salary_range": "PHP 50,000/month or null",
  "role_summary": "Summary here",
  "cv_match": "Match analysis here",
  "green_flags": "Positive point 1\nPositive point 2\nPositive point 3",
  "red_flags": "Concern 1\nConcern 2",
  "compensation": "Compensation analysis here",
  "recommendation": "Clear recommendation here"
}

Grading: A=4.5-5 exceptional, B=3.5-4.4 good, C=2.5-3.4 average, D=1.5-2.4 below average, F=0-1.4 poor.`,
        messages: [{ role: 'user', content: `Evaluate this job description and return JSON only:\n\n${jd_text}` }],
      }),
    })

    const data = await response.json()

    if (!data.content || !data.content[0]) {
      return NextResponse.json({ error: `API error: ${JSON.stringify(data)}` }, { status: 500 })
    }

    const text = data.content[0].text || ''

    // Try multiple parsing strategies
    let parsed: any = null

    // Strategy 1: direct parse
    try { parsed = JSON.parse(text.trim()); } catch {}

    // Strategy 2: strip markdown
    if (!parsed) {
      try { parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) } catch {}
    }

    // Strategy 3: extract JSON object
    if (!parsed) {
      try {
        const match = text.match(/\{[\s\S]*\}/)
        if (match) parsed = JSON.parse(match[0])
      } catch {}
    }

    if (!parsed) {
      return NextResponse.json({ error: `Could not parse response: ${text.substring(0, 200)}` }, { status: 500 })
    }

    const { data: evaluation, error: evalError } = await supabase
      .from('career_evaluations')
      .insert({
        job_id, user_id,
        grade: parsed.grade || 'C',
        score: parsed.score || 2.5,
        role_summary: parsed.role_summary || '',
        cv_match: parsed.cv_match || '',
        green_flags: parsed.green_flags || '',
        red_flags: parsed.red_flags || '',
        compensation: parsed.compensation || '',
        recommendation: parsed.recommendation || '',
        raw_response: text,
      })
      .select().single()

    if (evalError) return NextResponse.json({ error: evalError.message }, { status: 500 })

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
