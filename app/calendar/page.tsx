'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/app/components/Logo'

export default function CalendarPage() {
  const router = useRouter()
  const supabase = createClient()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      setToken(data.session.access_token)
      setUserId(data.session.user.id)
      fetchEvents(data.session.access_token, data.session.user.id)
    })
  }, [])

  const fetchEvents = async (tok: string, uid: string) => {
    try {
      const res = await fetch(`/api/calendar?user_id=${uid}`, { headers:{'Authorization':`Bearer ${tok}`} })
      const data = await res.json()
      setEvents(data.events || [])
    } catch {}
    finally { setLoading(false) }
  }

  const typeColors: Record<string,string> = { applied:'#00C2FF', interview:'#C9A84C', offer:'#22D3A8' }
  const typeIcons: Record<string,string> = { applied:'📤', interview:'🎤', offer:'🎉' }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ color:'var(--muted)' }}>Loading calendar…</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'56px', background:'rgba(8,12,24,0.95)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', backdropFilter:'blur(12px)' }}>
        <Logo />
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'8px', fontSize:'0.82rem' }}>Dashboard</button>
          <button onClick={() => router.push('/profile')} style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'8px', fontSize:'0.82rem' }}>Profile</button>
        </div>
      </nav>

      <main style={{ paddingTop:'80px', maxWidth:'740px', margin:'0 auto', padding:'80px 24px 60px' }}>
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'var(--accent)', fontFamily:'DM Mono,monospace', marginBottom:'10px' }}>Timeline</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.6rem,3vw,2rem)', fontWeight:700, color:'var(--white)', marginBottom:'6px' }}>Application Calendar</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.88rem' }}>{events.length} milestone{events.length !== 1 ? 's' : ''} across your active applications</p>
        </div>

        {events.length === 0 ? (
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'48px', textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'12px' }}>📅</div>
            <p style={{ color:'var(--muted)', fontSize:'0.9rem' }}>No milestones yet. Apply to jobs and update their status to see your timeline here.</p>
          </div>
        ) : (
          <div style={{ position:'relative', paddingLeft:'32px' }}>
            <div style={{ position:'absolute', left:'11px', top:'0', bottom:'0', width:'2px', background:'var(--border)' }} />
            <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
              {events.map((ev: any) => (
                <div key={ev.id} className="card-3d" style={{ position:'relative' }}>
                  <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px 24px' }}>
                    <div style={{ position:'absolute', left:'-26px', top:'22px', width:'12px', height:'12px', borderRadius:'50%', background:typeColors[ev.type] || 'var(--muted)', border:'2px solid var(--bg)' }} />
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                          <span style={{ fontSize:'0.72rem', padding:'3px 10px', borderRadius:'100px', background:`${typeColors[ev.type]}18`, border:`1px solid ${typeColors[ev.type]}33`, color:typeColors[ev.type], fontFamily:'DM Mono,monospace', letterSpacing:'0.5px' }}>{typeIcons[ev.type]} {ev.type}</span>
                        </div>
                        <div style={{ fontWeight:600, color:'var(--white)', fontSize:'0.92rem', marginBottom:'2px' }}>{ev.title}</div>
                        <div style={{ fontSize:'0.8rem', color:'var(--muted)' }}>{ev.company}</div>
                      </div>
                      <div style={{ fontSize:'0.78rem', color:'var(--muted)', fontFamily:'DM Mono,monospace', textAlign:'right', flexShrink:0 }}>
                        {new Date(ev.date).toLocaleDateString('en-PH', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
