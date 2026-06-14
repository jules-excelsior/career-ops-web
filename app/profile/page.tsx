'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/app/components/Logo'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [token, setToken] = useState<string|null>(null)
  const [userId, setUserId] = useState<string|null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    target_role: '',
    industry: '',
    years_experience: '',
    skills: '',
    preferred_location: '',
    salary_expectations: '',
    resume_text: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      setUserId(data.session.user.id)
      setToken(data.session.access_token)
      loadProfile(data.session.access_token)
    })
  }, [])

  const loadProfile = async (tok: string) => {
    try {
      const res = await fetch('/api/profile', { headers: { 'Authorization': `Bearer ${tok}` } })
      const data = await res.json()
      if (data.profile) {
        setForm({
          name: data.profile.name || '',
          target_role: data.profile.target_role || '',
          industry: data.profile.industry || '',
          years_experience: data.profile.years_experience?.toString() || '',
          skills: Array.isArray(data.profile.skills) ? data.profile.skills.join(', ') : (data.profile.skills || ''),
          preferred_location: data.profile.preferred_location || '',
          salary_expectations: data.profile.salary_expectations || '',
          resume_text: data.profile.resume_text || '',
        })
      }
    } catch {} finally { setLoading(false) }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setSaved(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'text/plain' && file.type !== 'application/pdf' && !file.name.endsWith('.txt')) {
      setError('Please upload a .txt or .pdf file')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      setForm(prev => ({ ...prev, resume_text: text.substring(0, 10000) }))
      setSaved(false)
    }
    reader.readAsText(file)
  }

  const handleSave = async () => {
    if (!token) return
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          years_experience: form.years_experience ? Number(form.years_experience) : null,
        }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) { setError(e.message || 'Failed to save profile') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ color:'var(--muted)' }}>Loading profile…</div>
    </div>
  )

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--white)',
    fontSize: '0.88rem',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: '8px',
    fontFamily: 'DM Mono, monospace',
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)' }}>
      {/* Nav */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'56px', background:'rgba(8,12,24,0.95)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', backdropFilter:'blur(12px)' }}>
        <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', fontWeight:700, color:'var(--white)', cursor:'pointer' }} onClick={() => router.push('/dashboard')}>
          <div onClick={() => router.push('/dashboard')} style={{ cursor:'pointer' }}><Logo /></div>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'8px', fontSize:'0.82rem', cursor:'pointer' }}>Pipeline</button>
          <button onClick={() => router.push('/evaluate')} style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'8px', fontSize:'0.82rem', cursor:'pointer' }}>Evaluate</button>
        </div>
      </nav>

      <main style={{ paddingTop:'80px', maxWidth:'740px', margin:'0 auto', padding:'80px 24px 60px' }}>
        <div style={{ marginBottom:'40px' }}>
          <div style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gold)', fontFamily:'DM Mono,monospace', marginBottom:'10px' }}>Your Profile</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.8rem,4vw,2.4rem)', fontWeight:700, color:'var(--white)', marginBottom:'10px' }}>Career Profile & Resume</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.9rem', lineHeight:1.7 }}>This information is used to personalize job evaluations. The more complete your profile, the more accurate the AI grading.</p>
        </div>

        {error && <div style={{ padding:'12px 16px', background:'rgba(255,82,82,0.08)', border:'1px solid rgba(255,82,82,0.25)', borderRadius:'10px', color:'var(--danger)', fontSize:'0.85rem', marginBottom:'20px' }}>{error}</div>}

        <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
          {/* Personal Info Section */}
          <section style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'28px' }}>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.2rem', fontWeight:700, color:'var(--white)', marginBottom:'24px' }}>Personal Information</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'18px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input value={form.name} onChange={handleChange('name')} placeholder="Your full name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Target Role</label>
                <input value={form.target_role} onChange={handleChange('target_role')} placeholder="e.g. Senior Software Engineer" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Industry</label>
                <input value={form.industry} onChange={handleChange('industry')} placeholder="e.g. FinTech, Healthcare" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Years Experience</label>
                <input value={form.years_experience} onChange={handleChange('years_experience')} type="number" placeholder="e.g. 5" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Skills</label>
                <input value={form.skills} onChange={handleChange('skills')} placeholder="e.g. React, TypeScript, Node.js" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Preferred Location</label>
                <input value={form.preferred_location} onChange={handleChange('preferred_location')} placeholder="e.g. Remote, Singapore" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Salary Expectations</label>
                <input value={form.salary_expectations} onChange={handleChange('salary_expectations')} placeholder="e.g. $120,000–$150,000" style={inputStyle} />
              </div>
            </div>
          </section>

          {/* Resume Section */}
          <section style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'28px' }}>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.2rem', fontWeight:700, color:'var(--white)', marginBottom:'8px' }}>Resume / CV</h2>
            <p style={{ color:'var(--muted)', fontSize:'0.82rem', marginBottom:'20px', lineHeight:1.6 }}>Paste your resume text below, or upload a .txt file. This is used by the AI to evaluate how well you match each job description.</p>
            <div style={{ marginBottom:'14px' }}>
              <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} style={{ fontSize:'0.82rem', color:'var(--muted)', cursor:'pointer' }} />
            </div>
            <textarea
              value={form.resume_text}
              onChange={handleChange('resume_text')}
              placeholder="Paste your resume / CV text here…&#10;&#10;Include:&#10;- Work experience (company, role, dates)&#10;- Education&#10;- Skills & technologies&#10;- Certifications&#10;- Projects"
              rows={16}
              style={{ ...inputStyle, resize:'vertical', lineHeight:1.7, minHeight:'240px', fontFamily:'DM Mono,monospace', fontSize:'0.82rem' }}
            />
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'8px' }}>
              <span style={{ fontSize:'0.72rem', color:'var(--muted)', fontFamily:'DM Mono,monospace' }}>{form.resume_text.length} chars</span>
              <span style={{ fontSize:'0.72rem', color:'var(--muted)' }}>Max 10,000 characters</span>
            </div>
          </section>

          {/* Save */}
          <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding:'14px 32px',
                background: saving ? 'rgba(184,151,90,0.3)' : 'var(--gold)',
                color: saving ? 'rgba(0,0,0,0.4)' : '#000',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
            {saved && <span style={{ fontSize:'0.85rem', color:'var(--success)' }}>✓ Profile saved</span>}
          </div>
        </div>
      </main>
    </div>
  )
}
