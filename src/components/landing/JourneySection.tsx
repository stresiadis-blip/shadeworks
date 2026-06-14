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
  PROOF_BODY,
  OPERATOR_EYEBROW,
  OPERATOR_HEADLINE,
  OPERATOR_BODY,
} from "@/data/studio";

gsap.registerPlugin(ScrollTrigger);

/** Linear interpolation helper. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ---------------------------------------------------------------------------
// Colour-arc machinery. The whole scene transitions noir -> full colour across
// scroll progress in 4 beats. Each element's tint is an independent factor
// (smoothstep ramp) so colour "bleeds" in gradually, never hard-switches.
// ---------------------------------------------------------------------------

/** Beat boundaries (progress). Tunable. */
const BEAT1_END = 0.25; // ARRIVAL (full noir) ends
const BEAT2_END = 0.55; // LEAVING THE CITY (road colours) ends
const BEAT3_END = 0.8; // CUL-DE-SAC APPROACH (everything colours) ends
// BEAT 4 (BEAT3_END..1.0) = HOME, full colour.

type RGB = [number, number, number];

/** Hermite smoothstep, self-clamped to [0,1]. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  let t = (x - edge0) / (edge1 - edge0);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return t * t * (3 - 2 * t);
}

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const rgbStr = (c: RGB): string =>
  `rgb(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])})`;
const rgbaStr = (c: RGB, a: number): string =>
  `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${a})`;

// Brand + neon palette.
const C_BONE: RGB = [247, 244, 236];
const C_GOLD: RGB = [255, 212, 0]; // car signature + warm accents
const C_CYAN: RGB = [0, 229, 255];
const C_MAGENTA: RGB = [255, 46, 196];
const C_AMBER: RGB = [255, 196, 120];
const C_CRIMSON: RGB = [209, 31, 42]; // brand crimson — used sparingly
const C_INK: RGB = [10, 10, 10];
const NEON: RGB[] = [
  [0, 229, 255], // cyan
  [255, 46, 196], // magenta
  [160, 90, 255], // purple
  [60, 255, 160], // green
  [255, 212, 0], // gold
];

// Sky keyframes: noir night -> deep dusk blue -> warm dawn.
const SKY_NOIR_TOP: RGB = [5, 5, 8];
const SKY_NOIR_BOT: RGB = [10, 10, 10];
const SKY_DUSK_TOP: RGB = [8, 12, 34];
const SKY_DUSK_BOT: RGB = [26, 24, 50];
const SKY_DAWN_TOP: RGB = [62, 76, 128];
const SKY_DAWN_BOT: RGB = [226, 150, 98];

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

/** A window on a building's lit (right) face, in face-local coords (0..1). */
interface Win {
  u: number; // along the base edge
  w: number; // up the height
}

interface Building {
  d: number; // depth along the road, 0 = foreground/near, 1 = horizon/far
  v: number; // signed lateral offset (lane units); |v| > ROAD_HALF
  footW: number; // footprint diameter (lane units)
  h: number; // height (lane units)
  tone: number; // base grey value (near-black -> dark grey)
  neon: number; // index into NEON — this building's window colour
  litOffset: number; // 0..1 scatter so windows light at different scroll points
  windows: Win[]; // deterministic window positions on the lit face
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
        const winCount = 2 + Math.floor(rng() * 3);
        const windows: Win[] = [];
        for (let k = 0; k < winCount; k++) {
          windows.push({ u: 0.2 + rng() * 0.6, w: 0.15 + rng() * 0.65 });
        }
        list.push({
          d: rowD + rng() * 0.02,
          v: side * (ROAD_HALF + 0.5 + j * 1.15 + rng() * 0.5),
          footW: 0.55 + rng() * 0.45,
          h: 1.3 + rng() * 5,
          tone: 14 + Math.round(rng() * 26),
          neon: Math.floor(rng() * NEON.length),
          litOffset: rng(),
          windows,
        });
      }
    }
  }
  return list;
}

/** Fixed window grid for the destination "home" at the end of the bend. */
const HOME_WINDOWS: Win[] = [
  { u: 0.3, w: 0.28 },
  { u: 0.55, w: 0.28 },
  { u: 0.3, w: 0.56 },
  { u: 0.55, w: 0.56 },
  { u: 0.42, w: 0.82 },
];

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

/** A flat side-elevation building for CAMERA B's background skyline. */
interface SideBuilding {
  x: number; // 0..1 fraction of width
  w: number; // 0..1 fraction of width
  h: number; // 0..1 fraction of height
  cols: number; // window grid
  rows: number;
}

