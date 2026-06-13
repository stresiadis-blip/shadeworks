"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Noir palette mirrored from globals.css — canvas needs raw hex, not tokens. */
const INK = "#0a0a0a";
const GOLD = "#ffd400";
const GRID = "rgba(247, 244, 236, 0.1)"; // bone/10
const READOUT = "rgba(247, 244, 236, 0.7)"; // bone, dimmed

/** Linear interpolation helper. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * COMMIT A — visual test draw only. Clears to ink, lays down a faint isometric
 * ground grid, then slides ONE gold "car" rectangle along a bottom-left ->
 * top-right diagonal as progress 0->1. The mono progress readout is TEMPORARY
 * and gets removed in commit B (replaced by the real city art + color arc).
 *
 * width/height are CSS pixels — the caller has already applied the
 * devicePixelRatio transform so all coordinates here stay in layout space.
 */
function draw(
  ctx: CanvasRenderingContext2D,
  progress: number,
  width: number,
  height: number,
): void {
  // background
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, width, height);

  // isometric ground grid — projected flat plane of thin bone lines
  const cx = width / 2;
  const groundY = height * 0.52;
  const tile = Math.max(36, Math.min(width, height) / 14);
  const isoW = tile;
  const isoH = tile * 0.5;
  const half = 9;

  const project = (gx: number, gy: number): [number, number] => [
    cx + (gx - gy) * isoW,
    groundY + (gx + gy) * isoH,
  ];

  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = -half; i <= half; i++) {
    const [ax, ay] = project(i, -half);
    const [bx, by] = project(i, half);
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);

    const [pcx, pcy] = project(-half, i);
    const [dx, dy] = project(half, i);
    ctx.moveTo(pcx, pcy);
    ctx.lineTo(dx, dy);
  }
  ctx.stroke();

  // the "car" — gold rectangle travelling the diagonal isometric path
  const carX = lerp(width * 0.12, width * 0.88, progress);
  const carY = lerp(height * 0.86, height * 0.16, progress);
  const carW = Math.max(28, width * 0.03);
  const carH = carW * 0.62;

  ctx.save();
  ctx.shadowColor = "rgba(255, 212, 0, 0.55)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = GOLD;
  ctx.fillRect(carX - carW / 2, carY - carH / 2, carW, carH);
  ctx.restore();

  // TEMPORARY progress readout (removed in commit B)
  ctx.fillStyle = READOUT;
  ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(progress.toFixed(2), 16, height - 16);
}

/**
 * COMMIT A scaffold — a tall pinned scroll container whose sticky full-viewport
 * canvas is driven by a single scroll progress value (0->1). This commit proves
 * the scroll -> canvas pipeline only: no city art, no color arc yet.
 *
 * All motion lives inside matchMedia("(prefers-reduced-motion: no-preference)").
 * Under reduced motion the section collapses to one viewport, the canvas paints
 * a single static frame at progress 0, and nothing pins or scrubs.
 */
export function JourneySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const canvas = canvasRef.current;
    if (!section || !pin || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match the backing store to the CSS box * devicePixelRatio so the grid and
    // car stay crisp on retina. All draw() coordinates remain in CSS pixels.
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
        onUpdate: (self) => render(self.progress),
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

  return (
    <section ref={sectionRef} className="relative bg-ink">
      <div ref={pinRef} className="h-[100svh] w-full overflow-hidden">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </section>
  );
}
