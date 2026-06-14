# ShadeWorks — BUILD LOG (Journey landing)

> De ce exista: ca sa nu mai intrebam niciodata "pe ce commit era scena buna?".
> Fiecare intrare = hash + ce scena/efect face + status. Se actualizeaza la FIECARE commit.
> Fisier component: `src/components/landing/JourneySection.tsx`
> Branch: `feature/journey-canvas`. Push pe `main` = deploy Vercel (cere confirmare; NU cu tester activ).

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
