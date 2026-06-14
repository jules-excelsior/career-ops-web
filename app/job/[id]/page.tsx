'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/app/components/Logo'

const GRADE_COLORS: Record<string,string> = { A:'#22D3A8', B:'#00C2FF', C:'#C9A84C', D:'#FB923C', F:'#ff5252' }
const GRADE_LABELS: Record<string,string> = { A:'Exceptional — Pursue Immediately', B:'Good — Worth Pursuing', C:'Average — Evaluate Carefully', D:'Below Average — Significant Concerns', F:'Poor — Avoid' }

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [job, setJob] = useState<any>(null)
  const [evaluation, setEvaluation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string|null>(null)
  const [token, setToken] = useState<string|null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [generatingCover, setGeneratingCover] = useState(false)
  const [skillsGap, setSkillsGap] = useState<any>(null)
  const [showSkillsGap, setShowSkillsGap] = useState(false)
  const [generatingSkills, setGeneratingSkills] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      setUserId(data.session.user.id)
      setToken(data.session.access_token)
      fetchJob(data.session.user.id, data.session.access_token)
    })
  }, [])

  const fetchJob = async (uid: string, tok: string) => {
    const res = await fetch(`/api/job/${params.id}?user_id=${uid}`, { headers: { 'Authorization':`Bearer ${tok}` } })
    const data = await res.json()
    setJob(data.job)
    setEvaluation(data.evaluation)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ color:'var(--muted)' }}>Loading…</div>
    </div>
  )

  if (!job) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ color:'var(--muted)' }}>Job not found. <a href="/dashboard" style={{ color:'var(--accent)' }}>Back to Dashboard</a></div>
    </div>
  )

  const grade = evaluation?.grade
  const score = evaluation?.score

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
        {/* Job header */}
        <div style={{ marginBottom:'24px' }}>
          <div style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gold)', fontFamily:'DM Mono,monospace', marginBottom:'8px' }}>Evaluation Report</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:700, color:'var(--white)', marginBottom:'4px' }}>{job.role}</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.9rem' }}>{job.company}{job.location ? ` · ${job.location}` : ''}{job.salary_range ? ` · ${job.salary_range}` : ''}</p>
        </div>

        {/* Grade block */}
        {evaluation ? (
          <>
            <div style={{ background:`linear-gradient(135deg,${GRADE_COLORS[grade]}18,transparent)`, border:`1px solid ${GRADE_COLORS[grade]}44`, borderRadius:'20px', padding:'36px', marginBottom:'20px', textAlign:'center' }}>
              <div style={{ fontSize:'5rem', fontFamily:'DM Mono,monospace', fontWeight:700, color:GRADE_COLORS[grade], lineHeight:1, marginBottom:'8px' }}>{grade}</div>
              <div style={{ fontSize:'1.1rem', color:GRADE_COLORS[grade], fontWeight:600, marginBottom:'4px' }}>{GRADE_LABELS[grade]}</div>
              <div style={{ fontSize:'0.85rem', color:'var(--muted)', fontFamily:'DM Mono,monospace' }}>Score: {score}/5.0</div>
              <div style={{ maxWidth:'300px', margin:'14px auto 0', height:'6px', background:'rgba(255,255,255,0.08)', borderRadius:'3px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(score/5)*100}%`, background:GRADE_COLORS[grade], borderRadius:'3px' }} />
              </div>
            </div>

            {/* 6 blocks */}
            {[
              { label:'📋 Role Summary', content: evaluation.role_summary },
              { label:'🎯 CV Match', content: evaluation.cv_match },
              { label:'✅ Green Flags', content: evaluation.green_flags },
              { label:'⚠️ Red Flags', content: evaluation.red_flags },
              { label:'💰 Compensation', content: evaluation.compensation },
              { label:'💡 Recommendation', content: evaluation.recommendation, highlight: true },
            ].map(({ label, content, highlight }) => (
              <div key={label} style={{ background:highlight?'rgba(201,168,76,0.06)':'var(--card)', border:`1px solid ${highlight?'rgba(201,168,76,0.25)':'var(--border)'}`, borderRadius:'14px', padding:'22px 24px', marginBottom:'12px' }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:highlight?'var(--gold)':'var(--accent)', fontFamily:'DM Mono,monospace', marginBottom:'10px' }}>{label}</div>
                <div style={{ fontSize:'0.9rem', color:'var(--text)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{content || 'Not available'}</div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'32px', textAlign:'center', color:'var(--muted)' }}>
            <p>No evaluation found for this job.</p>
            <button onClick={() => router.push('/evaluate')} style={{ marginTop:'16px', padding:'10px 24px', background:'var(--accent)', color:'#000', border:'none', borderRadius:'8px', fontWeight:700 }}>Evaluate Now →</button>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginTop:'20px' }}>
          <button onClick={async () => {
            setGeneratingCover(true); setActionError('')
            try {
              const res = await fetch('/api/cover-letter', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body:JSON.stringify({ job_id:job.id, user_id:userId }) })
              const d = await res.json()
              if (d.error) { setActionError(d.error); return }
              setCoverLetter(d.letter); setShowCoverLetter(true)
            } catch { setActionError('Failed') }
            finally { setGeneratingCover(false) }
          }} disabled={generatingCover} style={{ padding:'10px 20px', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'8px', color:'var(--gold)', fontSize:'0.82rem', fontWeight:600, cursor:generatingCover?'wait':'pointer' }}>
            {generatingCover ? 'Generating…' : '📝 Cover Letter'}
          </button>
          <button onClick={async () => {
            setGeneratingSkills(true); setActionError('')
            try {
              const res = await fetch('/api/skills-gap', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body:JSON.stringify({ job_id:job.id, user_id:userId }) })
              const d = await res.json()
              if (d.error) { setActionError(d.error); return }
              setSkillsGap(d); setShowSkillsGap(true)
            } catch { setActionError('Failed') }
            finally { setGeneratingSkills(false) }
          }} disabled={generatingSkills} style={{ padding:'10px 20px', background:'rgba(0,194,255,0.08)', border:'1px solid rgba(0,194,255,0.25)', borderRadius:'8px', color:'var(--accent)', fontSize:'0.82rem', fontWeight:600, cursor:generatingSkills?'wait':'pointer' }}>
            {generatingSkills ? 'Analyzing…' : '🎯 Skills Gap'}
          </button>
          <a href={`/interview?job_id=${job.id}`} style={{ padding:'10px 20px', background:'rgba(34,211,168,0.08)', border:'1px solid rgba(34,211,168,0.25)', borderRadius:'8px', color:'var(--success)', fontSize:'0.82rem', fontWeight:600, textDecoration:'none', display:'inline-block' }}>
            🎤 Interview Simulator
          </a>
        </div>

        {actionError && <div style={{ marginTop:'10px', padding:'10px 14px', background:'rgba(255,82,82,0.08)', border:'1px solid rgba(255,82,82,0.25)', borderRadius:'8px', color:'var(--danger)', fontSize:'0.82rem' }}>{actionError}</div>}

        {/* Cover letter result */}
        {showCoverLetter && (
          <div style={{ marginTop:'16px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--gold)', fontFamily:'DM Mono,monospace' }}>Cover Letter</div>
              <button onClick={() => setShowCoverLetter(false)} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:'1.2rem', cursor:'pointer' }}>×</button>
            </div>
            <div style={{ fontSize:'0.85rem', color:'var(--text)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{coverLetter}</div>
            <button onClick={() => { navigator.clipboard.writeText(coverLetter) }} style={{ marginTop:'12px', padding:'8px 18px', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'6px', color:'var(--gold)', fontSize:'0.78rem', cursor:'pointer' }}>📋 Copy to Clipboard</button>
          </div>
        )}

        {/* Skills gap result */}
        {showSkillsGap && skillsGap && (
          <div style={{ marginTop:'16px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--accent)', fontFamily:'DM Mono,monospace' }}>Skills Gap Analysis</div>
              <button onClick={() => setShowSkillsGap(false)} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:'1.2rem', cursor:'pointer' }}>×</button>
            </div>
            {skillsGap.match_percent && (
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--gold)', fontFamily:'DM Mono,monospace' }}>{skillsGap.match_percent}% Match</div>
                <div style={{ maxWidth:'200px', height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', marginTop:'6px' }}>
                  <div style={{ height:'100%', width:`${skillsGap.match_percent}%`, background:'var(--gold)', borderRadius:'2px' }} />
                </div>
              </div>
            )}
            {skillsGap.matching_skills?.length > 0 && (
              <div style={{ marginBottom:'12px' }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--success)', marginBottom:'6px' }}>✅ Matching Skills</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {skillsGap.matching_skills.map((s:string)=><span key={s} style={{ padding:'4px 12px', background:'rgba(34,211,168,0.08)', border:'1px solid rgba(34,211,168,0.2)', borderRadius:'100px', fontSize:'0.76rem', color:'var(--success)' }}>{s}</span>)}
                </div>
              </div>
            )}
            {skillsGap.missing_skills?.length > 0 && (
              <div style={{ marginBottom:'12px' }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--danger)', marginBottom:'6px' }}>❌ Missing Skills</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {skillsGap.missing_skills.map((s:string)=><span key={s} style={{ padding:'4px 12px', background:'rgba(255,82,82,0.08)', border:'1px solid rgba(255,82,82,0.2)', borderRadius:'100px', fontSize:'0.76rem', color:'var(--danger)' }}>{s}</span>)}
                </div>
              </div>
            )}
            {skillsGap.recommendation && <p style={{ fontSize:'0.85rem', color:'var(--muted)', lineHeight:1.7, marginBottom:'12px' }}>{skillsGap.recommendation}</p>}
            {skillsGap.learning_resources?.length > 0 && (
              <div>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--gold)', marginBottom:'6px' }}>📚 Learning Resources</div>
                {skillsGap.learning_resources.map((r:string)=><div key={r} style={{ fontSize:'0.82rem', color:'var(--muted)', padding:'3px 0' }}>• {r}</div>)}
              </div>
            )}
          </div>
        )}

        {/* Status update */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px 24px', marginTop:'20px' }}>
          <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--muted)', fontFamily:'DM Mono,monospace', marginBottom:'10px' }}>Pipeline Status</div>
          <select defaultValue={job.status} onChange={async e => {
            await fetch('/api/jobs', { method:'PATCH', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ id:job.id, status:e.target.value, user_id:userId }) })
          }} style={{ width:'auto', fontSize:'0.88rem' }}>
            {['saved','applied','interview','offer','rejected'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>

        {/* JD preview */}
        {job.jd_text && (
          <details style={{ marginTop:'16px' }}>
            <summary style={{ cursor:'pointer', fontSize:'0.82rem', color:'var(--muted)', padding:'12px 0' }}>View original job description</summary>
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'20px', fontSize:'0.83rem', color:'var(--muted)', lineHeight:1.8, whiteSpace:'pre-wrap', marginTop:'8px' }}>{job.jd_text}</div>
          </details>
        )}
      </main>
    </div>
  )
}
