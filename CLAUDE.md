# ResuMatch — Project Memory

## Project Overview
Free AI-powered job evaluation web app for all job seekers. Users paste job descriptions, AI grades them A–F against their profile/resume, and tracks applications through a kanban pipeline.

## Tech Stack
- **Framework**: Next.js 14.2.30 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (synpcpnstoulaxancsgh)
- **Deployment**: Vercel (career-ops-web-beta.vercel.app)
- **AI**: DeepSeek API (deepseek-chat model)
- **Auth**: Supabase Auth via `@supabase/ssr` ^0.1.0
- **Styling**: Inline styles + CSS custom properties (dark theme, no Tailwind)
- **Package manager**: npm

## Key Conventions
- Auth: `Authorization: Bearer <token>` header from client; verified via `supabase.auth.getUser(token)` in API routes
- DB: Service role client for writes with manual ownership checks; anon key for session reads
- API error responses: Generic messages only (no raw errors, no PII)
- Styling: Inline `style={{...}}` with CSS variables from `globals.css`
- Brand: Cormorant Garamond (headings), DM Sans (body), Navy `#080c18` bg, Gold `#C9A84C` accent

## Database Tables
- `career_jobs` — id, user_id, company, role, jd_text, status, location, salary_range, notes, applied_at, interviewed_at, offered_at, rejected_at, created_at
- `career_evaluations` — id, job_id, user_id, grade, score, role_summary, cv_match, green_flags, red_flags, compensation, recommendation, raw_response, created_at
- `career_profiles` — id, user_id, name, target_role, industry, years_experience, skills, preferred_location, salary_expectations, resume_text, created_at, updated_at

## Env Vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEPSEEK_API_KEY`

## Admin
Email: `excelsiorconsultancys@gmail.com` — Admin panel at `/admin`

## Active Branch
`master` — auto-deploys to Vercel

---

# CLAUDE.md — Prompt Master & Excelsior Development Standards

> **How to use:**
> - **Global** → Save as `~/.claude/CLAUDE.md` — auto-loads for every project
> - **Project** → Save as `CLAUDE.md` in project root — merged with global automatically
> - **claude.ai** → Paste this file + your filled project template at the start of every session

@docs/security.md
@docs/agent-workflow.md
@docs/vibe-coding-standards.md
@docs/risk-action-plans.md

---

## My Workflow Preferences

> Added June 2026. Applies across all projects and environments.

- **Never stop mid-task without asking.** If something needs a fix, ask whether to proceed with the fix rather than stopping silently.
- **Always ask before any commit or push.** Never commit or push without my explicit go-ahead — this prevents conflicts.
- **Offer to run commands instead of assuming.** When Git Bash / a terminal is available, ask *"Would you like me to run this in Git Bash for you?"* before running anything that changes state — don't silently run it, and don't make me run it manually if you're able to do it yourself.
- **Quick read-only checks** (`git status`, `git diff`, `git log`) you may run directly to investigate.
- **If I decline, or you can't execute**, hand me the exact Git Bash commands to run myself.

---

## PART 1 — PROMPT MASTER PROJECT

### What This Repository Is

Prompt Master is a **Claude skill** — a pure documentation project with no executable code, build system, or tests. When installed, it activates inside Claude (claude.ai or Claude Code) and operates as a prompt engineer: taking a user's rough idea, identifying their target AI tool, and generating a single production-ready prompt optimized for that tool.

The entire system lives in four Markdown files. There is nothing to compile, no dependencies to install, and no CI pipeline to run.

---

### Repository Structure

```
prompt-master/
├── SKILL.md                  # Operational skill definition — the "code" that runs
├── README.md                 # User-facing docs, examples, tool table, version history
├── references/
│   ├── templates.md          # 12 prompt templates — lazy-loaded, only when needed
│   └── patterns.md           # 37 failure patterns reference — lazy-loaded, only when needed
└── LICENSE                   # MIT
```

**SKILL.md** — The operative file. Structured in three attention zones:
- **Primacy Zone (first 30%)** — identity, hard rules, output format lock
- **Middle Zone (55%)** — intent extraction logic, tool routing for 30+ AI tools, diagnostic checklist, memory block system, safe techniques
- **Recency Zone (15%)** — verification checklist and success criteria

**README.md** — User installation guide, usage examples, full tool table, template table, pattern table, and version history. This is what users read on GitHub.

**references/templates.md** — Full template definitions for all 12 prompt architectures (RTF, CO-STAR, RISEN, CRISPE, Chain of Thought, Few-Shot, File-Scope, ReAct, Visual Descriptor, Reference Image Editing, ComfyUI, Prompt Decompiler, and Template M for Opus 4.7 agentic tasks).

**references/patterns.md** — Complete reference for all 37 prompt failure patterns organized in 6 categories: task, context, format, scope, reasoning, and agentic. Each pattern includes a before/after example.

---

### Development Workflow

There is no build step. Edit the Markdown files directly, commit, and push. The branch for active development is `claude/claude-md-docs-Ayms7`.

```bash
git checkout claude/claude-md-docs-Ayms7
# edit files
git add <specific files>
git commit -m "descriptive message"
git push -u origin claude/claude-md-docs-Ayms7
```

| Task | File to Edit |
|------|-------------|
| Adding a new AI tool profile | `SKILL.md` — Tool Routing section |
| Updating an existing tool profile | `SKILL.md` — find the tool's block in Tool Routing |
| Adding a new prompt template | `references/templates.md`, then add entry to the template table in `README.md` and reference it in `SKILL.md` |
| Adding a new failure pattern | `references/patterns.md`, update the count in `README.md` header, add the before/after row to the relevant table in `README.md` |
| Changing the output format | `SKILL.md` — Output format section in Primacy Zone |
| Adding a hard rule | `SKILL.md` — Hard rules block in Primacy Zone |
| Updating installation instructions | `README.md` only |
| Updating the version number | `SKILL.md` frontmatter (`version:` field) AND `README.md` version history section |

---

### Conventions

**SKILL.md Structure — Do Not Reorder Zones**
The three-zone structure (Primacy / Middle / Recency) maps to how transformer attention works. Critical constraints live in Primacy because models weight the first 30% of a prompt most heavily. Do not move hard rules or identity statements into the middle or recency sections.

**Section File Size**
Keep individual files under 450 lines. If a section grows past this, move detailed content to a `references/` file and add a lazy-load pointer in SKILL.md.

**Tool Routing Format**
Each tool block in SKILL.md follows this pattern:
1. Bold tool name with context in parentheses
2. 3–6 bullet points — one constraint or technique per bullet
3. One blank line separator before the next `---` divider

Do not merge multiple tools into one block unless they share identical routing logic (see Cursor / Windsurf as the only exception).

