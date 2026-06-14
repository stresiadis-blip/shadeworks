"use client";

import { useEffect, useRef } from "react";

/**
 * JourneyBackdrop — a cinematic neo-noir "car approaching down the street"
 * backdrop, painted to a full-bleed fixed 2D canvas behind the Vectr landing
 * structure. Ported from the neo-noir v2 prototype, with one change: the master
 * clock `t` (0->1) is NOT driven by a timer — it is driven by SCROLL over the
 * hero region. As you scroll the hero, the sedan eases in from the horizon to
 * near + large; by t≈1 it is parked close and static while the rest of the page
 * scrolls over the held final frame. Neo-noir the whole way; colour bleeds in
 * from t=0.59 (dawn). Ambient motion (rain, fog drift, grain) runs on its own
 * continuous phase so the frame stays alive even when scroll is idle.
 *
 * Reduced motion: one static, readable frame at t=0.66 (no rAF, no scroll bind).
 * DPR capped at 2; debounced resize. Full cleanup of rAF + listeners.
 */

// --- small maths ------------------------------------------------------------
type RGB = [number, number, number];

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

function smoothstep(edge0: number, edge1: number, x: number): number {
  let t = (x - edge0) / (edge1 - edge0);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return t * t * (3 - 2 * t);
}

/** Symmetric ease-in-out (accelerate then settle). */
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const rgb = (c: RGB): string =>
  `rgb(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])})`;
const rgba = (c: RGB, a: number): string =>
  `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${a})`;

/** Deterministic PRNG so every paint shares one fixed world layout. */
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

// --- palette ----------------------------------------------------------------
const INK: RGB = [8, 9, 14];
const SKY_TOP: RGB = [9, 11, 20];
const SKY_HORIZON: RGB = [24, 28, 46];
const DAWN_CORE: RGB = [255, 196, 132];
const DAWN_EDGE: RGB = [196, 86, 86];
const FAR_BLDG: RGB = [13, 15, 24];
const NEAR_BLDG: RGB = [20, 22, 34];
const WIN_WARM: RGB = [255, 198, 120];
const WIN_COOL: RGB = [126, 184, 232];
const ASPHALT: RGB = [15, 16, 22];
const FOG: RGB = [44, 50, 70];
const RAIN: RGB = [150, 172, 206];
const RIM_COOL: RGB = [150, 184, 224];
const RIM_WARM: RGB = [255, 200, 150];
const CHROME: RGB = [150, 158, 172];
const HEADLIGHT: RGB = [255, 242, 214];

// --- deterministic world data (built once) ----------------------------------
interface Bldg {
  x: number; // 0..1 fraction of width (left edge)
  w: number; // 0..1 fraction of width
  h: number; // 0..1 fraction of height (above horizon)
  cols: number;
  rows: number;
  spire: number; // 0 = none, else spire height fraction
  warm: boolean; // window tint
}

function buildPlane(seed: number, count: number, maxH: number, warmBias: number): Bldg[] {
  const rng = mulberry32(seed);
  const list: Bldg[] = [];
  for (let i = 0; i < count; i++) {
    list.push({
      x: i / count + (rng() - 0.5) * 0.02,
      w: (0.6 / count) * (0.7 + rng() * 0.9),
      h: maxH * (0.32 + rng() * 0.68),
      cols: 2 + Math.floor(rng() * 3),
      rows: 3 + Math.floor(rng() * 6),
      spire: rng() < 0.28 ? 0.04 + rng() * 0.09 : 0,
      warm: rng() < warmBias,
    });
  }
  return list;
}

const FAR_PLANE = buildPlane(0xfa2, 26, 0.16, 0.5);
const NEAR_PLANE = buildPlane(0x4e2, 16, 0.3, 0.62);

