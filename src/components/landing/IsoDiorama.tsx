"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient isometric diorama — a calm low-poly city of grey blocks on ink with
 * faint crimson guide lines, fixed behind the page. It drifts/parallaxes slowly
 * with scroll and re-focuses per active process step (one column lights crimson,
 * the camera eases toward it). Deterministic (seeded), DPR-aware, reduced-motion
 * safe (one static frame, no loop). Colours are the noir tokens only.
 */

/** Small mulberry32 PRNG — deterministic stream from a constant seed. */
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

interface DBox {
  gx: number;
  gy: number;
  h: number; // height in tiles
  tone: number; // base grey 0..255
}

const GRID_N = 5;
function buildDiorama(): DBox[] {
  const rng = mulberry32(0x5ade);
  const list: DBox[] = [];
  for (let gx = -GRID_N; gx <= GRID_N; gx++) {
    for (let gy = -GRID_N; gy <= GRID_N; gy++) {
      if (rng() < 0.24) continue; // open plots
      list.push({
        gx,
        gy,
        h: 0.4 + rng() * 3.2,
        tone: 34 + Math.round(rng() * 54), // grey blocks
      });
    }
  }
  return list;
}
const DIORAMA = buildDiorama();
const CRIMSON = "209, 31, 42";
const BONE = "247, 244, 236";

export function IsoDiorama({
  activeStep,
  stepCount,
  reduced,
}: {
  activeStep: number;
  stepCount: number;
  reduced: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(activeStep);
  const focusRef = useRef(activeStep);

  useEffect(() => {
    activeRef.current = activeStep;
  }, [activeStep]);

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

    const denom = Math.max(1, stepCount - 1);

    const draw = (): void => {
      // scroll parallax 0..1
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const sp = reduced ? 0 : Math.min(1, Math.max(0, window.scrollY / maxScroll));

      // ease the focus toward the active step
      if (!reduced) focusRef.current += (activeRef.current - focusRef.current) * 0.08;
      else focusRef.current = activeRef.current;
      const focusN = focusRef.current / denom; // 0..1

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      const tile = Math.max(26, Math.min(w, h) / 15);
      // gentle camera drift: pan on scroll + slide toward the active column
      const camX = w * 0.5 + Math.sin(sp * Math.PI * 2) * w * 0.035 + (focusN - 0.5) * w * 0.16;
      const camY = h * 0.48 + sp * h * 0.08;
      const iso = (gx: number, gy: number, z: number): [number, number] => [
        camX + (gx - gy) * tile,
        camY + (gx + gy) * tile * 0.5 - z * tile,
      ];

      // faint crimson iso guide grid
      ctx.strokeStyle = `rgba(${CRIMSON}, 0.1)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const G = GRID_N + 1;
      for (let i = -G; i <= G; i++) {
        const a = iso(i, -G, 0);
        const b = iso(i, G, 0);
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        const c = iso(-G, i, 0);
        const d = iso(G, i, 0);
        ctx.moveTo(c[0], c[1]);
        ctx.lineTo(d[0], d[1]);
      }
      ctx.stroke();

      // which grid column lights crimson for the active step
      const litCol = Math.round((focusN - 0.5) * (GRID_N * 1.6));

      const poly = (pts: [number, number][], fill: string): void => {
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
      };

      const sorted = [...DIORAMA].sort((p, q) => p.gx + p.gy - (q.gx + q.gy));
      for (const b of sorted) {
        const z = b.h;
        const fw = 0.86;
        const bRight = iso(b.gx + fw, b.gy, 0);
        const bBot = iso(b.gx + fw, b.gy + fw, 0);
        const bLeft = iso(b.gx, b.gy + fw, 0);
        const tTopP = iso(b.gx, b.gy, z);
        const tRight = iso(b.gx + fw, b.gy, z);
        const tBot = iso(b.gx + fw, b.gy + fw, z);
        const tLeft = iso(b.gx, b.gy + fw, z);
        const g = b.tone;
        poly([bRight, bBot, tBot, tRight], `rgb(${g * 0.68}, ${g * 0.68}, ${g * 0.68})`);
        poly([bLeft, bBot, tBot, tLeft], `rgb(${g * 0.42}, ${g * 0.42}, ${g * 0.42})`);
        poly([tTopP, tRight, tBot, tLeft], `rgb(${g}, ${g}, ${g})`);

        const lit = b.gx === litCol;
        ctx.strokeStyle = lit ? `rgba(${CRIMSON}, 0.85)` : `rgba(${BONE}, 0.1)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        [tTopP, tRight, tBot, tLeft].forEach((p, i) =>
          i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]),
        );
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bBot[0], bBot[1]);
        ctx.lineTo(tBot[0], tBot[1]);
        ctx.stroke();
      }

      // soft vignette to sink the edges into the ink
      const vg = ctx.createRadialGradient(
        w / 2,
        h * 0.5,
        Math.min(w, h) * 0.25,
        w / 2,
        h * 0.5,
        Math.max(w, h) * 0.72,
      );
      vg.addColorStop(0, "rgba(10, 10, 10, 0)");
      vg.addColorStop(1, "rgba(10, 10, 10, 0.7)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
    };

    size();
    let raf = 0;
    if (reduced) {
      draw(); // single static frame
    } else {
      const loop = (): void => {
        if (document.visibilityState !== "hidden") draw();
        raf = window.requestAnimationFrame(loop);
      };
      raf = window.requestAnimationFrame(loop);
    }

    let resizeTimer = 0;
    const onResize = (): void => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        size();
        draw();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced, stepCount]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