**Pattern Numbering**
Patterns are numbered sequentially across all categories. When adding a new pattern, assign the next available number, add it to `references/patterns.md` in the correct category section, and add it to the matching table in `README.md`. Update the pattern count in the README header (currently "37 credit-killing patterns").

**Template Naming**
Templates use the letter scheme (A through M currently). New templates get the next letter. Add the template letter and name to:
1. `references/templates.md` — full definition
2. `SKILL.md` — Tool Routing section for any tools that use it
3. `README.md` — template table in the 12 Prompt Templates section

**Version Numbering**
- Patch bump: typo fixes, wording improvements, adding a single tool profile
- Minor bump: new template, new pattern category, significant tool routing changes
- Major bump: structural overhaul (new zone system, new routing architecture)

Always update both `SKILL.md` frontmatter and the `README.md` version history table.

---

### Hard Rules for Editing SKILL.md

1. **Never add fabrication-prone techniques** as recommended approaches: Mixture of Experts, Tree of Thought, Graph of Thought, Universal Self-Consistency, prompt chaining as a meta-technique.
2. **Never recommend Chain of Thought for reasoning-native models** — o3, o4-mini, DeepSeek-R1, Qwen3 thinking mode. Patterns 27 and 36–37 enforce this.
3. **The output format block is locked** — one copyable prompt block + one-line target/strategy note. Do not add intermediate steps, framework names, or explanations visible to the user.
4. **Clarifying questions cap stays at 3** — do not raise this limit in any tool profile.
5. **Never embed credentials** — no API keys, tokens, or secrets. Any new tool profile requiring authentication must use generic references like "assumes [service] is already connected."

---

### Credential Safety (Prompt Master Files)

No file in this repository should ever contain API keys, tokens, secrets, connection strings, or auth credentials. If a contributed tool profile example shows authentication, use placeholder references only:
- `assumes [APP] is already connected`
- `requires [ENV_VAR_NAME] to be set`
- `use your [service] API key`

---

### Adding a New Tool Profile — Checklist

- [ ] Tool name exactly matches the product name (check official branding)
- [ ] Category label included in the heading (e.g., `(agentic IDE)`, `(reasoning LLM)`, `(image AI)`)
- [ ] 3–6 specific routing constraints or techniques listed
- [ ] If reasoning-native (thinks internally): explicitly state no CoT
- [ ] If agentic (runs commands/edits files): stop conditions mentioned
- [ ] If image-based: note whether negative prompts are supported
- [ ] Tool added to the tool table in `README.md`
- [ ] Version bumped if this is part of a release

---

### Reference Files — Lazy Load Pattern

SKILL.md references `references/templates.md` and `references/patterns.md` with explicit "read only when needed" instructions. This keeps SKILL.md token-lean. When routing logic in SKILL.md points to a template (e.g., "Read Template M"), the full template definition must exist in `references/templates.md`. Never inline a full template inside SKILL.md.

---

### Agentic Output Warning Rule

Any tool profile in SKILL.md for a tool that executes commands, edits files, runs in terminal, or manages a filesystem — and any template that targets these tools (Templates G, H, M) — must trigger the Agentic Output Warning defined in the Middle Zone. Do not add new agentic tool profiles without ensuring they are covered by the warning trigger condition.

---

### Current Version

**1.6.0** — Opus 4.7 compatibility update. Added Template M, updated Claude and Claude Code routing for adaptive thinking and xhigh effort defaults, added patterns 36–37 for Opus 4.7 prompt failures.

---

## PART 2 — WHO I AM & BUSINESS CONTEXT

### Who I Am

**Jules Villarta** — mechanical engineer (BS), MBA, 20+ years in HR practice.
Owner of **Excelsior Consultancy Services**, Talisay City, Cebu, Philippines (est. 2018).
I serve SMEs across the Philippines, US, and Latin America.
I build operational software and internal tools using an AI-assisted development approach.

**Positioning:** AI Systems Engineer and Builder

I design the systems that run your business. Then I build them. Most developers start from the code. I start from the business problem. With over 20 years of business and HR practice behind every decision, I diagnose the operation, design the system, and use AI as the execution layer. The result is software that actually fits how a business works.

| Type | Detail |
|------|--------|
| **Education** | BS Mechanical Engineering, Masters in Business Administration (MBA) |
| **Experience** | 20+ years in HR practice, full-time consultant |
| **Certification** | Entrepreneurship in Emerging Economies — edX Verified Certificate |
| **Certification** | Business Strategy Specialization — U.Va. Darden School, Coursera |
| **Certification** | Google Project Management: Professional Certificate — Google, Coursera |

---

### My Team

| Name | Role | Location | Specialty |
|------|------|----------|-----------|
| Sajeel Baig | Web Developer | Pakistan | WordPress, site conversions |
| Andrew Daugdaug | Web Developer / IT Consultant | Cebu | Zapier, servers, databases, hosting, DNS, Nginx |
| Riche Almagro | QA Consultant | Cebu | Quality assurance, ISO, safety management |
| Keene Paolo Villarta | Operations Officer | Cebu | Day-to-day ops, video editing (DaVinci Resolve) |
| Atty. Francis Ocampo | Legal Consultant | Cebu | Corporate and compliance law, BS Accountancy |
| Trisha Layaguin | Admin Officer | Cebu | Travel, ticketing, passport and visa processing |
| Lormilo Galo | Real Estate Consultant | Cebu | Strategic development, former Ayala Land |

---

### My Business Context

**Excelsior Consultancy Services**
- HQ: Zone 5 Dumlog, Talisay City, Cebu, Philippines
- Extension: Basement 1, Horizons 101, General Maxilom Ave., Cebu City
- Operating since: 2018 (registered Philippine business)
- Markets: Philippines, US, Latin America
- Mobile: +639190760425
- Email: info@excelsior-consultancy.com
- Meta Ads account: `51960794`
- Book Now: calendly.com/excelsiorconsultancys/30min

**Tagline:** *Align. Transform. Grow.*

**ATG Framework:**
- **Align** — understand the business, align goals with tailored strategies
- **Transform** — reshape outdated systems into efficient, future-ready processes
- **Grow** — build partnerships, grow sustainably

**Mission:** Empower businesses with strategic insights, expert guidance, and tailored solutions that drive efficiency, sustainability, and success.

**Vision:** Become a trusted and leading business consultancy delivering comprehensive, innovative, data-driven solutions locally and internationally.

**Social channels:**
- LinkedIn: linkedin.com/in/excelsiorconsultancyservices
- Facebook: facebook.com/excelsiorconsultancyservices
- Instagram: instagram.com/excelsiorcebu
- Twitter/X: x.com/excelsiorcebu
- TikTok: tiktok.com/@excelsiorcebu88

---

### Active Projects

