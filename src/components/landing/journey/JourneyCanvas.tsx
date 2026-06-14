"use client";

import { useEffect, useRef } from "react";
import { drawCar } from "./drawCar";
import { journeyStore } from "./journeyStore";

/**
 * The cinematic backdrop: one full-bleed fixed 2D canvas behind the editorial
 * structure. Layers (back -> front): dawn sky, two-plane parallax skyline, our
 * perspective road, the car, a fog belt it emerges from, and layered rain.
 *
 * Everything is painted to an offscreen scene in its natural colour; the visible
 * canvas blits it through a `grayscale(1 - colorProgress)` grade (so 0..59% of
 * the scroll is pure monochrome) plus a warm wash, then adds neutral grain and a
 * vignette. The scene is driven imperatively from the valtio store in the rAF
 * loop — React never re-renders per frame. Reduced motion paints one static,
 * readable frame at progress 0.66.
 */

type RGB = [number, number, number];
const rgb = (c: RGB): string => `rgb(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0})`;
const rgba = (c: RGB, a: number): string =>
  `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;
const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// palette (colours of the layers themselves; grade desaturates globally)
const SKY_TOP: RGB = [10, 11, 14];
const SKY_HORIZON: RGB = [20, 22, 28];
const AMBER: RGB = [242, 194, 0]; // #f2c200
const CRIMSON: RGB = [209, 31, 42]; // #d11f2a
const SKYLINE_BACK: RGB = [13, 14, 18];
const SKYLINE_FRONT: RGB = [18, 19, 25];
const WIN_WARM: RGB = [255, 200, 120];
const ASPHALT: RGB = [13, 14, 18];
const FOG: RGB = [58, 62, 76];
const RAIN: RGB = [150, 170, 202];
const INK: RGB = [8, 9, 13];

// --- deterministic world data (built once) ----------------------------------
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

interface Tower {
  x: number;
  w: number;
  h: number;
  spire: number;
  win: number; // 0..1 fraction of the cells that are lit
}
function buildSkyline(seed: number, count: number, maxH: number): Tower[] {
  const rng = mulberry32(seed);
  const list: Tower[] = [];
  for (let i = 0; i < count; i++) {
    list.push({
      x: i / count + (rng() - 0.5) * 0.015,
      w: (0.85 / count) * (0.6 + rng()),
      h: maxH * (0.34 + rng() * 0.66),
      spire: rng() < 0.3 ? 0.05 + rng() * 0.1 : 0,
      win: rng() * 0.4,
    });
  }
  return list;
}
const SKY_FAR = buildSkyline(0xfa2, 22, 0.18);
const SKY_NEAR = buildSkyline(0x4e2, 14, 0.32);

interface Drop {
  x: number;
  y: number;
  len: number;
}
function buildRain(seed: number, n: number): Drop[] {
  const rng = mulberry32(seed);
  const list: Drop[] = [];
  for (let i = 0; i < n; i++) {
    list.push({ x: rng(), y: rng(), len: 0.015 + rng() * 0.03 });
  }
  return list;
}
const RAIN_LAYERS: { drops: Drop[]; speed: number; alpha: number }[] = [
  { drops: buildRain(0x1, 60), speed: 0.3, alpha: 0.08 },
  { drops: buildRain(0x2, 80), speed: 1.0, alpha: 0.12 },
  { drops: buildRain(0x3, 70), speed: 2.2, alpha: 0.16 },
];

function buildGrain(): { x: number; y: number }[] {
  const rng = mulberry32(0x6a17);
  const list: { x: number; y: number }[] = [];
  for (let i = 0; i < 360; i++) list.push({ x: rng(), y: rng() });
  return list;
}
const GRAIN = buildGrain();

// --- skyline plane ----------------------------------------------------------
function drawSkyline(
  ctx: CanvasRenderingContext2D,
  plane: Tower[],
  base: RGB,
  hY: number,
  W: number,
  H: number,
  cp: number,
  shiftX: number,
): void {
  for (const t of plane) {
    const bw = t.w * W;
    const bh = t.h * H;
    const bx = t.x * W + shiftX;
    const by = hY - bh;
    ctx.fillStyle = rgb(base);
    ctx.fillRect(bx, by, bw, bh);
    if (t.spire > 0) {
      ctx.strokeStyle = rgb(base);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + bw * 0.5, by);
      ctx.lineTo(bx + bw * 0.5, by - t.spire * H);
      ctx.stroke();
    }
    // lit windows — they go dark as the dawn colour bleeds in
    const lit = clamp01(1 - cp * 1.3);
    if (lit <= 0.02) continue;
    const cols = 3;
    const rows = Math.max(2, Math.floor(bh / (H * 0.03)));
    const gw = bw / (cols + 1);
    const gh = bh / (rows + 1);
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (((c * 7 + r * 13 + ((t.x * 131) | 0)) % 11) / 11 > t.win) continue;
        ctx.fillStyle = rgba(WIN_WARM, 0.5 * lit);
        ctx.fillRect(bx + gw * (c + 0.7), by + gh * (r + 0.7), gw * 0.4, gh * 0.5);
      }
    }
  }
}

// --- full scene (offscreen, natural colour) ---------------------------------
function drawScene(
  ctx: CanvasRenderingContext2D,
  progress: number,
  cp: number,
  amb: number,
  W: number,
  H: number,
): void {
  const hY = H * 0.4;
  const topHalf = W * 0.015; // ~3% wide at the horizon
  const botHalf = W * 0.8; // ~160% wide at the bottom
  const roadHalfAt = (y: number): number =>
    topHalf + (botHalf - topHalf) * clamp01((y - hY) / (H - hY));

  // 1 — dawn sky
  const sky = ctx.createLinearGradient(0, 0, 0, hY);
  sky.addColorStop(0, rgb(SKY_TOP));
  sky.addColorStop(1, rgb(SKY_HORIZON));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, hY);
  // dawn glow at the horizon ONLY (amber + crimson), ONLY from 59%
  if (cp > 0.001) {
    const gx = W * 0.5;
    const amberGlow = ctx.createRadialGradient(gx, hY, 4, gx, hY, H * 0.55);
    amberGlow.addColorStop(0, rgba(AMBER, 0.5 * cp));
    amberGlow.addColorStop(0.45, rgba(CRIMSON, 0.24 * cp));
    amberGlow.addColorStop(1, rgba(CRIMSON, 0));
    ctx.fillStyle = amberGlow;
    ctx.fillRect(0, 0, W, hY + H * 0.08);
  }

  // 2 — two-plane parallax skyline (back 0.7x / front 1x of a small drift)
  const drift = (progress - 0.5) * W * 0.06;
  drawSkyline(ctx, SKY_FAR, SKYLINE_BACK, hY, W, H, cp, drift * 0.7);
  drawSkyline(ctx, SKY_NEAR, SKYLINE_FRONT, hY, W, H, cp, drift);

  // 3 — our road: low angle from the horizon, wet asphalt + reflections
  ctx.fillStyle = rgb(ASPHALT);
  ctx.fillRect(0, hY, W, H - hY);
  ctx.beginPath();
  ctx.moveTo(W * 0.5 - topHalf, hY);
  ctx.lineTo(W * 0.5 + topHalf, hY);
  ctx.lineTo(W * 0.5 + botHalf, H);
  ctx.lineTo(W * 0.5 - botHalf, H);
  ctx.closePath();
  ctx.fillStyle = rgb(mix(ASPHALT, [22, 23, 29], 0.6));
  ctx.fill();
  // wet sheen reflecting the sky/dawn just under the horizon
  const sheen = ctx.createLinearGradient(0, hY, 0, hY + H * 0.22);
  sheen.addColorStop(0, rgba(mix([40, 44, 58], AMBER, cp * 0.5), 0.5));
  sheen.addColorStop(1, rgba(ASPHALT, 0));
  ctx.fillStyle = sheen;
  ctx.fillRect(0, hY, W, H * 0.22);
  // almost-invisible centre lane dashes
  ctx.fillStyle = rgba([200, 200, 190], 0.06);
  for (let i = 1; i <= 6; i++) {
    const d = i / 7;
    const y = hY + (H - hY) * d * d;
    const wdt = 1 + d * d * W * 0.01;
    ctx.fillRect(W * 0.5 - wdt / 2, y, wdt, Math.max(1, d * d * H * 0.03));
  }

  // 4 — the car: sits on the road, grows with perspective; static at the end
  const depth = easeInOut(progress);
  const cy = hY + (H * 0.94 - hY) * depth;
  const carW = roadHalfAt(cy) * 1.15;
  drawCar(ctx, { cx: W * 0.5, cy, w: carW, colorProgress: cp });

  // 5 — fog belt (35%..55% of the screen): dense, drifts sideways; the car
  // emerges from it (it is drawn over the distant car, under the near car)
  const fogTop = H * 0.33;
  const fogBot = H * 0.57;
  const fogDrift = Math.sin(amb * 0.06) * W * 0.05;
  for (let i = 0; i < 3; i++) {
    const band = ctx.createLinearGradient(0, fogTop, 0, fogBot);
    band.addColorStop(0, rgba(FOG, 0));
    band.addColorStop(0.5, rgba(FOG, 0.22 - i * 0.04));
    band.addColorStop(1, rgba(FOG, 0));
    ctx.save();
    ctx.translate(fogDrift * (i % 2 === 0 ? 1 : -1), (i - 1) * H * 0.02);
    ctx.fillStyle = band;
    ctx.fillRect(-W * 0.1, fogTop, W * 1.2, fogBot - fogTop);
    ctx.restore();
  }

  // 6 — rain: three layers at distinct speeds
  for (const layer of RAIN_LAYERS) {
    ctx.strokeStyle = rgba(RAIN, layer.alpha);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const d of layer.drops) {
      const yy = ((d.y + amb * layer.speed) % 1) * H;
      const xx = d.x * W;
      const L = d.len * H * (0.6 + layer.speed * 0.3);
      ctx.moveTo(xx, yy);
      ctx.lineTo(xx - L * 0.12, yy + L);
    }
    ctx.stroke();
  }
}

// --- post passes on the visible canvas (after the grayscale blit) -----------
function drawPost(
  ctx: CanvasRenderingContext2D,
  cp: number,
  amb: number,
  W: number,
  H: number,
): void {
  // warm wash global — only as colour bleeds in
  if (cp > 0.001) {
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = rgba([255, 178, 96], 0.55 * cp);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  // vignette
  const vg = ctx.createRadialGradient(
    W / 2,
    H * 0.54,
    Math.min(W, H) * 0.2,
    W / 2,
    H * 0.54,
    Math.max(W, H) * 0.74,
  );
  vg.addColorStop(0, "rgba(8,9,13,0)");
  vg.addColorStop(1, rgba(INK, 0.72 - cp * 0.16));
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  // neutral film grain
  const gt = Math.floor(amb * 18);
  ctx.fillStyle = "rgba(247,244,236,0.03)";
  for (let i = 0; i < GRAIN.length; i++) {
    const g = GRAIN[i];
    const jx = ((g.x + ((i * 73 + gt * 37) % 100) / 100) % 1) * W;
    const jy = ((g.y + ((i * 31 + gt * 53) % 100) / 100) % 1) * H;
    ctx.fillRect(jx, jy, 1, 1);
  }
}

export function JourneyCanvas({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scene = document.createElement("canvas");
    const sctx = scene.getContext("2d");
    if (!sctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const size = (): void => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      canvas.width = bw;
      canvas.height = bh;
      scene.width = bw;
      scene.height = bh;
    };

    const renderFrame = (progress: number, cp: number, amb: number): void => {
      // scene in CSS px
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sctx.clearRect(0, 0, w, h);
      drawScene(sctx, progress, cp, amb, w, h);
      // blit through the grayscale grade (device px, 1:1)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `grayscale(${(1 - cp).toFixed(3)})`;
      ctx.drawImage(scene, 0, 0);
      ctx.filter = "none";
      // post passes in CSS px
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawPost(ctx, cp, amb, w, h);
    };

    size();

    if (reduced) {
      const p = 0.66;
      renderFrame(p, clamp01((p - 0.59) / 0.41), 0);
      let resizeTimer = 0;
      const onResize = (): void => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          size();
          renderFrame(p, clamp01((p - 0.59) / 0.41), 0);
        }, 150);
      };
      window.addEventListener("resize", onResize);
      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
      };
    }

    let raf = 0;
    const start = performance.now();
    const loop = (): void => {
      if (document.visibilityState !== "hidden") {
        const amb = (performance.now() - start) / 1000;
        renderFrame(journeyStore.progress, journeyStore.colorProgress, amb);
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
