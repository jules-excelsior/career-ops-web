import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id')
  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

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
}