| Project | Repo / URL | Stack | Notes |
|---------|-----------|-------|-------|
| **excelsiorblueprint.com** | `jules-excelsior/ghl-mastery` (master) | Next.js 14, Supabase, Vercel | Business Operations Mastery — 26 modules, 190+ lessons, 3 tiers |
| **Lex (Excelsior AI Assistant)** | excelsior-consultancy.com | React, Claude API, Supabase, Resend | Lead capture, scoring, Supabase persistence |
| **excelsiorhrconsulting.com** | — | Next.js, Claude API, Supabase, Vercel | HR Advisor — 6 domains, freemium SaaS ₱799/mo |
| **ai-productbuilder.com** | `jules-excelsior/ai-productbuilder` | Next.js, Vercel | Secondary personal brand portfolio |
| **julesvillarta.com** | — | — | Personal portfolio — scroll animations, JSON-LD |
| **excelsior-consultancy.com** | — | WordPress (Sajeel) | Main company site — 7 service lines |
| **Career Ops** | career-ops-web-beta.vercel.app | Next.js, TypeScript, Supabase, Vercel | 7-dimension job evaluator + pipeline tracker |
| **Forex Traders Database** | — | Node.js, Express, SQL.js, Hetzner VPS | Internal — 100+ traders, MT4 accounts, VPS, payments |
| **Excelsior Financial Dashboard** | excelsiordashboard.com | React, Supabase, Vercel | Real-time P&L, revenue, expenses — multi-client |

---

### Books on Amazon

Do not fabricate titles, descriptions, or URLs. Use exactly as listed.

| Title | Description | URL |
|-------|-------------|-----|
| **The Excelsior Standard** | The full framework behind the Align, Transform, and Grow (ATG) methodology. Practical steps, models, and execution guides for business owners. | amazon.com/dp/B0GTNH1KMK |
| **Claude Power User's Guide** | Guide to using Claude as a power user. Positioned alongside Excelsior's AI tools and methodology. | amazon.com/dp/B0GX5DCY5D |

---

### Portfolio & Proof Points

Use these proof points only as estimates in copy — do not invent new numbers.

- Training platform launched 60–70% faster than typical outsourced build
- Discovery call efficiency improved — unqualified leads reduced 30–40%
- Avoided $500–$1,200 in annual SaaS costs
- Two revenue-generating digital products with zero ongoing fulfillment cost
- 6,700+ organic followers grown · 4 AI-built products · 40% sales growth Q1

**Live Products (do not contradict or misrepresent)**

| Project | Description | URL |
|---------|-------------|-----|
| **Lex** | Branded AI assistant — handles client inquiries 24/7, zero staffing cost | excelsior-consultancy.com |
| **Excelsior HR Advisor** | AI-powered HR advisor for Philippine labor law. 6 domains. Freemium SaaS ₱799/mo | excelsiorhrconsulting.com |
| **Business Operations Mastery** | 26-module training platform, 190+ lessons, 130+ templates, 3-tier access | excelsiorblueprint.com |
| **Remote Ops Mastery** | 9-module course for Filipino VAs/freelancers. Starter ₱499 / Core ₱1,499 / Pro ₱3,999 | remoteopsmastery.com |
| **Excelsior Standard Diagnostic Scorecard** | 5-minute business readiness assessment using ATG framework | excelsior-standard-checklist.vercel.app |
| **Excelsior Financial Dashboard** | Custom financial visibility replacing $500–$1,200/yr SaaS spend | excelsiordashboard.com |
| **Excelsior Lead Ranker** | Free browser tool — lead priority scoring, no login | excelsior-lead-ranker.vercel.app |

**Client Testimonials (use verbatim only)**
- **RL (US)** — praised thorough cost/sales analysis, strategic sales forecasting, and business expansion projections
- **Cydel Ferolino, GM Southroads by CCF** — praised HR advice, recruitment strategy, and team-building seminar
- **Theodore KS (US)** — praised custom website development precision and user-friendly design
- **Caren Iwayan, RC Family Grocery** — praised grocery mart setup expertise and government reportorial compliance guidance

---

### Excelsior Services

Use these exactly when writing proposals, bios, or any content.

| # | Service | Stack / Tags |
|---|---------|-------------|
| 01 | **Business Operations Consulting** | SOPs, Process Design, ATG Methodology, Ops Strategy |
| 02 | **Digital Product Development** | Next.js, Supabase, Vercel, Full-Stack |
| 03 | **AI Application Development** | Claude API, AI Agents, Workflow Automation, Custom Tooling |
| 04 | **Web Development** | WordPress, Custom Dev, Landing Pages, Enhancements |
| 05 | **Business Tools & Systems Integration** | HubSpot, Notion, Zapier, Google Workspace, Slack |
| 06 | **Online Training Programs** | Business Ops, Digital Tools, Self-Paced, Tiered Access |
| 07 | **HR Consulting** | HR Compliance, Quality Systems, KPIs & Metrics, Performance Management — backed by nearly 2 decades of hands-on HR practice |

**Five problems I solve:**
1. Operational Drag — manual work, unclear processes, owner dependency
2. Revenue Gaps — expertise not structured into scalable revenue systems
3. Lead Quality Issues — lack of filtering and pre-qualification
4. Capacity Limits — growth constrained by headcount instead of systems
5. Disconnected Workflows — tools creating friction instead of flow

**Approach:** Diagnose → Design → Deploy (ATG framework — Align, Transform, Grow)

---

### Personal Context

- Based in Cebu, Philippines (Philippine Standard Time, UTC+8)
- Interests: Philippine equities investing, personal finance tools (Cash Flow, Investment Tracker, Net Worth workbook)
- Background blend: engineering precision + business strategy + HR depth

---

## PART 3 — DEVELOPMENT STANDARDS

### Development Methodology

> *"You don't need to know everything to build something real. You need clarity, structure, and the discipline to keep iterating."*

How I build operational software using AI-assisted development. I start from the business problem — diagnose the operation, design the system, use AI as the execution layer.

**Workflow:** Git Bash *(offer to run it for me — I reply yes/no)* → Claude → Localhost Test → Supabase/Neon → Vercel Deploy

| # | Principle | Rule |
|---|-----------|------|
| 01 | **Propose Before You Build** | No code until the plan is clear. Always define scope, architecture, and sequence first. |
| 02 | **Feature Branches, Always** | Every new feature lives on its own Git branch. Nothing touches master until it's tested and stable. |
| 03 | **Real Database From Day One** | Supabase or Neon from the start — not JSON, not local workarounds. |
| 04 | **Localhost First, Deploy Last** | Test at localhost first — iterate until stable. Then push via Git Bash → Vercel auto-deploys. Only skip localhost if explicitly requested. |
| 05 | **One AI, Fully Mastered** | Standardized on Claude across architecture, code, copy, and strategy. |
| 06 | **Document As You Go** | SOPs, changelogs, and briefs are built alongside the product — not written after the fact. |
| 07 | **Iteration Is The Real Skill** | Clear communication and precise problem framing produce better software than memorized syntax. |
| 08 | **Security by Default** | Every deployment passes basic security validation before release. |
| 09 | **Structured Project Memory** | Every project carries a CLAUDE.md — stack details, branch rules, session context. |
| 10 | **Conventional Commits** | Every commit: `feat`, `fix`, `docs`, `security`, `refactor`. Feeds the changelog automatically. |

