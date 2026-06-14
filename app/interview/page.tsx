'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/app/components/Logo'

export default function InterviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get('job_id')
  const supabase = createClient()
  const [token, setToken] = useState('')
  const [userId, setUserId] = useState('')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [jobTitle, setJobTitle] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      setToken(data.session.access_token)
      setUserId(data.session.user.id)
    })
  }, [])

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight) }, [messages])

  const startInterview = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/interview', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({ job_id:jobId, user_id:userId, action:'start', messages:[] })
      })
      const d = await res.json()
      if (d.error) return
      setMessages([{ role:'assistant', content: d.reply }])
      setStarted(true)
    } catch {}
    finally { setLoading(false) }
  }

  const sendAnswer = async () => {
    if (!input.trim()) return
    const newMessages = [...messages, { role:'user', content:input }]
    setMessages(newMessages); setInput(''); setLoading(true)
    try {
      const res = await fetch('/api/interview', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({ job_id:jobId, user_id:userId, action:'continue', messages:newMessages })
      })
      const d = await res.json()
      if (d.error) return
      setMessages([...newMessages, { role:'assistant', content: d.reply }])
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'56px', background:'rgba(8,12,24,0.95)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', backdropFilter:'blur(12px)' }}>
        <Logo />
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'8px', fontSize:'0.82rem' }}>Dashboard</button>
          {jobId && <button onClick={() => router.push(`/job/${jobId}`)} style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'8px', fontSize:'0.82rem' }}>← Job</button>}
        </div>
      </nav>

      <main style={{ paddingTop:'80px', maxWidth:'740px', margin:'0 auto', padding:'80px 24px 60px' }}>
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'var(--success)', fontFamily:'DM Mono,monospace', marginBottom:'10px' }}>Interview Simulator</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.6rem,3vw,2rem)', fontWeight:700, color:'var(--white)', marginBottom:'8px' }}>Practice Your Interview</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.88rem' }}>AI-powered mock interview based on the job description. Answer questions naturally and get feedback.</p>
        </div>

        {!started ? (
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'40px', textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'16px' }}>🎤</div>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', color:'var(--white)', marginBottom:'10px' }}>{jobTitle || 'Ready to practice?'}</h2>
            <p style={{ color:'var(--muted)', fontSize:'0.85rem', marginBottom:'24px', lineHeight:1.7 }}>The AI will ask you 5 role-specific interview questions based on the job description. After each answer, you'll get brief feedback.</p>
            <button onClick={startInterview} disabled={loading || !jobId} style={{ padding:'14px 32px', background:'var(--success)', color:'#000', border:'none', borderRadius:'10px', fontSize:'0.95rem', fontWeight:700, cursor:loading?'wait':'pointer' }}>
              {loading ? 'Starting…' : 'Start Interview →'}
            </button>
            {!jobId && <p style={{ marginTop:'12px', color:'var(--danger)', fontSize:'0.8rem' }}>Select a job from your pipeline first.</p>}
          </div>
        ) : (
          <div>
            <div ref={chatRef} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'24px', marginBottom:'16px', maxHeight:'60vh', overflowY:'auto', display:'flex', flexDirection:'column', gap:'16px' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start' }}>
                  <div style={{
                    maxWidth:'80%', padding:'14px 18px', borderRadius:'14px',
                    background: m.role==='user' ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                    color: m.role==='user' ? '#000' : 'var(--text)',
                    fontSize:'0.88rem', lineHeight:1.7, whiteSpace:'pre-wrap',
                    borderBottomRightRadius: m.role==='user' ? '4px' : '14px',
                    borderBottomLeftRadius: m.role==='assistant' ? '4px' : '14px',
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <div style={{ color:'var(--muted)', fontSize:'0.82rem', textAlign:'center' }}>Thinking…</div>}
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && sendAnswer()}
                placeholder="Type your answer…"
                disabled={loading}
                style={{ flex:1 }}
              />
              <button onClick={sendAnswer} disabled={loading || !input.trim()} style={{ padding:'12px 24px', background:'var(--success)', color:'#000', border:'none', borderRadius:'10px', fontWeight:700, cursor:loading?'wait':'pointer', whiteSpace:'nowrap' }}>
                {loading ? '…' : 'Send →'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
