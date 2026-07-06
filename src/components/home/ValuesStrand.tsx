"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const VALUES = [
  {
    sanskrit: "Prema",
    name: "Love",
    line: "Care for the people around you, in what you think, say, and do.",
  },
  {
    sanskrit: "Sathya",
    name: "Truth",
    line: "Be honest with yourself and with others.",
  },
  {
    sanskrit: "Shanti",
    name: "Peace",
    line: "A settled mind, practised through prayer and contentment.",
  },
  {
    sanskrit: "Dharma",
    name: "Right Conduct",
    line: "Do the right thing, even when it is not easy.",
  },
  {
    sanskrit: "Ahimsa",
    name: "Non-Violence",
    line: "Cause no harm through your words or your actions.",
  },
];

/**
 * The five values shown as beads on a strand, like a mala.
 * Selecting a bead shows its meaning below.
 */
export function ValuesStrand() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  return (
    <div>
      <div className="relative mx-auto flex max-w-3xl items-center justify-between">
        <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-line" aria-hidden="true" />
        {VALUES.map((v, i) => (
          <button
            key={v.name}
            onClick={() => setActive(i)}
            aria-pressed={active === i}
            aria-label={`${v.name} (${v.sanskrit})`}
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
          <p className="font-display text-4xl italic text-gold sm:text-5xl">
            {VALUES[active].sanskrit}
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            {VALUES[active].line}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
