import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

function getSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function getUserId(): Promise<string | null> {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find(c => c.name.includes('auth-token') || c.name.includes('access_token'))
  if (!authCookie) return null
  try {
    const supabase = getSupabase()
    const { data } = await supabase.auth.getUser(authCookie.value)
    return data.user?.id || null
  } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    // Find the access token cookie
    let accessToken = ''
    for (const cookie of allCookies) {
      if (cookie.name.includes('access_token') || cookie.name.includes('auth-token')) {
        accessToken = cookie.value
        break
      }
      // Also check for the base64 encoded session
      if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
        try {
          const decoded = JSON.parse(Buffer.from(cookie.value.split('.')[1] || '', 'base64').toString())
          if (decoded) { accessToken = cookie.value; break }
        } catch {}
      }
    }

    const anonClient = getSupabase()
    const { data: { user } } = await anonClient.auth.getUser(accessToken)
    
    if (!user) {
      return NextResponse.json({ error: `Not authenticated. Cookies: ${allCookies.map(c => c.name).join(', ')}` }, { status: 401 })
    }

    const body = await req.json()
    const { data: job, error } = await supabase
      .from('career_jobs')
      .insert({ ...body, user_id: user.id })
      .select()
      .single()

    if (error) return NextResponse.json({ error: `DB: ${error.message}` }, { status: 500 })
    return NextResponse.json({ job })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function GET() {
  return NextResponse.json({ jobs: [] })
}
export async function PATCH(req: NextRequest) {
  return NextResponse.json({ success: true })
}
export async function DELETE(req: NextRequest) {
  return NextResponse.json({ success: true })
}