interface Streak {
  x: number;
  y: number;
  len: number;
  sp: number;
}
function buildRain(): Streak[] {
  const rng = mulberry32(0x9a17);
  const list: Streak[] = [];
  for (let i = 0; i < 150; i++) {
    list.push({ x: rng(), y: rng(), len: 0.018 + rng() * 0.03, sp: 0.06 + rng() * 0.05 });
  }
  return list;
}
const RAIN_FIELD = buildRain();

interface Dot {
  x: number;
  y: number;
}
function buildGrain(): Dot[] {
  const rng = mulberry32(0x6a17);
  const list: Dot[] = [];
  for (let i = 0; i < 380; i++) list.push({ x: rng(), y: rng() });
  return list;
}
const GRAIN = buildGrain();

// --- skyline ----------------------------------------------------------------
function drawPlane(
  ctx: CanvasRenderingContext2D,
  plane: Bldg[],
  base: RGB,
  hY: number,
  W: number,
  H: number,
  cb: number,
): void {
  for (const b of plane) {
    const bw = b.w * W;
    const bh = b.h * H;
    const bx = b.x * W;
    const by = hY - bh;
    ctx.fillStyle = rgb(mix(base, [base[0] + 10, base[1] + 9, base[2] + 14], cb * 0.5));
    ctx.fillRect(bx, by, bw, bh);

    // spire + warning light
    if (b.spire > 0) {
      const sx = bx + bw * 0.5;
      ctx.strokeStyle = rgba(base, 0.9);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx, by);
      ctx.lineTo(sx, by - b.spire * H);
      ctx.stroke();
      ctx.fillStyle = rgba([255, 60, 60], 0.7);
      ctx.fillRect(sx - 1, by - b.spire * H - 1, 2, 2);
    }

    // lit windows — dim, slightly warmer as dawn bleeds in
    const win = mix(b.warm ? WIN_WARM : WIN_COOL, WIN_WARM, cb * 0.4);
    const padX = bw * 0.18;
    const padY = bh * 0.12;
    const gw = (bw - padX * 2) / b.cols;
    const gh = (bh - padY * 2) / b.rows;
    if (gw <= 0 || gh <= 0) continue;
    for (let c = 0; c < b.cols; c++) {
      for (let r = 0; r < b.rows; r++) {
        // deterministic "lit or dark" from a cheap hash
        const lit = ((c * 7 + r * 13 + Math.round(b.x * 97)) % 5) < 2;
        if (!lit) continue;
        ctx.fillStyle = rgba(win, 0.32 - cb * 0.12);
        ctx.fillRect(
          bx + padX + c * gw + gw * 0.24,
          by + padY + r * gh + gh * 0.22,
          gw * 0.5,
          gh * 0.52,
        );
      }
    }
  }
}