/** Deterministic side-elevation skyline behind the arrival scene. */
function buildSideCity(): SideBuilding[] {
  const rng = mulberry32(0xc0de);
  const list: SideBuilding[] = [];
  for (let i = 0; i < 11; i++) {
    list.push({
      x: i / 11 + rng() * 0.02,
      w: 0.05 + rng() * 0.05,
      h: 0.12 + rng() * 0.26,
      cols: 2 + Math.floor(rng() * 3),
      rows: 3 + Math.floor(rng() * 5),
    });
  }
  return list;
}

const CITY = buildCity();
const SKYLINE = buildSkyline();
const RAIN = buildRain();
const SIDE_CITY = buildSideCity();

// Deterministic film-grain dots (positions fixed; alpha pulses per frame via t).
interface Grain { x: number; y: number; }
function buildGrain(): Grain[] {
  const rng = mulberry32(0x6a17);
  const list: Grain[] = [];
  for (let i = 0; i < 420; i++) list.push({ x: rng(), y: rng() });
  return list;
}
const GRAIN = buildGrain();

function drawCameraA(
  ctx: CanvasRenderingContext2D,
  progress: number,
  width: number,
  height: number,
  showCar: boolean,
): void {
  // ===========================================================================
  // FIVE ACTS on a single clock (progress). HARD CUT at CUT between the iso
  // down-the-road view (acts 1-3) and the flat side-profile arrival (acts 4-5).
  // No hybrid projection => no overlap. Each act maps to a fixed progress band:
  //   ACT1 0.00-0.20 exposition  — noir, car far, approaching
  //   ACT2 0.20-0.40 inciting     — windows wake, car mid-road
  //   ACT3 0.40-0.62 rising       — car near, road bends, push-in peaks
  //   --- CUT (0.62) iso -> side ---
  //   ACT4 0.62-0.85 climax       — side profile, sunrise breaks
  //   ACT5 0.85-1.00 resolution   — full day, car parks home
  // ===========================================================================
  const CUT = 0.62;

  if (progress < CUT) {
    drawIsoAct(ctx, progress / CUT, width, height, showCar); // local 0..1 across acts 1-3
  } else {
    drawSideAct(ctx, (progress - CUT) / (1 - CUT), width, height, showCar); // local 0..1 acts 4-5
  }
}

