'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/app/components/Logo'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string|null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      setToken(data.session.access_token)
      fetchUsers(data.session.access_token)
    })
  }, [])

  const fetchUsers = async (tok: string) => {
    try {
      const res = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${tok}` } })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setUsers(data.users || [])
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ color:'var(--muted)' }}>Loading…</div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', flexDirection:'column', gap:'12px' }}>
      <div style={{ color:'var(--danger)', fontSize:'0.9rem' }}>{error}</div>
      <button onClick={() => router.push('/dashboard')} style={{ padding:'8px 20px', background:'var(--accent)', color:'#000', border:'none', borderRadius:'8px', cursor:'pointer' }}>Back to Dashboard</button>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)' }}>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'56px', background:'rgba(8,12,24,0.95)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', backdropFilter:'blur(12px)' }}>
        <Logo />
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'8px', fontSize:'0.82rem', cursor:'pointer' }}>Dashboard</button>
        </div>
      </nav>

      <main style={{ paddingTop:'80px', maxWidth:'1000px', margin:'0 auto', padding:'80px 24px 60px' }}>
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gold)', fontFamily:'DM Mono,monospace', marginBottom:'10px' }}>Admin Panel</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.6rem,3vw,2rem)', fontWeight:700, color:'var(--white)', marginBottom:'6px' }}>Registered Users</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.85rem' }}>{users.length} total user{users.length !== 1 ? 's' : ''}</p>
        </div>

        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding:'14px 20px', textAlign:'left', fontSize:'0.72rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--muted)', fontFamily:'DM Mono,monospace' }}>First Name</th>
                  <th style={{ padding:'14px 20px', textAlign:'left', fontSize:'0.72rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--muted)', fontFamily:'DM Mono,monospace' }}>Email</th>
                  <th style={{ padding:'14px 20px', textAlign:'left', fontSize:'0.72rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--muted)', fontFamily:'DM Mono,monospace' }}>Registered</th>
                  <th style={{ padding:'14px 20px', textAlign:'left', fontSize:'0.72rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--muted)', fontFamily:'DM Mono,monospace' }}>Last Sign In</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.15s' }}>
                    <td style={{ padding:'14px 20px', fontSize:'0.88rem', color:'var(--white)', fontWeight:500 }}>
                      {u.first_name || '—'}
                    </td>
                    <td style={{ padding:'14px 20px', fontSize:'0.85rem', color:'var(--muted)', fontFamily:'DM Mono,monospace' }}>
                      {u.email}
                    </td>
                    <td style={{ padding:'14px 20px', fontSize:'0.82rem', color:'var(--muted)' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' }) : '—'}
                    </td>
                    <td style={{ padding:'14px 20px', fontSize:'0.82rem', color:'var(--muted)' }}>
                      {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' }) : 'Never'}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} style={{ padding:'40px', textAlign:'center', color:'var(--muted)', fontSize:'0.85rem' }}>No users registered yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
