"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IdeaScannerConsole } from "@/components/gallery/IdeaScannerConsole";
import {
  HERO_TITLE_LINES,
  STORY_EYEBROW,
  STORY_BRIDGE,
  MANIFEST_EYEBROW,
  MANIFEST_HEADLINE,
  MANIFEST_BODY,
  ENGINE_EYEBROW,
  ENGINE_HEADLINE,
  ENGINE_BODY,
  PROOF_EYEBROW,
  PROOF_HEADLINE,
  OPERATOR_EYEBROW,
  OPERATOR_HEADLINE,
  OPERATOR_BODY,
} from "@/data/studio";

gsap.registerPlugin(ScrollTrigger);

/** Noir palette mirrored from globals.css — canvas needs raw hex, not tokens. */
const INK = "#0a0a0a";

/** Linear interpolation helper. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ---------------------------------------------------------------------------
// Deterministic world data — built ONCE at module load so every frame renders
// the identical layout. No per-frame randomness => no flicker, stable 60fps.
// Coordinates are resolution-independent (depth d in 0..1, lateral v in lane
// units); they get projected to the cinematic frame at draw time.
// ---------------------------------------------------------------------------

/** Small mulberry32 PRNG — a deterministic stream from a constant seed. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROAD_HALF = 3.4; // half road width, in lane units (wide, cinematic street)

interface Building {
  d: number; // depth along the road, 0 = foreground/near, 1 = horizon/far
  v: number; // signed lateral offset (lane units); |v| > ROAD_HALF
  footW: number; // footprint diameter (lane units)
  h: number; // height (lane units)
  tone: number; // base grey value (near-black -> dark grey)
}

/** Procedural city flanking the road on both sides, near -> far. */
function buildCity(): Building[] {
  const rng = mulberry32(0x5eed);
  const list: Building[] = [];
  const ROWS = 24;
  for (let i = 0; i < ROWS; i++) {
    const rowD = i / ROWS;
    for (const side of [-1, 1] as const) {
      const lots = 1 + (rng() < 0.55 ? 1 : 0);
      for (let j = 0; j < lots; j++) {
        if (rng() < 0.12) continue; // scattered empty lots
        list.push({
          d: rowD + rng() * 0.02,
          v: side * (ROAD_HALF + 0.5 + j * 1.15 + rng() * 0.5),
          footW: 0.55 + rng() * 0.45,
          h: 1.3 + rng() * 5,
          tone: 14 + Math.round(rng() * 26),
        });
      }
    }
  }
  return list;
}

interface Tower {
  x: number; // 0..1 fraction of width
  w: number; // 0..1 fraction of width
  h: number; // 0..1 fraction of height
}

/** Distant skyscraper silhouettes strung along the horizon line. */
function buildSkyline(): Tower[] {
  const rng = mulberry32(0xb14e);
  const list: Tower[] = [];
  for (let i = 0; i < 46; i++) {
    list.push({
      x: i / 46 + rng() * 0.01,
      w: 0.012 + rng() * 0.022,
      h: 0.02 + rng() * 0.07,
    });
  }
  return list;
}

interface Streak {
  x: number; // 0..1 fraction of width
  y: number; // 0..1 fraction of height
  len: number; // 0..1 fraction of height
}

/** A fixed set of rain streaks, offset by progress at draw time (performant). */
function buildRain(): Streak[] {
  const rng = mulberry32(0x9a17);
  const list: Streak[] = [];
  for (let i = 0; i < 180; i++) {
    list.push({ x: rng(), y: rng(), len: 0.02 + rng() * 0.035 });
  }
  return list;
}

const CITY = buildCity();
const SKYLINE = buildSkyline();
const RAIN = buildRain();

/**
 * COMMIT B — the isometric noir city as a cinematic film frame. Fully
 * monochrome (the color arc is commit C). Top ~25% is night sky + a horizon
 * line of distant skyscraper silhouettes; below it a tilted-isometric city
 * flanks a wet-asphalt road that runs from the foreground UP toward the
 * horizon (fake-perspective depth scaling: near = large/crisp, far =
 * small/dim). A small car drives up the road from near to far as progress
 * 0->1, with faint white headlight cones. Heavy diagonal rain over the frame.
 * The camera loosely pans vertically as the car advances (not locked centre).
 *
 * width/height are CSS pixels — the caller has already applied the
 * devicePixelRatio transform, so all coordinates here stay in layout space.
 */