// ---------------------------------------------------------------------------
// ACTS 1-3 — iso down-the-road. `t` is local 0..1 (global 0..CUT). Road shape
// is FIXED (does not morph on scroll); only the car advances, lights wake, and
// the camera pushes in. No camera rotation here — the rotation is the hard cut.
// ---------------------------------------------------------------------------
function drawIsoAct(
  ctx: CanvasRenderingContext2D,
  t: number,
  width: number,
  height: number,
  showCar: boolean,
): void {
  // Three distinct visual phases across acts 1-3 (t local 0..1):
  //   PHASE A (t 0.00-0.30) ACT1 exposition — deep noir, heavy rain, car far,
  //     headlights cutting fog. Maximum darkness, low camera.
  //   PHASE B (t 0.30-0.65) ACT2 inciting — push-in between buildings, first
  //     neon windows wake, car reaches mid-road. The city stirs.
  //   PHASE C (t 0.65-1.00) ACT3 the engine — high-angle lift, buildings pulse
  //     rhythmically, light-arteries stream between them (the agent swarm made
  //     visible). The city becomes the machine.
  const phaseA = 1 - smoothstep(0.0, 0.32, t); // 1 -> 0 over act 1
  const phaseC = smoothstep(0.62, 1.0, t); // 0 -> 1 into act 3
  const cityColor = smoothstep(0.22, 0.7, t); // neon windows wake mid-journey
  const duskF = smoothstep(0.4, 1.0, t); // noir -> dusk by end of act 3
  const rainAmount = phaseA; // rain owns act 1, gone by act 2
  const zoom = 1 + smoothstep(0.0, 0.65, t) * 0.55; // push-in peaks entering act 3
  const enginePulse = phaseC; // act-3 rhythmic energy strength

  const skyTop = mix(SKY_NOIR_TOP, SKY_DUSK_TOP, duskF);
  const skyBot = mix(SKY_NOIR_BOT, SKY_DUSK_BOT, duskF);
  const asphalt = mix([18, 19, 22], [30, 27, 38], duskF * 0.7);

  // Camera lifts to a higher angle in act 3 (the "engine" overhead feel):
  // horizon rises, depth compresses slightly => more rooftops visible.
  const horizonY = height * (0.26 + 0.1 * phaseC);
  const bottomY = height * 1.04;
  const lanePx = Math.max(20, width * 0.05);

  const depthScale = (d: number): number => 1 / (1 + d * (5 - 1.4 * phaseC));
  const sFar = depthScale(1);
  const yNorm = (d: number): number => (depthScale(d) - sFar) / (1 - sFar);
  const groundY = (d: number): number =>
    horizonY + (bottomY - horizonY) * yNorm(d);
  // FIXED double-S serpentine (constant amplitude — never morphs on scroll).
  const centerX = (d: number): number =>
    width * 0.5 + Math.sin(d * Math.PI * 2) * width * 0.22 * (1 - d);

  const cx0 = width / 2;
  const cy0 = groundY(0);
  const pz = (x: number, y: number): [number, number] => [
    cx0 + (x - cx0) * zoom,
    cy0 + (y - cy0) * zoom,
  ];
  const ground = (d: number, v: number): [number, number] => {
    const s = depthScale(d);
    return pz(centerX(d) + v * lanePx * s, groundY(d));
  };
  const sceneScale = (d: number): number => depthScale(d) * zoom;

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

  const drawIsoBox = (
    d: number,
    v: number,
    footW: number,
    h: number,
    fill: (m: number) => string,
    edge: string,
    windows?: Win[],
    winColor?: string,
  ): void => {
    const s = sceneScale(d);
    const [cx, cy] = ground(d, v);
    const dW = footW * lanePx * s * 0.5;
    const dH = dW * 0.5;
    const hPx = h * lanePx * s;
    const bRight: [number, number] = [cx + dW, cy];
    const bBot: [number, number] = [cx, cy + dH];
    const bLeft: [number, number] = [cx - dW, cy];
    const tTop: [number, number] = [cx, cy - dH - hPx];
    const tRight: [number, number] = [cx + dW, cy - hPx];
    const tBot: [number, number] = [cx, cy + dH - hPx];
    const tLeft: [number, number] = [cx - dW, cy - hPx];
    ctx.fillStyle = fill(0.66);
    poly([bRight, bBot, tBot, tRight]);
    ctx.fillStyle = fill(0.4);
    poly([bLeft, bBot, tBot, tLeft]);
    ctx.fillStyle = fill(1);
    poly([tTop, tRight, tBot, tLeft]);
    if (windows && winColor) {
      ctx.fillStyle = winColor;
      const sw = Math.max(1.1, dW * 0.18);
      const sh = Math.max(1.1, hPx * 0.07);
      for (const win of windows) {
        const wx = bRight[0] + (bBot[0] - bRight[0]) * win.u;
        const wy = bRight[1] + (bBot[1] - bRight[1]) * win.u - win.w * hPx;
        ctx.fillRect(wx - sw / 2, wy - sh / 2, sw, sh);
      }
    }
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1;
    strokePoly([tTop, tRight, tBot, tLeft]);
    line(bBot, tBot);
  };

  // --- sky -------------------------------------------------------------------
  ctx.fillStyle = rgbStr(mix(C_INK, [22, 22, 28], duskF));
  ctx.fillRect(0, 0, width, height);
  const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, rgbStr(skyTop));
  sky.addColorStop(1, rgbStr(skyBot));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, horizonY + 1);

  // distant skyline
  ctx.fillStyle = rgbStr(mix([17, 18, 21], [40, 44, 70], duskF));
  for (const tw of SKYLINE) {
    ctx.fillRect(tw.x * width, horizonY - tw.h * height, tw.w * width, tw.h * height);
  }

  // --- road surface (fixed serpentine) --------------------------------------
  const SAMPLES = 60;
  ctx.fillStyle = rgbStr(asphalt);
  for (let i = 0; i < SAMPLES; i++) {
    const dA = i / SAMPLES;
    const dB = (i + 1) / SAMPLES;
    poly([ground(dA, -ROAD_HALF), ground(dA, ROAD_HALF), ground(dB, ROAD_HALF), ground(dB, -ROAD_HALF)]);
  }
  ctx.strokeStyle = rgbaStr(mix(C_BONE, C_GOLD, duskF), 0.18 + duskF * 0.4);
  const DASH = 44;
  for (let i = 0; i < DASH; i += 2) line(ground(i / DASH, 0), ground((i + 1) / DASH, 0));

  // --- ACT3 engine: light-arteries streaming along the road toward horizon ---
  // Pulsing energy packets flowing up the centre line — the agent swarm made
  // visible. Strength ramps in with phaseC; deterministic positions from t.
  if (enginePulse > 0.01) {
    const PACKETS = 22;
    for (let i = 0; i < PACKETS; i++) {
      const base = i / PACKETS;
      const d = (base + (t * 0.6)) % 1; // flow toward horizon as you scroll
      const side = i % 2 === 0 ? -1 : 1;
      const lane = side * ROAD_HALF * 0.5;
      const [x, y] = ground(d, lane);
      const s = sceneScale(d);
      const col = NEON[i % NEON.length];
      const r = Math.max(1.5, 5 * s) * (0.6 + 0.4 * Math.sin(i + t * 12));
      ctx.fillStyle = rgbaStr(col, 0.5 * enginePulse);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- buildings + car, painter-sorted far -> near --------------------------
  const carAdvance = Math.pow(t, 0.7);
  const carD = 1 - carAdvance * 0.95;
  type Item = { d: number; b?: Building };
  const items: Item[] = CITY.map((b) => ({ d: b.d, b }));
  items.push({ d: carD });
  items.sort((p, q) => q.d - p.d);

  for (const it of items) {
    if (!it.b) {
      if (!showCar) continue; // backdrop mode composites a PNG car instead
      const grow = lerp(1.0, 2.2, smoothstep(0.0, 1.0, t));
      // headlight beams strongest in act 1 (fog), fading as the city lights up
      const beamA = 0.34 * (0.4 + 0.6 * phaseA);
      for (const lamp of [-0.3, 0.3] as const) {
        const apex = ground(carD, lamp);
        apex[1] -= lanePx * sceneScale(carD) * 0.3;
        const left = ground(Math.max(carD - 0.28, 0), lamp - 0.85);
        const right = ground(Math.max(carD - 0.28, 0), lamp + 0.85);
        const beam = ctx.createLinearGradient(apex[0], apex[1], (left[0] + right[0]) / 2, (left[1] + right[1]) / 2);
        beam.addColorStop(0, rgbaStr(C_BONE, beamA));
        beam.addColorStop(1, rgbaStr(C_BONE, 0));
        ctx.fillStyle = beam;
        poly([apex, left, right]);
      }
      drawIsoBox(carD, 0, 0.85 * grow, 1.2 * grow, (m) => {
        const v = 8 * m + 3;
        return rgbStr([v, v, v + 1]);
      }, rgbaStr(C_BONE, 0.3));
      continue;
    }
    const b = it.b;
    const foreFade = 1 - smoothstep(0.0, 0.18, b.d);
    const nearPass = smoothstep(0.15, 0.6, t);
    const a = 1 - foreFade * nearPass;
    if (a <= 0.02) continue;
    const dim = 0.5 + (1 - b.d) * 0.5;
    const neon = NEON[b.neon];
    // windows wake gradually; in act 3 they PULSE rhythmically (engine beat)
    const pulse = 1 + enginePulse * 0.5 * Math.sin(t * 16 + b.litOffset * 6.28);
    const winAlpha = Math.min(1, Math.max(0, cityColor * 1.5 - b.litOffset * 0.6)) * pulse;
    const faded = a < 1;
    if (faded) {
      ctx.save();
      ctx.globalAlpha = a;
    }
    drawIsoBox(b.d, b.v, b.footW, b.h, (m) => {
      const g = b.tone * dim * m;
      return rgbStr(mix([g, g, g], [g * 1.18, g * 1.02, g * 0.82], cityColor));
    }, rgbaStr(mix(C_BONE, neon, cityColor * 0.5), 0.05 + (1 - b.d) * 0.08 + cityColor * 0.1),
      b.windows, winAlpha > 0.02 ? rgbaStr(neon, 0.3 + Math.min(0.65, winAlpha * 0.6)) : undefined);
    if (faded) ctx.restore();
  }

  // --- rain (act 1 only) ----------------------------------------------------
  if (rainAmount > 0.01) {
    ctx.strokeStyle = rgbaStr(C_BONE, 0.12 * rainAmount);
    ctx.lineWidth = 1;
    ctx.beginPath();
    const count = Math.ceil(RAIN.length * rainAmount);
    for (let i = 0; i < count; i++) {
      const s = RAIN[i];
      const yy = ((s.y + t * 1.1) % 1) * height;
      const xx = s.x * width;
      const L = s.len * height;
      ctx.moveTo(xx, yy);
      ctx.lineTo(xx - L * 0.16, yy + L);
    }
    ctx.stroke();
  }

  // --- vignette (heavy in act 1, lifts toward act 3) ------------------------
  const vg = ctx.createRadialGradient(width / 2, height * 0.55, Math.min(width, height) * 0.2, width / 2, height * 0.55, Math.max(width, height) * 0.75);
  vg.addColorStop(0, "rgba(10,10,10,0)");
  vg.addColorStop(1, rgbaStr(C_INK, 0.78 * phaseA + 0.35 * (1 - phaseA) - 0.12 * phaseC));
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, width, height);
}

