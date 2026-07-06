export function Logomark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="24" cy="24" r="22.5" stroke="var(--color-gold)" strokeWidth="1.5" />
      {/* jyoti flame */}
      <path
        d="M24 10.5 C 29.5 16, 31 21.5, 31 26 C 31 31.5, 27.8 35.5, 24 35.5 C 20.2 35.5, 17 31.5, 17 26 C 17 21.5, 18.5 16, 24 10.5 Z"
        fill="var(--color-terra)"
        opacity="0.92"
      />
      <path
        d="M24 19 C 26.6 22, 27.4 24.6, 27.4 27 C 27.4 30.2, 25.9 32.4, 24 32.4 C 22.1 32.4, 20.6 30.2, 20.6 27 C 20.6 24.6, 21.4 22, 24 19 Z"
        fill="var(--color-cream)"
        opacity="0.9"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex flex-col leading-none">
      <span className="font-semibold text-[1.25rem] tracking-tight text-ink">
        Vancouver Sai Centre
      </span>
      <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-ink-faint">
        Love · Truth · Peace
      </span>
    </span>
  );
}
