# ShadeWorks — BUILD LOG (Journey landing)

> De ce exista: ca sa nu mai intrebam niciodata "pe ce commit era scena buna?".
> Fiecare intrare = hash + ce scena/efect face + status. Se actualizeaza la FIECARE commit.
> Fisier component: `src/components/landing/JourneySection.tsx`
> Branch: `feature/journey-canvas`. Push pe `main` = deploy Vercel (cere confirmare; NU cu tester activ).

---

## Sesiune 2026-06-14 (end sesh)
Landing pe `feature/journey-canvas`: structura editoriala Vectr (hero + proces pinned 6 pasi + Proof + CTA) peste backdrop cinematic.
- Iteratii backdrop GRESITE (toate = drum generat de la zero, NU drumul nostru): `CarJourneyBackground` (1a1cfbe), `JourneyBackdrop` (103fffc), `JourneyCanvas`+`drawCar` (054a78d). REVERTED.
- CORECT (a5af00d, **KEEP, NEverificat vizual**): backdrop = drumul EXACT din `JourneySection.tsx` reutilizat via export `drawJourneyScene(showCar=false)` (flag aditiv, drum byte-identic). Peste el DOAR: grade mono->culoare 59% (CSS grayscale), dawn glow amber/crimson la orizont de la 59%, masina = PNG `/car-noir-headon.png` (NU desenata). Scroll: pin 300vh -> store valtio. Stack nou: `valtio`.
- Deschis: sosirea (dupa cut 0.62) fara masina; PNG dispare la cut. De decis cu Adi.
- Lectie: NU regenera soseaua. "Drumul nostru" = JourneySection (147d973) — reutilizeaza desenul, pune doar grade+asset peste.

---

## Conventie
`HASH — eticheta — ce face (per scena) — STATUS`
STATUS: KEEP (bun, de pastrat) / BROKE (a stricat ceva) / WIP / REVERTED

---

## Istoric (de completat din `git log` — vezi mai jos)

> TODO: rulat `git log --oneline -25 -- src/components/landing/JourneySection.tsx`
> si lipit aici fiecare commit cu eticheta lui. Pana atunci, ce stim din sesiune:

- **(necomitat, working tree)** — chase-cam rewrite + restructurare 5 acte —
  drawIsoAct rescris ca one-point-perspective (masina in fata, drum spre vanishing point,
  cladiri billboard). Culoare graduala noir->synthwave->warm. CUT 0.58, 600svh,
  drawSideAct dawn-split, benzi op/tw realiniate.
  STATUS: **BROKE scena 1** — a inlocuit gresit scena 1 buna (orizont+zoom).
  Scenele 2/5 synthwave+sunrise = OK. De facut: REVERT doar scena 1, pastreaza restul.

## SCENA 1 — referinta "buna" (de gasit in git)
Versiunea corecta pt act 1: **orizont in header, masina vine dinspre orizont spre privitor,
zoom-in care mareste masina + farurile + lumina farurilor.** NU chase-cam de jos.
Commit-ul exact = de identificat din `git log` (cauta mesaje cu hero/horizon/zoom/camera).

## Referinte vizuale (uploads user, 2026-06-14)
- Sin City stills (alb-negru pur + 1 accent), noir cu ploaie+felinar.
- loopscene.mp4: chase-cam masina din spate, drum synthwave, luna mare.
- sincityscene.mp4: chase-cam masina rosie, alb-negru + accent rosu, faruri prin ceata.
- carnight.jpg: masina noir noaptea pe strada uda.
- Rol referinte: ghid pt UNGHIUL camerei PER scena (nu acelasi unghi peste tot).

## TODO design (din feedback user)
1. Scena 1: REVERT la orizont+zoom (nu o atinge).
2. Scenele 2-5: adapteaza camera per scena. Drum oras -> suburbie (zona case).
3. Efect tranzitie pagina ca pe vectrr (2 categorii stanga-sus) — de studiat + reprodus.
4. Animatia "astro" de pe vectrr (o singura plansa care se desfasoara) — de reprodus identic.
   > URL vectrr = de confirmat cu user.

