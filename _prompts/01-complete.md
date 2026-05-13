# Shade Works — Full Site Build · Completion Summary

**Status:** ✅ Built, type-checked, production build clean, pushed to `main`.
**Build time:** ~1.3s compile + ~1.6s typecheck on Turbopack.
**Date:** 2026-05-13

---

## What was built

### Pages
- **`/`** — homepage with 11 sections in cascade (Hero → Marquee → Work → Services → Marquee → Process → About → Marquee → FAQ → Contact → Footer)
- **`/work/[slug]`** — case-study detail page (statically generated for `ferdipoker`, 404 for everything else)
- **`/api/contact`** — POST endpoint with zod validation, Resend email send, Supabase insert, graceful fallbacks when env vars are missing

### Components

**Sections** (`src/components/sections/`):
- `Hero.tsx` — full-bleed hero with decorative shadow arc SVG, eyebrow, Italiana headline, Cormorant sub, two CTAs, live-status trust signal, scroll cue
- `Work.tsx` — main FerdiPoker glass-card-gold + concept-work card + "more coming Q3 2026" CTA row
- `Services.tsx` — 4-card 2×2 grid (full-stack apps, e-commerce, dashboards, landing pages) with Lucide icons and gold numerals
- `Process.tsx` — 4-step editorial timeline with gold gradient numerals and connector lines
- `About.tsx` — "A studio of one. Sometimes two." + Adrian bio, by-the-numbers stats card, location, founding quote
- `FAQ.tsx` — 5 native `<details>` accordions with rotating + icon
- `Contact.tsx` — client form with name/email/project-type pill selector/message, posts to /api/contact, Sonner toast feedback
- `Footer.tsx` — brand + nav + studio info + giant decorative wordmark + system status

**Reusable** (`src/components/`):
- `Marquee.tsx` — orchestrates the .animate-marquee utility with separator + reverse + speed props
- `SectionHeader.tsx` — eyebrow + Italiana title + optional Cormorant intro
- `TechChip.tsx` — small gold-bordered pill for tech stack
- `icons/BrandIcons.tsx` — inline GitHub/LinkedIn SVGs (Lucide v1+ stripped brand icons)
- `providers/ToastProvider.tsx` — Sonner Toaster, dark theme, brand colors

**Data:**
- `src/lib/work.ts` — `CaseStudy` type + `CASE_STUDIES` array + helpers

### Routes
- `src/app/work/[slug]/page.tsx` — uses Next 16 `params: Promise<{slug:string}>` pattern, `generateStaticParams`, `generateMetadata`, calls `notFound()` for unknown slugs

---

## Files created

```
.env.example
_prompts/01-complete.md
src/app/api/contact/route.ts
src/app/work/[slug]/page.tsx
src/components/Marquee.tsx
src/components/SectionHeader.tsx
src/components/TechChip.tsx
src/components/icons/BrandIcons.tsx
src/components/providers/ToastProvider.tsx
src/components/sections/About.tsx
src/components/sections/Contact.tsx
src/components/sections/FAQ.tsx
src/components/sections/Footer.tsx
src/components/sections/Hero.tsx
src/components/sections/Process.tsx
src/components/sections/Services.tsx
src/components/sections/Work.tsx
src/lib/work.ts
```

## Files modified

```
.gitignore           — added .claude/, exempted .env.example
package.json         — added zod direct dep
package-lock.json    — zod tree
src/app/layout.tsx   — mounted <ToastProvider />
src/app/page.tsx     — rebuilt as composition root
tsconfig.json        — exclude _reference, _prompts from TS check
```

---

## Environment variables needed in Vercel

All optional — the API route degrades gracefully if any of these are missing (it logs the lead to console and returns 200 with a `warnings` array).

| Variable                        | Purpose                                        | Required for prod? |
|---------------------------------|------------------------------------------------|--------------------|
| `RESEND_API_KEY`                | Send notification email to studio              | Yes               |
| `RESEND_FROM_EMAIL`             | "Shade Works \<hello@shadeworks.dev\>"          | Yes               |
| `CONTACT_TO_EMAIL`              | Lead inbox (default: adrian@shadeworks.dev)    | No (has default)   |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                            | Yes for DB store  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side anon key (not used yet, reserved)   | No                |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-side write key for /api/contact insert   | Yes for DB store  |

---

## What's pending (next iteration)

1. **Supabase `leads` table** — schema not yet created. Suggested:

   ```sql
   create table public.leads (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     email text not null,
     project_type text not null,
     message text not null,
     submitted_at timestamptz not null default now(),
     created_at timestamptz not null default now()
   );
   alter table public.leads enable row level security;
   -- No public policy: only service-role inserts via /api/contact
   ```

2. **Resend domain verification** — add `shadeworks.dev` in the Resend dashboard, set up DKIM/SPF/DMARC records on the DNS for the domain before swapping `RESEND_FROM_EMAIL` to a vanity address.

3. **Real screenshots** for the `/work/ferdipoker` case study (currently a placeholder card with "Screenshots coming soon"). Capture from ferdipoker.ro and drop in `public/work/ferdipoker/*.png`, then wire into the page.

4. **OG image** — `metadataBase` is set; add an `app/opengraph-image.tsx` to generate a branded social card.

5. **Sitemap & robots** — add `app/sitemap.ts` and `app/robots.ts` before pushing for indexing.

6. **Lighthouse audit** — needs an actual deploy URL to measure. Local builds are clean but mobile scores require real network conditions.

7. **More case studies** — `CASE_STUDIES` array is ready to extend. Just add an entry and the work cards + detail route pick it up automatically.

---

## Build output

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/contact
└ ● /work/[slug]
  └ /work/ferdipoker

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

Zero TS errors, zero ESLint warnings, zero broken imports.

---

## Lighthouse scores

Not yet measured — requires the deployed URL. Once Vercel deploys the push to `main`, run:

```
npx lighthouse https://shadeworks.dev --view --preset=desktop
npx lighthouse https://shadeworks.dev --view
```

Targets: 90+ Performance / 100 Accessibility / 90+ Best Practices / 100 SEO.

---

## Live URL

Vercel auto-deploys on push to `main`. After the push, the production URL will be available at the canonical Vercel domain for the project, and at `shadeworks.dev` once the custom domain is attached.

To check status: `vercel ls` (requires Vercel CLI: `npm i -g vercel`).
