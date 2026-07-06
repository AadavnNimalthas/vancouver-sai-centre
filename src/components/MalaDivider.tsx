/**
 * Section divider: five beads on a hairline, one for each value.
 * The centre bead is gold; used between major page sections.
 */
export function MalaDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-line" />
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`rounded-full ${
            i === 2 ? "size-2 bg-gold" : "size-1.5 bg-gold-soft"
          }`}
        />
      ))}
      <span className="h-px w-16 bg-line" />
    </div>
  );
}
