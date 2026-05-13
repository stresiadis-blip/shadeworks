/**
 * Ambient shadow-arc backdrop — the brand metaphor "code casts long."
 * Renders behind every page: cypress at left, low sun at right horizon,
 * long cast shadow stretching across. Fixed full-viewport, z-index -10,
 * pointer-events none, semi-transparent so content stays readable.
 *
 * Two parallax layers (foreground tree faster, background atmospherics
 * slower) via CSS scroll-driven animations. Progressive enhancement —
 * silently skipped on browsers that don't support animation-timeline,
 * and on prefers-reduced-motion.
 *
 * Wrappers are intentionally oversized (~106vh, ~110vh starting above
 * the viewport) so the drift never exposes empty viewport edges.
 */
export function ShadowArcBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink"
    >
      {/* SLOW parallax layer — atmospherics (sun glow, horizon, shadow, sun disc) */}
      <div
        className="absolute left-0 right-0 shadow-arc-parallax-slow"
        style={{ top: "-3vh", height: "106vh" }}
      >
        {/* Sun glow — large soft radial behind disc */}
        <div
          className="absolute"
          style={{
            right: "calc(8% - 35vmax)",
            top: "calc(64% - 35vmax)",
            width: "70vmax",
            height: "70vmax",
            background:
              "radial-gradient(circle, rgba(201,169,97,0.20) 0%, rgba(201,169,97,0.06) 28%, rgba(201,169,97,0) 60%)",
          }}
        />

        {/* Horizon hairline */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "68%",
            height: "1px",
            background:
              "linear-gradient(to right, transparent 0%, rgba(201,169,97,0.22) 35%, rgba(201,169,97,0.35) 72%, rgba(201,169,97,0.08) 95%, transparent 100%)",
          }}
        />

        {/* Cast shadow — long dark gradient from tree base toward sun */}
        <div
          className="absolute"
          style={{
            left: "12%",
            top: "67.4%",
            width: "65%",
            height: "1.6%",
            background:
              "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.42) 18%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.06) 85%, rgba(0,0,0,0) 100%)",
            filter: "blur(2px)",
          }}
        />

        {/* Sun disc */}
        <div
          className="absolute"
          style={{
            right: "20%",
            top: "65%",
            width: "clamp(48px, 5.5vw, 110px)",
            height: "clamp(48px, 5.5vw, 110px)",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(230,199,126,0.55) 0%, rgba(201,169,97,0.32) 50%, rgba(201,169,97,0) 100%)",
            boxShadow: "0 0 60px rgba(201,169,97,0.18)",
          }}
        />
      </div>

      {/* FAST parallax layer — foreground cypress */}
      <div
        className="absolute left-0 right-0 shadow-arc-parallax"
        style={{ top: "-5vh", height: "110vh" }}
      >
        <svg
          className="absolute"
          style={{
            left: "clamp(24px, 14vw, 240px)",
            bottom: "clamp(25vh, 33vh, 37vh)",
            width: "clamp(60px, 9vw, 160px)",
            height: "clamp(220px, 42vh, 460px)",
          }}
          viewBox="0 0 60 200"
          preserveAspectRatio="xMidYMax meet"
        >
          {/* Trunk */}
          <rect x="28.6" y="158" width="2.8" height="40" fill="#000" opacity="0.55" />
          {/* Cypress flame canopy */}
          <path
            d="M 30 160 C 44 156, 49 132, 45 108 C 49 82, 43 50, 30 22 C 17 50, 11 82, 15 108 C 11 132, 16 156, 30 160 Z"
            fill="#000"
            opacity="0.55"
          />
        </svg>
      </div>

      {/* Static — bottom fade for footer readability */}
      <div
        className="absolute inset-x-0 bottom-0 h-[18vh]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.92) 100%)",
        }}
      />

      {/* Static — subtle halftone dust over the whole frame */}
      <div className="absolute inset-0 bg-halftone opacity-[0.025]" />
    </div>
  );
}
