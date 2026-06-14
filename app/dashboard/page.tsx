'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
const STATUSES = [
  { key:'saved', label:'Saved', color:'#4a5a7a', bg:'rgba(74,90,122,0.12)' },
  { key:'applied', label:'Applied', color:'#00C2FF', bg:'rgba(0,194,255,0.08)' },
  { key:'interview', label:'Interview', color:'#C9A84C', bg:'rgba(201,168,76,0.08)' },
  { key:'offer', label:'Offer', color:'#22D3A8', bg:'rgba(34,211,168,0.08)' },
  { key:'rejected', label:'Rejected', color:'#ff5252', bg:'rgba(255,82,82,0.06)' },
]
const GRADE_COLORS: Record<string,string> = { A:'#22D3A8', B:'#00C2FF', C:'#C9A84C', D:'#FB923C', F:'#ff5252' }
export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string|null>(null)
  const [token, setToken] = useState<string|null>(null)
  const [dragging, setDragging] = useState<string|null>(null)
  const [view, setView] = useState<'kanban'|'list'>('kanban')
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      setUserId(data.session.user.id)
      setToken(data.session.access_token)
      fetchJobs(data.session.user.id, data.session.access_token)
    })
  }, [])
  const fetchJobs = useCallback(async (uid: string, tok: string) => {
    const res = await fetch(`/api/jobs?user_id=${uid}`, { headers: { 'Authorization':`Bearer ${tok}` } })
    const data = await res.json()
    setJobs(data.jobs || []); setLoading(false)
  }, [])
  const updateStatus = async (jobId: string, status: string) => {
    const previousJobs = jobs
    setJobs(prev => prev.map(j => j.id===jobId ? {...j, status} : j))
    try {
      const res = await fetch('/api/jobs', { method:'PATCH', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ id:jobId, status, user_id:userId }) })
      if (!res.ok) { setJobs(previousJobs); return }
    } catch { setJobs(previousJobs) }
  }
  const deleteJob = async (jobId: string) => {
    if (!confirm('Delete this job?')) return
    const previousJobs = jobs
    setJobs(prev => prev.filter(j => j.id!==jobId))
    try {
      const res = await fetch('/api/jobs', { method:'DELETE', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ id:jobId, user_id:userId }) })
      if (!res.ok) { setJobs(previousJobs); return }
    } catch { setJobs(previousJobs) }
  }
  const signOut = async () => { await supabase.auth.signOut(); router.push('/login') }
  const CARD_STYLE: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
  }
  const byStatus = (s: string) => jobs.filter(j => j.status===s)

  const getGrade = (job: any) => job.career_evaluations?.[0]?.grade || null
  const getScore = (job: any) => job.career_evaluations?.[0]?.score || null
  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}><div style={{ color:'var(--muted)' }}>Loading pipeline…</div></div>
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'56px', background:'rgba(8,12,24,0.95)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', backdropFilter:'blur(12px)' }}>
        <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', fontWeight:700, color:'var(--white)' }}>Career<span style={{ color:'var(--gold)' }}>Ops</span><span style={{ fontSize:'0.65rem', color:'var(--muted)', fontFamily:'DM Sans,sans-serif', fontWeight:400, marginLeft:'10px' }}>by Excelsior</span></div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:'8px', overflow:'hidden' }}>
            {(['kanban','list'] as const).map(v => <button key={v} onClick={() => setView(v)} style={{ padding:'6px 14px', background:view===v?'rgba(0,194,255,0.15)':'transparent', border:'none', color:view===v?'var(--accent)':'var(--muted)', fontSize:'0.78rem' }}>{v==='kanban'?'⬛ Board':'☰ List'}</button>)}
          </div>
          <button onClick={() => router.push('/profile')} style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'8px', fontSize:'0.82rem' }}>Profile</button>
          <button onClick={() => router.push('/evaluate')} style={{ padding:'8px 18px', background:'var(--accent)', color:'#000', border:'none', borderRadius:'8px', fontSize:'0.85rem', fontWeight:700 }}>+ Evaluate Job</button>
          <button onClick={signOut} style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'8px', fontSize:'0.82rem' }}>Sign Out</button>
        </div>
      </nav>
      <main style={{ paddingTop:'72px', maxWidth:'1400px', margin:'0 auto', padding:'72px 24px 48px' }}>
        <div style={{ marginBottom:'24px' }}>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.8rem', fontWeight:700, color:'var(--white)' }}>My Job Pipeline</h1>
          <p style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:'4px' }}>{jobs.length} total · {byStatus('interview').length} in interview · {byStatus('offer').length} offers</p>
        </div>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'28px' }}>
          {STATUSES.map(s => <div key={s.key} className="stat-card" style={{ background:s.bg, border:`1px solid ${s.color}33`, borderRadius:'10px', padding:'12px 20px' }}><div style={{ fontSize:'1.4rem', fontWeight:700, color:s.color, fontFamily:'DM Mono,monospace' }}>{byStatus(s.key).length}</div><div style={{ fontSize:'0.72rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px' }}>{s.label}</div></div>)}
        </div>
        {jobs.length===0 && (
          <div style={{ textAlign:'center', padding:'80px 24px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px' }}>
            <div style={{ fontSize:'3rem', marginBottom:'16px' }}>🎯</div>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.4rem', color:'var(--white)', marginBottom:'8px' }}>No jobs yet</h2>
            <p style={{ color:'var(--muted)', fontSize:'0.88rem', marginBottom:'24px' }}>Paste a job description and let Claude evaluate it.</p>
            <button onClick={() => router.push('/evaluate')} style={{ padding:'12px 28px', background:'var(--accent)', color:'#000', border:'none', borderRadius:'8px', fontSize:'0.9rem', fontWeight:700 }}>Evaluate Your First Job →</button>
          </div>
        )}
        {view==='kanban' && jobs.length>0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:'14px', alignItems:'start' }}>
            {STATUSES.map(status => (
              <div key={status.key} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if(dragging) updateStatus(dragging, status.key); setDragging(null) }} style={{ background:status.bg, border:`1px solid ${status.color}22`, borderRadius:'14px', padding:'14px', minHeight:'100px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                  <span style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:status.color }}>{status.label}</span>
                  <span style={{ fontSize:'0.75rem', color:'var(--muted)', background:'rgba(255,255,255,0.06)', padding:'2px 8px', borderRadius:'100px' }}>{byStatus(status.key).length}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {byStatus(status.key).map(job => {
                    const grade = getGrade(job); const score = getScore(job)
                    return (
                      <div key={job.id} draggable onDragStart={() => setDragging(job.id)} onDragEnd={() => setDragging(null)} onClick={() => router.push('/job/' + job.id)} className="job-card animate-in" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'14px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px' }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:600, color:'var(--white)', fontSize:'0.85rem', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{job.role||'Unknown Role'}</div>
                            <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{job.company||'Unknown'}</div>
                            {job.location && <div style={{ fontSize:'0.7rem', color:'var(--muted)', marginTop:'2px' }}>📍 {job.location}</div>}
                          </div>
                          {grade && <div style={{ width:'30px', height:'30px', borderRadius:'7px', background:`${GRADE_COLORS[grade]}18`, border:`1px solid ${GRADE_COLORS[grade]}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'DM Mono,monospace', fontWeight:700, fontSize:'0.85rem', color:GRADE_COLORS[grade] }}>{grade}</div>}
                        </div>
                        {score && <div style={{ marginTop:'8px', display:'flex', alignItems:'center', gap:'6px' }}><div style={{ flex:1, height:'3px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', overflow:'hidden' }}><div style={{ height:'100%', width:`${(score/5)*100}%`, background:GRADE_COLORS[grade||'C'], borderRadius:'2px' }} /></div><span style={{ fontSize:'0.65rem', color:'var(--muted)', fontFamily:'DM Mono,monospace' }}>{score}/5</span></div>}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px' }}>
                          <select value={job.status} onChange={e => updateStatus(job.id, e.target.value)} onClick={e => e.stopPropagation()} style={{ fontSize:'0.7rem', padding:'2px 6px', width:'auto', color:status.color, background:'transparent', border:`1px solid ${status.color}44`, borderRadius:'5px' }}>
                            {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                          </select>
                          <button onClick={() => deleteJob(job.id)} style={{ background:'none', border:'none', color:'rgba(255,82,82,0.5)', fontSize:'0.75rem', padding:'2px 4px' }}>🗑</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {view==='list' && jobs.length>0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {jobs.map(job => {
              const grade = getGrade(job); const score = getScore(job)
              const statusInfo = STATUSES.find(s => s.key===job.status)
              return (
                <div key={job.id} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'14px 20px', display:'flex', alignItems:'center', gap:'14px' }}>
                  {grade && <div style={{ width:'38px', height:'38px', borderRadius:'9px', background:`${GRADE_COLORS[grade]}18`, border:`1px solid ${GRADE_COLORS[grade]}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'DM Mono,monospace', fontWeight:700, color:GRADE_COLORS[grade] }}>{grade}</div>}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, color:'var(--white)', fontSize:'0.9rem' }}>{job.role||'Unknown Role'}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:'2px' }}>{job.company}{job.location?` · ${job.location}`:''}{job.salary_range?` · ${job.salary_range}`:''}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
                    {score && <span style={{ fontFamily:'DM Mono,monospace', fontSize:'0.8rem', color:'var(--muted)' }}>{score}/5</span>}
                    <select value={job.status} onChange={e => updateStatus(job.id, e.target.value)} style={{ fontSize:'0.76rem', padding:'4px 10px', width:'auto', color:statusInfo?.color, background:statusInfo?.bg, border:`1px solid ${statusInfo?.color}44`, borderRadius:'6px' }}>
                      {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                    <button onClick={() => deleteJob(job.id)} style={{ background:'none', border:'none', color:'rgba(255,82,82,0.5)', fontSize:'0.8rem' }}>🗑</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