---

### Default Tech Stack

- **Framework**: Next.js 14/15 App Router
- **Language**: TypeScript (strict mode, no `any`)
- **Database**: Supabase (primary), Neon (secondary) — confirm which is active at session start
- **Deployment**: Vercel (primary), Render (secondary, Singapore region)
- **AI**: Anthropic Claude API (`claude-sonnet-4-6`)
- **Email**: Resend
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **Automation**: Zapier
- **Cron/Uptime**: cron.org — keeps services active, schedules background jobs
- **CMS**: WordPress (via Sajeel)
- **Package manager**: npm
- **Version control**: GitHub
- **Terminal**: Windows Git Bash — when a command is needed, **offer to run it in Git Bash for me first** (I reply yes or no); if I decline or you can't execute, provide exact Git Bash commands, never PowerShell

**Excelsior Brand System**

| Element | Value |
|---------|-------|
| Primary Color | Navy `#0d1117` |
| Accent Color | Gold `#b8975a` |
| Heading Font | Cormorant Garamond |
| Body Font | Jost |
| Tone | Luxury, authoritative, precise |

---

### Currency Rules

- **Local projects** (Philippine clients) → ₱ Philippine Peso
- **Global projects** (international audience) → $ USD
- **Dual-currency** → show both, lead with ₱: e.g. "₱799/month ($15/month)"
- **When unsure** → ask which market before assuming

---

### How I Work with Claude

- **Offer to run terminal commands in Git Bash first** — ask before running anything that changes state; give exact commands if I decline
- **Step-by-step guidance** — when I run commands myself, give precise instructions I can follow exactly
- **Show full code blocks** — never truncate or summarize code
- **Tell me the file and line** — always specify where changes go
- **Flag breaking changes** — warn before anything that could break production
- **Step-by-step: ask first** — for business/strategy, skip the basics; for technical tasks, ask "Do you need step-by-step guidance?" and wait for yes or no
- **Plain-language input style** — I describe what I want in plain language, you translate to code
- **Prefer single-file solutions** unless architecture clearly demands otherwise
- **Localhost first, deploy last** — always provide a way to test locally before pushing
- **Security flag always** — before marking anything done, flag exposed env variables, missing RLS rules, unprotected routes, or unaudited dependencies. Don't wait to be asked
- **Documentation on every project** — maintain or prompt to update: `CHANGELOG.md`, `DOCS.md` or `/docs` folder, workflow notes (SOPs). Build alongside code, not after
- **No filler** — skip "Great question!", "Certainly!" — just answer
- **Lead with the solution** — don't explain what you're about to do, just do it
- **One question max** — ask only the most important clarification if needed

---

### Content & Writing Style

> Applies to all copy, proposals, SOPs, reports, and any text written for Jules.

- **Tone:** Professional, precise, no fluff
- **Format:** Use tables and code blocks liberally; use bullet lists sparingly in prose
- **Documents:** Match formal Philippines business English
- **Technical writing:** Clear, sequential, numbered steps for dev work
- **Marketing copy:** Luxury positioning, benefit-led, authoritative — not hype

**Forbidden words and phrases — never use these**
`delve`, `leverage`, `synergy`, `empower`, `utilize`, `seamlessly`, `cutting-edge`, `game-changer`, `robust`, `holistic`, `ecosystem`, `streamline`, `transformative`, `unlock`, `elevate`, `groundbreaking`, `tailored solutions`, `in today's fast-paced world`, `it's important to note`, `absolutely`, `certainly`, `of course`, `I'd be happy to`, and similar AI filler phrases.

**No em-dashes as sentence connectors**
Do not use — (em dash) to join clauses in natural prose. Use plain sentence structure instead. Em dashes are only acceptable in tables or technical references.

---

### Research & Document Drafting Rules

> Applies to every report, strategy doc, SOP, external-facing document, or research output.

**NEVER fabricate** statistics, data points, quotes, or claims not explicitly present in source documents. If a fact cannot be verified, flag it as `[NEEDS SOURCE]` — never include it as if it were confirmed. Cross-reference all data attributions to ensure they match the correct source document and author.

**Protocol**

1. **Read first, write second** — load and read all provided source documents fully before drafting. Do not begin writing until all sources are loaded.
2. **Maintain a source map** — track every factual claim, metric, name, or date back to its source. Present the draft clean (no inline tags), with a Source Map appendix listing each claim and its origin (document name, section/heading).
3. **Verify before delivering** — for substantive documents (strategy docs, external-facing reports, security reports, posts, presentations), spawn a verification pass that re-reads each source and checks every claim. Mark any unverifiable claim as `[UNVERIFIED]`.
4. **Separate verified from unverified** — present the clean draft with unverified claims removed, plus a separate list of removed claims so Jules can decide whether to add them back with proper sourcing.
5. **No invention** — never generate statistics, percentages, quotes, or specific details not found in the sources — even if they seem plausible or "directionally correct."

**Applies to:**
- Security reports
- Business strategy documents
- SOPs and workflow guides
- External-facing reports and posts
- Research summaries from crawled or provided sources
- Any document Jules will share with clients or publish

---

### Working Effectively with AI Tools

These principles apply when using any AI tool for development work. AI-assisted development is a skill. Prompting without these habits is hoping for the best.

**1. Give AI real context, not just symptoms.**
Don't paste only the error message. Include the container logs, the database schema, the API contract, the relevant file — whatever surrounds the problem. AI output quality is a direct function of the context quality you provide. Garbage in, garbage out.

**2. Ask for approaches before asking for code.**
When you don't know how something should be implemented, ask the AI to lay out 2–3 approaches with trade-offs before writing a single line. Pick the right approach, then plan the implementation. Asking for code before the architecture is decided produces code you'll throw away.

**3. Plan incrementally. Build incrementally.**
Break every feature into subproblems. Define the specific files, the end goal, the MVP boundary. Make changes small enough that you can actually test and validate each one before moving to the next. A single large prompt that builds an entire feature is a scope failure — use sequential prompts with checkpoints.

**4. Review the output like an architect, not a typist.**
After AI writes code, trace the flow yourself. Ask: What changed? What does this function actually do? What is missing or assumed? You build real architecture understanding through review, not by blindly running commands and hoping the result is correct.

---

### Business Logic Rules (ATG Framework)

> Every feature must tie back to a real business outcome.