// --- the car (low, wide, aggressive mob sedan — head-on) --------------------
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawCar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cw: number,
  cb: number,
): void {
  if (cw < 6) return;
  const ch = cw * 0.46; // LOW and WIDE — overall height is < half the width
  const halfW = cw / 2;
  const left = cx - halfW;

  const bottom = cy + ch * 0.5;
  const beltline = cy - ch * 0.06; // where greenhouse meets the body
  const roofTop = beltline - ch * 0.3; // flat roof, ~35% lower cabin
  const bumperTop = cy + ch * 0.32;

  const rimCol = mix(RIM_COOL, RIM_WARM, cb);
  const chromeCol = mix(CHROME, [CHROME[0] + 30, CHROME[1] + 14, CHROME[2] - 6], cb * 0.6);

  // --- wet-asphalt reflection: warm headlight smears + faint body sheen -----
  const hlY = beltline + ch * 0.16;
  for (const sgn of [-1, 1] as const) {
    const hx = cx + sgn * cw * 0.34;
    const refl = ctx.createLinearGradient(hx, bottom, hx, bottom + ch * 1.6);
    refl.addColorStop(0, rgba(HEADLIGHT, 0.3));
    refl.addColorStop(1, rgba(HEADLIGHT, 0));
    ctx.fillStyle = refl;
    ctx.fillRect(hx - cw * 0.08, bottom, cw * 0.16, ch * 1.6);
  }
  const bodyRefl = ctx.createLinearGradient(cx, bottom, cx, bottom + ch * 0.9);
  bodyRefl.addColorStop(0, rgba([20, 22, 30], 0.34));
  bodyRefl.addColorStop(1, rgba([20, 22, 30], 0));
  ctx.fillStyle = bodyRefl;
  ctx.fillRect(left + cw * 0.06, bottom, cw * 0.88, ch * 0.9);

  // --- low front wheels poking out (wide stance) ----------------------------
  ctx.fillStyle = rgb([6, 7, 10]);
  for (const sgn of [-1, 1] as const) {
    roundRectPath(ctx, cx + sgn * cw * 0.36 - cw * 0.07, bumperTop, cw * 0.14, ch * 0.22, ch * 0.06);
    ctx.fill();
  }

  // --- greenhouse / cabin (low, flat roof, narrow glass) --------------------
  const cabinHalf = cw * 0.29;
  const roofHalf = cw * 0.24;
  ctx.fillStyle = rgb([16, 18, 24]);
  ctx.beginPath();
  ctx.moveTo(cx - cabinHalf, beltline);
  ctx.lineTo(cx - roofHalf, roofTop);
  ctx.lineTo(cx + roofHalf, roofTop);
  ctx.lineTo(cx + cabinHalf, beltline);
  ctx.closePath();
  ctx.fill();
  // dark windshield with a faint cool sky reflection
  ctx.fillStyle = rgb([9, 11, 17]);
  ctx.beginPath();
  ctx.moveTo(cx - cabinHalf * 0.82, beltline - ch * 0.02);
  ctx.lineTo(cx - roofHalf * 0.82, roofTop + ch * 0.03);
  ctx.lineTo(cx + roofHalf * 0.82, roofTop + ch * 0.03);
  ctx.lineTo(cx + cabinHalf * 0.82, beltline - ch * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rgba(mix([60, 80, 120], RIM_WARM, cb), 0.18);
  ctx.beginPath();
  ctx.moveTo(cx - cabinHalf * 0.7, beltline - ch * 0.03);
  ctx.lineTo(cx - roofHalf * 0.2, roofTop + ch * 0.04);
  ctx.lineTo(cx + roofHalf * 0.1, roofTop + ch * 0.04);
  ctx.lineTo(cx - cabinHalf * 0.2, beltline - ch * 0.03);
  ctx.closePath();
  ctx.fill();

  // --- lower body mass (wide, horizontal, flared) ---------------------------
  const bodyGrad = ctx.createLinearGradient(0, beltline, 0, bumperTop);
  bodyGrad.addColorStop(0, rgb([30, 33, 42])); // sky sheen on the shoulder
  bodyGrad.addColorStop(0.5, rgb([17, 19, 26]));
  bodyGrad.addColorStop(1, rgb([10, 11, 16]));
  ctx.fillStyle = bodyGrad;
  roundRectPath(ctx, left, beltline, cw, bumperTop - beltline, ch * 0.12);
  ctx.fill();

  // --- wide imposing grille (chrome-edged, slatted) -------------------------
  const grW = cw * 0.46;
  const grH = ch * 0.24;
  const grX = cx - grW / 2;
  const grY = cy + ch * 0.0;
  ctx.fillStyle = rgb([6, 7, 10]);
  roundRectPath(ctx, grX, grY, grW, grH, grH * 0.18);
  ctx.fill();
  ctx.strokeStyle = rgba(chromeCol, 0.85);
  ctx.lineWidth = Math.max(1, cw * 0.006);
  roundRectPath(ctx, grX, grY, grW, grH, grH * 0.18);
  ctx.stroke();
  const slats = 4;
  for (let i = 1; i < slats; i++) {
    const yy = grY + (grH / slats) * i;
    ctx.beginPath();
    ctx.moveTo(grX + grW * 0.04, yy);
    ctx.lineTo(grX + grW * 0.96, yy);
    ctx.stroke();
  }

  // --- hooded headlights (menacing squint) + glow ---------------------------
  for (const sgn of [-1, 1] as const) {
    const hx = cx + sgn * cw * 0.32;
    const hw = cw * 0.16;
    const hh = ch * 0.12;
    // brow / hood: a dark overhang angled down toward the centre (the squint)
    ctx.fillStyle = rgb([8, 9, 13]);
    ctx.beginPath();
    ctx.moveTo(hx - sgn * hw * 0.62, hlY - hh * 1.5);
    ctx.lineTo(hx + sgn * hw * 0.62, hlY - hh * 0.55);
    ctx.lineTo(hx + sgn * hw * 0.62, hlY - hh * 0.1);
    ctx.lineTo(hx - sgn * hw * 0.62, hlY - hh * 0.5);
    ctx.closePath();
    ctx.fill();
    // headlight lens — thin angled slit under the brow
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(hx - sgn * hw * 0.55, hlY - hh * 0.35);
    ctx.lineTo(hx + sgn * hw * 0.55, hlY + hh * 0.2);
    ctx.lineTo(hx + sgn * hw * 0.55, hlY + hh * 0.7);
    ctx.lineTo(hx - sgn * hw * 0.55, hlY + hh * 0.3);
    ctx.closePath();
    ctx.clip();
    const lens = ctx.createLinearGradient(hx, hlY - hh, hx, hlY + hh);
    lens.addColorStop(0, rgba(HEADLIGHT, 1));
    lens.addColorStop(1, rgba(mix(HEADLIGHT, RIM_WARM, cb), 0.7));
    ctx.fillStyle = lens;
    ctx.fillRect(hx - hw, hlY - hh, hw * 2, hh * 2);
    ctx.restore();
    // glow halo
    const glow = ctx.createRadialGradient(hx, hlY, 1, hx, hlY, hw * 1.4);
    glow.addColorStop(0, rgba(HEADLIGHT, 0.55));
    glow.addColorStop(1, rgba(HEADLIGHT, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(hx - hw * 1.6, hlY - hw * 1.6, hw * 3.2, hw * 3.2);
  }

  // --- heavy chrome bumper --------------------------------------------------
  const bumpGrad = ctx.createLinearGradient(0, bumperTop, 0, bottom);
  bumpGrad.addColorStop(0, rgb(mix(chromeCol, [255, 255, 255], 0.15)));
  bumpGrad.addColorStop(0.5, rgb([70, 74, 84]));
  bumpGrad.addColorStop(1, rgb([34, 36, 44]));
  ctx.fillStyle = bumpGrad;
  roundRectPath(ctx, left + cw * 0.02, bumperTop, cw * 0.96, bottom - bumperTop, ch * 0.08);
  ctx.fill();
  // bright chrome highlight line
  ctx.strokeStyle = rgba([220, 226, 236], 0.55);
  ctx.lineWidth = Math.max(1, cw * 0.005);
  ctx.beginPath();
  ctx.moveTo(left + cw * 0.06, bumperTop + (bottom - bumperTop) * 0.32);
  ctx.lineTo(left + cw * 0.94, bumperTop + (bottom - bumperTop) * 0.32);
  ctx.stroke();

  // --- rim light along the roof + shoulder (sky/dawn) -----------------------
  ctx.strokeStyle = rgba(rimCol, 0.6);
  ctx.lineWidth = Math.max(1, cw * 0.006);
  ctx.beginPath();
  ctx.moveTo(cx - roofHalf, roofTop);
  ctx.lineTo(cx + roofHalf, roofTop);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(left + cw * 0.04, beltline);
  ctx.lineTo(left + cw * 0.96, beltline);
  ctx.stroke();

  // --- headlight beams fanning toward the camera ----------------------------
  for (const sgn of [-1, 1] as const) {
    const hx = cx + sgn * cw * 0.32;
    const beam = ctx.createLinearGradient(hx, hlY, hx + sgn * cw * 0.2, bottom + ch * 1.2);
    beam.addColorStop(0, rgba(HEADLIGHT, 0.16));
    beam.addColorStop(1, rgba(HEADLIGHT, 0));
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(hx - cw * 0.04, hlY);
    ctx.lineTo(hx + cw * 0.04, hlY);
    ctx.lineTo(hx + sgn * cw * 0.34 + cw * 0.16, bottom + ch * 1.3);
    ctx.lineTo(hx + sgn * cw * 0.34 - cw * 0.16, bottom + ch * 1.3);
    ctx.closePath();
    ctx.fill();
  }
}

// --- master frame -----------------------------------------------------------
function draw(
  ctx: CanvasRenderingContext2D,
  t: number,
  amb: number,
  W: number,
  H: number,
): void {
  const hY = H * 0.4; // horizon
  const cb = smoothstep(0.59, 1, t); // colour bleed (dawn) — neo-noir until 0.59

  // --- sky ------------------------------------------------------------------
  const sky = ctx.createLinearGradient(0, 0, 0, hY);
  sky.addColorStop(0, rgb(mix(SKY_TOP, [18, 16, 26], cb * 0.4)));
  sky.addColorStop(1, rgb(mix(SKY_HORIZON, [70, 48, 64], cb)));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, hY);

  // dawn glow — a warm hemisphere rising from the horizon, only from t>=0.59
  if (cb > 0.001) {
    const gx = W * 0.5;
    const glow = ctx.createRadialGradient(gx, hY, 4, gx, hY, H * 0.5);
    glow.addColorStop(0, rgba(DAWN_CORE, 0.5 * cb));
    glow.addColorStop(0.4, rgba(DAWN_EDGE, 0.26 * cb));
    glow.addColorStop(1, rgba(DAWN_EDGE, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, hY + H * 0.1);
  }

  // --- two-plane skyline ----------------------------------------------------
  drawPlane(ctx, FAR_PLANE, FAR_BLDG, hY, W, H, cb);
  drawPlane(ctx, NEAR_PLANE, NEAR_BLDG, hY, W, H, cb);

  // --- ground + perspective road -------------------------------------------
  ctx.fillStyle = rgb(mix(ASPHALT, [26, 22, 26], cb * 0.6));
  ctx.fillRect(0, hY, W, H - hY);
  const roadHalf = W * 0.46;
  ctx.fillStyle = rgb(mix([20, 21, 27], [32, 27, 30], cb * 0.5));
  ctx.beginPath();
  ctx.moveTo(W * 0.5, hY);
  ctx.lineTo(W * 0.5 + roadHalf, H);
  ctx.lineTo(W * 0.5 - roadHalf, H);
  ctx.closePath();
  ctx.fill();
  // centre lane dashes (perspective — longer/wider toward the camera)
  ctx.fillStyle = rgba(mix([200, 200, 190], RIM_WARM, cb), 0.5);
  for (let i = 1; i <= 7; i++) {
    const d = i / 8;
    const y0 = hY + (H - hY) * d * d;
    const y1 = hY + (H - hY) * Math.min(1, (d + 0.05) * (d + 0.05) * 1.1);
    const wdt = 1 + d * d * (W * 0.012);
    ctx.fillRect(W * 0.5 - wdt / 2, y0, wdt, Math.max(1, y1 - y0));
  }

  // --- dense fog bank (high + wide, slow horizontal drift) ------------------
  const drift = Math.sin(amb * 0.05) * W * 0.04;
  for (let i = 0; i < 3; i++) {
    const fy = hY - H * (0.02 + i * 0.05);
    const fh = H * (0.12 + i * 0.05);
    const fog = ctx.createLinearGradient(0, fy - fh, 0, fy + fh);
    fog.addColorStop(0, rgba(FOG, 0));
    fog.addColorStop(0.5, rgba(FOG, 0.16 - i * 0.03));
    fog.addColorStop(1, rgba(FOG, 0));
    ctx.save();
    ctx.translate(drift * (i % 2 === 0 ? 1 : -1), 0);
    ctx.fillStyle = fog;
    ctx.fillRect(-W * 0.1, fy - fh, W * 1.2, fh * 2);
    ctx.restore();
  }

  // --- the sedan: eased from horizon to near, scroll-driven -----------------
  const eased = easeInOut(t);
  const cy = hY + (H * 0.96 - hY) * eased;
  const roadHalfCar = roadHalf * ((cy - hY) / (H - hY));
  const carW = roadHalfCar * 2 * 0.72;
  drawCar(ctx, W * 0.5, cy, carW, cb);

  // --- slow rain ------------------------------------------------------------
  ctx.strokeStyle = rgba(RAIN, 0.14);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const s of RAIN_FIELD) {
    const yy = ((s.y + amb * s.sp) % 1) * H;
    const xx = s.x * W;
    const L = s.len * H;
    ctx.moveTo(xx, yy);
    ctx.lineTo(xx - L * 0.14, yy + L);
  }
  ctx.stroke();

  // --- colour soft-light wash (cool noir always, warm dawn from 0.59) -------
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = rgba([30, 56, 92], 0.5 * (1 - cb) + 0.12);
  ctx.fillRect(0, 0, W, H);
  if (cb > 0.001) {
    ctx.fillStyle = rgba([255, 168, 96], 0.5 * cb);
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();

  // --- vignette -------------------------------------------------------------
  const vg = ctx.createRadialGradient(
    W / 2,
    H * 0.52,
    Math.min(W, H) * 0.22,
    W / 2,
    H * 0.52,
    Math.max(W, H) * 0.74,
  );
  vg.addColorStop(0, "rgba(8,9,14,0)");
  vg.addColorStop(1, rgba(INK, 0.72 - cb * 0.18));
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // --- film grain -----------------------------------------------------------
  const gt = Math.floor(amb * 18);
  ctx.fillStyle = rgba([247, 244, 236], 0.03);
  for (let i = 0; i < GRAIN.length; i++) {
    const g = GRAIN[i];
    const jx = ((g.x + ((i * 73 + gt * 37) % 100) / 100) % 1) * W;
    const jy = ((g.y + ((i * 31 + gt * 53) % 100) / 100) % 1) * H;
    ctx.fillRect(jx, jy, 1, 1);
  }
}

/**
 * Fixed full-bleed canvas. `t` is normalized scroll over the hero (first
 * viewport): t = clamp(scrollY / heroHeight). Ambient phase runs continuously
 * for rain/fog/grain. Reports throttled `t` up so the page can tune its scrim.
 */
export function JourneyBackdrop({
  reduced,
  onProgress,
}: {
  reduced: boolean;
  onProgress?: (t: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const size = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    size();

    if (reduced) {
      draw(ctx, 0.66, 0, w, h); // single readable static frame
      onProgressRef.current?.(0.66);

      let resizeTimer = 0;
      const onResize = (): void => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          size();
          draw(ctx, 0.66, 0, w, h);
        }, 150);
      };
      window.addEventListener("resize", onResize);
      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
      };
    }

    let raf = 0;
    let last = -1;
    const start = performance.now();
    const loop = (): void => {
      if (document.visibilityState !== "hidden") {
        const heroH = Math.max(1, window.innerHeight);
        const t = clamp01(window.scrollY / heroH);
        const amb = (performance.now() - start) / 1000;
        draw(ctx, t, amb, w, h);
        if (Math.abs(t - last) > 0.004) {
          last = t;
          onProgressRef.current?.(t);
        }
      }
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);

    let resizeTimer = 0;
    const onResize = (): void => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(size, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
