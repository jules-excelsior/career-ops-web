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

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('career_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ profile: profile || null })
  } catch (e: any) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, target_role, industry, years_experience, skills, preferred_location, salary_expectations, resume_text } = body

    const { data: existing } = await supabase
      .from('career_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const payload = {
      user_id: user.id,
      name: name || null,
      target_role: target_role || null,
      industry: industry || null,
      years_experience: years_experience ? Number(years_experience) : null,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : null),
      preferred_location: preferred_location || null,
      salary_expectations: salary_expectations || null,
      resume_text: resume_text || null,
      updated_at: new Date().toISOString(),
    }

    if (existing) {
      const { data: profile, error } = await supabase
        .from('career_profiles')
        .update(payload)
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      return NextResponse.json({ profile })
    }

    const { data: profile, error } = await supabase
      .from('career_profiles')
      .insert(payload)
      .select()
      .single()
    if (error) return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    return NextResponse.json({ profile })
  } catch (e: any) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
