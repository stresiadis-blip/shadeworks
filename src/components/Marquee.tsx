import { Fragment } from "react";

type MarqueeProps = {
  text: string;
  separator?: string;
  reverse?: boolean;
  speed?: "slow" | "normal";
};

export function Marquee({
  text,
  separator = "·",
  reverse = false,
  speed = "normal",
}: MarqueeProps) {
  const items = Array.from({ length: 8 }, (_, i) => `${text}`);
  const animationClass = speed === "slow" ? "animate-marquee-slow" : "animate-marquee";

  return (
    <div
      className="relative w-full overflow-hidden border-y border-bone/5 bg-ink-elevated/40 py-6"
      aria-hidden="true"
    >
      <div
        className={`flex whitespace-nowrap ${animationClass} pause-on-hover`}
        style={{
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {[...items, ...items].map((item, i) => (
          <Fragment key={i}>
            <span className="font-heading-serif text-3xl md:text-5xl text-bone-muted/70 px-8">
              {item}
            </span>
            <span className="font-mono text-xl md:text-2xl text-gold px-4 self-center">
              {separator}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
