'use client'
import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/app/components/Logo'

const TABS = [
  { key: 'resume', label: 'Resume Writing' },
  { key: 'boards', label: 'Where to Apply' },
  { key: 'interview', label: 'Interview Prep' },
  { key: 'salary', label: 'Salary & Negotiation' },
  { key: 'news', label: 'Job Market News' },
  { key: 'training', label: 'Free Training' },
  { key: 'career', label: 'Career Growth' },
]

const RESOURCES: Record<string, { tips: string[]; sources: { title: string; url: string; desc: string; type: string }[] }> = {
  resume: {
    tips: [
      'Quantify your achievements — use numbers, percentages, and dollar amounts wherever possible.',
      'Tailor your resume to each job — mirror keywords from the job description.',
      'Keep it to one page if you have under 10 years of experience; two pages maximum for senior roles.',
      'Lead with a strong professional summary — 2-3 sentences that capture your value proposition.',
      'Use action verbs: Led, Built, Delivered, Optimized, Launched, Reduced.',
      'Remove outdated sections like "References available upon request" and objective statements.',
      'Format consistently — same font, same spacing, same date format throughout.',
      'Save as PDF to preserve formatting across all devices and ATS systems.',
      'Include a skills section with both technical and soft skills relevant to the role.',
      'Proofread three times — typos are the #1 reason resumes get rejected.',
    ],
    sources: [
      { title: 'Harvard Resume & Cover Letter Guide', url: 'https://careerservices.fas.harvard.edu/resources/bullet-point-resume-template/', desc: 'Ivy League resume standards with downloadable templates', type: 'Guide' },
      { title: 'r/resumes — Reddit Resume Community', url: 'https://www.reddit.com/r/resumes/', desc: 'Peer-reviewed resume feedback, templates, and ATS advice', type: 'Community' },
      { title: 'The Muse — Resume Tips', url: 'https://www.themuse.com/advice/resumes', desc: 'Modern resume advice from career coaches and recruiters', type: 'Articles' },
      { title: 'LinkedIn Resume Builder', url: 'https://www.linkedin.com/learning/topics/resume-writing', desc: 'Free courses on resume writing from LinkedIn Learning', type: 'Course' },
      { title: 'Indeed Career Guide — Resumes', url: 'https://www.indeed.com/career-advice/resumes-cover-letters', desc: 'Step-by-step resume guides with examples by industry', type: 'Guide' },
      { title: 'Canva Resume Templates', url: 'https://www.canva.com/resumes/templates/', desc: 'Free, professionally-designed resume templates', type: 'Tool' },
      { title: 'Enhancv Resume Builder', url: 'https://enhancv.com/', desc: 'ATS-friendly resume builder with content suggestions', type: 'Tool' },
      { title: 'Jobscan ATS Checker', url: 'https://www.jobscan.co/', desc: 'Check if your resume will pass ATS filters for specific jobs', type: 'Tool' },
    ],
  },
  boards: {
    tips: [
      'Create profiles on 3-5 platforms — do not spread yourself too thin across too many sites.',
      'Complete your profile 100% on each platform — incomplete profiles rank lower in search results.',
      'Set up job alerts with specific keywords — let opportunities come to you daily.',
      'For freelance platforms, start with a competitive rate to build reviews, then increase over time.',
      'Customize your pitch for each platform — what works on LinkedIn does not work on Upwork.',
      'Check platform-specific scam patterns — if it sounds too good to be true, it usually is.',
      'Update your availability status weekly — active profiles get more recruiter attention.',
      'For remote jobs, filter by timezone overlap to find roles that match your working hours.',
    ],
    sources: [
      // Global job boards
      { title: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/', desc: 'World\'s largest professional network — job listings, company insights, and recruiter connections', type: 'Global' },
      { title: 'Indeed', url: 'https://www.indeed.com/', desc: 'Aggregates listings from thousands of sites — largest job search engine worldwide', type: 'Global' },
      { title: 'Glassdoor', url: 'https://www.glassdoor.com/Job/index.htm', desc: 'Jobs with company reviews, salary data, and interview insights built-in', type: 'Global' },
      { title: 'ZipRecruiter', url: 'https://www.ziprecruiter.com/', desc: 'AI-powered job matching — apply to multiple jobs with one click', type: 'Global' },
      { title: 'Google Jobs', url: 'https://www.google.com/search?q=jobs', desc: 'Aggregated job search directly in Google — pulls from all major boards', type: 'Global' },
      // PH platforms
      { title: 'JobStreet Philippines', url: 'https://www.jobstreet.com.ph/', desc: 'Leading job portal in the Philippines — local and regional opportunities', type: 'PH' },
      { title: 'OnlineJobs.ph', url: 'https://www.onlinejobs.ph/', desc: '#1 platform for Filipino remote workers — VA, web dev, customer support roles', type: 'PH' },
      { title: 'Mynimo', url: 'https://www.mynimo.com/', desc: 'Cebu-based job portal — strong in Visayas and Mindanao regions', type: 'PH' },
      { title: 'Kalibrr', url: 'https://www.kalibrr.com/', desc: 'Skills-based job matching platform — popular with startups and tech companies', type: 'PH' },
      { title: 'Bossjob', url: 'https://bossjob.ph/', desc: 'Chat-based job matching — direct messaging with employers', type: 'PH' },
      // Freelance platforms
      { title: 'Upwork', url: 'https://www.upwork.com/', desc: 'Largest freelance marketplace — hourly and fixed-price projects across all categories', type: 'Freelance' },
      { title: 'Fiverr', url: 'https://www.fiverr.com/', desc: 'Service-based gig marketplace — sell your skills starting at $5 per gig', type: 'Freelance' },
      { title: 'Freelancer', url: 'https://www.freelancer.com/', desc: 'Global freelancing platform with contests and milestone-based projects', type: 'Freelance' },
      { title: 'Toptal', url: 'https://www.toptal.com/', desc: 'Premium freelance network — top 3% of talent, higher rates, rigorous screening', type: 'Freelance' },
      { title: 'PeoplePerHour', url: 'https://www.peopleperhour.com/', desc: 'UK-based freelance platform — strong in creative and digital services', type: 'Freelance' },
      // Remote-first platforms
      { title: 'We Work Remotely', url: 'https://weworkremotely.com/', desc: 'Largest remote work community — programming, design, marketing, customer support', type: 'Remote' },
      { title: 'Remote OK', url: 'https://remoteok.com/', desc: 'Aggregates remote jobs from across the web — filter by tech stack and timezone', type: 'Remote' },
      { title: 'FlexJobs', url: 'https://www.flexjobs.com/', desc: 'Hand-screened remote, hybrid, and flexible jobs — no scams, paid membership', type: 'Remote' },
      { title: 'Working Nomads', url: 'https://www.workingnomads.com/jobs', desc: 'Curated remote job lists for digital nomads — delivered daily to your inbox', type: 'Remote' },
      { title: 'Remotive', url: 'https://remotive.com/', desc: 'Active remote job community with a live job board and Slack community', type: 'Remote' },
      // VA-specific platforms
      { title: 'Virtual Staff Finder', url: 'https://www.virtualstafffinder.com/', desc: 'Matches Filipino VAs with businesses — full placement service', type: 'VA' },
      { title: 'FreeUp', url: 'https://freeup.net/', desc: 'Pre-vetted freelance marketplace — VA, eCommerce, and digital marketing roles', type: 'VA' },
      { title: 'Belay', url: 'https://belaysolutions.com/', desc: 'US-based VA staffing — virtual assistants, bookkeepers, and web specialists', type: 'VA' },
      { title: 'Time Etc', url: 'https://web.timeetc.com/', desc: 'Virtual assistant platform — US and UK clients, flexible hours', type: 'VA' },
      { title: 'Wing Assistant', url: 'https://www.wingassistant.com/', desc: 'Dedicated virtual assistants for businesses — managed service model', type: 'VA' },
      { title: 'Athena', url: 'https://www.athenago.com/', desc: 'Executive assistant matching — premium VA roles with career growth paths', type: 'VA' },
      // International job portals
      { title: 'SEEK (AU/NZ)', url: 'https://www.seek.com.au/', desc: 'Leading job portal for Australia and New Zealand — all industries', type: 'Intl' },
      { title: 'Jora Worldwide', url: 'https://au.jora.com/', desc: 'Global job search engine covering 36 countries — aggregates multiple sources', type: 'Intl' },
      { title: 'EuroJobs', url: 'https://www.eurojobs.com/', desc: 'Job portal focused on European Union — multilingual listings', type: 'Intl' },
      { title: 'JobsDB (Asia)', url: 'https://my.jobsdb.com/', desc: 'Southeast Asia job portal — Singapore, Malaysia, Thailand, Hong Kong', type: 'Intl' },
      { title: 'Naukri (India)', url: 'https://www.naukri.com/', desc: 'India\'s largest job site — IT, engineering, management roles', type: 'Intl' },
      { title: 'Bayt (Middle East)', url: 'https://www.bayt.com/', desc: 'Middle East and North Africa job portal — all industries', type: 'Intl' },
      { title: 'Workopolis (Canada)', url: 'https://www.workopolis.com/', desc: 'Canadian job board — bilingual English/French listings', type: 'Intl' },
    ],
  },
  interview: {
    tips: [
      'Research the company thoroughly — know their products, recent news, and competitors.',
      'Practice the STAR method: Situation, Task, Action, Result for behavioral questions.',
      'Prepare 3-5 stories that demonstrate your biggest achievements and challenges overcome.',
      'Have thoughtful questions ready — ask about team culture, growth paths, and success metrics.',
      'Dress one level above the company dress code — when in doubt, business casual.',
      'Arrive 10-15 minutes early for in-person; log in 5 minutes early for virtual.',
      'Send a thank-you email within 24 hours — reference specific points from the conversation.',
      'Record yourself practicing — you will catch filler words and nervous habits.',
      'Know your salary range before the interview — be ready if asked about expectations.',
      'Follow up once if you have not heard back in 5-7 business days.',
    ],
    sources: [
      { title: 'Glassdoor Interview Questions', url: 'https://www.glassdoor.com/Interview/index.htm', desc: 'Real interview questions from thousands of companies', type: 'Database' },
      { title: 'Pramp — Free Mock Interviews', url: 'https://www.pramp.com/', desc: 'Practice technical and behavioral interviews with peers', type: 'Tool' },
      { title: 'LeetCode Discuss — Interview Experiences', url: 'https://leetcode.com/discuss/interview-experience', desc: 'Detailed interview experience reports by company', type: 'Community' },
      { title: 'Big Interview', url: 'https://www.biginterview.com/', desc: 'AI-powered interview practice with feedback', type: 'Tool' },
      { title: 'The Balance Careers — Interview Tips', url: 'https://www.thebalancemoney.com/job-interviews-4161916', desc: 'Comprehensive interview guide covering all formats', type: 'Guide' },
      { title: 'Levels.fyi — Interview Guides', url: 'https://www.levels.fyi/interview/', desc: 'Tech company-specific interview process breakdowns', type: 'Guide' },
    ],
  },
  salary: {
    tips: [
      'Always research market rates before negotiating — use multiple sources for your role, location, and level.',
      'Let the employer name the first number whenever possible — deflect with "I am focused on finding the right fit."',
      'Negotiate the full package — base salary, bonus, equity, sign-on, PTO, remote flexibility, learning budget.',
      'Frame requests around value — "Based on my experience delivering X, I believe Y is fair."',
      'Get offers in writing before making counter-offers.',
      'Know your walk-away number before entering any negotiation.',
      'Silence is a negotiation tool — after stating your number, stop talking.',
      'Research the company\'s compensation philosophy — some have strict bands, others are flexible.',
      'Time your negotiation — after an offer is extended, before you accept.',
      'Practice your negotiation conversation out loud — it reduces anxiety.',
    ],
    sources: [
      { title: 'Levels.fyi — Compensation Data', url: 'https://www.levels.fyi/', desc: 'Crowdsourced salary data for tech companies worldwide', type: 'Database' },
      { title: 'Glassdoor Salaries', url: 'https://www.glassdoor.com/Salaries/index.htm', desc: 'Salary reports by company, role, and location', type: 'Database' },
      { title: 'Payscale Salary Calculator', url: 'https://www.payscale.com/', desc: 'Personalized salary reports based on your profile', type: 'Tool' },
      { title: 'HBR — Salary Negotiation', url: 'https://hbr.org/topic/salary-negotiation', desc: 'Harvard Business Review articles on negotiation strategy', type: 'Articles' },
      { title: 'Salary.com', url: 'https://www.salary.com/', desc: 'Salary data with cost-of-living adjustments', type: 'Database' },
      { title: '81cents — Closing the Pay Gap', url: 'https://www.81cents.com/', desc: 'Salary data and negotiation support for underrepresented groups', type: 'Tool' },
    ],
  },
  news: {
    tips: [
      'Job openings change weekly — check market reports monthly to stay ahead of hiring trends.',
      'Remote job listings grew 300%+ since 2020 — this trend is permanent, not temporary.',
      'AI and data roles are growing 30% year-over-year across all industries.',
      'Salary transparency laws (EU, NY, CA, CO) are reshaping negotiation — know the posted range.',
      'Green jobs and sustainability roles are the fastest-growing sector in Europe.',
      'Contract and freelance work now represents 36% of the global workforce.',
      'The Philippines BPO sector employs 1.4M+ and grows 8-10% annually.',
      'Skills-based hiring is replacing degree requirements — 59% of employers now prioritize skills over credentials.',
    ],
    sources: [
      { title: 'US Bureau of Labor Statistics', url: 'https://www.bls.gov/', desc: 'Official US employment data, wage statistics, occupation outlook, and CPI', type: 'Stats' },
      { title: 'ILO — Global Employment Trends', url: 'https://www.ilo.org/global/research/global-reports/weso/lang--en/index.htm', desc: 'World Employment and Social Outlook — global job market data', type: 'Stats' },
      { title: 'LinkedIn Workforce Report', url: 'https://economicgraph.linkedin.com/', desc: 'Real-time labor market insights — hiring rates, skills gaps, migration', type: 'Stats' },
      { title: 'OECD Employment Outlook', url: 'https://www.oecd.org/en/publications/oecd-employment-outlook.html', desc: 'Employment and wage data across 38 developed economies', type: 'Stats' },
      { title: 'Philippine Statistics Authority — Labor', url: 'https://psa.gov.ph/statistics/labor-force-survey', desc: 'PH employment rate, underemployment, and industry trends', type: 'Stats' },
      { title: 'World Bank Jobs Data', url: 'https://www.worldbank.org/en/topic/jobsanddevelopment', desc: 'Global employment indicators, youth employment, and labor policy', type: 'Stats' },
      { title: 'Glassdoor Economic Research', url: 'https://www.glassdoor.com/research/', desc: 'Salary trends, hiring outlook, and workplace satisfaction data', type: 'News' },
      { title: 'Indeed Hiring Lab', url: 'https://www.hiringlab.org/', desc: 'Labor market analysis — job posting trends, wage growth, sector shifts', type: 'News' },
      { title: 'Forbes Careers', url: 'https://www.forbes.com/careers/', desc: 'Career news, workplace trends, and leadership advice', type: 'News' },
      { title: 'TechCrunch — Jobs & Funding', url: 'https://techcrunch.com/category/fundraising/', desc: 'Tech company funding and hiring — signals where jobs are growing', type: 'News' },
      { title: 'Layoffs.fyi', url: 'https://layoffs.fyi/', desc: 'Tech layoff tracker — real-time data on company downsizing and hiring freezes', type: 'Stats' },
      { title: 'Remote Work Report by Buffer', url: 'https://buffer.com/state-of-remote-work', desc: 'Annual survey of remote workers — challenges, benefits, and trends', type: 'Stats' },
      { title: 'Freelancing in America (Upwork)', url: 'https://www.upwork.com/research/freelancing-in-america', desc: 'Annual freelancing study — rates, demographics, industry growth', type: 'Stats' },
      { title: 'PH IT-BPM Industry Roadmap', url: 'https://www.ibpap.org/', desc: 'Philippine IT and business process management industry data and forecasts', type: 'Stats' },
    ],
  },
  training: {
    tips: [
      'Set a weekly learning goal — even 3 hours per week compounds to 150+ hours per year.',
      'Prioritize courses that offer a verifiable certificate — add them to your LinkedIn profile immediately.',
      'Choose skills that appear in job descriptions you want — align training with market demand.',
      'Build a portfolio project for every major course — employers value proof over certificates.',
      'Many platforms offer financial aid for certificates — always apply, approval rates are high.',
      'TESDA offers completely free assessments and certifications for Filipinos — use this for local credentials.',
      'Combine free technical training with soft skills — communication and problem-solving differentiate candidates.',
      'Join course communities on Discord or Reddit — networking while learning multiplies opportunities.',
    ],
    sources: [
      // Global MOOC platforms
      { title: 'Coursera (Audit Mode)', url: 'https://www.coursera.org/', desc: '7,000+ courses from top universities — audit for free, apply for financial aid for certificates', type: 'MOOC' },
      { title: 'edX (Audit Track)', url: 'https://www.edx.org/', desc: 'Harvard, MIT, Stanford courses — free audit option on most courses, certificates at cost', type: 'MOOC' },
      { title: 'Alison', url: 'https://alison.com/', desc: '4,000+ free courses with certificates — business, tech, health, language, trades', type: 'MOOC' },
      { title: 'Saylor Academy', url: 'https://www.saylor.org/', desc: '100+ free college-level courses with free certificates — business, CS, sciences', type: 'MOOC' },
      { title: 'OpenLearn (Open University)', url: 'https://www.open.edu/openlearn/', desc: '1,000+ free courses from UK\'s largest university — all levels, free badges', type: 'MOOC' },
      { title: 'FutureLearn', url: 'https://www.futurelearn.com/', desc: 'Free access to course content for limited time — British Council, universities', type: 'MOOC' },
      { title: 'Class Central', url: 'https://www.classcentral.com/', desc: 'Search engine for free online courses — aggregates Coursera, edX, FutureLearn, and more', type: 'MOOC' },

      // Tech skills training
      { title: 'FreeCodeCamp', url: 'https://www.freecodecamp.org/', desc: 'Completely free coding curriculum with 12 certifications — web dev, data science, Python, more', type: 'Tech' },
      { title: 'The Odin Project', url: 'https://www.theodinproject.com/', desc: 'Full-stack web development curriculum — Ruby, JavaScript, Node.js, completely free', type: 'Tech' },
      { title: 'CS50 (Harvard)', url: 'https://cs50.harvard.edu/x/', desc: 'Harvard\'s legendary intro to computer science — free, with free certificate option', type: 'Tech' },
      { title: 'Google Digital Garage', url: 'https://learndigital.withgoogle.com/digitalgarage/', desc: 'Free Google-certified courses — digital marketing, data, AI, career development', type: 'Tech' },
      { title: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/training/', desc: 'Free Microsoft technical training with certifications — Azure, AI, Power Platform, 365', type: 'Tech' },
      { title: 'IBM SkillsBuild', url: 'https://skillsbuild.org/', desc: 'Free IBM training with digital credentials — AI, cloud, cybersecurity, data science', type: 'Tech' },
      { title: 'AWS Skill Builder (Free Tier)', url: 'https://explore.skillbuilder.aws/', desc: 'Free AWS cloud training — 600+ courses, some with free digital badges', type: 'Tech' },
      { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', desc: 'Free micro-courses on Python, machine learning, SQL, and data visualization', type: 'Tech' },
      { title: 'Codecademy (Free Tier)', url: 'https://www.codecademy.com/catalog/free', desc: 'Free interactive coding courses — Python, JavaScript, SQL, HTML/CSS', type: 'Tech' },
      { title: 'W3Schools', url: 'https://www.w3schools.com/', desc: 'Free tutorials and references for web technologies — certificates available', type: 'Tech' },
      { title: 'Khan Academy — Computing', url: 'https://www.khanacademy.org/computing', desc: 'Free programming and computer science courses — beginner to AP level', type: 'Tech' },
      { title: 'GitHub Skills', url: 'https://skills.github.com/', desc: 'Free, interactive courses by GitHub — Git, GitHub Actions, Codespaces', type: 'Tech' },

      // PH-specific free training
      { title: 'TESDA Online Program (TOP)', url: 'https://e-tesda.gov.ph/', desc: 'FREE technical-vocational courses for Filipinos — 100+ courses with free national assessment', type: 'PH' },
      { title: 'DICT Digital Skills Training', url: 'https://dict.gov.ph/', desc: 'Free digital literacy and IT training programs by the PH government — nationwide', type: 'PH' },
      { title: 'DOST-SEI Courses', url: 'https://www.sei.dost.gov.ph/', desc: 'Free science and technology training — scholarships and learning resources', type: 'PH' },
      { title: 'UP Open University (Free Courses)', url: 'https://www.upou.edu.ph/', desc: 'Free online courses from the University of the Philippines — various disciplines', type: 'PH' },
      { title: 'TESDA Women\'s Center', url: 'https://www.tesda.gov.ph/GenderAndDevelopment/TWC', desc: 'Free skills training for women — IT, hospitality, automotive, electronics', type: 'PH' },
      { title: 'DOLE JobStart Philippines', url: 'https://jobstart.dole.gov.ph/', desc: 'Free life skills and technical training for young Filipinos (18-24)', type: 'PH' },
      { title: 'DICT Tech4ED', url: 'https://tech4ed.dict.gov.ph/', desc: 'Free ICT training centers nationwide — digital literacy for underserved communities', type: 'PH' },
      { title: 'Bayan Academy', url: 'https://www.bayanacademy.edu.ph/', desc: 'Free entrepreneurship and livelihood training — social enterprise focus', type: 'PH' },

      // Professional certificates (free)
      { title: 'HubSpot Academy', url: 'https://academy.hubspot.com/', desc: 'Free certifications in marketing, sales, service, and CRM — industry-recognized', type: 'Cert' },
      { title: 'Google Career Certificates (Scholarship)', url: 'https://grow.google/certificates/', desc: 'Professional certificates in IT support, data analytics, UX, PM — scholarship available', type: 'Cert' },
      { title: 'Meta Career Programs', url: 'https://www.metacareers.com/careerprograms/', desc: 'Free training in social media marketing, software engineering — certificates available', type: 'Cert' },
      { title: 'Salesforce Trailhead', url: 'https://trailhead.salesforce.com/', desc: 'Free Salesforce training with certifications — admin, developer, consultant paths', type: 'Cert' },
      { title: 'Atlassian University (Free Tier)', url: 'https://university.atlassian.com/', desc: 'Free Jira and Confluence training — project management fundamentals', type: 'Cert' },

      // English & communication
      { title: 'Duolingo', url: 'https://www.duolingo.com/', desc: 'Free language learning — 40+ languages including English, Spanish, Japanese', type: 'Language' },
      { title: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish/', desc: 'Free English lessons — grammar, vocabulary, pronunciation, business English', type: 'Language' },
      { title: 'British Council LearnEnglish', url: 'https://learnenglish.britishcouncil.org/', desc: 'Free English resources — reading, writing, listening, speaking, IELTS prep', type: 'Language' },

      // Others
      { title: 'edX — Try Before You Buy', url: 'https://www.edx.org/free-online-courses', desc: 'Curated list of completely free edX courses — filter by subject and level', type: 'MOOC' },
      { title: 'Business Operations Mastery (Free + Paid)', url: 'https://excelsiorblueprint.com/', desc: '26-module training platform — business ops, systems, SOPs, digital tools. Free content + Pro tier', type: 'MOOC' },
      { title: 'Remote Ops Mastery', url: 'https://remoteopsmastery.com/', desc: '9-module course for Filipino VAs and freelancers — remote work skills, client acquisition, pricing', type: 'PH' },
      { title: 'LinkedIn Learning (Free with Library Card)', url: 'https://www.linkedin.com/learning-login/go/library', desc: '16,000+ courses free with a participating library card — check your local library', type: 'MOOC' },
    ],
  },
  career: {
    tips: [
      'Update your LinkedIn profile monthly — treat it as your living portfolio, not a static resume.',
      'Build a personal brand — write, speak, or create content in your domain.',
      'Network with intention — one meaningful conversation beats 50 generic connection requests.',
      'Set 90-day career goals and review them quarterly — be specific and measurable.',
      'Invest in skills that compound — AI literacy, data analysis, and clear communication.',
      'Find a mentor outside your company — fresh perspective on your growth trajectory.',
      'Document your wins weekly — when review season comes, you will have a detailed list.',
      'Say yes to stretch assignments — growth happens at the edge of your comfort zone.',
      'Build relationships across departments — the best opportunities often come laterally.',
      'Take vacation — burnout reduces performance more than any skill gap.',
    ],
    sources: [
      { title: 'LinkedIn Learning', url: 'https://www.linkedin.com/learning/', desc: '16,000+ courses on business, tech, and creative skills', type: 'Course' },
      { title: 'Coursera Career Resources', url: 'https://www.coursera.org/career-academy', desc: 'Professional certificates from Google, Meta, IBM, and more', type: 'Course' },
      { title: 'HBR Ascend', url: 'https://hbr.org/ascend', desc: 'Career advice for early and mid-career professionals', type: 'Articles' },
      { title: 'The Pragmatic Engineer', url: 'https://blog.pragmaticengineer.com/', desc: 'Deep dives on engineering careers and tech industry trends', type: 'Newsletter' },
      { title: 'First Round Review', url: 'https://review.firstround.com/', desc: 'Actionable advice from startup leaders and operators', type: 'Articles' },
      { title: 'Reforge', url: 'https://www.reforge.com/', desc: 'Advanced career programs for product, growth, and engineering', type: 'Course' },
    ],
  },
}

export default function ResourcesPage() {
  const [tab, setTab] = useState('resume')

  const current = RESOURCES[tab]

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)' }}>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'56px', background:'rgba(8,12,24,0.95)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', backdropFilter:'blur(12px)' }}>
        <Link href="/" style={{ textDecoration:'none' }}><Logo /></Link>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <Link href="/login" style={{ padding:'6px 14px', background:'var(--gold)', color:'#000', border:'none', borderRadius:'8px', fontSize:'0.82rem', fontWeight:700, textDecoration:'none' }}>Get Started Free</Link>
        </div>
      </nav>

      <main style={{ paddingTop:'80px', maxWidth:'900px', margin:'0 auto', padding:'80px 24px 60px' }}>
        <div style={{ marginBottom:'40px' }}>
          <div style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gold)', fontFamily:'DM Mono,monospace', marginBottom:'10px' }}>Career Resources</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.8rem,4vw,2.4rem)', fontWeight:700, color:'var(--white)', marginBottom:'10px' }}>Resume Tips & Career Guides</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.9rem', lineHeight:1.7 }}>Curated advice from top career resources — resume writing, interview preparation, salary negotiation, and career growth.</p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'36px', flexWrap:'wrap', borderBottom:'1px solid var(--border)', paddingBottom:'12px' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding:'8px 18px',
                background: tab === t.key ? 'rgba(201,168,76,0.1)' : 'transparent',
                border: tab === t.key ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                borderRadius:'8px',
                color: tab === t.key ? 'var(--gold)' : 'var(--muted)',
                fontSize:'0.8rem',
                fontWeight: tab === t.key ? 600 : 400,
                cursor:'pointer',
                transition:'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tips */}
        <section style={{ marginBottom:'44px' }}>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', fontWeight:700, color:'var(--white)', marginBottom:'20px' }}>Quick Tips</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {current.tips.map((tip, i) => (
              <div key={i} className="card-3d">
                <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'16px 20px', display:'flex', gap:'14px', alignItems:'flex-start' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'7px', background:`rgba(201,168,76,0.12)`, border:'1px solid rgba(201,168,76,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'DM Mono,monospace', fontSize:'0.72rem', fontWeight:700, color:'var(--gold)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize:'0.88rem', color:'var(--text)', lineHeight:1.7 }}>{tip}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quality Sources */}
        <section>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', fontWeight:700, color:'var(--white)', marginBottom:'8px' }}>Quality Sources</h2>
          <p style={{ color:'var(--muted)', fontSize:'0.82rem', marginBottom:'20px' }}>Verified external resources — guides, tools, communities, and courses.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))', gap:'12px' }}>
            {current.sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="card-3d" style={{ textDecoration:'none', color:'inherit' }}>
                <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px 24px', height:'100%' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px', marginBottom:'8px' }}>
                    <div style={{ fontWeight:700, color:'var(--white)', fontSize:'0.92rem' }}>{s.title}</div>
                    <span style={{ fontSize:'0.68rem', padding:'3px 10px', borderRadius:'100px', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.15)', color:'var(--gold)', flexShrink:0, fontFamily:'DM Mono,monospace', letterSpacing:'0.5px' }}>{s.type}</span>
                  </div>
                  <div style={{ fontSize:'0.82rem', color:'var(--muted)', lineHeight:1.6 }}>{s.desc}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--gold)', marginTop:'10px', fontWeight:500 }}>Visit →</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <div style={{ marginTop:'60px', padding:'28px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', textAlign:'center' }}>
          <div style={{ fontSize:'1.2rem', fontFamily:'Cormorant Garamond,serif', fontWeight:700, color:'var(--white)', marginBottom:'8px' }}>Put these tips into action</div>
          <p style={{ color:'var(--muted)', fontSize:'0.88rem', marginBottom:'18px' }}>Upload your resume, paste a job description, and get a personalized A–F grade.</p>
          <Link href="/evaluate" style={{ display:'inline-block', padding:'12px 28px', background:'var(--gold)', color:'#000', border:'none', borderRadius:'8px', fontSize:'0.9rem', fontWeight:700, textDecoration:'none' }}>Evaluate a Job Now →</Link>
        </div>
      </main>

      <footer style={{ borderTop:'1px solid var(--border)', padding:'32px', textAlign:'center' }}>
        <Logo size={22} />
        <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:'6px' }}>ResuMatch &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  )
}