function draw(
  ctx: CanvasRenderingContext2D,
  progress: number,
  width: number,
  height: number,
): void {
  // --- frame + projection setup -------------------------------------------
  const horizonY = height * 0.26;
  const bottomY = height * 1.04; // road mouth sits just off the bottom edge
  const lanePx = Math.max(20, width * 0.05);
  const camY = -height * 0.04 * progress; // gentle vertical pan, eased by car

  // Fake perspective: depth 0 (near) -> scale 1, depth 1 (horizon) -> small.
  const depthScale = (d: number): number => 1 / (1 + d * 5);
  const sFar = depthScale(1);
  const yNorm = (d: number): number => (depthScale(d) - sFar) / (1 - sFar);
  const groundY = (d: number): number =>
    horizonY + (bottomY - horizonY) * yNorm(d) + camY;
  // Road centreline winds, then converges to the vanishing point at horizon.
  const centerX = (d: number): number =>
    width * 0.5 + Math.sin(d * Math.PI * 1.6) * width * 0.13 * (1 - d);
  const ground = (d: number, v: number): [number, number] => [
    centerX(d) + v * lanePx * depthScale(d),
    groundY(d),
  ];

  // Polygon/line helpers operating on projected [x, y] points.
  const poly = (pts: [number, number][]): void => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.fill();
  };
  const strokePoly = (pts: [number, number][]): void => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.stroke();
  };
  const line = (p: [number, number], q: [number, number]): void => {
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.lineTo(q[0], q[1]);
    ctx.stroke();
  };

  // One tilted-isometric extruded box at (d, v): 2:1 diamond base + two visible
  // side faces + top, depth-scaled. fill(faceMul) tones the three faces.
  const drawIsoBox = (
    d: number,
    v: number,
    footW: number,
    h: number,
    fill: (faceMul: number) => string,
    edge: string,
  ): void => {
    const s = depthScale(d);
    const [cx, cy] = ground(d, v);
    const dW = footW * lanePx * s * 0.5;
    const dH = dW * 0.5; // 2:1 isometric diamond
    const hPx = h * lanePx * s;

    const bRight: [number, number] = [cx + dW, cy];
    const bBot: [number, number] = [cx, cy + dH];
    const bLeft: [number, number] = [cx - dW, cy];
    const tTop: [number, number] = [cx, cy - dH - hPx];
    const tRight: [number, number] = [cx + dW, cy - hPx];
    const tBot: [number, number] = [cx, cy + dH - hPx];
    const tLeft: [number, number] = [cx - dW, cy - hPx];

    ctx.fillStyle = fill(0.66); // right face (lit edge)
    poly([bRight, bBot, tBot, tRight]);
    ctx.fillStyle = fill(0.4); // left face (in shadow)
    poly([bLeft, bBot, tBot, tLeft]);
    ctx.fillStyle = fill(1); // top face
    poly([tTop, tRight, tBot, tLeft]);

    ctx.strokeStyle = edge;
    ctx.lineWidth = 1;
    strokePoly([tTop, tRight, tBot, tLeft]); // top outline
    line(bBot, tBot); // front vertical edge
  };

  // --- sky + horizon -------------------------------------------------------
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, width, height);

  const sky = ctx.createLinearGradient(0, 0, 0, horizonY + camY);
  sky.addColorStop(0, "rgb(5, 5, 8)"); // darker at the very top
  sky.addColorStop(1, INK);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, horizonY + camY + 1);

  // distant skyscraper silhouettes along the horizon (dark masses, faint tops)
  const skyBase = horizonY + camY;
  for (const t of SKYLINE) {
    const tw = t.w * width;
    const th = t.h * height;
    const tx = t.x * width;
    ctx.fillStyle = "rgb(17, 18, 21)";
    ctx.fillRect(tx, skyBase - th, tw, th);
    ctx.fillStyle = "rgba(247, 244, 236, 0.05)"; // faint lit top edge
    ctx.fillRect(tx, skyBase - th, tw, 1);
  }
  // thin horizon glow to separate sky from ground
  const glow = ctx.createLinearGradient(0, skyBase - 6, 0, skyBase + 6);
  glow.addColorStop(0, "rgba(247, 244, 236, 0)");
  glow.addColorStop(0.5, "rgba(247, 244, 236, 0.06)");
  glow.addColorStop(1, "rgba(247, 244, 236, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, skyBase - 6, width, 12);

  // --- road ----------------------------------------------------------------
  const SAMPLES = 60;
  ctx.fillStyle = "rgb(22, 23, 26)"; // wet-asphalt dark
  for (let i = 0; i < SAMPLES; i++) {
    const dA = i / SAMPLES;
    const dB = (i + 1) / SAMPLES;
    poly([
      ground(dA, -ROAD_HALF),
      ground(dA, ROAD_HALF),
      ground(dB, ROAD_HALF),
      ground(dB, -ROAD_HALF),
    ]);
  }
  // faint reflective sheen down the centre of the road
  ctx.fillStyle = "rgba(247, 244, 236, 0.025)";
  for (let i = 0; i < SAMPLES; i++) {
    const dA = i / SAMPLES;
    const dB = (i + 1) / SAMPLES;
    poly([
      ground(dA, -0.5),
      ground(dA, 0.5),
      ground(dB, 0.5),
      ground(dB, -0.5),
    ]);
  }
  // road edge lines + dashed centre line
  ctx.strokeStyle = "rgba(247, 244, 236, 0.07)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= SAMPLES; i++) {
    const [lx, ly] = ground(i / SAMPLES, -ROAD_HALF);
    if (i === 0) ctx.moveTo(lx, ly);
    else ctx.lineTo(lx, ly);
  }
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i <= SAMPLES; i++) {
    const [rx, ry] = ground(i / SAMPLES, ROAD_HALF);
    if (i === 0) ctx.moveTo(rx, ry);
    else ctx.lineTo(rx, ry);
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(247, 244, 236, 0.16)";
  const DASH = 44;
  for (let i = 0; i < DASH; i += 2) {
    line(ground(i / DASH, 0), ground((i + 1) / DASH, 0));
  }

  // --- render list: buildings + car, painter-sorted far -> near ------------
  type Item =
    | { d: number; kind: "building"; b: Building }
    | { d: number; kind: "car" };

  // Car depth mapping: at progress 0 the car sits near the horizon (far,
  // small); as scroll progresses to 1 it drives TOWARD the camera (near, large,
  // headlights facing the viewer). So carD goes 1 -> 0 with progress.
  const carD = 1 - progress;

  const items: Item[] = CITY.map((b) => ({ d: b.d, kind: "building", b }));
  items.push({ d: carD, kind: "car" });
  items.sort((p, q) => q.d - p.d); // farthest first (drawn behind)

  for (const it of items) {
    if (it.kind === "car") {
      // headlight cones — faint white, cast toward the camera (smaller d) as the
      // car approaches. Wide spread + decent reach so they read on the scene.
      const dF = Math.max(carD - 0.28, 0);
      for (const lamp of [-0.3, 0.3] as const) {
        const apex = ground(carD, lamp);
        apex[1] -= lanePx * depthScale(carD) * 0.3; // lift to lamp height
        const left = ground(dF, lamp - 0.85);
        const right = ground(dF, lamp + 0.85);
        const beam = ctx.createLinearGradient(
          apex[0],
          apex[1],
          (left[0] + right[0]) / 2,
          (left[1] + right[1]) / 2,
        );
        beam.addColorStop(0, "rgba(247, 244, 236, 0.3)");
        beam.addColorStop(1, "rgba(247, 244, 236, 0)");
        ctx.fillStyle = beam;
        poly([apex, left, right]);
      }
      // car body — near-black iso box (a clear focal element, not a speck)
      drawIsoBox(
        carD,
        0,
        0.85,
        1.2,
        (m) => {
          const val = Math.round(7 * m + 2);
          return `rgb(${val}, ${val}, ${val + 1})`;
        },
        "rgba(247, 244, 236, 0.26)",
      );
      continue;
    }

    const b = it.b;
    const dim = 0.5 + (1 - b.d) * 0.5; // foreground brighter, horizon dimmer
    drawIsoBox(
      b.d,
      b.v,
      b.footW,
      b.h,
      (m) => {
        const val = Math.round(b.tone * dim * m);
        return `rgb(${val}, ${val}, ${val})`;
      },
      `rgba(247, 244, 236, ${(0.05 + (1 - b.d) * 0.08).toFixed(3)})`,
    );
  }

  // --- rain — heavy uniform diagonal streaks, offset by progress -----------
  const slant = 0.16;
  ctx.strokeStyle = "rgba(247, 244, 236, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const s of RAIN) {
    const yy = ((s.y + progress * 1.1) % 1) * height;
    const xx = s.x * width;
    const L = s.len * height;
    ctx.moveTo(xx, yy);
    ctx.lineTo(xx - L * slant, yy + L);
  }
  ctx.stroke();

  // --- vignette — sink the edges into the ink (noir framing) ---------------
  const vg = ctx.createRadialGradient(
    width / 2,
    height * 0.55,
    Math.min(width, height) * 0.2,
    width / 2,
    height * 0.55,
    Math.max(width, height) * 0.75,
  );
  vg.addColorStop(0, "rgba(10, 10, 10, 0)");
  vg.addColorStop(1, "rgba(10, 10, 10, 0.7)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, width, height);
}

