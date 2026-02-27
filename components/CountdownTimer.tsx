"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function getTimeLeft(targetDate: Date): TimeLeft {
  const diff = targetDate.getTime() - Date.now();
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

interface CountdownTimerProps {
  /** ISO 8601 date string with timezone offset, e.g. "2026-07-08T18:00:00+03:00" */
  targetDate: string;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const date = new Date(targetDate);
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(getTimeLeft(date));
    const id = setInterval(() => setTime(getTimeLeft(date)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  const t = time ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const units: UnitProps[] = [
    { value: t.days,    label: "days",    animDelay: "0.3s"  },
    { value: t.hours,   label: "hours",   animDelay: "0.45s" },
    { value: t.minutes, label: "minutes", animDelay: "0.6s"  },
    { value: t.seconds, label: "seconds", animDelay: "0.75s" },
  ];

  return (
    <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6 md:gap-8">
      {units.map((u) => (
        <CountdownUnit key={u.label} {...u} />
      ))}
    </div>
  );
}
