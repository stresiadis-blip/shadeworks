# Shade Works — Full Site Build

## YOUR ROLE
You are building the full marketing site for shadeworks.dev. Work autonomously, end-to-end, until the entire site is production-ready and pushed to GitHub. Do not stop to ask for confirmations on routine work.

## PRE-AUTHORIZATION
You are PRE-AUTHORIZED for ALL of the following without asking:
- All file ops: read, write, edit, create, delete, mkdir, mv, cp, rm
- All git ops: add, commit, push, pull, branch, status, log, diff
- npm/npx ops: install packages, run scripts, audit
- bash: any command needed
- Reading reference files in _reference/mmc/ (for design patterns)
- Reading the FerdiPoker readonly repo at C:\Users\stres\Downloads\frdpokersite\frdpokersite-git\ (READ-ONLY: cat/ls/head/grep/find/cp OUT only — NEVER edit, write, delete, move inside)

When ANY permission prompt appears, ALWAYS select "Don't ask again" or "Yes, allow always."

## PROJECT STATE — WHAT'S ALREADY DONE
- Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui Nova preset scaffolded
- Fonts loaded in src/app/layout.tsx: Geist Sans, Geist Mono, Italiana, Cormorant Garamond
- Brand tokens defined in src/app/globals.css: gold #C9A961, ink #0a0a0a, bone #f5f0e6, glass system, marquee/scroll-cue/halftone utilities
- Header component built: src/components/layout/Header.tsx (sticky, scroll-aware glass, nav links: Work/Services/Process/About/Contact)
- Hero placeholder built in src/app/page.tsx
- shadcn components installed: button, card, input, textarea, label, sonner, separator
- Deps installed: framer-motion, lucide-react, clsx, tailwind-merge, class-variance-authority, @supabase/supabase-js, @supabase/ssr, resend, gsap, lenis
- GitHub repo: stresiadis-blip/shadeworks (push to main)
- Vercel: auto-deploy on push to main

