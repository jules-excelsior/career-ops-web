import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabaseServer = await createServerClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')
    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    if (user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: job } = await supabase
      .from('career_jobs')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user_id)
      .single()

    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: evaluation } = await supabase
      .from('career_evaluations')
      .select('*')
      .eq('job_id', params.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({ job, evaluation })
  } catch (e: any) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
