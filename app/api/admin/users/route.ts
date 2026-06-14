import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ADMIN_EMAIL = 'excelsiorconsultancys@gmail.com'

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
    if (user.email !== ADMIN_EMAIL) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 500 })

    if (error) return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })

    const mapped = users.map(u => ({
      id: u.id,
      email: u.email,
      first_name: u.user_metadata?.first_name || u.user_metadata?.name || null,
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at,
    }))

    return NextResponse.json({ users: mapped, total: mapped.length })
  } catch (e: any) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