## DO NOT TOUCH
- src/app/globals.css — design tokens are locked (gold #C9A961, three-tone gold light/dark, ink/bone palette). DO NOT change colors.
- Header nav structure (Work/Services/Process/About/Contact)
- Font stack (Italiana display, Cormorant serif, Geist sans/mono)

## DESIGN REFERENCE
Read these files FIRST before writing any code:
- _reference/mmc/CLAUDE.md — full design brief from a previous project
- _reference/mmc/globals.css — original CSS (for glass system patterns; we already adapted it)
- _reference/mmc/page.tsx — section composition pattern
- _reference/mmc/layout.tsx — layout pattern

Apply MMC's architecture (glass cards, marquee, halftone, cascading sections, generous spacing py-32 md:py-48, max-w-7xl containers) but with SHADEWORKS brand (gold #C9A961 not #FFD700, Italiana not Bebas, restraint over flash).

## SECTIONS TO BUILD (in order, on src/app/page.tsx)

1. **Hero** (already exists placeholder — REBUILD properly)
   - Eyebrow mono: "shade works — software studio · constanta"
   - Headline display Italiana: "Where code casts long." (clamp 3rem-9vw-9rem, "long" with text-gold-gradient)
   - Sub serif italic Cormorant: 1-2 lines about premium full-stack studio
   - Two CTAs: "View work" (gold solid) + "Get in touch" (outline)
   - Trust signal below: small text like "Currently shipping FerdiPoker · Available for new projects Q3 2026"
   - Optional shadow arc SVG as decorative element (background, subtle)
   - Scroll cue at bottom (use .animate-scroll-cue)

2. **Marquee 1** — text: "full-stack engineering · constanta · shipping since 2026"

3. **Work** (#work)
   - Section header eyebrow + display heading
   - 1 main case study card (FerdiPoker) — glass-card-gold, with:
     - Project name, year, role
     - Short description (2 lines)
     - Tech stack chips: Next.js, Supabase, Stripe, Vercel, Resend
     - "View case study →" link (placeholder route /work/ferdipoker)
   - 2 placeholder cards labeled "Concept work" and "More coming Q3 2026"

4. **Services** (#services)
   - Section header
   - 4 glass-card grid (2x2 on desktop, stacked mobile):
     1. **Full-stack web apps** — "Next.js, Supabase, Stripe. Apps that scale from MVP to production."
     2. **E-commerce & subscriptions** — "Stripe integrations, subscription management, custom checkout flows."
     3. **Custom dashboards** — "Admin panels and internal tools that ship in weeks, not months."
     4. **Landing pages** — "Premium marketing sites that convert. From concept to ship in 2-3 weeks."
   - Each card: icon (Lucide), title, description, optional "Learn more →"

5. **Marquee 2** (reverse) — text: "next.js · supabase · stripe · vercel · resend · typescript · tailwind"

6. **Process** (#process)
   - 4-step process editorial layout:
     1. **Discovery** — understand the problem, scope, constraints
     2. **Design** — wireframes, prototypes, brand alignment
     3. **Build** — production code, tests, staging
     4. **Ship & support** — deploy, monitor, iterate
   - Each step: number 01-04 large gold, title, short description

7. **About** (#about)
   - Editorial section
   - Big display heading: "A studio of one. Sometimes two."
   - Paragraph about Adrian (founder, ex-navy engineer, dev, built FerdiPoker, Constanta)
   - Optional: 3 stats inline (years coding, projects shipped, coffee per week or similar wit)
   - Quote in Cormorant italic about philosophy

8. **Marquee 3** — text: "shade works · est. 2026 · constanta"

9. **FAQ** (#faq)
   - 5 collapsible items (use simple <details> or shadcn accordion):
     1. "How much does a project cost?" — depends on scope, typical range €3-15k
     2. "How long does it take?" — 2-8 weeks depending on complexity
     3. "Do you work with non-tech founders?" — yes, often preferred
     4. "What's included?" — design, dev, deploy, 30-day post-launch support
     5. "Where are you based?" — Constanta, Romania. Work remote globally.

10. **Contact** (#contact)
    - Form: name, email, project type (select: Web app / E-commerce / Dashboard / Landing / Other), message
    - On submit: POST to /api/contact
    - Show success state with Sonner toast
    - Email + social links below

11. **Footer**
    - Logo + tagline (where code casts long)
    - Quick links (same as nav)
    - Social: GitHub, LinkedIn, Email
    - Bottom: © 2026 Shade Works · Constanta, Romania

## API ROUTES TO BUILD

### /api/contact (POST)
- Use Resend to send email to adrian@shadeworks.dev (placeholder env var RESEND_API_KEY)
- Insert lead row into Supabase (env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- Validate input with zod
- Return 200 + success message OR 400/500 with error
- DO NOT actually configure Supabase/Resend keys — just write the code referencing process.env vars. Add a .env.example file.

## /work/[slug] DETAIL ROUTE
- Build src/app/work/[slug]/page.tsx
- Static params for "ferdipoker"
- For ferdipoker slug:
  - Hero: project name, year, role
  - Overview, problem, solution, tech stack, screenshots placeholders, results
  - Back to work link
- For other slugs: 404

## REUSABLE COMPONENTS TO CREATE
Put them in src/components/sections/ or src/components/ui-extra/ as appropriate:
- Hero, Work, Services, Process, About, FAQ, Contact, Footer (sections)
- Marquee (reusable utility)
- SectionHeader (eyebrow + heading + optional intro)
- TechChip (small gold-bordered pill for tech names)
- WorkCard, ServiceCard, ProcessStep, FaqItem

## CONTENT RULES
- Copy in English (we're targeting international clients)
- No fake testimonials, no fake metrics, no fake case studies
- Be honest: "Concept work" or "More coming Q3 2026" for placeholder portfolio items
- For FerdiPoker case study: pull facts from public site ferdipoker.ro if needed, or use generic descriptions ("MTT poker training platform, RO market")

## OPERATIONAL RULES
1. Build incrementally. After each major section (Hero, Work, Services, etc), run `npm run build` to verify no errors, then commit with a clear message and push.
2. Commit format: "feat(section): build [name]" or "fix(area): [issue]"
3. NEVER touch _reference/mmc/* (read-only)
4. NEVER touch C:\Users\stres\Downloads\frdpokersite\frdpokersite-git\ (read-only)
5. Use server components by default, "use client" only when needed (interactivity, hooks)
6. Use Lucide icons (already installed)
7. Animations: prefer CSS (already-defined .animate-* utilities) for marquee/scroll-cue. Use framer-motion sparingly for entrance animations on scroll.
8. Mobile responsive: design mobile-first, use md:/lg: breakpoints
9. Accessibility: semantic HTML, alt texts, keyboard nav, focus states
10. Performance: lazy load images, no huge bundles

## SUCCESS CRITERIA
- npm run build → clean (zero errors, zero warnings except Next telemetry)
- All sections rendering, mobile + desktop
- Forms working (API route returns 200, even if Supabase/Resend not connected — log to console as fallback)
- Lighthouse mobile score 90+ Performance, 100 Accessibility
- Pushed to main, deployed on Vercel
- Tell me the live URL and any setup steps needed (env vars to add in Vercel dashboard)

## WHEN YOU FINISH
Write a final summary in _prompts/01-complete.md with:
- What you built
- Files created/modified (list)
- What env vars need to be set in Vercel
- What's pending (e.g., real Supabase table schema, Resend domain verification)
- Lighthouse scores
- Live URL

## START NOW
1. Read _reference/mmc/CLAUDE.md, _reference/mmc/globals.css, _reference/mmc/page.tsx, _reference/mmc/layout.tsx
2. Read current state: src/app/page.tsx, src/app/layout.tsx, src/app/globals.css, src/components/layout/Header.tsx
3. Plan the section order and component breakdown
4. Build Hero properly first (replace placeholder)
5. Build Marquee
6. Continue through all sections
7. Build /api/contact
8. Build /work/ferdipoker
9. Build Footer
10. Run build, fix all errors
11. Commit, push, summarize

GO.