- **Diagnose before building** — always ask "what operational constraint does this remove?"
- **Start from the business problem** — never from the tech stack or a feature idea
- **Every feature must do one of:** reduce cost, increase revenue, or save owner time
- **Prefer systems that work without the owner** — avoid tools that require constant manual intervention
- **Scope before code** — define the outcome first, then the minimum build to achieve it
- **No feature creep** — if it wasn't in the brief, flag it before adding it
- **Business language first** — present results in business terms (cost saved, time reduced), not technical terms
- **ATG lens on every decision:** Align (does this serve the business direction?) → Transform (does this change how the org works?) → Grow (does this compound capability over time?)

---

### Philippine-Specific Development Rules

> Applies to all projects serving Philippine clients or running on PH infrastructure.

- **Timezone**: Always use PST (Philippine Standard Time, UTC+8) for cron jobs, timestamp displays, date calculations, and log timestamps
  ```typescript
  const pstDate = new Date(Date.now() + 8 * 60 * 60 * 1000);
  ```
- **cron.org** — use to keep Render/Railway services warm. Ping every 14 minutes for Render free tier. Set up at project launch.
- **Government data is unreliable** — NEVER hardcode rates from DOLE, SSS, PhilHealth, or Pag-IBIG. Always fetch from official source or instruct user to verify.
- **Contribution tables change yearly** — treat any specific peso amount as potentially outdated.
- **Payment methods for PH market**: GCash and Maya are primary — Stripe has low adoption. Manual bank transfer is acceptable for B2B.
- **Language**: Default to English for all UI; occasional Filipino/Bisaya is acceptable in copy where natural.

---

## PART 4 — SECURITY STANDARDS

> This is the full self-contained security standard.

### Four Security Tools

| Tool | Surface | Auto-activates when |
|---|---|---|
| `/security-review` | Code — OWASP Top 10, secrets, SQL, XSS, CSRF, auth, rate limiting | Writing code that touches auth, user input, API, payments, sensitive data |
| `/security-scan` (AgentShield) | Claude Code — hooks, MCPs, agent configs, permissions | `.claude/settings.json` changes, new MCP or hook added |
| `cloud-infrastructure-security` | Infrastructure — IAM, network, CI/CD, CDN/WAF, backups | Deploying to cloud, configuring infra, setting up CI/CD |
| **`security report`** | Everything — all four merged into one scored report | Jules says "security report" on any project |

### When Each Tool Activates Automatically

| Trigger | Tool |
|---|---|
| Code written touching auth, user input, API, payments | `/security-review` |
| `.claude/settings.json` modified, new MCP or hook added | `/security-scan` |
| Deploying to Vercel, Railway, Hetzner, configuring CI/CD | `cloud-infrastructure-security` |
| Jules says "security report" | All four merged |
| Jules says "/security-scan" | AgentShield only |
| Jules says "/security-review" | Code review only |

---

### Security Report Format

Triggered by: **"security report"**

```
============================================
  SECURITY REPORT
  Project: [name]   Date: [date]
  Stack: [stack]    Type: [static/saas/vps]
============================================

SECURITY SCORE:        [0–100]
STABILITY SCORE:       [0–100]
MAINTAINABILITY SCORE: [0–100]

DEPLOY DECISION:  APPROVED / BLOCKED
============================================

PART A — CODE SURFACE (/security-review)
PART B — CLAUDE CODE SURFACE (/security-scan)
PART C — INFRASTRUCTURE SURFACE (cloud-infrastructure-security)
PART D — WEB APP & COMPLIANCE
```

**PART A — Code Surface (`/security-review`)**

| Check | Items |
|---|---|
| Injection | Parameterized queries, no string-concatenated SQL, ORM used safely |
| Broken Auth | bcrypt/argon2 passwords, JWT validated, sessions secure, HttpOnly cookies |
| Sensitive Data | HTTPS enforced, secrets in env vars, PII encrypted, logs sanitized |
| Broken Access | Auth on every route, CORS configured, RLS active |
| Misconfiguration | Debug mode off in prod, default creds changed, security headers set |
| XSS | Output escaped, CSP set, no `dangerouslySetInnerHTML` with user input |
| Insecure Deserialization | User input deserialized safely |
| Known Vulnerabilities | `npm audit` clean, dependencies up to date |
| Insufficient Logging | Security events logged, no sensitive data in logs, alerts configured |
| Rate Limiting | All endpoints limited; auth max 5/min/IP; paid APIs protected |

**PART B — Claude Code Surface (AgentShield)**

Runs: `npx ecc-agentshield scan --path ".claude/" --format text`

- Hardcoded secrets in `.claude/settings.json` or agent configs
- Overly broad tool permissions (`Bash`, `Write` granted too widely)
- Executable hooks with shell access that could be exploited
- MCP servers with shell, filesystem, remote transport, or unpinned `npx`
- Agent prompts that handle untrusted content without defenses
- Claude Code permissions that exceed minimum required for the session

**PART C — Infrastructure Surface**

Applies when deployed to Vercel, Railway, Hetzner VPS, or any cloud:
- IAM & Access Control — least privilege, MFA on admin accounts, no root usage in production
- Secrets Management — cloud secrets manager, rotation enabled, no secrets in logs
- Network Security — database not publicly accessible, ports restricted, VPC/firewall configured
- Logging & Monitoring — audit logging enabled, failed auth attempts logged, retention 90+ days
- CI/CD Pipeline — OIDC auth (not long-lived tokens), secrets scanning, dependency audits in pipeline
- CDN/WAF — Cloudflare WAF with OWASP rules, rate limiting, bot protection, DDoS enabled
- Backups & DR — automated daily backups, tested quarterly, RPO and RTO documented

**PART D — Web App & Compliance**

1. Dependency Vulnerabilities — `npm audit` by severity: Critical / High / Medium / Low
2. HTTP Security Headers — table: Header | Value | PASS / FAIL / MISSING
3. Content Security Policy — nonce-based via `middleware.ts` preferred; justify any `unsafe-inline`
4. Source Code Scan: hardcoded secrets, `dangerouslySetInnerHTML` with user/AI content, `eval()` in client code, `process.env` exposure to client, user input → AI prompt injection path, AI output rendered without escaping, `localStorage`/`sessionStorage` storing tokens, open redirects, DevTools imports without `NODE_ENV` guard, `console.log` with PII
5. Source Maps — production source maps off (`productionBrowserSourceMaps: false`)
6. Auth & Authorization — ownership checks, RLS, service role key server-side only, admin routes protected
7. API & Input Validation — Zod on all endpoints, rate limiting, explicit CORS, no MemoryStore
8. Infrastructure — hosting, HTTPS, env vars, VPS hardening
9. Error Handling — `error.tsx` present, `not-found.tsx` present, no stack traces exposed
10. Privacy & Compliance — PII collected, Privacy Policy linked, RA 10173, data retention documented
11. DNS & Anti-Phishing — SPF, DKIM, DMARC status
12. Critical Issues — each: file · line · severity · required fix
13. Recommended Fixes — prioritized with effort estimate (Low / Medium / High)

