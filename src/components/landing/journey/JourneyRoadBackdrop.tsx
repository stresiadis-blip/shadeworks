"use client";

import { useEffect, useRef, useState } from "react";
import { drawJourneyScene } from "../JourneySection";
import { journeyStore } from "./journeyStore";

/**
 * Backdrop = OUR existing road. It paints the EXACT JourneySection road scene
 * (geometry / perspective / movement / timing untouched) with its drawn car
 * turned OFF, then layers ONLY the neo-noir treatment on top, driven by the same
 * scroll progress:
 *   - mono -> colour at 59% as a CSS `grayscale(1 - colorProgress)` FILTER over
 *     the existing canvas (no new road, no second scene canvas),
 *   - a dawn glow (amber + crimson) at the horizon ONLY, fading in from 59%,
 *   - the approaching car as a real PNG asset (/car-noir-headon.png) composited
 *     over the road perspective — never drawn. If the PNG is missing, a clearly
 *     marked placeholder shows (not a box-car).
 *
 * The road is never regenerated here; it is JourneySection's own draw code.
 * Reduced motion paints one static, readable frame at progress 0.66.
 */

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const colorProgressOf = (p: number): number => clamp01((p - 0.59) / 0.41);

const CUT = 0.62; // JourneySection's iso->side hard cut

/** Approach mapping for the PNG car along the iso road (0..0.62 of the scroll). */
function carFrame(progress: number): { widthVw: number; topPct: number; opacity: number } {
  const tIso = clamp01(progress / CUT);
  const approach = Math.pow(tIso, 0.7); // mirrors the drawn car's advance curve
  // fade out across the cut — the side-profile arrival is a different shot
  const fade = progress < 0.58 ? 1 : clamp01((0.66 - progress) / 0.08);
  return {
    widthVw: lerp(5, 60, approach),
    topPct: lerp(41, 92, approach),
    opacity: fade,
  };
}

export function JourneyRoadBackdrop({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const [carMissing, setCarMissing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const size = (): void => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    const updateOverlay = (progress: number, cp: number): void => {
      if (glowRef.current) glowRef.current.style.opacity = cp.toFixed(3);
      if (carRef.current) {
        const f = carFrame(progress);
        carRef.current.style.width = `${f.widthVw}vw`;
        carRef.current.style.top = `${f.topPct}%`;
        carRef.current.style.opacity = f.opacity.toFixed(3);
      }
    };

    const paint = (progress: number, cp: number): void => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // OUR road scene, exactly — drawn car suppressed (PNG composited instead)
      drawJourneyScene(ctx, progress, w, h, false);
      // grade: mono -> colour at 59%, as a filter over the existing scene
      canvas.style.filter = `grayscale(${(1 - cp).toFixed(3)})`;
      updateOverlay(progress, cp);
    };

    size();

    if (reduced) {
      const p = 0.66;
      paint(p, colorProgressOf(p));
      let resizeTimer = 0;
      const onResize = (): void => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          size();
          paint(p, colorProgressOf(p));
        }, 150);
      };
      window.addEventListener("resize", onResize);
      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
      };
    }

    let raf = 0;
    const loop = (): void => {
      if (document.visibilityState !== "hidden") {
        paint(journeyStore.progress, journeyStore.colorProgress);
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
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* OUR road scene (graded via CSS filter, set imperatively) */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* dawn glow — amber + crimson, at the horizon ONLY, fades in from 59% */}
      <div
        ref={glowRef}
        className="absolute inset-x-0"
        style={{
          top: "26%",
          height: "30%",
          opacity: 0,
          background:
            "radial-gradient(ellipse 55% 60% at 50% 60%, rgba(242,194,0,0.55), rgba(209,31,42,0.30) 42%, rgba(209,31,42,0) 72%)",
        }}
      />

      {/* approaching car — real PNG asset over the road perspective */}
      <div
        ref={carRef}
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "5vw", top: "41%", opacity: 1 }}
      >
        {carMissing ? (
          // clearly-marked placeholder — NOT a box-car
          <div className="flex aspect-[5/2] w-full items-center justify-center border border-dashed border-signal/60 bg-ink/40">
            <span className="px-2 text-center font-mono text-[9px] uppercase leading-tight tracking-[0.2em] text-signal/80">
              car png
              <br />
              /car-noir-headon.png
            </span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/car-noir-headon.png"
            alt=""
            className="block w-full"
            onError={() => setCarMissing(true)}
          />
        )}
      </div>
    </div>
  );
}
