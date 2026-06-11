# Shade Works — Claude Context
Last updated: 2026-06-11 | Status: IN DEVELOPMENT
Studio personal Adrian Cata, Constanta Romania.

## Paths & Infra
- Working dir: C:\Users\stres\jarvis\projects\shadeworks
- GitHub: stresiadis-blip/shadeworks, branch main
- Vercel: deployed (shadeworks.vercel.app)
- Package manager: npm

## Stack
Next.js 16 App Router · TypeScript · Tailwind CSS v4 · Framer Motion · GSAP · Lenis
Three.js + R3F · Radix · shadcn/ui · Supabase · Resend · Zod · Sonner

## Design System
- Gold: #C9A961 | Ink: #0a0a0a | Bone: #f5f0e6
- Fonturi: Italiana (hero display) · Cormorant Garamond (headings editorial) · Geist Mono (labels)
- SW monogram mark cu gold frame
- Premium, restraint, flat — zero gradients, zero neon, zero drop shadows decorative

## Sectiuni construite
- Homepage: Hero, Marquee, Work, Services, Process, About, FAQ, Contact, Footer
- /work/[slug] — case study page (static: ferdipoker; 404 altfel)
- /api/contact — POST cu zod + Resend + Supabase, fallback graceful fara env vars

## Issues deschise
- Italiana font glyph rendering broken pe section headings
- ShadowArcBackground SVG opacity prea mica

## Reguli
- NO process narration. Root cause first.
- Nu modifica copy user-facing existent byte-for-byte.
- Tipuri stricte, no any, no console.log in prod.

## Context aditional
- Gotcha-uri tehnice → .claude/gotchas.md
- Prompts build → _prompts/ (deja in repo)
