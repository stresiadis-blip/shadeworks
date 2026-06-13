# Shade Works — Claude Context
Last updated: 2026-06-13 | Status: IN DEVELOPMENT
Pagina de prezentare a studioului Shade Works (viitor PFA Adrian Cata, Constanta). Vitrina: "ce suntem capabili sa facem". Studio generalist — NU nisat pe maritim (maritimul tine de un eventual produs separat, nu de site).

> **PIVOT ACTIV (branch `feature/vectr-model`, 3/9 commits, NEmerged):** landing-ul se muta pe model editorial Vectr (hero pinned + sectiuni scroll), iar sfera 3D pleaca pe `/work`. Sectiunea "CONCEPT REAL" de mai jos descrie inca PRODUCTIA (main, sfera-as-homepage) — valida pana la merge. Detalii + ce a ramas: `_prompts/vectr-model-progress.md`. Arhiva sfera-as-hero: branch `sphere-gallery-archive`.

> **Reguli de convorbire + protocoale cross-proiect: `C:\Users\stres\jarvis\Claude\_RULES.md`** (sursa de adevar). Rezumat aplicabil mai jos.

## MOD DE LUCRU CU ADRIAN (sistem cross-proiect — aplica de la primul raspuns)
- **Pas cu pas.** UN task per prompt, scope strans, un commit revertabil per bucata. Mega-prompturi = interzis.
- **Root cause first** — `cat`/`grep`/inspect INAINTE de fix. Arata evidenta, apoi propune. Nu inventa ipoteze cand poti verifica.
- **Raspuns scurt executiv** — ce + de ce (1 linie) + comanda/cod. Fara preambul, fara narratie de proces, fara concluzii de complezenta.
- **Intreaba, nu presupune** — lipsa info = intrebare directa. DAR paths/pornire/skip-perms NU se intreaba, sunt scrise aici.
- **Recomandare cu reasoning, NU meniu A/B/C** — alegi tu si explici scurt.
- **Romana FARA diacritice** (ASCII) in conversatie/UI. Comentarii cod = engleza.
- **NU auto-translate/regenera copy user-facing existent** — leave byte-for-byte.
- **Verificare vizuala umana** dupa fiecare pas.
- **NICIODATA 2 prompturi Claude Code paralele** pe acelasi branch. Paralel doar audit read-only.
- **Panic mode** ("ne facem de ras"/"rapid"/"FIXURI ACUM") → cea mai rapida optiune. Datoria tehnica se noteaza ulterior.

## SKIP-PERMS — Shadeworks = PERMIS (DEV)
Shadeworks e IN DEZVOLTARE — fara useri reali. ATENTIE: push pe main = AUTO-DEPLOY (shadeworks.vercel.app). Pornire:
```bash
cd ~/jarvis/projects/shadeworks && git checkout main && git status
claude --dangerously-skip-permissions
```
Criteriu: "loveste useri/bani reali?" NU (vitrina, fara useri) → skip-perms ON la lucru local. DAR: branch + review Adrian INAINTE de push pe main (push = deploy live). NU push automat fara confirmare.

## Stack (verificat in cod 2026-06-12)
Next.js 16 App Router · TypeScript · Tailwind v4 · GSAP · Lenis · Three.js/R3F (sfera) · Radix/shadcn/ui · Supabase · Resend · Zod · Sonner

## Paths & Infra
- Working dir: C:\Users\stres\jarvis\projects\shadeworks
- GitHub: stresiadis-blip/shadeworks, branch main
- Vercel: deployed (shadeworks.vercel.app) — push pe main = auto-deploy
- Package manager: npm

## CONCEPT REAL — galerie noir cinematica (NU site editorial cu sectiuni)
Toata experienta e in `src/components/gallery/GalleryExperience.tsx` (montat din `app/page.tsx`). NU exista sectiuni Hero/Work/Services/About/FAQ separate — e o experienta single-screen:
- Sfera 3D rotativa de proiecte (`SphereGallery.tsx`) + vedere lista alternativa (`ListView.tsx`)
- Straturi de atmosfera noir (`AtmosphereLayers.tsx`): ploaie, grain de film, ceata, halftone, vigneta, fulger
- Overlay hero auto-fade dupa 4s: "YOU THINK IT. / WE SHADE IT INTO REALITY."
- Chrome UI: logo "shadeworks" stanga-sus, FILTER center-sus, EXECUTE DESCENT dreapta-sus (deschide consola), toggle SPHERE/INDEX stanga, nav jos (WORK/ENGINE/OPERATORS)
- Panels: `OverlayPanels.tsx` (EnginePanel, OperatorsPanel) + `IdeaScannerConsole.tsx`
- Fallback prefers-reduced-motion: grid CSS plat cu aceleasi date (ReducedMotionGrid)
- `/work/[slug]` — pagina case study (doar ferdipoker e real; restul placeholdere)
- `/api/contact` — POST cu zod + Resend + Supabase, fallback graceful fara env

## Design System (verificat in cod — sursa de adevar: globals.css + layout.tsx)
- Paleta: ink #0a0a0a / bone #f7f4ec / GOLD #ffd400 (light #ffe05c, dark #d9b200)
- Accente noir: crimson #d11f2a (+bright #ff2b38) · signal #f2c200
- ATENTIE: gold-ul e #ffd400, NU #C9A961 (acela era un brand vechi, depasit)
- Fonturi: Italiana = DOAR logo wordmark (.font-logo) · Archivo Black = display poster (.font-display-black) · Oswald = condensed · Geist sans/mono = UI/labels
- NU se foloseste Cormorant Garamond nicaieri (era in doc veche, fals)
- Estetica: noir cinematic — gold + crimson/signal pe ink. Are glow/grain/vignette intentionat (parte din conceptul noir), nu "flat premium".

## Date proiecte (src/data/projects.ts)
21 proiecte, 3 categorii: custom-code · control-panels · megaphone (THE MEGAPHONE).
- FerdiPoker = singurul LIVE & real (MTT poker, Stripe, Supabase). Restul = CONCEPT/IN PROGRESS, placeholdere de vitrina (Ledger Console, Fleet Ops Panel, Signal Pipeline, Shade Engine etc.).
- STATUS_COLOR: LIVE #ffd400 · CONCEPT #6e6e6e · IN PROGRESS #a8a8a8

## De aliniat la strategie (piloni in vault: jarvis/Claude/Projects/Shadeworks/pillars/)
- FerdiPoker = case study cu CIFRE de business (proof of capability). De dezvoltat `/work/ferdipoker`.
- Proiectele placeholder (restul de 20) — de decis daca raman ca "concept showcase" sau se curata. NEDECIS.

## Reguli
- NO process narration. Root cause first (inspect cod inainte de fix).
- Copy user-facing existent: byte-for-byte, nu rescrie/traduce in refactor.
- Tipuri stricte, no any, no console.log in prod.
- Push pe main = deploy. Branch + review Adrian inainte de push.

## Context aditional
- Gotcha-uri tehnice → .claude/gotchas.md
- Prompts build → _prompts/

## Note istorice (corectii 2026-06-12)
- Versiunea veche a acestui fisier descria un site editorial gold #C9A961 cu sectiuni si fonturi Cormorant/Italiana-pe-hero, plus issue-uri "Italiana glyphs pe headings" si "ShadowArcBackground opacity". ACELEA NU MAI EXISTA in cod — erau dintr-o iteratie anterioara. Sursa de adevar e codul, nu memoria.
