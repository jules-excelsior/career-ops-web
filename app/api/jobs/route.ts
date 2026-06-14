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

const ALLOWED_UPDATE_FIELDS = new Set(['status', 'notes', 'salary_range', 'location', 'company', 'role', 'job_url', 'applied_at', 'interviewed_at', 'offered_at', 'rejected_at'])

const STATUS_TIMESTAMP_MAP: Record<string, string> = {
  applied: 'applied_at',
  interview: 'interviewed_at',
  offer: 'offered_at',
  rejected: 'rejected_at',
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req)
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { user_id, ...rest } = body
    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    if (user_id !== sessionUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: job, error } = await supabase
      .from('career_jobs')
      .insert({ ...rest, user_id })
      .select()
      .single()
    if (error) return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
    return NextResponse.json({ job })
  } catch (e: any) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req)
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')
    if (!user_id) return NextResponse.json({ jobs: [] })
    if (user_id !== sessionUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: jobs, error } = await supabase
      .from('career_jobs')
      .select('*, career_evaluations(grade, score, created_at)')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
    return NextResponse.json({ jobs })
  } catch (e: any) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req)
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, user_id, ...updates } = await req.json()
    if (!id || !user_id) return NextResponse.json({ error: 'id and user_id required' }, { status: 400 })
    if (user_id !== sessionUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const safeUpdates: Record<string, unknown> = {}
    for (const key of Object.keys(updates)) {
      if (ALLOWED_UPDATE_FIELDS.has(key)) safeUpdates[key] = updates[key]
    }

    if (updates.status && STATUS_TIMESTAMP_MAP[updates.status]) {
      const tsField = STATUS_TIMESTAMP_MAP[updates.status]
      if (!safeUpdates[tsField]) safeUpdates[tsField] = new Date().toISOString()
    }

    const { data: job, error } = await supabase
      .from('career_jobs')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
    return NextResponse.json({ job })
  } catch (e: any) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req)
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, user_id } = await req.json()
    if (!id || !user_id) return NextResponse.json({ error: 'id and user_id required' }, { status: 400 })
    if (user_id !== sessionUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await supabase.from('career_jobs').delete().eq('id', id).eq('user_id', user_id)
    return NextResponse.json({ success: true })
  } catch (e: any) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