// ---------------------------------------------------------------------------
// ACTS 4-5 — flat side profile (the arrival). `t` is local 0..1 (global
// CUT..1). This is the clean composition from drawCameraB, driven by t so the
// car pulls toward home and the sky goes full dawn. No iso geometry here.
// ---------------------------------------------------------------------------
function drawSideAct(
  ctx: CanvasRenderingContext2D,
  t: number,
  width: number,
  height: number,
  showCar: boolean,
): void {
  drawCameraB(ctx, lerp(0.78, 1.0, t), width, height, showCar);
}

/**
 * CAMERA B — a clean, stylized SIDE PROFILE of the car arriving home, in full
 * warm colour. This is NOT a reprojection of the isometric city (that path is
 * where the jank lives); it is a separate, simpler flat composition that the
 * orchestrator cross-fades to at the very end of the scroll. Deterministic.
 */
function drawCameraB(
  ctx: CanvasRenderingContext2D,
  progress: number,
  width: number,
  height: number,
  showCar: boolean,
): void {
  const localT = smoothstep(0.78, 1.0, progress); // arrival progression 0..1
  const groundY = height * 0.72;

  // path helpers
  const circle = (cx: number, cy: number, r: number): void => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  const roundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void => {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
    ctx.fill();
  };

  // --- sky — warm sunrise gradient -----------------------------------------
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, rgbStr([86, 110, 168]));
  sky.addColorStop(0.6, rgbStr([214, 150, 138]));
  sky.addColorStop(1, rgbStr([252, 196, 140]));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, groundY);

  // low warm sun glow on the right, behind the home
  const sunX = width * 0.74;
  const sunY = groundY - height * 0.05;
  const sun = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, height * 0.42);
  sun.addColorStop(0, rgbaStr([255, 234, 184], 0.9));
  sun.addColorStop(0.4, rgbaStr([255, 200, 130], 0.32));
  sun.addColorStop(1, rgbaStr([255, 200, 130], 0));
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, width, groundY);

  // --- background skyline (flat side elevation, lit windows) ---------------
  for (const b of SIDE_CITY) {
    const bw = b.w * width;
    const bh = b.h * height;
    const bx = b.x * width;
    const by = groundY - bh;
    ctx.fillStyle = rgbStr([58, 52, 74]); // dusky violet mass
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = rgbaStr(C_GOLD, 0.5); // lit windows
    const padX = bw * 0.2;
    const padY = bh * 0.1;
    const gw = (bw - padX * 2) / b.cols;
    const gh = (bh - padY * 2) / b.rows;
    for (let c = 0; c < b.cols; c++) {
      for (let r = 0; r < b.rows; r++) {
        ctx.fillRect(
          bx + padX + c * gw + gw * 0.22,
          by + padY + r * gh + gh * 0.22,
          gw * 0.5,
          gh * 0.5,
        );
      }
    }
  }

  // --- ground + road -------------------------------------------------------
  ctx.fillStyle = rgbStr([74, 58, 50]);
  ctx.fillRect(0, groundY, width, height - groundY);
  const roadTop = groundY + (height - groundY) * 0.16;
  const roadH = (height - groundY) * 0.46;
  ctx.fillStyle = rgbStr([40, 36, 42]);
  ctx.fillRect(0, roadTop, width, roadH);
  // gold centre dashes, scrolling with arrival
  const cyl = roadTop + roadH * 0.5;
  ctx.fillStyle = rgbaStr(C_GOLD, 0.8);
  const dashOffset = (localT * 60) % 60;
  for (let x = -dashOffset; x < width; x += 60) {
    ctx.fillRect(x, cyl - 2, 28, 4);
  }

  // --- the home (destination) on the right ---------------------------------
  const homeX = width * 0.82;
  const hw = width * 0.16;
  const hh = height * 0.2;
  const homeBaseY = roadTop;
  // warm glow behind the home
  const hglow = ctx.createRadialGradient(
    homeX,
    homeBaseY - hh * 0.5,
    8,
    homeX,
    homeBaseY - hh * 0.5,
    hw * 1.6,
  );
  hglow.addColorStop(0, rgbaStr(C_GOLD, 0.3));
  hglow.addColorStop(1, rgbaStr(C_GOLD, 0));
  ctx.fillStyle = hglow;
  ctx.fillRect(homeX - hw * 1.6, homeBaseY - hh * 2, hw * 3.2, hh * 2.4);
  // walls
  ctx.fillStyle = rgbStr([224, 208, 182]);
  ctx.fillRect(homeX - hw / 2, homeBaseY - hh, hw, hh);
  // crimson pitched roof
  ctx.fillStyle = rgbStr(C_CRIMSON);
  ctx.beginPath();
  ctx.moveTo(homeX - hw / 2 - 8, homeBaseY - hh);
  ctx.lineTo(homeX, homeBaseY - hh - hh * 0.48);
  ctx.lineTo(homeX + hw / 2 + 8, homeBaseY - hh);
  ctx.closePath();
  ctx.fill();
  // door + lit windows
  ctx.fillStyle = rgbStr([92, 60, 40]);
  ctx.fillRect(homeX - hw * 0.08, homeBaseY - hh * 0.4, hw * 0.16, hh * 0.4);
  ctx.fillStyle = rgbaStr(C_GOLD, 0.85);
  ctx.fillRect(homeX - hw * 0.36, homeBaseY - hh * 0.74, hw * 0.2, hh * 0.24);
  ctx.fillRect(homeX + hw * 0.16, homeBaseY - hh * 0.74, hw * 0.2, hh * 0.24);

  // --- the car, side profile, pulling toward home --------------------------
  if (!showCar) return; // backdrop mode composites a PNG car instead
  const carCX = lerp(width * 0.32, width * 0.58, localT);
  const L = width * 0.2;
  const H = L * 0.3;
  const wheelR = L * 0.1;
  const wy = cyl - wheelR; // wheels rest on the road centre line
  const bodyBottom = wy;
  const bodyTop = wy - H;
  const bodyLeft = carCX - L * 0.5;

  // headlight beam toward the home (drawn first, under the body)
  const beam = ctx.createLinearGradient(carCX + L * 0.5, bodyTop + H * 0.4, carCX + L * 1.3, cyl);
  beam.addColorStop(0, rgbaStr([255, 240, 200], 0.5));
  beam.addColorStop(1, rgbaStr([255, 240, 200], 0));
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(carCX + L * 0.48, bodyTop + H * 0.35);
  ctx.lineTo(carCX + L * 1.3, cyl - H * 0.2);
  ctx.lineTo(carCX + L * 1.3, cyl + H * 0.5);
  ctx.closePath();
  ctx.fill();

  // wheels
  ctx.fillStyle = "#111418";
  circle(carCX - L * 0.3, wy, wheelR);
  circle(carCX + L * 0.3, wy, wheelR);
  ctx.fillStyle = rgbStr([92, 92, 100]); // hubs
  circle(carCX - L * 0.3, wy, wheelR * 0.42);
  circle(carCX + L * 0.3, wy, wheelR * 0.42);

  // body — gold
  ctx.fillStyle = rgbStr(C_GOLD);
  roundRect(bodyLeft, bodyTop, L, H, H * 0.35);
  // cabin — slightly deeper gold, with a sky-tinted window
  ctx.fillStyle = rgbStr([232, 188, 36]);
  ctx.beginPath();
  ctx.moveTo(carCX - L * 0.22, bodyTop);
  ctx.lineTo(carCX - L * 0.12, bodyTop - H * 0.6);
  ctx.lineTo(carCX + L * 0.12, bodyTop - H * 0.6);
  ctx.lineTo(carCX + L * 0.22, bodyTop);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rgbaStr([186, 214, 238], 0.92); // glass
  ctx.beginPath();
  ctx.moveTo(carCX - L * 0.17, bodyTop - H * 0.05);
  ctx.lineTo(carCX - L * 0.09, bodyTop - H * 0.52);
  ctx.lineTo(carCX + L * 0.09, bodyTop - H * 0.52);
  ctx.lineTo(carCX + L * 0.17, bodyTop - H * 0.05);
  ctx.closePath();
  ctx.fill();
  // crimson accent stripe along the lower body
  ctx.fillStyle = rgbStr(C_CRIMSON);
  ctx.fillRect(bodyLeft + L * 0.06, bodyBottom - H * 0.28, L * 0.88, H * 0.1);
  // headlight + tail light
  ctx.fillStyle = rgbaStr([255, 244, 210], 0.97);
  circle(carCX + L * 0.46, bodyTop + H * 0.4, H * 0.1);
  ctx.fillStyle = rgbStr(C_CRIMSON);
  circle(carCX - L * 0.46, bodyTop + H * 0.4, H * 0.08);
}