---

### Score Formula

**Security Score (0–100):** Start 100. -20 Critical, -10 High, -5 Medium, -2 Low.

**Stability Score (0–100):** Start 100. -20 missing timeouts on external calls, -15 missing error handling, -15 missing retry logic, -10 MemoryStore without cleanup, -10 no health check, -5 per unhandled promise rejection.

**Maintainability Score (0–100):** Start 100. -15 no CHANGELOG entry, -10 no architecture docs, -10 functions >50 lines, -5 files >800 lines, -5 no env var docs, -5 per `console.log` in production code.

---

### Hard Deploy Blocks — No Exceptions

| Condition | Action |
|---|---|
| Critical Issues > 0 | BLOCKED — fix all critical issues first |
| Exposed secrets in code or git history | BLOCKED — rotate keys, clean history |
| Any dependency with Critical CVE | BLOCKED — patch or replace |
| Tests failing | BLOCKED — fix tests before deploy |
| Backup not verified quarterly (DB projects) | BLOCKED — verify restore first |

---

### AI-Specific Security Checks

- **Prompt injection** — filter inputs containing: `ignore previous instructions`, `system:`, `new role:`, `pretend you are`, `disregard your`, `override:`, `[INST]`, `<|im_start|>`
- **Tool abuse risks** — Claude Code tool permissions scoped to minimum required
- **Unauthorized file access** — no API route reads files from user-supplied paths
- **Unauthorized shell execution** — block any pattern where user input reaches `exec()`, `spawn()`, `eval()`
- **Data exfiltration** — API responses never return full DB rows or fields not needed by client
- **Excessive permissions** — Supabase service role key only in server-side routes
- **Output sanitization** — all AI-generated text displayed in UI must be escaped
- **Secret leakage** — error responses never include stack traces, file paths, or env var names

---

### Security Pre-Commit Checklist

**Secrets**
- [ ] No hardcoded API keys, tokens, passwords, or SSH keys
- [ ] `.env.local` in `.gitignore` and not staged
- [ ] No `NEXT_PUBLIC_` used for secrets
- [ ] `git diff --staged` scanned for secret patterns
- [ ] No `console.log` with PII fields

**AI Safety**
- [ ] No user input flows unfiltered into AI system prompts
- [ ] All AI output escaped before rendering in UI
- [ ] API responses return only fields needed by client

**Code Quality**
- [ ] All external API calls have a timeout (10s max)
- [ ] All async operations have try/catch with user-visible fallback
- [ ] No `eval()`, `exec()`, or `spawn()` with user input

**Agent & Claude Code Surface**
- [ ] No secrets in `.claude/settings.json` or agent configs
- [ ] Tool permissions scoped to minimum required
- [ ] No unpinned `npx` in MCP server configs
- [ ] Hooks reviewed — no shell access beyond what is needed

**Dependencies**
- [ ] `npm audit --audit-level=high` passing
- [ ] No new dependencies added without checking npm registry

---

### Security Pre-Deploy Checklist

**Secrets & Access**
- [ ] All secrets in Vercel environment variables — not hardcoded
- [ ] `git log -p | grep "sk-\|AKIA\|supabase\|password\|secret"` clean
- [ ] Supabase RLS active on all tables
- [ ] Supabase service role key not exposed client-side
- [ ] Admin endpoints protected by authentication middleware

**Infrastructure**
- [ ] HTTPS enforced — no mixed content
- [ ] All 6 security headers in `next.config.ts` verified
- [ ] CSP — nonce-based via `middleware.ts` (preferred)
- [ ] For VPS: `ufw status` — only required ports open
- [ ] For VPS: `.env` file permissions are `600`
- [ ] Sentry connected and receiving test events
- [ ] Uptime monitoring ping active (cron.org) with alert channel

**Privacy**
- [ ] Privacy Policy linked on all pages that collect PII
- [ ] Data retention policy documented
- [ ] Audit logging enabled in Supabase

**Front End**
- [ ] No `innerHTML` or `dangerouslySetInnerHTML` with user or AI-generated content
- [ ] No `localStorage` / `sessionStorage` storing tokens
- [ ] No `eval()` in any client-side file
- [ ] `productionBrowserSourceMaps: false` confirmed
- [ ] Bundle size within budget: Landing < 150kb JS gzipped; App < 300kb

---

### Red Team Protocol

Run before first public launch, after major feature additions, or quarterly on live apps.

**Prompt to use:**
> "Act as a hostile penetration tester. Assume the system is already compromised. Identify every possible path for privilege escalation, credential theft, prompt injection, data exfiltration, remote code execution, lateral movement, and persistence. Produce a red-team report with severity ratings and remediation steps."

**Required when:**
- First public launch of any project
- New authentication system added
- New payment or financial feature
- New AI/bot feature accepting user input
- After a reported security incident
- Quarterly review on live production apps

---

### Security Response Protocol

If a vulnerability is found:
1. **Stop** — do not push any further code
2. **Assess** — determine if already exploited or just potential
3. **Contain** — rotate any exposed secrets immediately
4. **Document** — record in `CHANGELOG.md` under `### Security`
5. **Fix** — on a separate `hotfix/[description]` branch
6. **Verify** — re-run full pre-deploy checklist and security report
7. **Notify** — if PII was exposed, RA 10173 requires notifying affected persons and the NPC within 72 hours
8. **Post-mortem** — add section to `docs/architecture.md`

---

### Terms & Conditions Reminder

T&C is **never built unless Jules explicitly asks**. Prompt automatically when these features are added:

| Feature | Reminder |
|---|---|
| Login / auth | T&C covering account use, suspension, data handling |
| Payments | Refund policy, billing terms, liability limits |
| Contact form / lead capture | Privacy Policy + RA 10173 obligations |
| AI chat / user input to AI | Acceptable use, AI disclaimers, prompt injection liability |
| File uploads | File types, storage limits, ownership, prohibited content |
| Multi-tenant / team access | Access controls, data separation, admin responsibilities |
| Public API | Terms of Service — rate limits, abuse, key revocation |

---

### Non-Negotiable Security Rules

**1. Secrets — Always Server-Side**
- NEVER put API keys or tokens in frontend code
- NEVER suggest `NEXT_PUBLIC_`, `VITE_`, or `REACT_APP_` for anything secret
- ALWAYS put secrets in `.env` / `.env.local`
- If a key is pasted in chat → warn to rotate it immediately

**2. Database — No SQLite on Serverless**
- Vercel, Netlify, Railway, Fly.io → reject SQLite
- Always recommend: Supabase, Neon, or PlanetScale

