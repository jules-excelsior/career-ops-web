'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/app/components/Logo'
const GRADE_COLORS: Record<string,string> = { A:'#22D3A8', B:'#00C2FF', C:'#C9A84C', D:'#FB923C', F:'#ff5252' }
const GRADE_LABELS: Record<string,string> = { A:'Exceptional — Pursue Immediately', B:'Good — Worth Pursuing', C:'Average — Evaluate Carefully', D:'Below Average — Significant Concerns', F:'Poor — Avoid' }
export default function EvaluatePage() {
  const router = useRouter()
  const supabase = createClient()
  const [jdText, setJdText] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string|null>(null)
  const [token, setToken] = useState<string|null>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      setUserId(data.session.user.id)
      setToken(data.session.access_token)
    })
  }, [])
  const handleEvaluate = async () => {
    if (!jdText.trim() || jdText.length < 50) { setError('Please paste a complete job description (at least 50 characters).'); return }
    if (!userId || !token) { setError('Not logged in. Please refresh.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const headers = { 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` }
      const jobRes = await fetch('/api/jobs', { method:'POST', headers, body: JSON.stringify({ company:'Evaluating…', role:'Evaluating…', jd_text:jdText, job_url:jobUrl || null, status:'saved', user_id:userId }) })
      const jobData = await jobRes.json()
      if (!jobData.job) { setError(jobData.error || 'Failed to create job record.'); setLoading(false); return }
      const evalRes = await fetch('/api/evaluate', { method:'POST', headers, body: JSON.stringify({ jd_text:jdText, job_id:jobData.job.id, user_id:userId }) })
      const evalData = await evalRes.json()
      if (evalData.error) { setError(evalData.error); setLoading(false); return }
      setResult({ ...evalData.parsed, job_id:jobData.job.id })
    } catch (e: any) { setError(e.message||'Something went wrong.') }
    setLoading(false)
  }
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'56px', background:'rgba(8,12,24,0.95)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', backdropFilter:'blur(12px)' }}>
        <Logo />
        <button onClick={() => router.push('/dashboard')} style={{ padding:'6px 16px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'8px', fontSize:'0.82rem' }}>← Pipeline</button>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => router.push('/profile')} style={{ padding:'6px 16px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'8px', fontSize:'0.82rem' }}>Profile</button>
        </div>
      </nav>
      <main style={{ paddingTop:'80px', maxWidth:'820px', margin:'0 auto', padding:'80px 24px 60px' }}>
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gold)', fontFamily:'DM Mono,monospace', marginBottom:'10px' }}>AI Job Evaluator</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:700, color:'var(--white)', marginBottom:'10px' }}>Evaluate a Job Offer</h1>
           <p style={{ color:'var(--muted)', fontSize:'0.9rem', lineHeight:1.7 }}>Paste a job description below. AI will analyze it and give you an A–F grade with a clear recommendation.</p>
        </div>
        {!result && (
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'28px' }}>
            <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--muted)', marginBottom:'10px' }}>Job Posting URL (optional)</label>
            <input value={jobUrl} onChange={e => setJobUrl(e.target.value)} placeholder="https://... (link to the job posting so you can apply later)" style={{ marginBottom:'20px' }} />
            <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--muted)', marginBottom:'10px' }}>Job Description</label>
            <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste the full job description here..." rows={14} style={{ resize:'vertical', lineHeight:1.75 }} />
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px', marginBottom:'18px' }}>
              <span style={{ fontSize:'0.72rem', color:'var(--muted)', fontFamily:'DM Mono,monospace' }}>{jdText.length} chars</span>
              <span style={{ fontSize:'0.72rem', color:'var(--muted)' }}>Min 50 characters</span>
            </div>
            {error && <div style={{ padding:'12px 16px', background:'rgba(255,82,82,0.08)', border:'1px solid rgba(255,82,82,0.25)', borderRadius:'10px', color:'var(--danger)', fontSize:'0.85rem', marginBottom:'16px' }}>{error}</div>}
            <button onClick={handleEvaluate} disabled={loading} style={{ width:'100%', padding:'14px', background:loading?'rgba(0,194,255,0.3)':'var(--accent)', color:'#000', border:'none', borderRadius:'10px', fontSize:'1rem', fontWeight:700 }}>
              {loading ? '🤖 AI is evaluating…' : '🎯 Evaluate with AI →'}
            </button>
            {loading && <p style={{ textAlign:'center', marginTop:'12px', fontSize:'0.78rem', color:'var(--muted)' }}>Takes 10–20 seconds. AI is analyzing across 6 dimensions.</p>}
          </div>
        )}
        {result && (
          <div>
            <div style={{ background:`linear-gradient(135deg,${GRADE_COLORS[result.grade]}18,transparent)`, border:`1px solid ${GRADE_COLORS[result.grade]}44`, borderRadius:'20px', padding:'36px', marginBottom:'20px', textAlign:'center' }}>
              <div style={{ fontSize:'5rem', fontFamily:'DM Mono,monospace', fontWeight:700, color:GRADE_COLORS[result.grade], lineHeight:1, marginBottom:'8px' }}>{result.grade}</div>
              <div style={{ fontSize:'1.1rem', color:GRADE_COLORS[result.grade], fontWeight:600, marginBottom:'4px' }}>{GRADE_LABELS[result.grade]}</div>
              <div style={{ fontSize:'0.85rem', color:'var(--muted)', fontFamily:'DM Mono,monospace' }}>Score: {result.score}/5.0</div>
              <div style={{ maxWidth:'300px', margin:'14px auto 0', height:'6px', background:'rgba(255,255,255,0.08)', borderRadius:'3px', overflow:'hidden' }}><div style={{ height:'100%', width:`${(result.score/5)*100}%`, background:GRADE_COLORS[result.grade], borderRadius:'3px' }} /></div>
              <div style={{ marginTop:'14px', fontSize:'0.88rem', color:'var(--white)', fontWeight:600 }}>{result.company} — {result.role}</div>
              {result.location && <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:'4px' }}>📍 {result.location}</div>}
              {result.salary_range && <div style={{ fontSize:'0.8rem', color:'var(--gold)', marginTop:'4px' }}>💰 {result.salary_range}</div>}
            </div>
            {[
              { label:'📋 Role Summary', content:result.role_summary },
              { label:'🎯 CV Match', content:result.cv_match },
              { label:'✅ Green Flags', content:result.green_flags },
              { label:'⚠️ Red Flags', content:result.red_flags },
              { label:'💰 Compensation', content:result.compensation },
              { label:'💡 Recommendation', content:result.recommendation, highlight:true },
            ].map(({ label, content, highlight }) => (
              <div key={label} style={{ background:highlight?'rgba(201,168,76,0.06)':'var(--card)', border:`1px solid ${highlight?'rgba(201,168,76,0.25)':'var(--border)'}`, borderRadius:'14px', padding:'22px 24px', marginBottom:'12px' }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:highlight?'var(--gold)':'var(--accent)', fontFamily:'DM Mono,monospace', marginBottom:'10px' }}>{label}</div>
                <div style={{ fontSize:'0.9rem', color:'var(--text)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{content}</div>
              </div>
            ))}
            <div style={{ background:'rgba(34,211,168,0.08)', border:'1px solid rgba(34,211,168,0.25)', borderRadius:'12px', padding:'14px 20px', fontSize:'0.85rem', color:'var(--success)', marginBottom:'20px' }}>✓ Saved to your pipeline automatically</div>
            <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
              <button onClick={() => router.push('/dashboard')} style={{ flex:1, padding:'13px', background:'var(--accent)', color:'#000', border:'none', borderRadius:'10px', fontSize:'0.9rem', fontWeight:700 }}>View Pipeline →</button>
              <button onClick={() => { setResult(null); setJdText('') }} style={{ flex:1, padding:'13px', background:'transparent', color:'var(--muted)', border:'1px solid var(--border)', borderRadius:'10px', fontSize:'0.9rem' }}>Evaluate Another Job</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
