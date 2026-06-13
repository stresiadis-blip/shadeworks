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

/** Clamp to [0,1]. Defined early so canvas draw helpers can use it. */
const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

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
): void {
  // ===========================================================================
  // FIVE ACTS on a single clock (progress), as five roughly-equal windows.
  // HARD CUT at CUT between the iso down-the-road view (acts 1-3) and the flat
  // side scenes (act4 dawn + act5 arrival). No hybrid projection => no overlap.
  //   ACT1 0.00-0.18 noir road      (iso)
  //   ACT2 0.20-0.38 city wakes      (iso)
  //   ACT3 0.40-0.56 the engine      (iso)
  //   --- CUT (0.58) iso -> side ---
  //   ACT4 0.60-0.76 dawn breaks     (side)
  //   ACT5 0.80-1.00 arrival / home  (side)
  // ===========================================================================
  const CUT = 0.58;

  if (progress < CUT) {
    drawIsoAct(ctx, progress / CUT, width, height); // local 0..1 across acts 1-3
  } else {
    drawSideAct(ctx, (progress - CUT) / (1 - CUT), width, height); // local 0..1 acts 4-5
  }
}

// ---------------------------------------------------------------------------
// ACTS 1-3 — CHASE CAMERA behind the car on a one-point-perspective road that
// rushes toward the viewer. `t` is local 0..1 (global 0..CUT). Forward motion
// (not frame rotation) drives the three beats; a gradual colour arc runs noir
// -> synthwave -> warm across t. No iso geometry here.
// ---------------------------------------------------------------------------
function drawIsoAct(
  ctx: CanvasRenderingContext2D,
  t: number,
  width: number,
  height: number,
): void {
  // --- beat factors (gradual across t) -------------------------------------
  const noir = 1 - smoothstep(0.0, 0.42, t); // act1 b/w world, fades by mid
  const synth = smoothstep(0.3, 0.72, t); // act2 synthwave colour bleeds in
  const warmUp = smoothstep(0.74, 1.0, t); // act3 warms just before the cut
  const rainAmt = 1 - smoothstep(0.0, 0.3, t); // rain owns act1
  const wake = smoothstep(0.34, 0.62, t); // building windows light up (act2)
  const speed = 0.6 + smoothstep(0, 1, t) * 1.4; // world flows FASTER on scroll

  // --- one-point perspective projection ------------------------------------
  // d: depth (0 = at the camera / bottom of screen, 1 = at the vanishing point).
  // v: lateral lane offset (lane units; road half-width = ROAD_HALF).
  const vx = width / 2;
  const vy = height * 0.42;
  const persp = (d: number): number => Math.pow(1 - d, 1.7); // 1 near -> 0 vanish
  const project = (d: number, v: number): [number, number] => {
    const p = persp(d);
    const y = vy + (height - vy) * p; // bottom at d=0, vanish at d=1
    const laneW = width * 0.62 * p; // road narrows toward the vanish
    const x = vx + (v / ROAD_HALF) * laneW * 0.5;
    return [x, y];
  };
  const scaleAt = (d: number): number => persp(d);
  const wrap = (n: number): number => ((n % 1) + 1) % 1;

  const poly = (pts: [number, number][]): void => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.fill();
  };

  // --- sky -----------------------------------------------------------------
  // noir near-black -> synthwave indigo/purple -> a hint of warm before the cut
  const skyTopCol = mix(mix([6, 6, 12], [26, 16, 52], synth), [62, 48, 74], warmUp * 0.6);
  const skyHorizCol = mix(mix([12, 12, 20], [72, 34, 96], synth), [150, 86, 72], warmUp * 0.7);
  const sky = ctx.createLinearGradient(0, 0, 0, vy);
  sky.addColorStop(0, rgbStr(skyTopCol));
  sky.addColorStop(1, rgbStr(skyHorizCol));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, vy + 1);

  // distant skyline along the horizon (greyscale in noir, tinting with synth)
  ctx.fillStyle = rgbStr(mix([14, 15, 20], [48, 28, 70], synth));
  for (const tw of SKYLINE) {
    const th = tw.h * height * 0.6;
    ctx.fillRect(tw.x * width, vy - th, tw.w * width, th);
  }
  // soft horizon glow (cool in synth, warm at the very end)
  const hGlowCol = mix(mix([20, 30, 60], [120, 40, 120], synth), [255, 150, 90], warmUp);
  const hGlow = ctx.createRadialGradient(vx, vy, 4, vx, vy, width * 0.5);
  hGlow.addColorStop(0, rgbaStr(hGlowCol, 0.2 + 0.2 * synth));
  hGlow.addColorStop(1, rgbaStr(hGlowCol, 0));
  ctx.fillStyle = hGlow;
  ctx.fillRect(0, 0, width, vy + height * 0.1);

  // --- ground + road -------------------------------------------------------
  ctx.fillStyle = rgbStr(mix(C_INK, [22, 18, 30], synth * 0.6 + warmUp * 0.3));
  ctx.fillRect(0, vy, width, height - vy);

  // road ribbon — bottom trapezoid converging on the vanish
  const asphalt = mix([20, 20, 24], [44, 30, 64], synth);
  ctx.fillStyle = rgbStr(asphalt);
  poly([
    project(0, -ROAD_HALF),
    project(0, ROAD_HALF),
    project(1, ROAD_HALF),
    project(1, -ROAD_HALF),
  ]);

  // road edge lines (gold in noir -> cyan in synth)
  const edgeCol = mix(C_GOLD, C_CYAN, synth);
  ctx.strokeStyle = rgbaStr(edgeCol, 0.25 + 0.3 * synth);
  ctx.lineWidth = 1.5;
  for (const sgn of [-1, 1] as const) {
    const [ax, ay] = project(0, sgn * ROAD_HALF);
    const [bx, by] = project(0.96, sgn * ROAD_HALF);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  // centre dashes + perpendicular rungs streaming TOWARD the camera (speed read)
  const dashCol = mix(C_GOLD, C_CYAN, synth);
  const RUNGS = 16;
  for (let i = 0; i < RUNGS; i++) {
    const d = wrap(i / RUNGS - t * speed); // decreasing depth => rushes at camera
    if (d > 0.98) continue;
    const p = scaleAt(d);
    const [d0x, d0y] = project(d, 0);
    const [d1x, d1y] = project(Math.min(d + 0.05, 1), 0);
    ctx.strokeStyle = rgbaStr(dashCol, (0.2 + 0.5 * p) * (0.5 + 0.5 * synth + 0.3 * noir));
    ctx.lineWidth = Math.max(1, 4 * p);
    ctx.beginPath();
    ctx.moveTo(d0x, d0y);
    ctx.lineTo(d1x, d1y);
    ctx.stroke();
    // faint full-width rung
    const [rlx, rly] = project(d, -ROAD_HALF);
    const [rrx, rry] = project(d, ROAD_HALF);
    ctx.strokeStyle = rgbaStr(edgeCol, 0.08 * p);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rlx, rly);
    ctx.lineTo(rrx, rry);
    ctx.stroke();
  }

  // --- buildings — flat billboards flanking the road, rushing past ---------
  // Each building scrolls in depth (dd decreases with t) so it flies toward the
  // camera and recycles — infinite drive. Painter-sorted far (dd~1) first.
  const cityH = height * 0.13;
  const bills = CITY.map((b) => ({ b, dd: wrap(b.d - t * speed) }));
  bills.sort((p, q) => q.dd - p.dd);
  for (const { b, dd } of bills) {
    if (dd < 0.02) continue; // at/behind the camera
    const p = scaleAt(dd);
    const [bx, by] = project(dd, b.v); // base on the ground beside the road
    const bw = b.footW * width * 0.12 * p;
    const bh = b.h * cityH * p;
    if (bw < 0.6 || bh < 0.6) continue;
    const top = by - bh;
    const dimF = 0.45 + 0.55 * p; // nearer = brighter
    const neon = NEON[b.neon];
    const g = b.tone * dimF;
    // facade: greyscale in noir -> tinted toward neon in synth
    const facade = mix([g, g, g], [neon[0] * 0.32, neon[1] * 0.32, neon[2] * 0.32], synth);
    ctx.fillStyle = rgbStr(facade);
    ctx.fillRect(bx - bw / 2, top, bw, bh);
    // lit edge (Sin City contrast) — bone in noir, neon in synth
    ctx.strokeStyle = rgbaStr(mix(C_BONE, neon, synth), 0.12 + 0.25 * synth);
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - bw / 2, top, bw, bh);
    // windows — gold in noir, neon in synth; wake in with the city
    const winAlpha = clamp01(wake * 1.4 - b.litOffset * 0.5);
    if (winAlpha > 0.02) {
      ctx.fillStyle = rgbaStr(mix(C_GOLD, neon, synth), 0.4 + winAlpha * 0.5);
      const ww = Math.max(1, bw * 0.16);
      const wh = Math.max(1, bh * 0.06);
      for (const win of b.windows) {
        const wx = bx - bw / 2 + win.u * bw;
        const wy = top + (1 - win.w) * bh; // win.w 0..1 from the base up
        ctx.fillRect(wx - ww / 2, wy - wh / 2, ww, wh);
      }
    }
  }

  // --- the hero car — chase view from behind, low and centred --------------
  const bob = Math.sin(t * 40) * 2; // tiny life
  const [carBaseX, carBaseY] = project(0.08, 0);
  const cx = carBaseX;
  const cy = carBaseY + bob;
  const carW = width * 0.17;
  const carH = carW * 0.5;

  // headlight beams splaying forward up the road — dominant in act 1
  const beamCol = mix(C_BONE, C_AMBER, warmUp);
  const beamA = (0.3 + 0.55 * noir) * 0.6;
  for (const lamp of [-0.45, 0.45] as const) {
    const apex: [number, number] = [cx + lamp * carW * 0.7, cy - carH * 0.3];
    const fl = project(0.6, lamp * 1.2 - 1.1);
    const fr = project(0.6, lamp * 1.2 + 1.1);
    const beam = ctx.createLinearGradient(
      apex[0],
      apex[1],
      (fl[0] + fr[0]) / 2,
      (fl[1] + fr[1]) / 2,
    );
    beam.addColorStop(0, rgbaStr(beamCol, beamA));
    beam.addColorStop(1, rgbaStr(beamCol, 0));
    ctx.fillStyle = beam;
    poly([apex, fl, fr]);
  }

  // car body — dark rounded silhouette seen from behind
  const bodyTop = cy - carH;
  const r = carH * 0.3;
  const x0 = cx - carW / 2;
  const x1 = cx + carW / 2;
  ctx.fillStyle = rgbStr([14, 14, 18]);
  ctx.beginPath();
  ctx.moveTo(x0 + r, bodyTop);
  ctx.lineTo(x1 - r, bodyTop);
  ctx.quadraticCurveTo(x1, bodyTop, x1, bodyTop + r);
  ctx.lineTo(x1, cy - r);
  ctx.quadraticCurveTo(x1, cy, x1 - r, cy);
  ctx.lineTo(x0 + r, cy);
  ctx.quadraticCurveTo(x0, cy, x0, cy - r);
  ctx.lineTo(x0, bodyTop + r);
  ctx.quadraticCurveTo(x0, bodyTop, x0 + r, bodyTop);
  ctx.closePath();
  ctx.fill();
  // rear window — slightly lighter trapezoid, cools toward synth
  ctx.fillStyle = rgbStr(mix([26, 26, 34], [40, 30, 60], synth));
  poly([
    [cx - carW * 0.32, bodyTop + carH * 0.16],
    [cx + carW * 0.32, bodyTop + carH * 0.16],
    [cx + carW * 0.24, bodyTop + carH * 0.5],
    [cx - carW * 0.24, bodyTop + carH * 0.5],
  ]);
  // signature gold light bar + crimson tail dots
  ctx.fillStyle = rgbaStr(C_GOLD, 0.85);
  ctx.fillRect(cx - carW * 0.34, cy - carH * 0.34, carW * 0.68, Math.max(1.5, carH * 0.07));
  ctx.fillStyle = rgbStr(C_CRIMSON);
  for (const sgn of [-1, 1] as const) {
    ctx.beginPath();
    ctx.arc(cx + sgn * carW * 0.36, cy - carH * 0.3, Math.max(1.5, carH * 0.1), 0, Math.PI * 2);
    ctx.fill();
  }

  // --- rain (act 1 only) ---------------------------------------------------
  if (rainAmt > 0.01) {
    ctx.strokeStyle = rgbaStr(C_BONE, 0.12 * rainAmt);
    ctx.lineWidth = 1;
    ctx.beginPath();
    const count = Math.ceil(RAIN.length * rainAmt);
    for (let i = 0; i < count; i++) {
      const s = RAIN[i];
      const yy = ((s.y + t * speed * 0.5) % 1) * height;
      const xx = s.x * width;
      const L = s.len * height;
      ctx.moveTo(xx, yy);
      ctx.lineTo(xx - L * 0.16, yy + L);
    }
    ctx.stroke();
  }

  // --- vignette (heavy noir, lifts with synth) -----------------------------
  const vg = ctx.createRadialGradient(width / 2, height * 0.55, Math.min(width, height) * 0.2, width / 2, height * 0.55, Math.max(width, height) * 0.78);
  vg.addColorStop(0, "rgba(10,10,10,0)");
  vg.addColorStop(1, rgbaStr(C_INK, 0.72 * noir + 0.32 * (1 - noir) - 0.12 * synth));
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
): void {
  // The side slice holds TWO sub-scenes, so the long 0.58..1.0 window is no
  // longer dead:
  //   ACT4 DAWN    (t 0.0-0.5): wide horizon, sky breaks dark -> first light,
  //     the city a dim silhouette. No home, no full sunrise yet.
  //   ACT5 ARRIVAL (t 0.5-1.0): camB's sunrise + home + car pulling in.
  // Crossfade over t 0.45..0.55 so there is no hard pop between them.
  const camMix = smoothstep(0.45, 0.55, t); // 0 = pure dawn, 1 = pure arrival

  if (camMix < 1) {
    // --- ACT4 DAWN — wide horizon shot, the missing scene ------------------
    const dawn = smoothstep(0.0, 0.5, t); // 0 at the cut -> 1 at the handoff
    const horizonY = height * 0.6;
    // sky: deep navy -> indigo up top, a first warm band rising on the horizon
    const skyTopCol = mix([8, 10, 26], [34, 28, 60], dawn);
    const skyHorizonCol = mix([14, 14, 30], [120, 72, 52], dawn);
    const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
    sky.addColorStop(0, rgbStr(skyTopCol));
    sky.addColorStop(1, rgbStr(skyHorizonCol));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, horizonY);
    // first-light glow hugging the horizon, grows with dawn
    const glowH = height * 0.18;
    const glow = ctx.createLinearGradient(0, horizonY - glowH, 0, horizonY);
    glow.addColorStop(0, rgbaStr([255, 150, 80], 0));
    glow.addColorStop(1, rgbaStr([255, 150, 80], 0.32 * dawn));
    ctx.fillStyle = glow;
    ctx.fillRect(0, horizonY - glowH, width, glowH);
    // ground below the horizon — dark, lifts a touch with dawn
    ctx.fillStyle = rgbStr(mix([6, 7, 10], [20, 18, 24], dawn));
    ctx.fillRect(0, horizonY, width, height - horizonY);
    // the city as a dim, squat silhouette low on the horizon (reuse SIDE_CITY)
    ctx.fillStyle = rgbaStr(mix([4, 5, 9], [14, 14, 22], dawn), 0.92);
    for (const b of SIDE_CITY) {
      const bw = b.w * width;
      const bh = b.h * height * 0.7; // distant, squat
      ctx.fillRect(b.x * width, horizonY - bh, bw, bh);
    }
  }

  if (camMix > 0) {
    // --- ACT5 ARRIVAL — camB sunrise/home across the back half -------------
    // Feed camB its full 0.78..1.0 internal arrival clock as t goes 0.5..1.0.
    ctx.save();
    ctx.globalAlpha = camMix;
    drawCameraB(ctx, lerp(0.78, 1.0, smoothstep(0.0, 1.0, (t - 0.5) / 0.5)), width, height);
    ctx.restore();
  }
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
): void {
  // Remap the incoming 0.78..1.0 window back to a full 0..1 arrival clock so
  // sunrise, car motion and home glow span the entire side act.
  const arrival = clamp01((progress - 0.78) / (1.0 - 0.78)); // 0 at cut -> 1 at end
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
  const dashOffset = (arrival * 60) % 60;
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
  const carCX = lerp(width * 0.32, width * 0.58, arrival);
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
): void {
  const CUT = 0.58;

  drawCameraA(ctx, progress, width, height);

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

// ---------------------------------------------------------------------------
// Per-chapter overlay (model B): ONE continuous journey, chapters cross-fade on
// the SAME scroll progress that drives the canvas. Copy is byte-for-byte from
// studio.ts — never rewritten here.
// ---------------------------------------------------------------------------

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
      section.style.height = "600svh";
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
  const op1 = bandOpacity(progress, 0.0, 0.18); // act1 noir road
  const op2 = bandOpacity(progress, 0.2, 0.38); // act2 city wakes
  const op3 = bandOpacity(progress, 0.4, 0.56); // act3 the machine
  const op4 = bandOpacity(progress, 0.6, 0.76); // act4 dawn breaks
  const op5 = bandOpacity(progress, 0.8, 1.0); // act5 arrival / home
  // Typewriter reveal per chapter — wide bands so text writes slowly as you
  // scroll through almost the entire chapter window (cinematic, deliberate).
  const tw1 = bandProgress(progress, 0.0, 0.18);
  const tw2 = bandProgress(progress, 0.2, 0.38);
  const tw3 = bandProgress(progress, 0.4, 0.56);
  const tw4 = bandProgress(progress, 0.6, 0.76); // dawn copy writes as light breaks
  const tw5 = bandProgress(progress, 0.8, 1.0);
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

      {consoleOpen && <IdeaScannerConsole onClose={() => setConsoleOpen(false)} />}
    </section>
  );
}
