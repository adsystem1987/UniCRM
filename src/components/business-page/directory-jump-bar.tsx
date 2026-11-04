"use client";

import { motion } from "motion/react";

interface DirectoryJumpBarProps {
  alphabet: string[];
  activeCounts: Record<string, number>;
}

export function DirectoryJumpBar({ alphabet, activeCounts }: DirectoryJumpBarProps) {
  return (
    <div className="pt-4 flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground mr-2">Jump to:</span>
      {alphabet.map((letter) => {
        const hasEntries = (activeCounts[letter] || 0) > 0;
        return (
          <motion.a
            key={letter}
            href={hasEntries ? `#letter-${letter}` : undefined}
            whileHover={hasEntries ? { scale: 1.15, y: -2 } : {}}
            whileTap={hasEntries ? { scale: 0.9 } : {}}
            className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${
              hasEntries
                ? "bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground shadow-xs cursor-pointer"
                : "text-muted-foreground/30 pointer-events-none"
            }`}
          >
            {letter}
          </motion.a>
        );
      })}
      <motion.a
        href="#categories"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="ml-2 px-2.5 py-1 rounded-md text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors"
      >
        By Category ↓
      </motion.a>
      <motion.a
        href="#locations"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="px-2.5 py-1 rounded-md text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors"
      >
        By City Location ↓
      </motion.a>
    </div>
  );
}
