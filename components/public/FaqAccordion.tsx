"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-[var(--color-cream)] overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-right"
            aria-expanded={open === i}
          >
            <span
              className="font-medium text-[var(--color-charcoal)] text-sm"
              style={{ fontFamily: "var(--font-body)" }}
              dir="rtl"
            >
              {item.q}
            </span>
            <svg
              className={`flex-shrink-0 w-4 h-4 text-[var(--color-muted)] transition-transform ${open === i ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open === i && (
            <div
              className="px-6 pb-5 text-sm text-[var(--color-muted)] leading-relaxed border-t border-[var(--color-cream)] pt-4"
              style={{ fontFamily: "var(--font-body)" }}
              dir="rtl"
            >
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