// ---------------------------------------------------------------------------
// Per-chapter overlay (model B): ONE continuous journey, chapters cross-fade on
// the SAME scroll progress that drives the canvas. Copy is byte-for-byte from
// studio.ts — never rewritten here.
// ---------------------------------------------------------------------------

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Opacity for a chapter visible across [start, end], fading in just before
 * `start` and out just after `end` (FADE-wide ramps) so neighbours cross-fade.
 */
const FADE = 0.04;
function bandOpacity(p: number, start: number, end: number): number {
  const fadeIn = clamp01((p - (start - FADE)) / FADE); // reaches 1 at p = start
  const fadeOut = clamp01((end + FADE - p) / FADE); // 1 until p = end
  return Math.min(fadeIn, fadeOut);
}

// Shared overlay typography — scaled to sit IN the scene (not a pasted hero).
const EYEBROW_CLS =
  "mb-5 font-accent text-base tracking-wide text-signal md:text-xl";
const HEADLINE_CLS =
  "font-display-black text-2xl leading-[1.04] text-bone md:text-4xl";
const BODY_CLS =
  "mx-auto mt-6 max-w-xl font-mono text-xs leading-relaxed tracking-wide text-bone-muted md:text-sm";
const CTA_CLS =
  "mt-10 bg-crimson px-9 py-4 font-mono text-xs uppercase tracking-[0.3em] text-bone transition-all hover:-translate-y-0.5 hover:bg-crimson-bright";

