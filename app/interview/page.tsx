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
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [showText, setShowText] = useState(false)
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const listeningTimeout = useRef<any>(null)

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
      r.interimResults = true
      r.lang = 'en-US'
      r.onresult = (e: any) => {
        let final = ''
        let interim = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript
          else interim += e.results[i][0].transcript
        }
        if (final) {
          setInput(final)
          setListening(false)
          clearTimeout(listeningTimeout.current)
          setTimeout(() => handleAnswer(final), 200)
        } else if (interim) {
          setInput(interim)
        }
      }
      r.onerror = () => { setListening(false); clearTimeout(listeningTimeout.current) }
      r.onend = () => {
        if (listeningTimeout.current) {
          setListening(true)
          try { r.start() } catch {}
        }
      }
      recognitionRef.current = r
    }
  }, [])

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight) }, [messages])

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(); return }
      window.speechSynthesis.cancel()
      const clean = text
      const u = new SpeechSynthesisUtterance(clean)
      u.rate = 0.9
      u.pitch = 1
      u.volume = 1
      u.lang = 'en-US'
      const voices = window.speechSynthesis.getVoices()
      const voice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google'))
      if (voice) u.voice = voice
      u.onend = () => { setSpeaking(false); resolve() }
      u.onerror = () => { setSpeaking(false); resolve() }
      setSpeaking(true)
      window.speechSynthesis.speak(u)
    })
  }, [])

  const startListening = () => {
    if (!recognitionRef.current) return
    setListening(true)
    setInput('')
    listeningTimeout.current = setTimeout(() => {
      setListening(false)
      if (recognitionRef.current) try { recognitionRef.current.stop() } catch {}
    }, 15000)
    try { recognitionRef.current.start() } catch {}
  }

  const stopListening = () => {
    setListening(false)
    clearTimeout(listeningTimeout.current)
    if (recognitionRef.current) try { recognitionRef.current.stop() } catch {}
  }

  const startInterview = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/interview', {
        method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({ job_id:jobId, user_id:userId, action:'start', messages:[] })
      })
      const d = await res.json()
      if (d.error) return
      const reply = d.reply
      setMessages([{ role:'assistant', content: reply }])
      setStarted(true)
      await speak(reply)
      setTimeout(() => startListening(), 600)
    } catch {} finally { setLoading(false) }
  }

  const handleAnswer = async (text: string) => {
    if (!text.trim()) return
    const newMessages = [...messages, { role:'user', content: text }]
    setMessages(newMessages); setInput(''); setLoading(true)
    try {
      const res = await fetch('/api/interview', {
        method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({ job_id:jobId, user_id:userId, action:'continue', messages:newMessages })
      })
      const d = await res.json()
      if (d.error) return
      const reply = d.reply
      setMessages([...newMessages, { role:'assistant', content: reply }])
      await speak(reply)
      setTimeout(() => startListening(), 600)
    } catch {} finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'56px', background:'rgba(8,12,24,0.95)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', backdropFilter:'blur(12px)' }}>
        <Logo />
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          {started && (
            <button onClick={() => setShowText(!showText)} style={{ padding:'6px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--muted)', fontSize:'0.78rem', cursor:'pointer', fontFamily:'inherit' }}>
              {showText ? 'Hide Transcript' : 'Show Transcript'}
            </button>
          )}
          <button onClick={() => router.push('/dashboard')} style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--muted)', fontSize:'0.82rem' }}>Dashboard</button>
        </div>
      </nav>

      <main style={{ paddingTop:'80px', maxWidth:'740px', margin:'0 auto', padding:'80px 24px 60px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        {!started ? (
          <div style={{ width:'100%', maxWidth:'520px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'20px', padding:'48px 36px', textAlign:'center', marginTop:'60px' }}>
            <div style={{ fontSize:'4rem', marginBottom:'20px', lineHeight:1 }}>🎤</div>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.4rem', color:'var(--white)', marginBottom:'10px' }}>Voice Interview Practice</h2>
            <p style={{ color:'var(--muted)', fontSize:'0.88rem', marginBottom:'28px', lineHeight:1.7 }}>
              {voiceSupported
                ? 'The AI interviewer will ask you questions aloud. Speak your answers — just like a real interview. No typing required.'
                : 'Your browser doesn\'t support voice. Use Chrome or Edge for the full voice experience.'}
            </p>
            <button onClick={startInterview} disabled={loading || !jobId} style={{ width:'100%', padding:'16px', background:'var(--success)', color:'#000', border:'none', borderRadius:'12px', fontSize:'1.05rem', fontWeight:700, cursor:loading?'wait':'pointer' }}>
              {loading ? 'Starting…' : 'Start Voice Interview'}
            </button>
            {!jobId && <p style={{ marginTop:'14px', color:'var(--danger)', fontSize:'0.8rem' }}>Select a job from your pipeline first.</p>}
          </div>
        ) : (
          <>
            {/* Voice-first UI */}
            <div style={{ width:'100%', maxWidth:'520px', textAlign:'center', marginTop:'40px', marginBottom:'30px' }}>
              <div style={{ marginBottom:'24px' }}>
                {speaking ? (
                  <div style={{ padding:'20px', background:'rgba(34,211,168,0.06)', border:'1px solid rgba(34,211,168,0.2)', borderRadius:'16px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'10px' }}>
                      <span style={{ width:'12px', height:'12px', borderRadius:'50%', background:'var(--success)', animation:'fadeIn 0.5s ease infinite alternate' }} />
                      <span style={{ fontSize:'0.9rem', color:'var(--success)', fontWeight:600 }}>Interviewer is speaking…</span>
                    </div>
                    <p style={{ fontSize:'0.82rem', color:'var(--muted)' }}>Listen carefully, then answer when prompted</p>
                  </div>
                ) : listening ? (
                  <div style={{ padding:'20px', background:'rgba(255,82,82,0.06)', border:'1px solid rgba(255,82,82,0.2)', borderRadius:'16px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'10px' }}>
                      <span style={{ width:'12px', height:'12px', borderRadius:'50%', background:'var(--danger)', animation:'fadeIn 0.3s ease infinite alternate' }} />
                      <span style={{ fontSize:'0.9rem', color:'var(--danger)', fontWeight:600 }}>Listening… speak your answer</span>
                    </div>
                    {input && <p style={{ fontSize:'0.82rem', color:'var(--muted)', fontStyle:'italic' }}>"{input}"</p>}
                  </div>
                ) : loading ? (
                  <div style={{ padding:'20px', background:'rgba(0,194,255,0.06)', border:'1px solid rgba(0,194,255,0.2)', borderRadius:'16px' }}>
                    <span style={{ fontSize:'0.85rem', color:'var(--accent)' }}>Processing…</span>
                  </div>
                ) : (
                  <div style={{ padding:'20px', background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)', borderRadius:'16px' }}>
                    <span style={{ fontSize:'0.85rem', color:'var(--muted)' }}>Tap the mic to answer</span>
                  </div>
                )}
              </div>

              {/* Mic button */}
              <button
                onClick={listening ? stopListening : startListening}
                disabled={speaking || loading}
                style={{
                  width:'96px', height:'96px', borderRadius:'50%',
                  background: listening ? 'rgba(255,82,82,0.15)' : speaking ? 'rgba(34,211,168,0.1)' : 'rgba(0,194,255,0.1)',
                  border: `3px solid ${listening ? 'rgba(255,82,82,0.5)' : speaking ? 'rgba(34,211,168,0.4)' : 'rgba(0,194,255,0.3)'}`,
                  cursor: (speaking || loading) ? 'default' : 'pointer',
                  fontSize:'2rem',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.2s',
                  margin:'0 auto',
                }}
              >
                {listening ? '⏹' : speaking ? '🔊' : '🎤'}
              </button>
              <div style={{ marginTop:'14px', fontSize:'0.78rem', color:'var(--muted)' }}>
                {listening ? 'Tap to stop' : speaking ? 'Interviewer speaking' : 'Tap to speak'}
              </div>
            </div>

            {/* Transcript (collapsible) */}
            {showText && (
              <div ref={chatRef} style={{ width:'100%', maxWidth:'580px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'20px', marginBottom:'16px', maxHeight:'30vh', overflowY:'auto', display:'flex', flexDirection:'column', gap:'12px' }}>
                <div style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--muted)', fontFamily:'DM Mono,monospace', textAlign:'center', marginBottom:'6px' }}>Transcript</div>
                {messages.map((m, i) => (
                  <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:m.role==='user'?'flex-end':'flex-start' }}>
                    <div style={{
                      maxWidth:'85%', padding:'10px 14px', borderRadius:'12px',
                      background: m.role==='user' ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                      color: m.role==='user' ? '#000' : 'var(--text)',
                      fontSize:'0.82rem', lineHeight:1.6, whiteSpace:'pre-wrap',
                    }}>
                      <div style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginBottom:'3px', color: m.role==='user' ? 'rgba(0,0,0,0.5)' : 'var(--accent)', fontFamily:'DM Mono,monospace' }}>
                        {m.role==='assistant' ? 'Interviewer' : 'You'}
                      </div>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}><div style={{ color:'var(--muted)' }}>Loading…</div></div>}>
      <InterviewContent />
    </Suspense>
  )
}
