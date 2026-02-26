"use client";

import { useEffect, useState } from "react";

const WEDDING_DATE = new Date("2026-07-08T00:00:00+03:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = WEDDING_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface UnitProps {
  value: number;
  label: string;
  animDelay: string;
}

/**
 * Re-keying the inner span by `value` causes React to remount it each time
 * the number changes, restarting the CSS `tick` animation — no setState needed.
 */
function CountdownUnit({ value, label, animDelay }: UnitProps) {
  return (
    <div
      className="animate-fade-up flex flex-col items-center gap-2"
      style={{ animationDelay: animDelay }}
    >
      <div
        className="relative flex h-20 w-20 items-center justify-center
                   rounded-xl border border-[var(--color-blush)]/40
                   bg-white/60 backdrop-blur-sm shadow-sm
                   sm:h-24 sm:w-24 md:h-28 md:w-28"
      >
        <span
          key={value}
          className="animate-tick text-4xl font-light tracking-tight text-[var(--color-charcoal)]
                     sm:text-5xl md:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {pad(value)}
        </span>
      </div>
      <span
        className="text-xs font-light uppercase tracking-[0.2em] text-[var(--color-muted)]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units: UnitProps[] = [
    { value: time.days,    label: "days",    animDelay: "0.3s"  },
    { value: time.hours,   label: "hours",   animDelay: "0.45s" },
    { value: time.minutes, label: "minutes", animDelay: "0.6s"  },
    { value: time.seconds, label: "seconds", animDelay: "0.75s" },
  ];

  return (
    <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6 md:gap-8">
      {units.map((u) => (
        <CountdownUnit key={u.label} {...u} />
      ))}
    </div>
  );
}
