import CountdownTimer from "@/components/CountdownTimer";
import { buildWeddingDateISO, getWeddingConfig, toPublicConfig } from "@/lib/config";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const raw = await getWeddingConfig();
  const cfg = toPublicConfig(raw);
  const weddingISO = buildWeddingDateISO(cfg);

  const dateDisplay = (() => {
    const [y, m, d] = cfg.weddingDate.split("-");
    return `${d} · ${m} · ${y}`;
  })();

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
            className="animate-fade-up text-5xl font-light italic leading-none tracking-wide text-[var(--color-charcoal)] delay-200
                       sm:text-7xl md:text-8xl lg:text-9xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {cfg.brideNameEn} &amp; {cfg.groomNameEn}
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
            {dateDisplay}
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
          <CountdownTimer targetDate={weddingISO} />
        </div>

        {/* Nav links */}
        <div className="animate-fade-up delay-700 flex flex-wrap justify-center gap-4">
          <Link
            href="/details"
            className="rounded-full border border-[var(--color-blush)] px-6 py-2.5 text-sm text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]/20"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Event Details
          </Link>
          <Link
            href="/rsvp"
            className="rounded-full bg-[var(--color-charcoal)] px-6 py-2.5 text-sm text-white transition hover:bg-[var(--color-rose)]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            RSVP
          </Link>
          <Link
            href="/faq"
            className="rounded-full border border-[var(--color-blush)] px-6 py-2.5 text-sm text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]/20"
            style={{ fontFamily: "var(--font-body)" }}
          >
            FAQ
          </Link>
        </div>
      </div>
    </main>
  );
}