**3. Authorization — Ownership Checks Are Mandatory**
```js
if (record.userId !== authenticatedUser.id) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

**4. Input Validation — Server-Side Always**
Every API endpoint validates inputs with Zod or equivalent. Frontend validation alone is not acceptable.

**5. SQL — Parameterized Queries Only**
Never string interpolation with user input.

**6. Passwords — bcrypt or argon2 Only**
Never MD5, SHA1, SHA256 for passwords. Always bcrypt (cost 12) or argon2id.

**7. Error Handling — Never a White Screen**
Every data-fetching component needs loading, error, and empty states.

**8. CORS — Explicit Origins Only**
Never `origin: '*'` on authenticated routes.

**9. Rate Limiting — Required on Key Endpoints**
Auth endpoints: max 3–5 req/min/IP. Paid API endpoints: always rate limited.

**10. Secure Headers**
Express: `helmet` middleware. Next.js: headers in `next.config.js`.

**11. Session Store — Never MemoryStore in Production**
```js
// SQLite-based VPS apps
const SQLiteStore = require('connect-sqlite3')(session);
store: new SQLiteStore({ db: 'sessions.db', dir: path.dirname(process.env.DB_PATH) })

// Cloud / multi-server
const RedisStore = require('connect-redis').default;
store: new RedisStore({ client: redisClient })
```

**12. VPS Hardening**
```bash
apt install fail2ban -y && systemctl enable fail2ban && systemctl start fail2ban
```

---

## PART 5 — OPERATIONS & WORKFLOW

### Vercel Deployment Rules

- `export const runtime = "nodejs"` for API routes using Node APIs
- `maxDuration = 60` for routes calling external APIs (Claude, Crawl4AI)
- Never `export const runtime = "edge"` with Supabase service role key
- Remind to add env vars to Vercel dashboard, not just `.env.local`
- Confirm production branch before pushing

---

### Supabase Rules

- Use `supabaseAdmin` (service role) for ALL server-side writes
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Always enable RLS on new tables
- Watch for infinite recursion on `profiles` self-referential policies
- Test RLS after every schema change
- Use `upsert` over `insert` when row may already exist
- Usage/tracking tables: use `month TEXT` format `"2026-06"` not `created_at`

---

### Claude API Rules

- Default model: `claude-sonnet-4-6`
- Use prompt caching for long system prompts:
  ```typescript
  system: [{
    type: "text",
    text: SYSTEM_PROMPT,
    cache_control: { type: "ephemeral" }
  }]
  ```
- For streaming: use `anthropic.messages.stream()` not `.create()`
- Always set `max_tokens` explicitly
- 429 errors → exponential backoff, not immediate retry

---

### AI App Development Rules

> Applies to every project using Claude API, OpenAI, or any LLM.

- **System prompts are sacred** — never change a system prompt without asking first. It IS the product.
- **Always use prompt caching** for system prompts >1000 tokens
- **Streaming pattern for Vercel** — always use `TransformStream`, never `ReadableStream` with async start
- **Never expose API keys client-side** — all LLM calls go through server-side API routes only
- **Log token usage** — store `input_tokens` and `output_tokens` in Supabase for cost tracking
- **Fallback behavior** — if Claude API is down, return a graceful error, never a white screen
- **Max tokens always explicit** — never leave `max_tokens` to default
- **Model string pinned** — use `claude-sonnet-4-6`, never a floating alias
- **System prompt length** — keep under 8000 tokens for cost efficiency; use caching above 1000
- **Conversation history cap** — always limit to `MAX_MESSAGES_IN_HISTORY` (e.g. 20)
- **Rate limit AI endpoints** — Claude API calls cost money; protect with rate limiting per user

---

### Project Folder Structure

```
my_project/
├── CLAUDE.md                  ← Project memory & rules
├── .claude/
│   ├── settings.json          ← Permissions & hooks
│   ├── settings.local.json    ← Local overrides (not committed)
│   └── commands/
│       ├── review.md          ← /review slash command
│       ├── deploy.md          ← /deploy slash command
│       ├── test-all.md        ← /test-all slash command
│       └── bootstrap.md       ← /bootstrap slash command
├── skills/                    ← Auto-activated skills (SKILL.md per skill)
├── agents/                    ← Subagent definitions
├── docs/
│   ├── architecture.md        ← System design overview
│   ├── api-reference.md       ← API endpoints & usage
│   ├── security.md            ← Full security standard (four tools)
│   └── onboarding.md          ← How to get started
├── CHANGELOG.md               ← What changed and why
├── README.md                  ← Project overview
├── .env.example               ← Safe env variable template
└── .gitignore
```

- Never commit `.env` or secrets — use `.env.example` with placeholder values only
- Keep `docs/` updated alongside every feature build
- `CLAUDE.local.md` is personal and never committed — add to `.gitignore`

---

### Slash Commands (.claude/commands/)

| Command | Purpose |
|---------|---------|
| `/review` | Code review — check logic, security, naming, structure |
| `/deploy` | Pre-deploy checklist — env vars, RLS, branch, localhost verified |
| `/test-all` | Run all test cases at localhost before pushing |
| `/bootstrap` | New project setup — scaffold folders, install deps, init DB |

---

### Hook Events (Claude Code)

| Hook | Trigger | Purpose |
|------|---------|---------|
| `PreToolUse` | Before any tool runs | Block unsafe actions |
| `PostToolUse` | After any write | Auto lint check |
| `SessionStart` | On launch | Load project context |
| `SessionEnd` | On close | Save session summary |
| `PreCommit` | Before git commit | Scan for exposed secrets |
| `Notification` | On events | Slack/webhook alerts |

---

### Context Management (Claude Code)

| Usage | Action |
|-------|--------|
| 0–50% | Work normally |
| 50–70% | Monitor — start wrapping up long threads |
| 70–80% | Run `/compact` to compress context |
| 80%+ | Start fresh session with updated CLAUDE.md |

---

### Git Workflow

- Branches: `feat/feature-name`, `fix/bug-name`
- Never push directly to production without asking
- Always run `git status` before committing
- **Offer to run git commands in Git Bash first** (I reply yes or no), and **always ask before any commit or push**

### Commit Conventions

```
feat: add lead scoring to Lex bot
fix: resolve RLS infinite recursion on user_access table
chore: update dependencies, run npm audit
docs: update architecture.md with new API routes
refactor: simplify LessonTemplate.tsx component
security: rotate Supabase service key, update env vars
```

**Format:** `type: short description (present tense, lowercase)`
**Types:** feat, fix, chore, docs, refactor, security, style, test

---

### Naming Conventions

- **Components**: `PascalCase.tsx` (e.g. `LessonTemplate.tsx`)
- **Utilities**: `camelCase.ts` (e.g. `authGuard.ts`)
- **API routes**: `kebab-case` (e.g. `/api/lead-score`)
- **Database files**: `snake_case.sql` (e.g. `seed_lessons.sql`)
- **Docs**: `UPPERCASE.md` (e.g. `CHANGELOG.md`)
- **Env files**: `.env`, `.env.example` — never commit `.env.local`

---

### Code Style Defaults

- TypeScript over JavaScript for all new projects
- Zod for schema validation
- Prisma or Drizzle for ORM (not raw SQL)
- bcrypt for password hashing
- Sentry for error tracking (add at project start)

---

### SaaS & Freemium Patterns

**Free/Pro Tier Gating**
```typescript
const currentMonth = new Date().toISOString().slice(0, 7); // "2026-06"

