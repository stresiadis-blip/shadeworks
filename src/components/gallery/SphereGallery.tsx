"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import type { Project, ProjectCategory } from "@/data/projects";
import { CATEGORY_SHORT } from "@/data/projects";

type SphereGalleryProps = {
  projects: Project[];
  activeCategory: ProjectCategory | "all";
  onSelect: (project: Project) => void;
  onFirstDrag: () => void;
};

const RADIUS = 11;
const CARD_W = 3.4;
const CARD_H = 4.25;
const LERP = 0.1;
const MAX_LAT = THREE.MathUtils.degToRad(60);

// ── noir palette (Sin City) ──────────────────────────────────────
const NOIR = {
  black: "#000000",
  ink: "#0a0a0a",
  ghost: "#1a1a1a", // watermark ghost number
  bone: "#f7f4ec",
  muted: "#b8b1a3",
  red: "#d11f2a",
  yellow: "#f2c200",
};

/** Comic halftone dot field in one corner of a card. */
function halftoneCorner(
  ctx: CanvasRenderingContext2D,
  s: (n: number) => number,
  W: number,
  dark: boolean
) {
  ctx.save();
  ctx.fillStyle = dark ? "rgba(0,0,0,0.18)" : "rgba(247,244,236,0.16)";
  const step = s(11);
  for (let gy = 0; gy < 7; gy++) {
    for (let gx = 0; gx < 7; gx++) {
      const r = s(3.2) * (1 - (gx + gy) / 16); // fade outward
      if (r <= 0) continue;
      ctx.beginPath();
      ctx.arc(W - s(20) - gx * step, s(20) + gy * step, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Card image zone (unscaled, in the 512×640 card space): upper ~55%.
const IZ = { x: 20, y: 76, w: 472, h: 282 };

/** FerdiPoker is the only shipped product — its real screenshot lives here. */
const FERDI_SRC = "/work/ferdipoker.jpg";
// cache the loaded screenshot so we only fetch it once across all card draws
let ferdiImg: HTMLImageElement | null = null;

/** small seeded PRNG (LCG) so each concept mockup is unique but stable */
function seeded(seed: number) {
  let s = (seed * 2654435761) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** cover-fit + desaturate-ish draw of a real image into the card image zone */
function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  s: (n: number) => number,
  img: HTMLImageElement
) {
  const zx = s(IZ.x), zy = s(IZ.y), zw = s(IZ.w), zh = s(IZ.h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(zx, zy, zw, zh);
  ctx.clip();
  const ar = img.width / img.height;
  const zar = zw / zh;
  let dw = zw, dh = zh, dx = zx, dy = zy;
  if (ar > zar) { dw = zh * ar; dx = zx - (dw - zw) / 2; }
  else { dh = zw / ar; dy = zy - (dh - zh) / 2; }
  ctx.drawImage(img, dx, dy, dw, dh);
  // noir grade: knock back saturation with a dark multiply + raise contrast edge
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(zx, zy, zw, zh);
  const grad = ctx.createLinearGradient(0, zy, 0, zy + zh);
  grad.addColorStop(0, "rgba(0,0,0,0.05)");
  grad.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = grad;
  ctx.fillRect(zx, zy, zw, zh);
  ctx.restore();
}

/**
 * Procedural noir UI mockup for a CONCEPT card — an honest stylized sketch of
 * the project's category (NOT a fake screenshot). Lines only, one accent tick.
 */
function drawMockup(
  ctx: CanvasRenderingContext2D,
  s: (n: number) => number,
  category: ProjectCategory,
  inverted: boolean,
  accent: string,
  seed: number
) {
  const rnd = seeded(seed);
  const zx = s(IZ.x), zy = s(IZ.y), zw = s(IZ.w), zh = s(IZ.h);
  const line = inverted ? "rgba(10,10,10,0.82)" : "rgba(247,244,236,0.8)";
  const dim = inverted ? "rgba(10,10,10,0.32)" : "rgba(247,244,236,0.28)";

  ctx.save();
  ctx.beginPath();
  ctx.rect(zx, zy, zw, zh);
  ctx.clip();
  ctx.translate(zx, zy);

  if (category === "custom-code") {
    // terminal: title bar + 3 dots, then code rows of varying width
    ctx.fillStyle = dim;
    ctx.fillRect(s(18), s(18), zw - s(36), s(26));
    ctx.fillStyle = line;
    for (let d = 0; d < 3; d++) {
      ctx.beginPath();
      ctx.arc(s(34) + d * s(20), s(31), s(4), 0, Math.PI * 2);
      ctx.fill();
    }
    let yy = s(70);
    for (let r = 0; r < 9; r++) {
      const indent = s(24 + (rnd() < 0.4 ? 24 : 0) + (rnd() < 0.2 ? 24 : 0));
      const wdt = s(70 + rnd() * 240);
      ctx.fillStyle = r === 4 && rnd() > 0.3 ? accent : line;
      ctx.globalAlpha = 0.55 + rnd() * 0.4;
      ctx.fillRect(indent, yy, wdt, s(8));
      // occasional syntax tick
      if (rnd() > 0.6) {
        ctx.fillStyle = accent;
        ctx.fillRect(indent + wdt + s(10), yy, s(18), s(8));
      }
      ctx.globalAlpha = 1;
      yy += s(24);
    }
    // cursor block
    ctx.fillStyle = accent;
    ctx.fillRect(s(24), yy, s(14), s(16));
  } else if (category === "control-panels") {
    // dashboard: KPI blocks, bar chart, sparkline, gauge arc
    for (let k = 0; k < 3; k++) {
      const bx = s(18) + k * s((IZ.w - 36) / 3);
      ctx.strokeStyle = dim;
      ctx.lineWidth = s(1);
      ctx.strokeRect(bx, s(18), s((IZ.w - 36) / 3 - 12), s(56));
      ctx.fillStyle = k === 1 ? accent : line;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(bx + s(10), s(32), s(40 + rnd() * 50), s(14));
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = line;
      ctx.fillRect(bx + s(10), s(54), s(60), s(7));
      ctx.globalAlpha = 1;
    }
    // bar chart
    const baseY = s(212);
    for (let b = 0; b < 8; b++) {
      const bh = s(20 + rnd() * 96);
      ctx.fillStyle = b === 5 ? accent : line;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(s(24) + b * s(30), baseY - bh, s(18), bh);
    }
    ctx.globalAlpha = 1;
    // sparkline
    ctx.strokeStyle = line;
    ctx.lineWidth = s(2);
    ctx.beginPath();
    for (let p = 0; p <= 10; p++) {
      const px = s(280) + p * s(16);
      const py = s(120) + Math.sin(p + seed) * s(18) - rnd() * s(14);
      p === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
  } else {
    // megaphone: rising line chart with nodes + audience dots + signal wave
    const pts: { x: number; y: number }[] = [];
    let py = s(150);
    for (let p = 0; p <= 7; p++) {
      const px = s(20) + p * s(48);
      if (p > 0) py -= s(6 + rnd() * 26);
      pts.push({ x: px, y: py });
    }
    ctx.strokeStyle = line;
    ctx.lineWidth = s(2.5);
    ctx.beginPath();
    pts.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
    ctx.stroke();
    pts.forEach((pt, i) => {
      ctx.fillStyle = i === 5 ? accent : line;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, s(4), 0, Math.PI * 2);
      ctx.fill();
    });
    // audience dots spreading from lower-left
    const ox = s(60), oy = s(232);
    for (let d = 0; d < 26; d++) {
      const ang = (d / 26) * Math.PI - Math.PI * 0.1;
      const rad = s(20 + rnd() * 150);
      ctx.fillStyle = d % 9 === 0 ? accent : dim;
      ctx.beginPath();
      ctx.arc(ox + Math.cos(ang) * rad, oy - Math.abs(Math.sin(ang)) * rad * 0.5, s(3.5), 0, Math.PI * 2);
      ctx.fill();
    }
    // signal wave at bottom
    ctx.strokeStyle = accent;
    ctx.lineWidth = s(2);
    ctx.beginPath();
    for (let x = 0; x <= zw; x += s(6)) {
      const yy = s(252) + Math.sin(x / s(22) + seed) * s(10);
      x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Noir card texture — high-contrast Sin City comic panel with a preview zone.
 * Three variants: NEGATIVE (black/bone, most), INVERTED (bone/black, ~1 in 5),
 * FEATURED (FerdiPoker — black with blood-red accents, the "red dress").
 */
function makeCardTexture(project: Project, isMobile: boolean): THREE.CanvasTexture {
  const scale = isMobile ? 0.5 : 1;
  const W = Math.round(512 * scale);
  const H = Math.round(640 * scale);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const s = (n: number) => n * scale;

  const n = parseInt(project.id.slice(1), 10) || 0;
  const featured = project.slug === "ferdipoker";
  const inverted = !featured && n % 5 === 2; // p07, p12, p17, ...
  // yellow tag on a sprinkle of (non-inverted, non-featured) cards — never with red
  const yellowTag = !featured && !inverted && n % 4 === 0;

  const bg = inverted ? NOIR.bone : NOIR.black;
  const fg = inverted ? NOIR.black : NOIR.bone;
  const sub = inverted ? "rgba(10,10,10,0.62)" : NOIR.muted;
  const borderCol = inverted ? "rgba(0,0,0,0.85)" : "rgba(247,244,236,0.85)";
  const accent = featured ? NOIR.red : fg;

  // background — pure flat panel
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // big ghost index watermark
  ctx.font = `900 ${s(280)}px "Arial Black", Impact, sans-serif`;
  ctx.fillStyle = inverted ? "rgba(0,0,0,0.06)" : "rgba(247,244,236,0.05)";
  ctx.textAlign = "right";
  ctx.fillText(project.id.slice(1), W - s(20), H - s(150));
  ctx.textAlign = "left";

  // halftone corner (comic print)
  halftoneCorner(ctx, s, W, inverted);

  // ── category tag pill (top-left) ──
  const cat = CATEGORY_SHORT[project.category];
  ctx.font = `${s(17)}px ui-monospace, monospace`;
  const catW = ctx.measureText(cat).width + s(26);
  let tagBg: string | null = null;
  let tagText = fg;
  if (featured) {
    tagBg = NOIR.red;
    tagText = NOIR.bone;
  } else if (yellowTag) {
    tagBg = NOIR.yellow;
    tagText = NOIR.black;
  }
  if (tagBg) {
    ctx.fillStyle = tagBg;
    ctx.fillRect(s(30), s(34), catW, s(34));
    ctx.fillStyle = tagText;
  } else {
    ctx.strokeStyle = inverted ? "rgba(0,0,0,0.5)" : "rgba(247,244,236,0.45)";
    ctx.lineWidth = s(1.5);
    ctx.strokeRect(s(30), s(34), catW, s(34));
    ctx.fillStyle = fg;
  }
  ctx.fillText(cat, s(43), s(57));

  // ── status badge (top-right) ──
  const status = project.status;
  let stCol = inverted ? "rgba(0,0,0,0.55)" : "rgba(247,244,236,0.55)"; // CONCEPT
  if (status === "IN PROGRESS") stCol = NOIR.yellow;
  if (status === "LIVE") stCol = NOIR.red;
  ctx.font = `${s(16)}px ui-monospace, monospace`;
  const stW = ctx.measureText(status).width + s(24);
  ctx.textAlign = "left";
  if (status === "LIVE") {
    ctx.fillStyle = NOIR.red;
    ctx.fillRect(W - s(30) - stW, s(34), stW, s(34));
    ctx.fillStyle = NOIR.bone;
  } else {
    ctx.strokeStyle = stCol;
    ctx.lineWidth = s(1.5);
    ctx.strokeRect(W - s(30) - stW, s(34), stW, s(34));
    ctx.fillStyle = stCol;
  }
  ctx.fillText(status, W - s(30) - stW + s(12), s(57));

  // ── image / preview zone (upper ~55%) ──
  const zx = s(IZ.x), zy = s(IZ.y), zw = s(IZ.w), zh = s(IZ.h);
  // zone panel bg — slightly off the card bg for a framed preview
  ctx.fillStyle = inverted ? "#e8e3d6" : "#070708";
  ctx.fillRect(zx, zy, zw, zh);
  const mockAccent = featured ? NOIR.red : NOIR.yellow;
  if (featured) {
    if (ferdiImg && ferdiImg.complete && ferdiImg.naturalWidth > 0) {
      drawCoverImage(ctx, s, ferdiImg);
    } else {
      // honest noir placeholder until the real screenshot is dropped in
      ctx.save();
      ctx.beginPath();
      ctx.rect(zx, zy, zw, zh);
      ctx.clip();
      ctx.fillStyle = "rgba(209,31,42,0.10)";
      ctx.fillRect(zx, zy, zw, zh);
      ctx.font = `900 ${s(34)}px "Arial Black", Impact, sans-serif`;
      ctx.fillStyle = "rgba(247,244,236,0.85)";
      ctx.fillText("FERDIPOKER.RO", zx + s(22), zy + zh / 2);
      ctx.font = `${s(15)}px ui-monospace, monospace`;
      ctx.fillStyle = NOIR.red;
      ctx.fillText("LIVE · MTT POKER TRAINING", zx + s(22), zy + zh / 2 + s(30));
      ctx.restore();
    }
  } else {
    drawMockup(ctx, s, project.category, inverted, mockAccent, n * 97 + 13);
  }
  // halftone over one corner of the image zone
  ctx.save();
  ctx.fillStyle = inverted ? "rgba(0,0,0,0.16)" : "rgba(247,244,236,0.14)";
  for (let gy = 0; gy < 5; gy++) {
    for (let gx = 0; gx < 5; gx++) {
      const r = s(2.6) * (1 - (gx + gy) / 12);
      if (r <= 0) continue;
      ctx.beginPath();
      ctx.arc(zx + s(16) + gx * s(10), zy + s(16) + gy * s(10), r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  // zone frame + separator line under it
  ctx.strokeStyle = inverted ? "rgba(0,0,0,0.4)" : "rgba(247,244,236,0.22)";
  ctx.lineWidth = s(1);
  ctx.strokeRect(zx, zy, zw, zh);
  ctx.strokeStyle = featured ? NOIR.red : inverted ? "rgba(0,0,0,0.5)" : "rgba(247,244,236,0.4)";
  ctx.lineWidth = s(2);
  ctx.beginPath();
  ctx.moveTo(zx, zy + zh + s(6));
  ctx.lineTo(zx + zw, zy + zh + s(6));
  ctx.stroke();

  // ── title — heavy condensed display, large ──
  ctx.fillStyle = fg;
  const title = project.title.toUpperCase();
  let titleSize = 50;
  ctx.font = `900 ${s(titleSize)}px "Arial Black", Impact, sans-serif`;
  while (ctx.measureText(title).width > W - s(56) && titleSize > 30) {
    titleSize -= 3;
    ctx.font = `900 ${s(titleSize)}px "Arial Black", Impact, sans-serif`;
  }
  const titleY = s(414);
  ctx.fillText(title, s(28), titleY, W - s(56));

  // title underline — blood red for featured, accent rule otherwise
  ctx.fillStyle = featured ? NOIR.red : inverted ? NOIR.black : NOIR.bone;
  ctx.fillRect(s(28), titleY + s(18), s(featured ? 130 : 64), s(featured ? 7 : 4));

  // year — top-right of metadata band
  ctx.font = `${s(16)}px ui-monospace, monospace`;
  ctx.fillStyle = sub;
  ctx.textAlign = "right";
  ctx.fillText(project.year, W - s(28), s(410));
  ctx.textAlign = "left";

  // ── description — 2 lines max, readable ──
  ctx.font = `${s(19)}px ui-monospace, monospace`;
  ctx.fillStyle = sub;
  const words = project.description.toUpperCase().split(" ");
  let line = "";
  let y = s(470);
  let lines = 0;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > W - s(56) && line) {
      ctx.fillText(line, s(28), y);
      line = w;
      y += s(28);
      lines++;
      if (lines >= 2) {
        line = line + "…";
        break;
      }
    } else {
      line = test;
    }
  }
  if (lines < 2) ctx.fillText(line, s(28), y);

  // ── tech tag pills (bottom) ──
  ctx.font = `${s(15)}px ui-monospace, monospace`;
  let tx = s(28);
  for (const tag of project.tags) {
    const t = tag.toUpperCase();
    const tw = ctx.measureText(t).width + s(22);
    ctx.strokeStyle = inverted ? "rgba(0,0,0,0.35)" : "rgba(247,244,236,0.3)";
    ctx.lineWidth = s(1);
    ctx.strokeRect(tx, s(566), tw, s(34));
    ctx.fillStyle = inverted ? "rgba(10,10,10,0.7)" : NOIR.muted;
    ctx.fillText(t, tx + s(11), s(588));
    tx += tw + s(10);
  }

  // ── outer border (1px feel) ──
  ctx.strokeStyle = featured ? NOIR.red : borderCol;
  ctx.lineWidth = s(featured ? 3 : 2);
  ctx.strokeRect(s(2), s(2), W - s(4), H - s(4));
  void accent;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  // FerdiPoker — load the real screenshot async, then repaint its image zone.
  if (featured && !(ferdiImg && ferdiImg.complete && ferdiImg.naturalWidth > 0)) {
    const img = new Image();
    img.onload = () => {
      ferdiImg = img;
      drawCoverImage(ctx, s, img);
      // restore the zone frame over the freshly drawn image
      ctx.strokeStyle = NOIR.red;
      ctx.lineWidth = s(1);
      ctx.strokeRect(s(IZ.x), s(IZ.y), s(IZ.w), s(IZ.h));
      texture.needsUpdate = true;
    };
    img.onerror = () => {
      // asset not present yet — noir placeholder stays. User drops it later.
      console.warn(`[gallery] Missing FerdiPoker screenshot at public${FERDI_SRC} — using placeholder.`);
    };
    img.src = FERDI_SRC;
  }

  return texture;
}

/**
 * Noir atmosphere backdrop — deep murky city air on a giant cylinder behind
 * the gallery. Soft fog bands, a faint distant skyline silhouette mostly
 * swallowed by haze, and a pale moon veiled by fog. No figures, no hard shapes.
 */
function makeBackdropTexture(isMobile: boolean): THREE.CanvasTexture {
  const scale = isMobile ? 0.5 : 1;
  const W = Math.round(4096 * scale);
  const H = Math.round(1280 * scale);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const s = (n: number) => n * scale;

  // deep night base
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);

  // murky vertical haze — lighter toward the horizon band, dark top & bottom
  const haze = ctx.createLinearGradient(0, 0, 0, H);
  haze.addColorStop(0, "#000000");
  haze.addColorStop(0.55, "#070708");
  haze.addColorStop(0.72, "#101013"); // horizon glow band
  haze.addColorStop(0.82, "#0a0a0c");
  haze.addColorStop(1, "#000000");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, W, H);

  const horizon = s(940);

  // veiled moon — pale, soft halo, sits in the haze band
  const moonX = s(2750);
  const moonY = s(560);
  const halo = ctx.createRadialGradient(moonX, moonY, s(40), moonX, moonY, s(460));
  halo.addColorStop(0, "rgba(210,214,224,0.18)");
  halo.addColorStop(1, "rgba(210,214,224,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(moonX - s(460), moonY - s(460), s(920), s(920));
  const moon = ctx.createRadialGradient(moonX, moonY, s(10), moonX, moonY, s(120));
  moon.addColorStop(0, "rgba(225,228,235,0.55)");
  moon.addColorStop(0.7, "rgba(200,205,215,0.32)");
  moon.addColorStop(1, "rgba(200,205,215,0)");
  ctx.fillStyle = moon;
  ctx.beginPath();
  ctx.arc(moonX, moonY, s(120), 0, Math.PI * 2);
  ctx.fill();

  // faint distant skyline silhouette — barely-there building shapes, low,
  // mostly swallowed by fog; occasional tiny warm/red window light.
  let bx = -s(40);
  let bi = 7;
  while (bx < W) {
    const seed = (bi * 73 + 31) % 100;
    const bw = s(140 + (seed % 6) * 64);
    const bh = s(120 + ((seed * 7) % 320));
    const top = horizon - bh;
    // building body — only a touch above the haze, very dark
    ctx.fillStyle = "rgba(8,9,12,0.9)";
    ctx.fillRect(bx, top, bw, bh);
    // sparse window lights, faint, mostly warm with a rare red
    const cols = Math.max(2, Math.floor(bw / s(54)));
    const rows = Math.max(2, Math.floor(bh / s(72)));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((seed * (r + 2) * (c + 3)) % 23 < 1) {
          const red = (seed * (r + 1) * (c + 1)) % 11 === 0;
          ctx.fillStyle = red
            ? "rgba(209,31,42,0.32)"
            : `rgba(196,176,128,${0.10 + ((seed * r) % 4) * 0.04})`;
          ctx.fillRect(bx + s(16) + c * s(54), top + s(22) + r * s(72), s(14), s(20));
        }
      }
    }
    bx += bw + s(6 + (seed % 4) * 14);
    bi++;
  }

  // fog veil over the skyline — pushes buildings deep into the murk
  const fog = ctx.createLinearGradient(0, horizon - s(360), 0, horizon + s(40));
  fog.addColorStop(0, "rgba(8,9,12,0)");
  fog.addColorStop(0.7, "rgba(8,9,12,0.6)");
  fog.addColorStop(1, "rgba(6,6,9,0.92)");
  ctx.fillStyle = fog;
  ctx.fillRect(0, horizon - s(360), W, s(400));

  // soft drifting haze blobs for volumetric depth
  for (let i = 0; i < 7; i++) {
    const hx = (i * 631) % W;
    const hy = horizon - s(120) - ((i * 217) % 260);
    const hr = s(280 + ((i * 97) % 240));
    const g = ctx.createRadialGradient(hx, hy, s(10), hx, hy, hr);
    g.addColorStop(0, `rgba(24,26,32,${0.10 + (i % 3) * 0.03})`);
    g.addColorStop(1, "rgba(24,26,32,0)");
    ctx.fillStyle = g;
    ctx.fillRect(hx - hr, hy - hr, hr * 2, hr * 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Evenly distribute n cards on the inner sphere surface (lat/long rings). */
function layoutPositions(n: number): { phi: number; theta: number }[] {
  const out: { phi: number; theta: number }[] = [];
  // rows of ~6, latitudes spread within ±40°
  const rows = Math.max(2, Math.min(4, Math.ceil(n / 6)));
  const perRow: number[] = [];
  let left = n;
  for (let r = 0; r < rows; r++) {
    const c = Math.ceil(left / (rows - r));
    perRow.push(c);
    left -= c;
  }
  perRow.forEach((count, r) => {
    const lat =
      rows === 1 ? 0 : THREE.MathUtils.degToRad(-38 + (76 * r) / (rows - 1));
    const offset = (r % 2) * (Math.PI / count); // stagger alternate rows
    for (let i = 0; i < count; i++) {
      out.push({ phi: Math.PI / 2 - lat, theta: offset + (i * Math.PI * 2) / count });
    }
  });
  return out;
}

function sphericalToVec(phi: number, theta: number, radius = RADIUS): THREE.Vector3 {
  return new THREE.Vector3().setFromSphericalCoords(radius, phi, theta);
}

export function SphereGallery({
  projects,
  activeCategory,
  onSelect,
  onFirstDrag,
}: SphereGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    meshes: Map<string, THREE.Mesh>;
    transitioning: boolean;
  }>({ meshes: new Map(), transitioning: false });
  const onSelectRef = useRef(onSelect);
  const onFirstDragRef = useRef(onFirstDrag);
  onSelectRef.current = onSelect;
  onFirstDragRef.current = onFirstDrag;

  // ── scene lifecycle ──────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");
    scene.fog = new THREE.Fog("#000000", RADIUS * 0.9, RADIUS * 2.6);

    const camera = new THREE.PerspectiveCamera(
      isMobile ? 90 : 80,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 0.001);

    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Sin City backdrop — noir city on a cylinder around the gallery
    const backdropRadius = RADIUS * 1.5;
    const backdropHeight = (2 * Math.PI * backdropRadius) * (1280 / 4096);
    const backdropTexture = makeBackdropTexture(isMobile);
    backdropTexture.wrapS = THREE.RepeatWrapping;
    const backdropMaterial = new THREE.MeshBasicMaterial({
      map: backdropTexture,
      side: THREE.BackSide,
    });
    const backdrop = new THREE.Mesh(
      new THREE.CylinderGeometry(backdropRadius, backdropRadius, backdropHeight, 64, 1, true),
      backdropMaterial
    );
    backdrop.position.y = -backdropHeight * 0.12; // street sits below eye level
    scene.add(backdrop);

    // cards
    const meshes = new Map<string, THREE.Mesh>();
    const group = new THREE.Group();
    scene.add(group);

    const positions = layoutPositions(projects.length);
    projects.forEach((project, i) => {
      const texture = makeCardTexture(project, isMobile);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
      });
      // slightly curved plane: bend vertices onto the sphere
      const geo = new THREE.PlaneGeometry(CARD_W, CARD_H, 6, 6);
      const pos = geo.attributes.position;
      for (let v = 0; v < pos.count; v++) {
        const x = pos.getX(v);
        const z = -(x * x) / (2 * RADIUS); // gentle horizontal curvature toward center
        pos.setZ(v, z);
      }
      geo.computeVertexNormals();

      const mesh = new THREE.Mesh(geo, material);
      const { phi, theta } = positions[i];
      mesh.position.copy(sphericalToVec(phi, theta));
      mesh.lookAt(0, 0, 0);
      mesh.userData = { project, baseScale: 1 };
      group.add(mesh);
      meshes.set(project.id, mesh);
    });
    stateRef.current.meshes = meshes;

    // ── drag controls with lerp + inertia ──────────────────────
    let lon = 0;
    let lat = 0;
    let targetLon = 0;
    let targetLat = 0;
    let velLon = 0;
    let velLat = 0;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let firstDragFired = false;

    const dom = renderer.domElement;
    dom.style.touchAction = "none";
    dom.style.cursor = "grab";

    const onPointerDown = (e: PointerEvent) => {
      if (stateRef.current.transitioning) return;
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      velLon = 0;
      velLat = 0;
      dom.style.cursor = "grabbing";
      dom.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / container.clientWidth) * 2 - 1;
      pointer.y = -(e.clientY / container.clientHeight) * 2 + 1;
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      lastX = e.clientX;
      lastY = e.clientY;
      const speed = (camera.fov / 80) * 0.0028;
      targetLon -= dx * speed;
      targetLat += dy * speed;
      targetLat = THREE.MathUtils.clamp(targetLat, -MAX_LAT, MAX_LAT);
      velLon = -dx * speed;
      velLat = dy * speed;
      if (!firstDragFired && moved > 24) {
        firstDragFired = true;
        onFirstDragRef.current();
      }
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      dom.style.cursor = "grab";
      if (moved < 8) handleClick(e);
    };

    // ── raycaster: hover + click ────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);
    let hovered: THREE.Mesh | null = null;

    const intersectCard = (): THREE.Mesh | null => {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(group.children, false);
      const hit = hits.find((h) => h.object.visible && (h.object as THREE.Mesh).userData.project);
      return (hit?.object as THREE.Mesh) ?? null;
    };

    const handleClick = (e: PointerEvent) => {
      if (stateRef.current.transitioning) return;
      pointer.x = (e.clientX / container.clientWidth) * 2 - 1;
      pointer.y = -(e.clientY / container.clientHeight) * 2 + 1;
      const mesh = intersectCard();
      if (!mesh) return;
      const project = mesh.userData.project as Project;
      stateRef.current.transitioning = true;
      // camera pushes toward the card, scene fades, then navigate
      const dir = mesh.position.clone().normalize();
      const camTarget = dir.multiplyScalar(RADIUS * 0.55);
      gsap.to(camera.position, {
        x: camTarget.x,
        y: camTarget.y,
        z: camTarget.z,
        duration: 0.9,
        ease: "power3.inOut",
      });
      gsap.to(camera, {
        fov: 50,
        duration: 0.9,
        ease: "power3.inOut",
        onUpdate: () => camera.updateProjectionMatrix(),
      });
      gsap.to(container, {
        opacity: 0,
        duration: 0.55,
        delay: 0.45,
        ease: "power2.in",
        onComplete: () => onSelectRef.current(project),
      });
    };

    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("pointercancel", onPointerUp);

    // ── resize ──────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── render loop ─────────────────────────────────────────────
    let raf = 0;
    const lookTarget = new THREE.Vector3();
    const animate = () => {
      raf = requestAnimationFrame(animate);

      if (!dragging) {
        // inertia decay
        targetLon += velLon;
        targetLat = THREE.MathUtils.clamp(targetLat + velLat, -MAX_LAT, MAX_LAT);
        velLon *= 0.94;
        velLat *= 0.94;
      }
      lon += (targetLon - lon) * LERP;
      lat += (targetLat - lat) * LERP;

      backdrop.rotation.y += 0.00035; // city drifts slowly behind the cards

      if (!stateRef.current.transitioning) {
        const phi = Math.PI / 2 - lat;
        lookTarget.setFromSphericalCoords(1, phi, lon);
        camera.lookAt(lookTarget);
      }

      // hover
      if (!stateRef.current.transitioning && !dragging) {
        const hit = intersectCard();
        if (hit !== hovered) {
          if (hovered) {
            gsap.to(hovered.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: "power2.out" });
            const m = hovered.material as THREE.MeshBasicMaterial;
            gsap.to(m.color, { r: 1, g: 1, b: 1, duration: 0.35 });
          }
          hovered = hit;
          if (hovered) {
            gsap.to(hovered.scale, { x: 1.07, y: 1.07, z: 1.07, duration: 0.35, ease: "power2.out" });
            const m = hovered.material as THREE.MeshBasicMaterial;
            gsap.to(m.color, { r: 1.25, g: 1.25, b: 1.25, duration: 0.35 });
            dom.style.cursor = "pointer";
          } else if (!dragging) {
            dom.style.cursor = "grab";
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // chrome entrance fade for the canvas itself
    gsap.fromTo(container, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.out" });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointercancel", onPointerUp);
      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        const m = mesh.material as THREE.MeshBasicMaterial;
        m.map?.dispose();
        m.dispose();
      });
      backdrop.geometry.dispose();
      backdropTexture.dispose();
      backdropMaterial.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── filter animation: hide non-matching, redistribute the rest ──
  useEffect(() => {
    const { meshes } = stateRef.current;
    if (meshes.size === 0) return;

    const visible = projects.filter(
      (p) => activeCategory === "all" || p.category === activeCategory
    );
    const positions = layoutPositions(visible.length);

    projects.forEach((project) => {
      const mesh = meshes.get(project.id);
      if (!mesh) return;
      const idx = visible.findIndex((p) => p.id === project.id);
      if (idx === -1) {
        gsap.to(mesh.scale, {
          x: 0.001,
          y: 0.001,
          z: 0.001,
          duration: 0.5,
          ease: "power3.in",
          onComplete: () => {
            mesh.visible = false;
          },
        });
      } else {
        const { phi, theta } = positions[idx];
        const target = sphericalToVec(phi, theta);
        mesh.visible = true;
        gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: "power3.out", delay: 0.15 });
        gsap.to(mesh.position, {
          x: target.x,
          y: target.y,
          z: target.z,
          duration: 0.9,
          ease: "power3.inOut",
          onUpdate: () => mesh.lookAt(0, 0, 0),
        });
      }
    });
  }, [activeCategory, projects]);

  return <div ref={containerRef} className="fixed inset-0 z-0" aria-label="Project gallery" />;
}
