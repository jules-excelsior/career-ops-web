import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Logo from '@/app/components/Logo'
import ScrollReveal from '@/app/components/ScrollReveal'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  const accent = '#00C2FF'

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)' }}>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'60px', background:'rgba(8,12,24,0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px' }}>
        <a href="/" style={{ textDecoration:'none' }}><Logo /></a>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <a href="/login" style={{ padding:'7px 18px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'6px', fontSize:'0.83rem', fontWeight:500, textDecoration:'none' }}>Sign In</a>
          <a href="/login" style={{ padding:'7px 18px', background:accent, color:'#000', border:'none', borderRadius:'6px', fontSize:'0.83rem', fontWeight:600, textDecoration:'none' }}>Get Started Free</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding:'140px 28px 80px', maxWidth:'720px', margin:'0 auto' }}>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2.4rem,5vw,3.4rem)', fontWeight:700, color:'var(--white)', lineHeight:1.2, marginBottom:'18px' }}>
          Know if a job is worth it — before you apply.
        </h1>
        <p style={{ fontSize:'1.08rem', color:'#8899bb', maxWidth:'560px', lineHeight:1.75, marginBottom:'36px' }}>
          Paste a job description. ResuMatch compares it against your profile and resume, grades it A–F, and helps you track every application.
        </p>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          <a href="/login" style={{ padding:'13px 28px', background:accent, color:'#000', border:'none', borderRadius:'8px', fontSize:'0.92rem', fontWeight:600, textDecoration:'none' }}>Start Evaluating Free</a>
          <a href="/login" style={{ padding:'13px 26px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'8px', fontSize:'0.92rem', fontWeight:500, textDecoration:'none' }}>I have an account</a>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth:'860px', margin:'0 auto', padding:'0 28px 90px' }}>
        <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.6rem', fontWeight:700, color:'var(--white)', marginBottom:'32px' }}>How it works</h2>
        <ScrollReveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'16px' }}>
          {[
            { step:'1', title:'Build your profile', desc:'Add your skills, experience, and paste your resume. This is what the AI uses to evaluate each job against your background.' },
            { step:'2', title:'Paste a job description', desc:'Drop in any job posting. The AI analyzes it across role fit, compensation, culture signals, and red flags.' },
            { step:'3', title:'Get your grade and track it', desc:'Receive an A–F score. Move the job through your pipeline from saved to applied to interview to offer.' },
          ].map(item => (
            <div key={item.step} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'24px' }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--accent)', fontFamily:'DM Mono,monospace', marginBottom:'12px' }}>Step {item.step}</div>
              <div style={{ fontWeight:700, color:'var(--white)', fontSize:'0.95rem', marginBottom:'8px' }}>{item.title}</div>
              <p style={{ fontSize:'0.84rem', color:'#8899bb', lineHeight:1.65 }}>{item.desc}</p>
            </div>
          ))}
          </div>
        </ScrollReveal>
      </section>

      {/* What you get */}
      <section style={{ maxWidth:'860px', margin:'0 auto', padding:'0 28px 90px' }}>
        <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.6rem', fontWeight:700, color:'var(--white)', marginBottom:'28px' }}>What you get</h2>
        <ScrollReveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))', gap:'12px' }}>
          {[
            { title:'AI-Powered Grading', desc:'Every job gets an A–F grade based on how well it matches your profile and resume.' },
            { title:'6-Dimension Analysis', desc:'Role summary, CV match, green flags, red flags, compensation analysis, and a recommendation.' },
            { title:'Kanban Pipeline', desc:'Drag and drop jobs from Saved → Applied → Interview → Offer. See your entire job search at a glance.' },
            { title:'Timestamp Tracking', desc:'Automatically logs when you applied, interviewed, or received an offer. Know your status on every opportunity.' },
            { title:'Resume-Aware Matching', desc:'Upload your resume once. Every evaluation compares the job against your actual skills.' },
            { title:'Private & Secure', desc:'Your data is private to your account. Compliant with the Data Privacy Act (RA 10173).' },
          ].map(f => (
            <div key={f.title} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'20px 22px' }}>
              <div style={{ fontWeight:600, color:'var(--white)', fontSize:'0.9rem', marginBottom:'6px' }}>{f.title}</div>
              <div style={{ fontSize:'0.82rem', color:'#8899bb', lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section style={{ textAlign:'center', padding:'0 28px 100px' }}>
        <div style={{ maxWidth:'500px', margin:'0 auto', padding:'44px 32px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px' }}>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.5rem', fontWeight:700, color:'var(--white)', marginBottom:'10px' }}>Stop guessing on job offers.</h2>
          <p style={{ color:'#8899bb', fontSize:'0.9rem', marginBottom:'24px', lineHeight:1.6 }}>Free forever. No credit card. No ads.</p>
          <a href="/login" style={{ display:'inline-block', padding:'13px 32px', background:accent, color:'#000', border:'none', borderRadius:'8px', fontSize:'0.92rem', fontWeight:600, textDecoration:'none' }}>Get Started</a>
        </div>
      </section>

      <footer style={{ borderTop:'1px solid var(--border)', padding:'28px', textAlign:'center' }}>
        <div style={{ marginBottom:'6px' }}><Logo size={22} /></div>
        <div style={{ fontSize:'0.72rem', color:'var(--muted)' }}>ResuMatch &copy; {new Date().getFullYear()} · Free for all job seekers</div>
      </footer>
    </div>
  )
}
