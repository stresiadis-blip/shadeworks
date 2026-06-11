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

/**
 * Noir card texture — high-contrast Sin City comic panel.
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

  // ── title — heavy condensed display, large ──
  ctx.fillStyle = fg;
  const title = project.title.toUpperCase();
  let titleSize = 58;
  ctx.font = `900 ${s(titleSize)}px "Arial Black", Impact, sans-serif`;
  while (ctx.measureText(title).width > W - s(56) && titleSize > 32) {
    titleSize -= 3;
    ctx.font = `900 ${s(titleSize)}px "Arial Black", Impact, sans-serif`;
  }
  const titleY = s(370);
  ctx.fillText(title, s(28), titleY, W - s(56));

  // title underline — blood red for featured, accent rule otherwise
  ctx.fillStyle = featured ? NOIR.red : inverted ? NOIR.black : NOIR.bone;
  ctx.fillRect(s(28), titleY + s(22), s(featured ? 130 : 64), s(featured ? 7 : 4));

  // year — under the underline, right
  ctx.font = `${s(16)}px ui-monospace, monospace`;
  ctx.fillStyle = sub;
  ctx.textAlign = "right";
  ctx.fillText(project.year, W - s(28), s(366));
  ctx.textAlign = "left";

  // ── description — 2 lines max, readable ──
  ctx.font = `${s(19)}px ui-monospace, monospace`;
  ctx.fillStyle = sub;
  const words = project.description.toUpperCase().split(" ");
  let line = "";
  let y = s(434);
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
  return texture;
}

/**
 * Sin City backdrop — hard black/white noir city painted on a giant cylinder
 * around the gallery. Selective color only: the red car, the yellow dress.
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
  const WHITE = "#f2f2f2";
  const RED = "#e5253d";
  const YELLOW = "#ffd400";

  // pitch black night
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);

  // moon — huge, stark white, halo
  const moonX = s(2750);
  const moonY = s(230);
  const halo = ctx.createRadialGradient(moonX, moonY, s(80), moonX, moonY, s(420));
  halo.addColorStop(0, "rgba(242,242,242,0.22)");
  halo.addColorStop(1, "rgba(242,242,242,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(moonX - s(420), moonY - s(420), s(840), s(840));
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.arc(moonX, moonY, s(130), 0, Math.PI * 2);
  ctx.fill();

  // street level + horizon
  const streetY = s(950);

  // skyline — black monoliths with stark white rim light + sparse lit windows
  let bx = 0;
  let bi = 0;
  while (bx < W) {
    const seed = (bi * 73 + 31) % 100;
    const bw = s(120 + (seed % 5) * 70);
    const bh = s(260 + ((seed * 7) % 420));
    const top = streetY - bh;
    ctx.fillStyle = "#050505";
    ctx.fillRect(bx, top, bw, bh);
    // white rim light on one vertical edge + roofline
    ctx.strokeStyle = `rgba(242,242,242,${0.25 + (seed % 4) * 0.12})`;
    ctx.lineWidth = s(3);
    ctx.beginPath();
    ctx.moveTo(bx + bw, top);
    ctx.lineTo(bx, top);
    ctx.lineTo(bx, top + bh);
    ctx.stroke();
    // lit windows — sparse, harsh white
    const cols = Math.max(2, Math.floor(bw / s(46)));
    const rows = Math.max(3, Math.floor(bh / s(60)));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((seed * (r + 2) * (c + 3)) % 17 < 2) {
          ctx.fillStyle = `rgba(242,242,242,${0.5 + ((seed * r) % 5) * 0.1})`;
          ctx.fillRect(bx + s(14) + c * s(46), top + s(20) + r * s(60), s(18), s(26));
        }
      }
    }
    bx += bw + s(8 + (seed % 3) * 20);
    bi++;
  }

  // street — dark asphalt with white center dashes and curb light
  ctx.fillStyle = "#080808";
  ctx.fillRect(0, streetY, W, H - streetY);
  ctx.strokeStyle = "rgba(242,242,242,0.55)";
  ctx.lineWidth = s(3);
  ctx.beginPath();
  ctx.moveTo(0, streetY + s(2));
  ctx.lineTo(W, streetY + s(2));
  ctx.stroke();
  ctx.lineWidth = s(6);
  ctx.setLineDash([s(70), s(60)]);
  ctx.strokeStyle = "rgba(242,242,242,0.4)";
  ctx.beginPath();
  ctx.moveTo(0, streetY + s(170));
  ctx.lineTo(W, streetY + s(170));
  ctx.stroke();
  ctx.setLineDash([]);

  // ── SCENE 1: gangster, trench coat + fedora, under a streetlamp ──
  {
    const x = s(420);
    const ground = streetY + s(40);
    // lamp pole + head
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = s(7);
    ctx.beginPath();
    ctx.moveTo(x + s(180), ground);
    ctx.lineTo(x + s(180), ground - s(560));
    ctx.lineTo(x + s(110), ground - s(560));
    ctx.stroke();
    // light cone
    const cone = ctx.createLinearGradient(0, ground - s(540), 0, ground);
    cone.addColorStop(0, "rgba(242,242,242,0.5)");
    cone.addColorStop(1, "rgba(242,242,242,0.06)");
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(x + s(110), ground - s(545));
    ctx.lineTo(x - s(60), ground);
    ctx.lineTo(x + s(260), ground);
    ctx.closePath();
    ctx.fill();
    // figure — solid black silhouette inside the light
    ctx.fillStyle = "#000000";
    const fx = x + s(90);
    // legs
    ctx.fillRect(fx - s(28), ground - s(120), s(22), s(120));
    ctx.fillRect(fx + s(8), ground - s(120), s(22), s(120));
    // trench coat — flared
    ctx.beginPath();
    ctx.moveTo(fx - s(36), ground - s(330));
    ctx.lineTo(fx + s(38), ground - s(330));
    ctx.lineTo(fx + s(64), ground - s(100));
    ctx.lineTo(fx - s(62), ground - s(100));
    ctx.closePath();
    ctx.fill();
    // shoulders + head + fedora
    ctx.fillRect(fx - s(40), ground - s(360), s(82), s(40));
    ctx.beginPath();
    ctx.arc(fx, ground - s(385), s(26), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(fx - s(48), ground - s(404), s(98), s(10)); // brim
    ctx.beginPath(); // crown
    ctx.moveTo(fx - s(26), ground - s(404));
    ctx.lineTo(fx - s(18), ground - s(442));
    ctx.lineTo(fx + s(20), ground - s(442));
    ctx.lineTo(fx + s(28), ground - s(404));
    ctx.closePath();
    ctx.fill();
    // cigarette ember — single crimson dot (one colored element in this zone)
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(fx + s(30), ground - s(376), s(4), 0, Math.PI * 2);
    ctx.fill();
  }

  // ── SCENE 2: red car driving down the street ──
  {
    const x = s(1280);
    const y = streetY + s(95);
    // speed lines behind
    ctx.strokeStyle = "rgba(242,242,242,0.35)";
    ctx.lineWidth = s(4);
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x - s(420) - i * s(28), y - s(20) - i * s(22));
      ctx.lineTo(x - s(140) - i * s(14), y - s(20) - i * s(22));
      ctx.stroke();
    }
    // red glow
    const glow = ctx.createRadialGradient(x + s(120), y - s(40), s(20), x + s(120), y - s(40), s(420));
    glow.addColorStop(0, "rgba(229,37,61,0.30)");
    glow.addColorStop(1, "rgba(229,37,61,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - s(320), y - s(420), s(880), s(700));
    // body — classic sedan profile
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.moveTo(x - s(150), y);
    ctx.lineTo(x - s(135), y - s(52));
    ctx.lineTo(x - s(50), y - s(62));
    ctx.lineTo(x - s(10), y - s(108));
    ctx.lineTo(x + s(170), y - s(108));
    ctx.lineTo(x + s(230), y - s(60));
    ctx.lineTo(x + s(330), y - s(48));
    ctx.lineTo(x + s(340), y);
    ctx.closePath();
    ctx.fill();
    // windows — black
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(x + s(2), y - s(100));
    ctx.lineTo(x + s(160), y - s(100));
    ctx.lineTo(x + s(205), y - s(64));
    ctx.lineTo(x - s(30), y - s(64));
    ctx.closePath();
    ctx.fill();
    // wheels
    for (const wx of [x - s(60), x + s(240)]) {
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(wx, y, s(42), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = s(5);
      ctx.beginPath();
      ctx.arc(wx, y, s(20), 0, Math.PI * 2);
      ctx.stroke();
    }
    // headlight beam
    ctx.fillStyle = "rgba(242,242,242,0.35)";
    ctx.beginPath();
    ctx.moveTo(x + s(338), y - s(46));
    ctx.lineTo(x + s(560), y - s(70));
    ctx.lineTo(x + s(560), y - s(8));
    ctx.lineTo(x + s(340), y - s(28));
    ctx.closePath();
    ctx.fill();
  }

  // ── SCENE 3: woman in the yellow dress ──
  {
    const x = s(2300);
    const ground = streetY + s(30);
    // yellow glow
    const glow = ctx.createRadialGradient(x, ground - s(220), s(20), x, ground - s(220), s(380));
    glow.addColorStop(0, "rgba(255,212,0,0.28)");
    glow.addColorStop(1, "rgba(255,212,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - s(380), ground - s(600), s(760), s(660));
    // legs — black silhouette
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(x - s(18), ground - s(200));
    ctx.lineTo(x + s(2), ground - s(200));
    ctx.lineTo(x - s(8), ground);
    ctx.lineTo(x - s(26), ground);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + s(8), ground - s(200));
    ctx.lineTo(x + s(28), ground - s(200));
    ctx.lineTo(x + s(44), ground);
    ctx.lineTo(x + s(26), ground);
    ctx.closePath();
    ctx.fill();
    // dress — fitted bodice, skirt caught in the wind (YELLOW)
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.moveTo(x - s(24), ground - s(420)); // left shoulder
    ctx.lineTo(x + s(24), ground - s(420)); // right shoulder
    ctx.lineTo(x + s(18), ground - s(330)); // waist right
    ctx.lineTo(x + s(120), ground - s(190)); // skirt blown right
    ctx.lineTo(x + s(60), ground - s(180));
    ctx.lineTo(x + s(34), ground - s(195));
    ctx.lineTo(x - s(34), ground - s(195)); // hem left
    ctx.lineTo(x - s(20), ground - s(330)); // waist left
    ctx.closePath();
    ctx.fill();
    // arms + head + hair — black
    ctx.fillStyle = "#000000";
    ctx.beginPath(); // head
    ctx.arc(x, ground - s(455), s(24), 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath(); // hair sweep
    ctx.moveTo(x - s(20), ground - s(470));
    ctx.quadraticCurveTo(x - s(70), ground - s(430), x - s(48), ground - s(360));
    ctx.lineTo(x - s(24), ground - s(400));
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x - s(30), ground - s(420), s(10), s(100)); // left arm
    ctx.beginPath(); // right arm raised
    ctx.moveTo(x + s(20), ground - s(415));
    ctx.lineTo(x + s(64), ground - s(480));
    ctx.lineTo(x + s(74), ground - s(468));
    ctx.lineTo(x + s(30), ground - s(402));
    ctx.closePath();
    ctx.fill();
  }

  // ── SCENE 4: man in a suit, lit doorway ──
  {
    const x = s(3260);
    const ground = streetY + s(10);
    // doorway — stark white rectangle
    ctx.fillStyle = WHITE;
    ctx.fillRect(x - s(110), ground - s(520), s(220), s(520));
    // figure — black silhouette in the doorway
    ctx.fillStyle = "#000000";
    const fx = x;
    ctx.fillRect(fx - s(26), ground - s(130), s(20), s(130)); // legs
    ctx.fillRect(fx + s(6), ground - s(130), s(20), s(130));
    ctx.beginPath(); // suit jacket
    ctx.moveTo(fx - s(44), ground - s(380));
    ctx.lineTo(fx + s(44), ground - s(380));
    ctx.lineTo(fx + s(36), ground - s(120));
    ctx.lineTo(fx - s(36), ground - s(120));
    ctx.closePath();
    ctx.fill();
    ctx.beginPath(); // head
    ctx.arc(fx, ground - s(412), s(26), 0, Math.PI * 2);
    ctx.fill();
    // white shirt V + tie cut INTO the black suit
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.moveTo(fx - s(16), ground - s(380));
    ctx.lineTo(fx + s(16), ground - s(380));
    ctx.lineTo(fx, ground - s(330));
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.fillRect(fx - s(4), ground - s(372), s(8), s(70)); // tie
  }

  // rain — hard diagonal streaks over everything
  ctx.lineWidth = s(2);
  for (let i = 0; i < 700; i++) {
    const rx = (i * 379) % W;
    const ry = ((i * 691) % H) - s(60);
    const len = s(50 + ((i * 37) % 90));
    ctx.strokeStyle = `rgba(242,242,242,${0.04 + ((i * 13) % 9) * 0.012})`;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - len * 0.25, ry + len);
    ctx.stroke();
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