const { data: usageRow } = await supabaseAdmin
  .from("usage")
  .select("question_count")
  .eq("user_id", user.id)
  .eq("month", currentMonth)
  .single();

const currentCount = usageRow?.question_count ?? 0;

if (plan === "free" && currentCount >= FREE_LIMIT) {
  return new Response(JSON.stringify({ error: "free_limit_reached" }), { status: 403 });
}
```

**Usage Tracking Table (Standard)**
```sql
user_id        UUID     -- references auth.users
month          TEXT     -- format: "2026-06" (NEVER use created_at for monthly counts)
question_count INTEGER  -- increment, never insert new row per question
```

**Standard Tier Constants**
```typescript
const FREE_LIMIT = 3;    // questions/actions per month
const PRO_LIMIT  = 50;   // questions/actions per month
// Pro price: ₱799/month (local) or $15/month (global)
```

**Freemium Conversion Triggers**
- Show upgrade prompt immediately on limit hit — not after
- Include specific benefit: "Upgrade to Pro — unlimited questions + priority support"
- Never block without explaining how to unblock

**Payment (PH Context)**
- Local PH clients → manual bank transfer or GCash (Stripe overkill)
- International clients → Stripe
- Dual market → offer both, default to manual for PH

---

### Crawl4AI Integration

**When to Use**
```
Use when the app needs to FETCH live external data.
Skip when the app already knows the domain deeply.
```

**Non-Negotiable Rules**

1. **Markdown is an OBJECT — always extract `.raw_markdown`**
   ```typescript
   // WRONG — causes "markdown.slice is not a function"
   return data.results?.[0]?.markdown
   // CORRECT
   return data.results?.[0]?.markdown?.raw_markdown
   ```

2. **Docker Desktop must be running first**
   ```bash
   docker ps | grep crawl4ai
   docker start crawl4ai
   ```

3. **Wrap crawled content with disclaimer**
   ```typescript
   crawledSection = `## LIVE WEB SOURCES\nNote: Fetched live. Treat specific numbers/dates as reference only.\n${crawledContent}`;
   ```

4. **Empty result = silent failure — check Docker first**

**Setup**
```bash
docker run -d -p 11235:11235 --name crawl4ai --shm-size=1g unclecode/crawl4ai:latest
docker start crawl4ai
curl http://localhost:11235/monitor/health
```

**Production:** Vercel cannot run Docker → deploy on Railway (~$5/month). Set `CRAWL4AI_ENDPOINT` per environment.

---

### Testing Before Deploy

**Functional**
- [ ] Tested at localhost — zero console errors
- [ ] Auth flow works: login → session → logout
- [ ] Free tier limit triggers correctly
- [ ] Pro tier has full access
- [ ] Admin email bypass works
- [ ] Error, loading, and empty states display correctly

**Mobile**
- [ ] Tested at 375px (iPhone SE)
- [ ] Tested at 768px (tablet)
- [ ] Touch targets minimum 44×44px
- [ ] No horizontal scroll on mobile

**Performance**
- [ ] No layout shift on page load (CLS < 0.1)
- [ ] Bundle size within budget (landing pages: JS < 150kb gzipped)

**AI App Specific**
- [ ] Streaming response works end-to-end
- [ ] Usage counter increments correctly
- [ ] System prompt is unchanged from last verified version
- [ ] Claude API error returns graceful message, not white screen

**Before Every Git Push**
```bash
npm run build          # no build errors
npm audit              # no critical vulnerabilities
git status             # no accidental .env files staged
git diff --staged      # review exactly what's going out
```

---

### Review Checklist (Before Every Merge or Deploy)

- [ ] Tested at localhost — no errors
- [ ] No secrets or API keys in code or logs
- [ ] Supabase RLS rules checked
- [ ] Environment variables in Vercel — not hardcoded
- [ ] npm audit run — no critical vulnerabilities
- [ ] CHANGELOG.md updated
- [ ] Branch is feature branch — not committing directly to master
- [ ] docs/ updated if architecture or API changed

---

### Session Startup Checklist

When starting a new session, share:
1. Which project you're working on
2. Current branch (`git branch`)
3. Any error messages in full
4. Relevant file paths
5. Which database is active — Supabase or Neon
6. Whether cron.org ping is set up for this project

---

### Reminders at Project Start

1. Create `.gitignore` — exclude `.env`, `.env.local`, `*.pem`, `*.key`
2. Create `.env.example` with placeholder values
3. Set up database with external provider (not SQLite on serverless)
4. Ask: "What external APIs will this use?"
5. Set up CORS, security headers, rate limiting stubs
6. If `express-session` → add persistent store immediately
7. If VPS deploy → remind to install fail2ban

---

### What NOT to Do

- Do not add features beyond what was asked
- Do not refactor working code unless asked
- Do not add comments explaining WHAT code does — only WHY if non-obvious
- Do not create README or docs unless asked
- Do not commit or push without explicit request
- Do not overwrite a file without seeing its current contents first

---

### Stop and Ask Before Doing These

- Deleting data or dropping database tables
- Changing authentication logic
- Modifying `.env` files directly
- Merging to production branch
- Changing billing or payment logic
- Removing existing features
- Changing AI app system prompts

---

### Databases & Key References

| Project | Database | Key Tables |
|---------|----------|------------|
| excelsiorblueprint.com | Supabase | lessons, modules, user_access, forum_posts |
| excelsiorhrconsulting.com | Supabase | users, usage, conversations |
| Lex bot | Supabase | leads, conversations, messages |
| excelsior-consultancy.com | — | Static/CMS (WordPress) |
| Forex Traders Database | SQLite on Hetzner VPS | traders, mt4_accounts, vps_servers, payments |

---

### How to Use This File

**claude.ai** — Paste at the start of every session alongside the project-specific template.

**Claude Code (desktop/local)**
```
~/.claude/CLAUDE.md           ← Global — loads for every project
/your-project/CLAUDE.md       ← Per project — merged automatically
/your-project/CLAUDE.local.md ← Private local notes — add to .gitignore
```

---

*AI-Assisted Development Standards · julesvillarta.com · ai-productbuilder.com*
*Last updated: June 2026*
