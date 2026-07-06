export function Logomark({ size = 34 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo.png"
      alt="Vancouver Sai Centre Logo"
      width={size}
      height={size}
      className="shrink-0 object-contain"
    />
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
