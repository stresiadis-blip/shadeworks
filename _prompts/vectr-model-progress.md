# VECTR MODEL — Landing pivot — PROGRESS (4/9 commits)

Last updated: 2026-06-13
Branch: `feature/vectr-model` (din `feature/scroll-story`). NU pushed, NU deployed.

## DECIZIE (cu Adi)
Landing-ul pivoteaza pe modelul **Vectr** (vectrfl.com): editorial curat, hero text
mare pinned, sectiuni care curg + reveal pe scroll — TOTUL in neo-noir ShadeWorks
(ink/bone/gold #ffd400/crimson #d11f2a/signal #f2c200, grain/vignette). Structura +
choreografia Vectr, NU pixelii lor.

**Sfera 3D pleaca de pe landing** si traieste pe `/work` ca galerie de proiecte.
Scroll-story-ul vechi (sfera-as-hero + ACT2 S1-S6) ramane recuperabil pe branch
`sphere-gallery-archive`. `StoryScroll.tsx` inca exista ca fisier (se retrage la final).

## TEHNICA VECTR (inspectie live, confirmat din cod-ul lor)
Astro (MPA) + GSAP + ScrollTrigger + Lenis + IntersectionObserver. Hero `position:fixed`
+ spacer (content urca peste). Process 01-04 = clasa `--active` togglata pe scroll.
Features `position:sticky`. Tranzitii de pagina = overlay-curtain custom pe navigatii MPA.
~80% din tehnica o aveam deja in `StoryScroll.tsx` + `SmoothScrollProvider.tsx`.

## STRUCTURA APROBATA (A-D)
Sectiuni landing, in ordine: HERO pinned → MANIFEST/3 tracks → PROOF/FerdiPoker →
ENGINE (sticky device) → PROCESS/OPERATORS (scrub timeline) → CTA → FOOTER.
Copy byte-for-byte din `src/data/studio.ts`. Logica GSAP portata din StoryScroll S1-S6.

## ASSETS (decizie Adi)
- FerdiPoker: `/work/ferdipoker.jpg` existent (screenshot 2x mai tarziu daca arata slab).
- Hero bg / Engine ambianta / divider: **PUR TIPOGRAFIC** acum. Adi procura foto doar
  daca o sectiune o cere in dev — atunci se cere cu ratio exact.
- Iconite SVG (3 tracks, 3 agenti): generate inline noir de Claude.

## COMMITURI FACUTE
1. `eeed8b2` feat(work): mount sphere gallery on /work hub
   - `src/app/work/page.tsx` NOU monteaza `<GalleryExperience/>`. Logo galeriei deja → "/".
2. `b7611ca` feat(landing): pinned editorial hero, drop sphere from /
   - `landing/LandingHero.tsx` + `landing/LandingExperience.tsx` NOI. `page.tsx` scoate
     sfera+StoryScroll, monteaza landing-ul. Hero `fixed inset-0` + dwell window + body
     ink care aluneca peste. Reduced-motion: hero in flow, dwell sarit.
3. `730a59f` feat(landing): manifest + three capability tracks (S2)
   - `landing/ManifestSection.tsx` NOU. Iconite noir inline (`</>` / slidere / bullhorn).
     Driver reveal `[data-reveal]`/`[data-reveal-group]` mutat in LandingExperience.
4. `40ac5fb` feat(landing): proof section — FerdiPoker receipt, qualitative LIVE/STRIPE/0-templates (S3)
   - `landing/ProofSection.tsx` NOU (server component, montat sub ManifestSection in bg-ink).
     Copy din studio.ts (PROOF_EYEBROW/HEADLINE) + getCaseStudy("ferdipoker") (name/tagline/stack/liveUrl).
     Poza 4:3 noir-graded (border crimson/30, grayscale->color hover, gradient ink) link → /work/ferdipoker.
     CTA "READ THE CASE STUDY" (gold) + link live discret "LIVE → ferdipoker.ro".
     3 tile-uri calitative (data-reveal-group/item, FARA cifre): LIVE / STRIPE / 0 TEMPLATES.
     Reveal doar prin atribute existente, zero JS local, reduced-motion static. tsc curat, build verde 27 pagini.

## RAMAS DE FACUT (commit 5-9)

> **ATENTIE — PLAN SCHIMBAT 2026-06-13.** Planul tipografic de mai jos (commit 5-9: engine sticky, process scrub, cta) e **CONGELAT/ABANDONAT**. Landing-ul pivoteaza pe **scroll-driven journey cinematic Sin City noir→color** cu animatie 3D izometrica pre-randata pe canvas (calea A, Blender). Concept complet + decizii: `C:\Users\stres\jarvis\projects\shadeworks\_prompts\CONCEPT-journey-noir-to-color.md`. Commit 1-4 (hero/manifest/proof) raman valide ca sectiuni editoriale post-journey. Engine/learn/build/deliver se muta IN journey. Nu mai executa planul de jos ca atare — se regandeste cand incepem productia (storyboard + Blender intai).

--- plan vechi, pastrat ca referinta istorica ---
5. ENGINE (S4) — device sticky Vectr: coloana stanga sticky (headline 80% faster),
   dreapta cei 3 agenti (ARCHITECT/BUILD/DEPLOY) curg pe langa. Iconite noir inline.
6. PROCESS / OPERATORS (S5) — rail vertical scrub scaleY 0→1 + markere se aprind (3 pasi).
7. CTA / EXECUTE DESCENT (S6) + FOOTER (logo + link WORK → /work + contact).
8. Preloader + polish (atmosfera discreta pe landing, reduced-motion sweep, mobil).
9. **FAZA SEPARATA, commit distinct:** page-transitions `next-view-transitions`. NU in
   acelasi commit cu structura (cerinta Adi).

Fiecare commit: `tsc --noEmit` curat + `npm run build` verde + verificare vizuala umana
in dev (port 3005 — Adi are altceva pe 3000). NU inlantui commituri fara verificare.

## STARE INTEGRITATE (la end sesh)
tsc curat. Build verde (Next 16.2.6 / Turbopack, 27 pagini: / static, /work static,
/work/[slug] SSG 21 paths, /api/contact dynamic).
