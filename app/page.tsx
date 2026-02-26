import CountdownTimer from "@/components/CountdownTimer";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20">

      {/* ── Decorative background rings ───────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[600px] w-[600px] rounded-full border border-[var(--color-blush)]/20 animate-fade-in delay-900" />
        <div className="absolute h-[420px] w-[420px] rounded-full border border-[var(--color-sage)]/15 animate-fade-in delay-700" />
        <div className="absolute h-[240px] w-[240px] rounded-full border border-[var(--color-rose)]/10 animate-fade-in delay-500" />
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-12 text-center">

        {/* Pre-title */}
        <p
          className="animate-fade-up text-xs font-light uppercase tracking-[0.35em] text-[var(--color-muted)] delay-100"
          style={{ fontFamily: "var(--font-body)" }}
        >
          You are invited
        </p>

        {/* Names */}
        <div className="flex flex-col items-center gap-3">
          <h1
            className="animate-fade-up text-6xl font-light italic leading-none tracking-wide text-[var(--color-charcoal)] delay-200
                       sm:text-7xl md:text-8xl lg:text-9xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Name &amp; Name
          </h1>

          {/* Ornamental divider */}
          <div className="animate-fade-up flex items-center gap-4 delay-300">
            <div className="h-px w-16 bg-[var(--color-blush)] sm:w-24" />
            <span
              className="text-lg font-light italic text-[var(--color-rose)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ❧
            </span>
            <div className="h-px w-16 bg-[var(--color-blush)] sm:w-24" />
          </div>

          {/* Date */}
          <p
            className="animate-fade-up text-base font-light tracking-[0.25em] text-[var(--color-muted)] delay-400
                       sm:text-lg"
            style={{ fontFamily: "var(--font-body)" }}
          >
            08 · 07 · 2026
          </p>
        </div>

        {/* Countdown */}
        <div className="animate-fade-up delay-500 w-full max-w-xl">
          <p
            className="mb-8 text-sm font-light uppercase tracking-[0.2em] text-[var(--color-muted)]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Counting down
          </p>
          <CountdownTimer />
        </div>

        {/* Footer note */}
        <p
          className="animate-fade-up max-w-sm text-sm font-light leading-relaxed text-[var(--color-muted)] delay-900"
          style={{ fontFamily: "var(--font-body)" }}
        >
          More details to follow soon.
        </p>
      </div>
    </main>
  );
}
