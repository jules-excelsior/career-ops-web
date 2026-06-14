'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/app/components/Logo'
export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const handleLogin = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ marginBottom:'6px' }}><Logo size={42} /></div>
          <p style={{ fontSize:'0.85rem', color:'var(--muted)' }}>AI-powered job evaluation</p>
          <p style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:'4px' }}>Free for all job seekers</p>
        </div>
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'36px' }}>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.6rem', fontWeight:700, color:'var(--white)', marginBottom:'6px' }}>Welcome back</h1>
          <p style={{ fontSize:'0.83rem', color:'var(--muted)', marginBottom:'28px' }}>Sign in to your ResuMatch account</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label style={{ display:'block', fontSize:'0.72rem', fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--muted)', marginBottom:'6px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" onKeyDown={e => e.key==='Enter' && handleLogin()} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.72rem', fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--muted)', marginBottom:'6px' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key==='Enter' && handleLogin()} />
            </div>
            {error && <div style={{ background:'rgba(255,82,82,0.08)', border:'1px solid rgba(255,82,82,0.25)', borderRadius:'8px', padding:'10px 14px', fontSize:'0.83rem', color:'var(--danger)' }}>{error}</div>}
            <button onClick={handleLogin} disabled={loading} style={{ padding:'13px', background:loading?'rgba(0,194,255,0.4)':'var(--accent)', color:'#000', border:'none', borderRadius:'8px', fontSize:'0.9rem', fontWeight:700, marginTop:'4px' }}>
              {loading ? 'Logging in…' : 'Log In →'}
            </button>
          </div>
          <p style={{ marginTop:'24px', fontSize:'0.78rem', color:'var(--muted)', textAlign:'center' }}>
            No account? <a href="https://excelsiorblueprint.com/signup" target="_blank" rel="noopener noreferrer" style={{ color:'var(--accent)', fontWeight:600 }}>Create a free account</a>
          </p>
        </div>
      </div>
    </div>
  )
}
