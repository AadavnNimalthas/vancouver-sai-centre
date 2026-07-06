"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { ValueItem } from "@/lib/types";

/**
 * The five values shown as beads on a strand, like a mala.
 * Selecting a bead shows its meaning below. The values and their
 * descriptions are edited in the Site content console.
 */
export function ValuesStrand({ values }: { values: ValueItem[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  if (values.length === 0) return null;
  const current = values[Math.min(active, values.length - 1)];

  return (
    <div>
      <div className="relative mx-auto flex max-w-3xl items-center justify-between">
        <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-line" aria-hidden="true" />
        {values.map((v, i) => (
          <button
            key={v.name}
            onClick={() => setActive(i)}
            aria-pressed={active === i}
            aria-label={v.sanskrit ? `${v.name} (${v.sanskrit})` : v.name}
            className="group relative flex flex-col items-center gap-3 px-1 pt-8"
          >
            <span
              className={`block rounded-full transition-all duration-500 ${
                active === i
                  ? "size-5 bg-terra shadow-[0_0_0_8px_rgba(230,126,82,0.15)]"
                  : "size-3.5 bg-gold-soft group-hover:bg-gold"
              }`}
            />
            <span
              className={`text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors sm:text-[0.75rem] ${
                active === i ? "text-terra-deep" : "text-ink-faint group-hover:text-ink-soft"
              }`}
            >
              {v.name}
            </span>
          </button>
        ))}
      </div>

      <div className="mx-auto mt-12 min-h-[7rem] max-w-xl text-center">
        <motion.div
          key={active}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {current.sanskrit && (
            <p className="font-display text-4xl italic text-gold sm:text-5xl">
              {current.sanskrit}
            </p>
          )}
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{current.line}</p>
        </motion.div>
      </div>
    </div>
  );
}
