# Changelog

## 2026-06-14 — ResuMatch Rebrand & Major Feature Release

### Added
- **Rebrand**: Career Ops → ResuMatch (custom SVG logo with matching arc motif)
- **Landing page** (`/`) — Hero with 3D glow orbs, text shimmer, card tilt, features grid, CTA
- **Profile page** (`/profile`) — Name, target role, skills, experience, location, salary expectations
- **Resume upload** — Paste text or upload `.txt` file, stored in `career_profiles.resume_text`
- **Resources page** (`/resources`) — 7 tabs:
  - Resume Writing: 10 tips + 8 curated sources
  - Where to Apply: 34 job portals (Global, PH, Freelance, Remote, VA, International)
  - Interview Prep: 10 tips + 6 sources
  - Salary & Negotiation: 10 tips + 6 sources
  - Job Market News: 14 stats/news sources (BLS, ILO, LinkedIn Economic Graph, PSA, layoffs.fyi)
  - Free Training: 42 sources (MOOCs, Tech, PH government, Certifications, Language)
  - Career Growth: 10 tips + 6 sources
- **Admin panel** (`/admin`) — User list with first name, email, registration date; restricted to admin email
- **Data privacy notice** — RA 10173 compliance notice on dashboard
- **API routes**: `/api/profile`, `/api/admin/users`
- **Custom SVG Logo** (`app/components/Logo.tsx`)
- **3D CSS effects**: Glass morphism, card tilt, glow orbs, text shimmer, float animations

### Changed
- **API**: Anthropic → DeepSeek (`deepseek-chat`) for all AI calls
- **API**: Anthropic API format → DeepSeek OpenAI-compatible format
- **API auth**: Cookie-based session → `Authorization: Bearer` JWT token validation
- **API evaluate**: Now fetches candidate profile + resume and includes in evaluation prompt
- **API PATCH**: Added company, role to allowed fields; auto-set timestamps on status changes
- **UI**: All inline "Resu"+"Match" text → `<Logo />` SVG component
- **UI**: Removed Excelsior branding — positioned as free standalone app
- **UI**: Card hover effects, button transitions, fade-in animations, stat card interactions
- **Error responses**: Generic messages replace raw API/PII leaks

### Fixed
- **Security**: Session validation on all API routes (previously trusted client-supplied `user_id`)
- **Security**: Prompt injection filter (10 regex patterns) on evaluate input
- **Security**: Job update ownership check — now verifies `user_id` matches session on every write
- **Security**: PATCH field whitelist — only allowed fields pass through
- **Timestamps**: `applied_at`, `interviewed_at`, `offered_at`, `rejected_at` auto-set on status change
- **Optimistic UI**: Error recovery — reverts state on API failure

### Database
- Migration: `supabase/migration.sql` — adds `career_profiles` table + 4 timestamp columns to `career_jobs`
