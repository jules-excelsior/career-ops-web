import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) return NextResponse.json({ error: `Auth error: ${authError.message}` }, { status: 401 })
    if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

    const { data: jobs, error } = await supabase
      .from('career_jobs')
      .select('*, career_evaluations(grade, score, created_at)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ jobs })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) return NextResponse.json({ error: `Auth error: ${authError.message}` }, { status: 401 })
    if (!user) return NextResponse.json({ error: 'Not logged in — please refresh and log in again' }, { status: 401 })

    const body = await req.json()
    const { data: job, error } = await supabase
      .from('career_jobs')
      .insert({ ...body, user_id: user.id })
      .select()
      .single()

    if (error) return NextResponse.json({ error: `DB error: ${error.message}` }, { status: 500 })
    if (!job) return NextResponse.json({ error: 'No job returned from insert' }, { status: 500 })
    return NextResponse.json({ job })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, ...updates } = await req.json()
    const { data: job, error } = await supabase.from('career_jobs').update(updates).eq('id', id).eq('user_id', user.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ job })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await req.json()
    await supabase.from('career_jobs').delete().eq('id', id).eq('user_id', user.id)
    return NextResponse.json({ success: true })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
