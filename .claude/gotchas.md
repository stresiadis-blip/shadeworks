# Shade Works — Gotcha-uri tehnice
> Incarca cand lucrezi la fonturi, animatii, Three.js, contact form.

## Fonturi
- Italiana: glyph rendering broken pe section headings — issue deschis
- Cormorant Garamond: serif editorial, headings mari si quotes
- Geist Mono: labels, date tehnice, badges

## Animatii
- Lenis + GSAP ScrollTrigger sync: in `components/providers/SmoothScrollProvider.tsx`
  (Lenis pe gsap.ticker, lenis.on("scroll", ScrollTrigger.update)). NU exista lib/gsap.ts.
- ScrollTrigger se registreaza inline per fisier care-l foloseste (idempotent).
- **gsap.from + StrictMode (Next dev) = ultimul element din stagger ramane blocat la
  opacity:0.** Cauza: `gsap.context().revert()` la double-invoke captureaza valoarea
  curenta (mid-animatie) ca stare "naturala". FIX: foloseste `gsap.fromTo` cu stare
  finala EXPLICITA pentru animatii care pornesc imediat la mount (ex: hero entrance).
  Reveal-urile scroll-triggered (once:true) sunt OK cu `from` — nu ruleaza pana la scroll,
  deci double-invoke-ul nu le prinde mid-flight.

## Three.js (r128)
- OrbitControls: indisponibil — nu folosi
- CapsuleGeometry: indisponibil — foloseste CylinderGeometry sau SphereGeometry

## Contact Form
- /api/contact: POST cu zod + Resend + Supabase insert
- Fallback graceful cand env vars lipsesc
- Sonner pentru toast feedback client-side

## Tailwind v4 + shadcn
- @theme tokens in globals.css, nu tailwind.config.ts
- Import shadcn din @/components/ui/[component]
