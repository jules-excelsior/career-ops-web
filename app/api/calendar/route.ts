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

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')
    if (user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: jobs } = await supabase
      .from('career_jobs')
      .select('id, role, company, status, applied_at, interviewed_at, offered_at, created_at')
      .eq('user_id', user_id)
      .not('status', 'eq', 'rejected')

    const events = (jobs || []).flatMap(j => {
      const ev: any[] = []
      if (j.applied_at) ev.push({ id: `${j.id}-applied`, job_id: j.id, title: `Applied: ${j.role}`, company: j.company, date: j.applied_at, type: 'applied' })
      if (j.interviewed_at) ev.push({ id: `${j.id}-interview`, job_id: j.id, title: `Interview: ${j.role}`, company: j.company, date: j.interviewed_at, type: 'interview' })
      if (j.offered_at) ev.push({ id: `${j.id}-offer`, job_id: j.id, title: `Offer: ${j.role}`, company: j.company, date: j.offered_at, type: 'offer' })
      return ev
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ events, jobs: jobs || [] })
  } catch (e: any) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
