import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={`eyebrow ${centered ? "" : "eyebrow-rule"}`}>{eyebrow}</p>
      <h2 className="mt-4 font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
        {title}
      </h2>
      {intro && <p className="mt-5 text-lg leading-relaxed text-ink-soft">{intro}</p>}
    </div>
  );
}