/**
 * Frame orchestrator — renders CAMERA A across the WHOLE scroll (0..1). The
 * dual-camera dissolve was removed in D1: drawCameraB stays defined but unused
 * for now. // D2: reintegrated as rotated camera target
 */
/**
 * Frame orchestrator — draws the act, then layers cinematic post-process:
 * a hard-cut dip-to-black around CUT, a per-act colour grade wash, and subtle
 * film grain (fullscreen, no letterbox). All deterministic from `progress`.
 */
function draw(
  ctx: CanvasRenderingContext2D,
  progress: number,
  width: number,
  height: number,
  showCar = true,
): void {
  const CUT = 0.62;

  drawCameraA(ctx, progress, width, height, showCar);

  // --- colour-grade wash: cool noir -> warm dawn across the journey --------
  // Two overlapping washes keyed to progress; very low alpha so it tints,
  // never floods. Cool teal early, warm amber late.
  const coolF = 1 - smoothstep(0.0, CUT, progress);
  const warmF = smoothstep(CUT, 1.0, progress);
  if (coolF > 0.01) {
    ctx.fillStyle = rgbaStr([20, 40, 70], 0.12 * coolF); // teal noir grade
    ctx.fillRect(0, 0, width, height);
  }
  if (warmF > 0.01) {
    ctx.fillStyle = rgbaStr([255, 170, 90], 0.1 * warmF); // amber dawn grade
    ctx.fillRect(0, 0, width, height);
  }

  // --- hard-cut dip to black: brief blackout right around CUT --------------
  // Bell curve centred on CUT (half-width 0.03): scene dips to near-black and
  // back, so the iso->side jump reads as a deliberate film cut, not a glitch.
  const cutDist = Math.abs(progress - CUT);
  if (cutDist < 0.035) {
    const dip = 1 - smoothstep(0.0, 0.035, cutDist); // 1 at CUT -> 0 at edges
    ctx.fillStyle = rgbaStr(C_INK, dip * 0.96);
    ctx.fillRect(0, 0, width, height);
  }

  // --- film grain: subtle moving dots --------------------------------------
  const gt = Math.floor(progress * 240); // changes as you scroll => "alive"
  ctx.fillStyle = rgbaStr(C_BONE, 0.035);
  for (let i = 0; i < GRAIN.length; i++) {
    const g = GRAIN[i];
    const jx = ((g.x + ((i * 73 + gt * 37) % 100) / 100) % 1) * width;
    const jy = ((g.y + ((i * 31 + gt * 53) % 100) / 100) % 1) * height;
    ctx.fillRect(jx, jy, 1, 1);
  }
}

