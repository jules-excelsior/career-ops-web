import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_id, ...rest } = body
    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    const { data: job, error } = await supabase
      .from('career_jobs')
      .insert({ ...rest, user_id })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ job })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id')
  if (!user_id) return NextResponse.json({ jobs: [] })
  const { data: jobs, error } = await supabase
    .from('career_jobs')
    .select('*, career_evaluations(grade, score, created_at)')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ jobs })
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, user_id, ...updates } = await req.json()
    const { data: job, error } = await supabase.from('career_jobs').update(updates).eq('id', id).eq('user_id', user_id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ job })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, user_id } = await req.json()
    await supabase.from('career_jobs').delete().eq('id', id).eq('user_id', user_id)
    return NextResponse.json({ success: true })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
