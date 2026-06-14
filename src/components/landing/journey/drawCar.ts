/**
 * Isolated car renderer for the journey backdrop. Kept in its own file with a
 * tiny, stable signature so the procedural placeholder can be swapped for a
 * dedicated SVG/raster asset later without touching the canvas orchestrator.
 *
 * Silhouette: a low, wide American luxury sedan, head-on (think Cadillac Series
 * 62 / Lincoln Continental) — wide chrome grille, heavy chrome bumper with
 * guards, round headlights under hood "eyebrows", rounded front fenders, a low
 * roof. NOT a hot-rod, muscle car, or bubble. Drawn in colour; the orchestrator
 * applies the global grayscale grade, so chrome only reads gold once colour
 * bleeds in (colorProgress).
 */

export interface CarFrame {
  cx: number; // centre x
  cy: number; // road-contact y (the car sits ON the road here)
  w: number; // car width in CSS px
  colorProgress: number; // 0..1 — warms the chrome toward gold near the climax
}

type RGB = [number, number, number];
const rgb = (c: RGB): string => `rgb(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0})`;
const rgba = (c: RGB, a: number): string =>
  `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;
const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const CHROME: RGB = [156, 164, 178];
const CHROME_GOLD: RGB = [222, 182, 96];
const HEADLIGHT: RGB = [255, 242, 214];

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function drawCar(ctx: CanvasRenderingContext2D, f: CarFrame): void {
  const { cx, cy, w } = f;
  if (w < 6) return;
  const cp = f.colorProgress < 0 ? 0 : f.colorProgress > 1 ? 1 : f.colorProgress;
  const h = w * 0.52; // LOW + WIDE: total height is barely over half the width

  const chrome = mix(CHROME, CHROME_GOLD, cp);
  const halfW = w / 2;
  const left = cx - halfW;

  // vertical anatomy, measured up from the road-contact line (cy = bottom)
  const bumperBot = cy - h * 0.02;
  const bumperTop = cy - h * 0.18;
  const beltline = cy - h * 0.52; // shoulder line / base of the greenhouse
  const roofTop = cy - h * 0.76; // low roof
  const hlY = cy - h * 0.36; // round headlight centres
  const grilleTop = cy - h * 0.44;
  const grilleBot = bumperTop;

  // --- wet-asphalt reflection: STRONGER than the headlights themselves ------
  for (const sgn of [-1, 1] as const) {
    const hx = cx + sgn * w * 0.34;
    const refl = ctx.createLinearGradient(hx, cy, hx, cy + h * 1.9);
    refl.addColorStop(0, rgba(HEADLIGHT, 0.62));
    refl.addColorStop(0.5, rgba(mix(HEADLIGHT, CHROME_GOLD, cp), 0.26));
    refl.addColorStop(1, rgba(HEADLIGHT, 0));
    ctx.fillStyle = refl;
    ctx.fillRect(hx - w * 0.1, cy, w * 0.2, h * 1.9);
  }
  const bodyRefl = ctx.createLinearGradient(cx, cy, cx, cy + h * 1.1);
  bodyRefl.addColorStop(0, rgba([24, 26, 34], 0.4));
  bodyRefl.addColorStop(1, rgba([24, 26, 34], 0));
  ctx.fillStyle = bodyRefl;
  ctx.fillRect(left, cy, w, h * 1.1);

  // --- low front wheels peeking (wide stance) -------------------------------
  ctx.fillStyle = rgb([5, 6, 9]);
  for (const sgn of [-1, 1] as const) {
    roundRect(ctx, cx + sgn * w * 0.38 - w * 0.08, bumperBot - h * 0.04, w * 0.16, h * 0.16, h * 0.05);
    ctx.fill();
  }

  // --- low greenhouse / roof (narrow, set back) -----------------------------
  const cabinHalf = w * 0.32;
  const roofHalf = w * 0.26;
  ctx.fillStyle = rgb([17, 19, 25]);
  ctx.beginPath();
  ctx.moveTo(cx - cabinHalf, beltline);
  ctx.lineTo(cx - roofHalf, roofTop + h * 0.02);
  ctx.quadraticCurveTo(cx, roofTop - h * 0.02, cx + roofHalf, roofTop + h * 0.02);
  ctx.lineTo(cx + cabinHalf, beltline);
  ctx.closePath();
  ctx.fill();
  // dark wrap-around windshield with a faint cool sky reflection
  ctx.fillStyle = rgb([10, 12, 18]);
  ctx.beginPath();
  ctx.moveTo(cx - cabinHalf * 0.84, beltline - h * 0.02);
  ctx.lineTo(cx - roofHalf * 0.82, roofTop + h * 0.05);
  ctx.lineTo(cx + roofHalf * 0.82, roofTop + h * 0.05);
  ctx.lineTo(cx + cabinHalf * 0.84, beltline - h * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rgba(mix([70, 92, 130], CHROME_GOLD, cp), 0.16);
  ctx.beginPath();
  ctx.moveTo(cx - cabinHalf * 0.7, beltline - h * 0.03);
  ctx.lineTo(cx - roofHalf * 0.2, roofTop + h * 0.06);
  ctx.lineTo(cx + roofHalf * 0.15, roofTop + h * 0.06);
  ctx.lineTo(cx - cabinHalf * 0.1, beltline - h * 0.03);
  ctx.closePath();
  ctx.fill();

  // --- lower body mass with rounded fenders (wide + horizontal) -------------
  const bodyGrad = ctx.createLinearGradient(0, beltline, 0, bumperTop);
  bodyGrad.addColorStop(0, rgb([34, 38, 47])); // sky sheen along the shoulder
  bodyGrad.addColorStop(0.45, rgb([18, 20, 27]));
  bodyGrad.addColorStop(1, rgb([10, 11, 16]));
  ctx.fillStyle = bodyGrad;
  // big top corner radius = rounded front fenders/shoulders
  roundRect(ctx, left, beltline, w, bumperTop - beltline, h * 0.26);
  ctx.fill();
  // chrome beltline trim
  ctx.strokeStyle = rgba(chrome, 0.5);
  ctx.lineWidth = Math.max(1, w * 0.004);
  ctx.beginPath();
  ctx.moveTo(left + w * 0.08, beltline + h * 0.14);
  ctx.lineTo(left + w * 0.92, beltline + h * 0.14);
  ctx.stroke();

  // --- wide imposing chrome grille (vertical bars + centre bar) -------------
  const grW = w * 0.46;
  const grX = cx - grW / 2;
  const grH = grilleBot - grilleTop;
  ctx.fillStyle = rgb([6, 7, 10]);
  roundRect(ctx, grX, grilleTop, grW, grH, grH * 0.16);
  ctx.fill();
  ctx.save();
  roundRect(ctx, grX, grilleTop, grW, grH, grH * 0.16);
  ctx.clip();
  ctx.strokeStyle = rgba(chrome, 0.9);
  ctx.lineWidth = Math.max(1, w * 0.006);
  const bars = 9;
  for (let i = 1; i < bars; i++) {
    const bx = grX + (grW / bars) * i;
    ctx.beginPath();
    ctx.moveTo(bx, grilleTop + grH * 0.12);
    ctx.lineTo(bx, grilleTop + grH * 0.88);
    ctx.stroke();
  }
  // heavy horizontal centre bar
  ctx.fillStyle = rgb(mix(chrome, [240, 244, 250], 0.2));
  ctx.fillRect(grX, grilleTop + grH * 0.44, grW, grH * 0.16);
  ctx.restore();
  ctx.strokeStyle = rgba(chrome, 0.95);
  ctx.lineWidth = Math.max(1, w * 0.007);
  roundRect(ctx, grX, grilleTop, grW, grH, grH * 0.16);
  ctx.stroke();

  // --- round headlights under hood "eyebrows" + glow ------------------------
  const hr = w * 0.062;
  for (const sgn of [-1, 1] as const) {
    const hx = cx + sgn * w * 0.34;
    // chrome bezel ring
    ctx.fillStyle = rgb(chrome);
    ctx.beginPath();
    ctx.arc(hx, hlY, hr * 1.25, 0, Math.PI * 2);
    ctx.fill();
    // warm lens
    const lens = ctx.createRadialGradient(hx - hr * 0.3, hlY - hr * 0.3, 1, hx, hlY, hr);
    lens.addColorStop(0, rgb([255, 255, 244]));
    lens.addColorStop(1, rgb(mix(HEADLIGHT, CHROME_GOLD, cp * 0.6)));
    ctx.fillStyle = lens;
    ctx.beginPath();
    ctx.arc(hx, hlY, hr, 0, Math.PI * 2);
    ctx.fill();
    // hood eyebrow — a body-dark brow arching over the top of the lamp
    ctx.fillStyle = rgb([12, 13, 18]);
    ctx.beginPath();
    ctx.ellipse(hx, hlY - hr * 0.95, hr * 1.6, hr * 0.95, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // glow halo
    const glow = ctx.createRadialGradient(hx, hlY, hr * 0.4, hx, hlY, hr * 3);
    glow.addColorStop(0, rgba(HEADLIGHT, 0.4));
    glow.addColorStop(1, rgba(HEADLIGHT, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(hx, hlY, hr * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- heavy chrome bumper with guards --------------------------------------
  const bump = ctx.createLinearGradient(0, bumperTop, 0, bumperBot);
  bump.addColorStop(0, rgb(mix(chrome, [255, 255, 255], 0.18)));
  bump.addColorStop(0.5, rgb(mix(chrome, [40, 44, 54], 0.55)));
  bump.addColorStop(1, rgb([28, 30, 38]));
  ctx.fillStyle = bump;
  roundRect(ctx, left + w * 0.01, bumperTop, w * 0.98, bumperBot - bumperTop, h * 0.06);
  ctx.fill();
  ctx.strokeStyle = rgba([222, 228, 238], 0.5);
  ctx.lineWidth = Math.max(1, w * 0.004);
  ctx.beginPath();
  ctx.moveTo(left + w * 0.05, bumperTop + (bumperBot - bumperTop) * 0.34);
  ctx.lineTo(left + w * 0.95, bumperTop + (bumperBot - bumperTop) * 0.34);
  ctx.stroke();
  // two bumper guards flanking the centre
  ctx.fillStyle = rgb(mix(chrome, [230, 234, 242], 0.15));
  for (const sgn of [-1, 1] as const) {
    roundRect(ctx, cx + sgn * w * 0.12 - w * 0.018, bumperTop - h * 0.05, w * 0.036, bumperBot - bumperTop + h * 0.06, w * 0.014);
    ctx.fill();
  }

  // --- cool->warm rim light along the roof + shoulder -----------------------
  const rim = mix([150, 184, 224], [255, 200, 150], cp);
  ctx.strokeStyle = rgba(rim, 0.6);
  ctx.lineWidth = Math.max(1, w * 0.006);
  ctx.beginPath();
  ctx.moveTo(cx - roofHalf * 0.9, roofTop + h * 0.02);
  ctx.quadraticCurveTo(cx, roofTop - h * 0.02, cx + roofHalf * 0.9, roofTop + h * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(left + w * 0.06, beltline + h * 0.02);
  ctx.lineTo(left + w * 0.94, beltline + h * 0.02);
  ctx.stroke();

  // --- headlight cones cutting forward (toward the camera) ------------------
  for (const sgn of [-1, 1] as const) {
    const hx = cx + sgn * w * 0.34;
    const cone = ctx.createLinearGradient(hx, hlY, hx + sgn * w * 0.18, cy + h * 1.2);
    cone.addColorStop(0, rgba(HEADLIGHT, 0.14));
    cone.addColorStop(1, rgba(HEADLIGHT, 0));
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(hx - w * 0.05, hlY);
    ctx.lineTo(hx + w * 0.05, hlY);
    ctx.lineTo(hx + sgn * w * 0.32 + w * 0.18, cy + h * 1.3);
    ctx.lineTo(hx + sgn * w * 0.32 - w * 0.18, cy + h * 1.3);
    ctx.closePath();
    ctx.fill();
  }
}