## Auto-log
- 9c89ede — chore: verify post-commit auto-log — files: .hooktest — 2026-06-14T02:49:22+03:00
- 6e920a4 — chore: remove hook test file — files: .hooktest — 2026-06-14T02:49:23+03:00
- 6db9abb — chore: version BUILDLOG (track _prompts) — files: .gitignore,_prompts/BUILDLOG.md — 2026-06-14T02:54:19+03:00
- 6633892 — chore: narrow _prompts gitignore to BUILDLOG only — files: .gitignore,_prompts/01-build-full-site.md,_prompts/01-complete.md,_prompts/BUILDLOG.md,_prompts/vectr-model-progress.md — 2026-06-14T03:01:53+03:00
- 147d973 — revert(journey): restore iso scene-1 (horizon approach + push-in zoom) from 415a229 — files: _prompts/BUILDLOG.md,src/components/landing/JourneySection.tsx — 2026-06-14T03:05:59+03:00
- b54981a — feat(nav): wire Work link to /work; drop CRLF churn — files: _prompts/BUILDLOG.md,src/components/landing/LandingExperience.tsx — 2026-06-14T03:24:19+03:00
- 73dc20c — feat(journey): preloader + reduced-motion + mobile polish — files: _prompts/BUILDLOG.md,src/components/landing/JourneySection.tsx — 2026-06-14T03:46:20+03:00
- 3bf90aa — feat(landing): editorial Vectr structure on / (pinned hero + scroll-built process + flowing sections) — files: _prompts/BUILDLOG.md,src/components/landing/LandingExperience.tsx,src/components/landing/ProcessSection.tsx — 2026-06-14T04:33:16+03:00
- a90caa9 — feat(landing): faithful vectr design+motion (noir, own copy) — files: _prompts/BUILDLOG.md,src/components/landing/IsoDiorama.tsx,src/components/landing/LandingExperience.tsx,src/components/landing/ProcessSection.tsx — 2026-06-14T04:49:34+03:00
- 7d3f3a8 — @ feat(landing): car-journey background under vectr structure (noir->color) — files: src/components/landing/CarJourneyBackground.tsx,src/components/landing/IsoDiorama.tsx,src/components/landing/LandingExperience.tsx — 2026-06-14T06:31:21+03:00
- 1a1cfbe — feat(landing): car-journey background under vectr structure (noir->color) — files: src/components/landing/CarJourneyBackground.tsx,src/components/landing/IsoDiorama.tsx,src/components/landing/LandingExperience.tsx — 2026-06-14T06:31:56+03:00
- 103fffc — feat(journey): cinematic noir car-approach backdrop under vectr (scroll-driven) — files: src/components/landing/CarJourneyBackground.tsx,src/components/landing/IsoDiorama.tsx,src/components/landing/JourneyBackdrop.tsx,src/components/landing/LandingExperience.tsx — 2026-06-14T07:39:09+03:00
- 054a78d — feat(journey): cinematic canvas car-approach on our road + vectr structure — files: package-lock.json,package.json,src/components/landing/JourneyBackdrop.tsx,src/components/landing/LandingExperience.tsx,src/components/landing/ProofSection.tsx,src/components/landing/journey/JourneyCanvas.tsx,src/components/landing/journey/JourneyProcess.tsx,src/components/landing/journey/drawCar.ts,src/components/landing/journey/journeyStore.ts — 2026-06-14T08:03:04+03:00
- a5af00d — feat(journey): our road backdrop + neo-noir grade + PNG car — files: public/car-noir-headon.png,src/components/landing/JourneySection.tsx,src/components/landing/LandingExperience.tsx,src/components/landing/journey/JourneyCanvas.tsx,src/components/landing/journey/JourneyRoadBackdrop.tsx,src/components/landing/journey/drawCar.ts — 2026-06-14T09:26:39+03:00
- 180cae5 — @ docs: end sesh 2026-06-14 — journey road backdrop (our road + grade + PNG car) — files: CLAUDE.md,_prompts/BUILDLOG.md — 2026-06-14T09:28:36+03:00