/** A single overlay chapter — absolutely stacked, opacity driven by scroll. */
function Chapter({
  opacity,
  children,
}: {
  opacity: number;
  children: ReactNode;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center"
      style={{ opacity }}
      aria-hidden={opacity < 0.5}
    >
      <div className="relative mx-auto max-w-4xl">{children}</div>
    </div>
  );
}

/**
 * The landing journey — a tall pinned scroll container whose full-viewport
 * canvas is driven by a single scroll progress value (0->1), with a text
 * overlay layered above it. The page opens directly on this noir city scene.
 *
 * All motion lives inside matchMedia("(prefers-reduced-motion: no-preference)").
 * Under reduced motion the section collapses to one viewport, the canvas paints
 * a single static frame at progress 0, and nothing pins or scrubs.
 *
 * C1 renders ONLY the chapter-1 copy, static (no scroll-driven swapping yet —
 * that lands in C2). Copy is byte-for-byte from studio.ts.
 */
export function JourneySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [consoleOpen, setConsoleOpen] = useState(false);
  // Scroll progress lifted from ScrollTrigger so the overlay chapters read the
  // SAME value the canvas renders from. lastProgressRef throttles re-renders.
  const [progress, setProgress] = useState(0);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const canvas = canvasRef.current;
    if (!section || !pin || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match the backing store to the CSS box * devicePixelRatio so the scene
    // stays crisp on retina. All draw() coordinates remain in CSS pixels.
    const sizeCanvas = (): void => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (progress: number): void => {
      draw(ctx, progress, canvas.clientWidth, canvas.clientHeight);
    };

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      section.style.height = "400svh";
      sizeCanvas();
      render(0);

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        pin: pin,
        pinSpacing: false,
        onUpdate: (self) => {
          render(self.progress); // canvas stays on the existing render path
          // Mirror progress into React for the overlay (throttled to changes).
          if (Math.abs(self.progress - lastProgressRef.current) > 0.004) {
            lastProgressRef.current = self.progress;
            setProgress(self.progress);
          }
        },
      });

      // Debounced resize — re-fit the backing store, then redraw + refit ST.
      let resizeTimer = 0;
      const onResize = (): void => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          sizeCanvas();
          render(trigger.progress);
          ScrollTrigger.refresh();
        }, 150);
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
      };
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      // No pin, no scrub — collapse to one viewport and paint a static frame.
      section.style.height = "100svh";
      sizeCanvas();
      render(0);

      let resizeTimer = 0;
      const onResize = (): void => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          sizeCanvas();
          render(0);
        }, 150);
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
      };
    });

    return () => mm.revert();
  }, []);

  // Chapter opacities from the shared scroll progress (model B cross-fade).
  const op1 = bandOpacity(progress, 0.0, 0.18); // opener
  const op2 = bandOpacity(progress, 0.2, 0.38); // the studio / manifest
  const op3 = bandOpacity(progress, 0.42, 0.6); // the engine
  const op4 = bandOpacity(progress, 0.64, 0.8); // proof
  const op5 = bandOpacity(progress, 0.84, 1.0); // operators + final CTA
  const openConsole = () => setConsoleOpen(true);

  return (
    <section ref={sectionRef} className="relative bg-ink">
      <div ref={pinRef} className="relative h-[100svh] w-full overflow-hidden">
        <canvas ref={canvasRef} className="block h-full w-full" />

        {/* text overlay — 5 chapters cross-fading on scroll. pointer-events-none
            so the page still scrolls/clicks through; only the active chapter's
            CTA is interactive. The canvas already carries its own vignette, so
            we add NO grain/vignette here (that produced the shadow artifact) —
            just a soft legibility scrim behind the centred copy. */}
        <div className="pointer-events-none absolute inset-0">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(10,10,10,0.6), transparent 70%)",
            }}
          />

          {/* CH1 — opener */}
          <Chapter opacity={op1}>
            <p className={EYEBROW_CLS}>{STORY_EYEBROW}</p>
            <h1 className="font-display-black text-4xl leading-[0.95] text-bone md:text-6xl">
              {HERO_TITLE_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className={BODY_CLS}>{STORY_BRIDGE}</p>
            <button
              type="button"
              onClick={openConsole}
              style={{ pointerEvents: op1 > 0.5 ? "auto" : "none" }}
              className={CTA_CLS}
            >
              EXECUTE DESCENT
            </button>
          </Chapter>

          {/* CH2 — the studio / manifest */}
          <Chapter opacity={op2}>
            <p className={EYEBROW_CLS}>{MANIFEST_EYEBROW}</p>
            <h2 className={HEADLINE_CLS}>{MANIFEST_HEADLINE}</h2>
            <p className={BODY_CLS}>{MANIFEST_BODY}</p>
          </Chapter>

          {/* CH3 — the engine */}
          <Chapter opacity={op3}>
            <p className={EYEBROW_CLS}>{ENGINE_EYEBROW}</p>
            <h2 className={HEADLINE_CLS}>{ENGINE_HEADLINE}</h2>
            <p className={BODY_CLS}>{ENGINE_BODY}</p>
          </Chapter>

          {/* CH4 — proof (text only; FerdiPoker media lands later) */}
          <Chapter opacity={op4}>
            <p className={EYEBROW_CLS}>{PROOF_EYEBROW}</p>
            <h2 className={HEADLINE_CLS}>{PROOF_HEADLINE}</h2>
          </Chapter>

          {/* CH5 — operators + final CTA */}
          <Chapter opacity={op5}>
            <p className={EYEBROW_CLS}>{OPERATOR_EYEBROW}</p>
            <h2 className={HEADLINE_CLS}>{OPERATOR_HEADLINE}</h2>
            <p className={BODY_CLS}>{OPERATOR_BODY}</p>
            <button
              type="button"
              onClick={openConsole}
              style={{ pointerEvents: op5 > 0.5 ? "auto" : "none" }}
              className={CTA_CLS}
            >
              EXECUTE DESCENT
            </button>
          </Chapter>
        </div>
      </div>

      {consoleOpen && <IdeaScannerConsole onClose={() => setConsoleOpen(false)} />}
    </section>
  );
}
