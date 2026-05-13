type TechChipProps = {
  children: React.ReactNode;
};

export function TechChip({ children }: TechChipProps) {
  return (
    <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-[0.2em] text-bone-muted border border-gold/30 bg-gold/5 px-3 py-1.5 rounded-full">
      {children}
    </span>
  );
}
