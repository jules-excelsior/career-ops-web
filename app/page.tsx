import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Logo from '@/app/components/Logo'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)', overflow:'hidden' }}>
      {/* Nav */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'64px', background:'rgba(8,12,24,0.9)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(26,39,68,0.4)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px' }}>
        <a href="/" style={{ textDecoration:'none' }}><Logo /></a>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <a href="/login" style={{ padding:'8px 20px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'8px', fontSize:'0.85rem', fontWeight:500, textDecoration:'none', transition:'all 0.15s' }}>Sign In</a>
          <a href="/login" style={{ padding:'8px 20px', background:'var(--gold)', color:'#000', border:'none', borderRadius:'8px', fontSize:'0.85rem', fontWeight:700, textDecoration:'none' }}>Get Started Free</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding:'160px 32px 100px', maxWidth:'840px', margin:'0 auto', textAlign:'center', position:'relative' }}>
        {/* Glow orbs */}
        <div className="glow-orb" style={{ width:'400px', height:'400px', background:'radial-gradient(circle, rgba(201,168,76,0.15), transparent)', top:'-80px', left:'-120px' }} />
        <div className="glow-orb" style={{ width:'300px', height:'300px', background:'radial-gradient(circle, rgba(0,194,255,0.1), transparent)', bottom:'-40px', right:'-80px' }} />
        <div className="glow-orb" style={{ width:'200px', height:'200px', background:'radial-gradient(circle, rgba(201,168,76,0.08), transparent)', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />

        <div style={{ display:'inline-block', marginBottom:'20px', padding:'6px 18px', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'100px', fontSize:'0.75rem', fontWeight:600, letterSpacing:'2px', textTransform:'uppercase', color:'var(--gold)', fontFamily:'DM Mono,monospace', position:'relative', zIndex:1 }}>
          AI-Powered Job Evaluation
        </div>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2.8rem,6vw,4rem)', fontWeight:700, color:'var(--white)', lineHeight:1.15, marginBottom:'20px', position:'relative', zIndex:1 }}>
          Your resume.<br/>
          <span className="text-shimmer">Every job.</span> One score.
        </h1>
        <p style={{ fontSize:'1.05rem', color:'var(--muted)', maxWidth:'560px', margin:'0 auto 36px', lineHeight:1.7, position:'relative', zIndex:1 }}>
          Paste a job description. ResuMatch compares it against your profile and resume, grades it A–F, and tracks every application through your pipeline.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <a href="/login" style={{ padding:'14px 32px', background:'var(--gold)', color:'#000', border:'none', borderRadius:'10px', fontSize:'0.95rem', fontWeight:700, textDecoration:'none', transition:'all 0.15s' }}>Start Evaluating Free →</a>
          <a href="/login" style={{ padding:'14px 28px', background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'10px', fontSize:'0.95rem', fontWeight:500, textDecoration:'none', transition:'all 0.15s' }}>I have an account</a>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ maxWidth:'700px', margin:'0 auto 80px', display:'flex', justifyContent:'center', gap:'60px', flexWrap:'wrap', padding:'0 32px' }}>
        {[
          { value:'A–F', label:'Grading scale' },
          { value:'6', label:'Analysis dimensions' },
          { value:'5', label:'Pipeline stages' },
        ].map(s => (
          <div key={s.label} style={{ textAlign:'center' }}>
            <div style={{ fontSize:'1.6rem', fontWeight:700, color:'var(--white)', fontFamily:'DM Mono,monospace', marginBottom:'4px' }}>{s.value}</div>
            <div style={{ fontSize:'0.78rem', color:'var(--muted)', letterSpacing:'0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <section style={{ maxWidth:'900px', margin:'0 auto', padding:'0 32px 100px' }}>
        <div style={{ textAlign:'center', marginBottom:'56px' }}>
          <div style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gold)', fontFamily:'DM Mono,monospace', marginBottom:'12px' }}>How It Works</div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:700, color:'var(--white)' }}>Three steps to smarter job decisions</h2>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'20px' }}>
          {[
            { step:'01', title:'Build Your Profile', desc:'Add your target role, skills, experience, and paste your resume. ResuMatch uses this to evaluate every job against your actual background.' },
            { step:'02', title:'Paste a Job Description', desc:'Drop in any job posting. Our AI analyzes it across 6 dimensions — role fit, compensation, culture signals, and red flags you might miss.' },
            { step:'03', title:'Get Your Grade & Track It', desc:'Receive an A–F score with a clear recommendation. Move the job through your pipeline from saved → applied → interview → offer.' },
          ].map(item => (
          <div key={item.step} className="card-3d">
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'28px', transition:'all 0.2s' }}>
              <div style={{ fontSize:'2.4rem', fontWeight:700, color:'var(--gold)', fontFamily:'Cormorant Garamond,serif', lineHeight:1, marginBottom:'16px' }}>{item.step}</div>
              <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.15rem', fontWeight:700, color:'var(--white)', marginBottom:'10px' }}>{item.title}</h3>
              <p style={{ fontSize:'0.85rem', color:'var(--muted)', lineHeight:1.7 }}>{item.desc}</p>
            </div>
          </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section style={{ maxWidth:'900px', margin:'0 auto', padding:'0 32px 100px' }}>
        <div style={{ textAlign:'center', marginBottom:'56px' }}>
          <div style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gold)', fontFamily:'DM Mono,monospace', marginBottom:'12px' }}>Features</div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:700, color:'var(--white)' }}>Everything you need to evaluate offers</h2>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(380px, 1fr))', gap:'16px' }}>
          {[
            { icon:'🎯', title:'AI-Powered Grading', desc:'Every job gets an A–F grade based on how well it matches your profile, resume, and career goals. No more guessing.' },
            { icon:'📊', title:'6-Dimension Analysis', desc:'Role summary, CV match, green flags, red flags, compensation analysis, and a clear recommendation — all in seconds.' },
            { icon:'📋', title:'Kanban Pipeline', desc:'Drag-and-drop jobs from Saved → Applied → Interview → Offer. Visualize your entire job search at a glance.' },
            { icon:'⏱️', title:'Timestamp Tracking', desc:'Automatically logs when you applied, interviewed, or received an offer. Know exactly where you stand with every opportunity.' },
            { icon:'📝', title:'Resume-Aware Matching', desc:'Upload your resume once. Every evaluation compares the job requirements against your actual skills and experience.' },
            { icon:'🔒', title:'Private & Secure', desc:'Your profile, resume, and job data are private to your account. No tracking, no ads, no data selling.' },
          ].map(f => (
            <div key={f.title} className="card-3d">
              <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'24px 28px', display:'flex', gap:'16px', alignItems:'flex-start' }}>
              <div style={{ fontSize:'1.6rem', flexShrink:0, lineHeight:1 }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight:700, color:'var(--white)', fontSize:'0.92rem', marginBottom:'6px' }}>{f.title}</div>
                <div style={{ fontSize:'0.82rem', color:'var(--muted)', lineHeight:1.6 }}>{f.desc}</div>
              </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign:'center', padding:'0 32px 120px' }}>
        <div style={{ maxWidth:'520px', margin:'0 auto', padding:'52px 36px', background:'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))', border:'1px solid rgba(201,168,76,0.15)', borderRadius:'20px' }}>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.6rem,3vw,2rem)', fontWeight:700, color:'var(--white)', marginBottom:'12px' }}>Ready to stop guessing on job offers?</h2>
          <p style={{ color:'var(--muted)', fontSize:'0.92rem', marginBottom:'28px', lineHeight:1.6 }}>Create your profile, upload your resume, and get AI-powered grades on every job — free.</p>
          <a href="/login" style={{ display:'inline-block', padding:'14px 36px', background:'var(--gold)', color:'#000', border:'none', borderRadius:'10px', fontSize:'0.95rem', fontWeight:700, textDecoration:'none' }}>Get Started — It's Free</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'32px', textAlign:'center' }}>
        <div style={{ marginBottom:'8px' }}><Logo size={24} /></div>
        <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>ResuMatch &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  )
}
