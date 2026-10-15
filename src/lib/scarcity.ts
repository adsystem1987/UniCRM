"use client";

import { useEffect, useState } from "react";

export interface ServerSlots {
  remaining: number;
  total: number;
  claimed: number;
  percentage: number;
}

/**
 * Calculates dynamic server scarcity slots deterministically.
 * Updates smoothly every 3 hours based on epoch time, staying within
 * an authentic urgency range of 8 to 17 spots remaining out of 100.
 */
export function getServerSlots(): ServerSlots {
  const windowHours = 3;
  const now = typeof window !== "undefined" ? Date.now() : 1776312000000;
  const epochHours = Math.floor(now / (1000 * 60 * 60 * windowHours));
  
  // Linear congruential pseudorandom cycle
  const seed = (epochHours * 9301 + 49297) % 233280;
  const remaining = 8 + (seed % 10); // always between 8 and 17
  const total = 100;
  const claimed = total - remaining;
  const percentage = Math.round((claimed / total) * 100);

  return { remaining, total, claimed, percentage };
}

/**
 * React hook to synchronize server capacity numbers across all pages.
 */
export function useServerSlots(): ServerSlots {
  const [slots, setSlots] = useState<ServerSlots>(() => getServerSlots());

  useEffect(() => {
    setSlots(getServerSlots());
    const interval = setInterval(() => {
      setSlots(getServerSlots());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return slots;
}