/**
 * Reuse the EXACT journey road scene (geometry, perspective, movement, timing,
 * grain) as a standalone backdrop — driven by an external scroll progress.
 * `showCar = false` skips the drawn car so a PNG asset can be composited over
 * the road instead. The JourneySection component itself is unchanged (it calls
 * `draw` with the default `showCar = true`).
 */
export function drawJourneyScene(
  ctx: CanvasRenderingContext2D,
  progress: number,
  width: number,
  height: number,
  showCar = true,
): void {
  draw(ctx, progress, width, height, showCar);
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

/**
 * Progress WITHIN a chapter band [start,end], 0..1. Drives the typewriter so
 * text reveals as you scroll deeper into the band and un-reveals on scroll-up.
 */
function bandProgress(p: number, start: number, end: number): number {
  return clamp01((p - start) / (end - start));
}

/**
 * Scroll-driven typewriter: reveals the first `reveal*length` chars of `text`.
 * A blinking caret trails the revealed slice while it is mid-typing. Pure
 * function of scroll progress — deterministic, reversible, no timers.
 */
function Typewriter({
  text,
  reveal,
  className,
}: {
  text: string;
  reveal: number;
  className?: string;
}) {
  const count = Math.round(clamp01(reveal) * text.length);
  const shown = text.slice(0, count);
  const typing = count > 0 && count < text.length;
  return (
    <span className={className}>
      {shown}
      {typing && <span className="ml-0.5 animate-pulse text-signal">|</span>}
    </span>
  );
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
  // Preloader: a noir overlay covers the canvas until the first frame is painted.
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);
  // Reduced-motion lifted to React so the overlay shows fully-typed static copy
  // (with no scroll there is no progress to drive the typewriter).
  const [reduced, setReduced] = useState(false);

  // Track reduced-motion at the React layer (separate from gsap.matchMedia).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (): void => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Unmount the preloader shortly after it has faded out (~400ms transition).
  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => setGone(true), 450);
    return () => window.clearTimeout(id);
  }, [ready]);

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
      // Cap DPR at 2 so high-DPR phones don't allocate a huge backing store.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
      section.style.height = "900svh";
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

    // Reveal the scene once the first frame is actually on screen (two RAFs =
    // layout + paint done) — then the preloader fades away with no content flash.
    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => setReady(true));
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      mm.revert();
    };
  }, []);

  // Chapter opacities from the shared scroll progress (model B cross-fade).
  const op1 = bandOpacity(progress, 0.0, 0.16); // ACT1 exposition (opener)
  const op2 = bandOpacity(progress, 0.2, 0.36); // ACT2 inciting (manifest)
  const op3 = bandOpacity(progress, 0.42, 0.6); // ACT3 rising action (engine)
  const op4 = bandOpacity(progress, 0.66, 0.82); // ACT4 climax (proof)
  const op5 = bandOpacity(progress, 0.86, 1.0); // ACT5 resolution (operators)
  // Typewriter reveal per chapter — wide bands so text writes slowly as you
  // scroll through almost the entire chapter window (cinematic, deliberate).
  // Under reduced motion there is no scroll progress to type with, so reveal the
  // copy in full (otherwise the typewriter would render blank text).
  const tw1 = reduced ? 1 : bandProgress(progress, 0.0, 0.15);
  const tw2 = reduced ? 1 : bandProgress(progress, 0.18, 0.37);
  const tw3 = reduced ? 1 : bandProgress(progress, 0.4, 0.6);
  const tw4 = reduced ? 1 : bandProgress(progress, 0.64, 0.83);
  const tw5 = reduced ? 1 : bandProgress(progress, 0.85, 1.0);
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
              <Typewriter text={HERO_TITLE_LINES.join(" ")} reveal={tw1} />
            </h1>
            <p className={BODY_CLS}>
              <Typewriter text={STORY_BRIDGE} reveal={tw1} />
            </p>
            <button
              type="button"
              onClick={openConsole}
              style={{ pointerEvents: op1 > 0.5 ? "auto" : "none" }}
              className={CTA_CLS}
            >
              BRING THE WEIGHT
            </button>
          </Chapter>

          {/* CH2 — the studio / manifest */}
          <Chapter opacity={op2}>
            <p className={EYEBROW_CLS}>{MANIFEST_EYEBROW}</p>
            <h2 className={HEADLINE_CLS}>
              <Typewriter text={MANIFEST_HEADLINE} reveal={tw2} />
            </h2>
            <p className={BODY_CLS}>
              <Typewriter text={MANIFEST_BODY} reveal={tw2} />
            </p>
          </Chapter>

          {/* CH3 — the engine */}
          <Chapter opacity={op3}>
            <p className={EYEBROW_CLS}>{ENGINE_EYEBROW}</p>
            <h2 className={HEADLINE_CLS}>
              <Typewriter text={ENGINE_HEADLINE} reveal={tw3} />
            </h2>
            <p className={BODY_CLS}>
              <Typewriter text={ENGINE_BODY} reveal={tw3} />
            </p>
          </Chapter>

          {/* CH4 — proof (text only; FerdiPoker media lands later) */}
          <Chapter opacity={op4}>
            <p className={EYEBROW_CLS}>{PROOF_EYEBROW}</p>
            <h2 className={HEADLINE_CLS}>
              <Typewriter text={PROOF_HEADLINE} reveal={tw4} />
            </h2>
            <p className={BODY_CLS}>
              <Typewriter text={PROOF_BODY} reveal={tw4} />
            </p>
          </Chapter>

          {/* CH5 — operators + final CTA */}
          <Chapter opacity={op5}>
            <p className={EYEBROW_CLS}>{OPERATOR_EYEBROW}</p>
            <h2 className={HEADLINE_CLS}>
              <Typewriter text={OPERATOR_HEADLINE} reveal={tw5} />
            </h2>
            <p className={BODY_CLS}>
              <Typewriter text={OPERATOR_BODY} reveal={tw5} />
            </p>
            <button
              type="button"
              onClick={openConsole}
              style={{ pointerEvents: op5 > 0.5 ? "auto" : "none" }}
              className={CTA_CLS}
            >
              BRING THE WEIGHT
            </button>
          </Chapter>
        </div>
      </div>

      {/* Preloader — noir overlay over everything until the first frame paints,
          then fades out (~400ms) and unmounts. No flash of un-rendered canvas. */}
      {!gone && (
        <div
          aria-hidden
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink transition-opacity duration-[400ms] ease-out"
          style={{ opacity: ready ? 0 : 1, pointerEvents: ready ? "none" : "auto" }}
        >
          <span className="font-logo text-3xl text-bone md:text-4xl">shadeworks</span>
          <span className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-signal" />
            loading
          </span>
        </div>
      )}

      {consoleOpen && <IdeaScannerConsole onClose={() => setConsoleOpen(false)} />}
    </section>
  );
}
