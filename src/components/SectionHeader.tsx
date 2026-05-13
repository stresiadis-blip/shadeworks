type SectionHeaderProps = {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  const maxWidth = align === "center" ? "max-w-3xl" : "max-w-4xl";

  return (
    <div className={`${alignClass} ${maxWidth} ${className}`}>
      <p className="font-mono text-xs uppercase tracking-[0.4em] text-gold mb-6">
        {eyebrow}
      </p>
      <h2
        className="font-heading-serif text-bone leading-[0.95] tracking-tight"
        style={{ fontSize: "clamp(2.25rem, 5vw, 4.5rem)" }}
      >
        {title}
      </h2>
      {intro ? (
        <p className="mt-6 max-w-2xl text-lg md:text-xl text-bone-muted font-serif-italic leading-relaxed">
          {intro}
        </p>
      ) : null}
    </div>
  );
}
