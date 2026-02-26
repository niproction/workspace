import { getWeddingConfig, toPublicConfig } from "@/lib/config";
import RsvpForm from "@/components/public/RsvpForm";

export const dynamic = "force-dynamic";

export default async function RsvpPage() {
  const raw = await getWeddingConfig();
  const cfg = toPublicConfig(raw);

  // Check if RSVP is closed
  let isClosed = false;
  if (cfg.rsvpDeadline) {
    isClosed = new Date().getTime() > new Date(cfg.rsvpDeadline).getTime();
  }

  return (
    <main className="min-h-screen bg-[var(--color-ivory)] px-6 py-20">
      <div className="mx-auto max-w-lg">
        <div className="mb-10 text-center">
          <p className="text-xs font-light uppercase tracking-[0.3em] text-[var(--color-muted)] mb-3"
            style={{ fontFamily: "var(--font-body)" }}>
            Kindly Reply
          </p>
          <h1 className="font-display text-4xl font-light italic text-[var(--color-charcoal)] sm:text-5xl">
            RSVP
          </h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-12 bg-[var(--color-blush)]" />
            <span className="font-display text-lg italic text-[var(--color-rose)]">❧</span>
            <div className="h-px w-12 bg-[var(--color-blush)]" />
          </div>
          {cfg.rsvpDeadline && !isClosed && (
            <p className="mt-4 text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-body)" }}>
              Please respond by {new Date(cfg.rsvpDeadline).toLocaleDateString("he-IL")}
            </p>
          )}
        </div>

        {isClosed ? (
          <div className="rounded-2xl bg-white border border-[var(--color-cream)] p-10 text-center">
            <p className="font-display text-xl italic text-[var(--color-charcoal)] mb-2">
              תקופת האישור נסגרה
            </p>
            <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-body)" }}>
              RSVP is now closed. Please contact us directly.
            </p>
          </div>
        ) : (
          <RsvpForm mealOptions={cfg.mealOptions} />
        )}
      </div>
    </main>
  );
}
