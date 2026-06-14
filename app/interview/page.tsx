'use client'
import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/app/components/Logo'

function InterviewContent() {
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
  const [listening, setListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [voiceMode, setVoiceMode] = useState(true)
  const chatRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      setToken(data.session.access_token)
      setUserId(data.session.user.id)
    })
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setVoiceSupported(!!SpeechRecognition)
    if (SpeechRecognition) {
      const r = new SpeechRecognition()
      r.continuous = false
      r.interimResults = false
      r.lang = 'en-US'
      r.onresult = (e: any) => {
        const text = e.results[0][0].transcript
        setInput(text)
        setListening(false)
        setTimeout(() => sendAnswer(text), 300)
      }
      r.onerror = () => setListening(false)
      r.onend = () => setListening(false)
      recognitionRef.current = r
    }
  }, [])

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight) }, [messages])

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.95
    u.pitch = 1
    u.volume = 1
    u.lang = 'en-US'
    const voices = window.speechSynthesis.getVoices()
    const female = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'))
    if (female) u.voice = female
    window.speechSynthesis.speak(u)
  }, [])

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
      const reply = d.reply
      setMessages([{ role:'assistant', content: reply }])
      setStarted(true)
      if (voiceMode) speak(stripFeedback(reply))
    } catch {} finally { setLoading(false) }
  }

  const sendAnswer = async (text?: string) => {
    const answer = text || input
    if (!answer.trim()) return
    const newMessages = [...messages, { role:'user', content: answer }]
    setMessages(newMessages); setInput(''); setLoading(true)
    try {
      const res = await fetch('/api/interview', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({ job_id:jobId, user_id:userId, action:'continue', messages:newMessages })
      })
      const d = await res.json()
      if (d.error) return
      const reply = d.reply
      setMessages([...newMessages, { role:'assistant', content: reply }])
      if (voiceMode) speak(stripFeedback(reply))
    } catch {} finally { setLoading(false) }
  }

  const toggleListening = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    if (!recognitionRef.current) return
    setListening(true)
    setInput('')
    recognitionRef.current.start()
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'56px', background:'rgba(8,12,24,0.95)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', backdropFilter:'blur(12px)' }}>
        <Logo />
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          {started && voiceSupported && (
            <button onClick={() => setVoiceMode(!voiceMode)} style={{ padding:'6px 12px', background:voiceMode?'rgba(34,211,168,0.1)':'rgba(255,255,255,0.04)', border:`1px solid ${voiceMode?'rgba(34,211,168,0.3)':'var(--border)'}`, borderRadius:'8px', color:voiceMode?'var(--success)':'var(--muted)', fontSize:'0.78rem', cursor:'pointer', fontFamily:'inherit' }}>
              {voiceMode ? '🔊 Voice On' : '🔇 Voice Off'}
            </button>
          )}
          <button onClick={() => router.push('/dashboard')} style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--muted)', fontSize:'0.82rem' }}>Dashboard</button>
        </div>
      </nav>

      <main style={{ paddingTop:'80px', maxWidth:'740px', margin:'0 auto', padding:'80px 24px 60px' }}>
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'var(--success)', fontFamily:'DM Mono,monospace', marginBottom:'10px' }}>Interview Simulator</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.6rem,3vw,2rem)', fontWeight:700, color:'var(--white)', marginBottom:'8px' }}>Voice Interview Practice</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.88rem' }}>{voiceSupported ? 'Speak your answers naturally — the AI listens and responds. Or type if you prefer.' : 'Type your answers — your browser does not support voice input.'}</p>
        </div>

        {!started ? (
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'40px', textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'16px' }}>🎤</div>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', color:'var(--white)', marginBottom:'10px' }}>Ready to practice?</h2>
            <p style={{ color:'var(--muted)', fontSize:'0.85rem', marginBottom:'24px', lineHeight:1.7 }}>
              {voiceSupported ? 'The AI will ask you 5 questions aloud. Speak your answers — like a real interview.' : 'The AI will ask you 5 role-specific questions. Type your answers and get feedback.'}
            </p>
            <button onClick={startInterview} disabled={loading || !jobId} style={{ padding:'14px 32px', background:'var(--success)', color:'#000', border:'none', borderRadius:'10px', fontSize:'0.95rem', fontWeight:700, cursor:loading?'wait':'pointer' }}>
              {loading ? 'Starting…' : 'Start Interview →'}
            </button>
            {!jobId && <p style={{ marginTop:'12px', color:'var(--danger)', fontSize:'0.8rem' }}>Select a job from your pipeline first.</p>}
          </div>
        ) : (
          <div>
            <div ref={chatRef} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'24px', marginBottom:'16px', maxHeight:'55vh', overflowY:'auto', display:'flex', flexDirection:'column', gap:'14px' }}>
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
                    <div style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginBottom:'4px', color: m.role==='user' ? 'rgba(0,0,0,0.5)' : 'var(--accent)', fontFamily:'DM Mono,monospace' }}>
                      {m.role==='assistant' ? '🤖 Interviewer' : '🎤 You'}
                    </div>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <div style={{ color:'var(--muted)', fontSize:'0.82rem', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                <span style={{ display:'inline-block', width:'8px', height:'8px', borderRadius:'50%', background:'var(--accent)', animation:'fadeIn 0.6s ease infinite alternate' }} />
                Thinking…
              </div>}
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              {voiceSupported && (
                <button
                  onClick={toggleListening}
                  disabled={loading}
                  style={{
                    padding:'12px 18px', minWidth:'48px',
                    background: listening ? 'rgba(255,82,82,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${listening ? 'rgba(255,82,82,0.4)' : 'var(--border)'}`,
                    borderRadius:'10px', color: listening ? 'var(--danger)' : 'var(--muted)',
                    fontSize:'1.2rem', cursor: loading?'wait':'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'all 0.15s',
                  }}
                  title={listening ? 'Stop listening' : 'Speak your answer'}
                >
                  {listening ? '⏹' : '🎤'}
                </button>
              )}
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && sendAnswer()}
                placeholder={listening ? 'Listening… speak now' : voiceMode ? 'Type or tap 🎤 to speak…' : 'Type your answer…'}
                disabled={loading}
                style={{ flex:1 }}
              />
              <button onClick={() => sendAnswer()} disabled={loading || !input.trim()} style={{ padding:'12px 24px', background:'var(--success)', color:'#000', border:'none', borderRadius:'10px', fontWeight:700, cursor:loading?'wait':'pointer', whiteSpace:'nowrap' }}>
                {loading ? '…' : 'Send →'}
              </button>
            </div>
            {listening && (
              <div style={{ marginTop:'10px', display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', background:'rgba(255,82,82,0.06)', border:'1px solid rgba(255,82,82,0.2)', borderRadius:'8px' }}>
                <span style={{ width:'10px', height:'10px', borderRadius:'50%', background:'var(--danger)', animation:'fadeIn 0.4s ease infinite alternate' }} />
                <span style={{ fontSize:'0.82rem', color:'var(--danger)' }}>Listening… speak your answer clearly</span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function stripFeedback(text: string): string {
  return text.replace(/\bScore:?\s*\d+\/?\d*\b/gi, '').replace(/^(Feedback|Summary|Final|Overall).*$/gim, '').trim() || text
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}><div style={{ color:'var(--muted)' }}>Loading…</div></div>}>
      <InterviewContent />
    </Suspense>
  )
}
