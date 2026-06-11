# Shade Works — Gotcha-uri tehnice
> Incarca cand lucrezi la fonturi, animatii, Three.js, contact form.

## Fonturi
- Italiana: glyph rendering broken pe section headings — issue deschis
- Cormorant Garamond: serif editorial, headings mari si quotes
- Geist Mono: labels, date tehnice, badges

## Animatii
- ShadowArcBackground SVG: opacity prea mica — issue deschis
- Lenis: initializat in LenisProvider din components/layout/
- GSAP + ScrollTrigger: register in lib/gsap.ts — importa de acolo, nu re-registra

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
