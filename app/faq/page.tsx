import { getWeddingConfig, toPublicConfig } from "@/lib/config";
import FaqAccordion from "@/components/public/FaqAccordion";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const raw = await getWeddingConfig();
  const cfg = toPublicConfig(raw);

  return (
    <main className="min-h-screen bg-[var(--color-ivory)] px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <p className="text-xs font-light uppercase tracking-[0.3em] text-[var(--color-muted)] mb-3"
            style={{ fontFamily: "var(--font-body)" }}>
            Questions &amp; Answers
          </p>
          <h1 className="font-display text-4xl font-light italic text-[var(--color-charcoal)] sm:text-5xl">
            FAQ
          </h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-12 bg-[var(--color-blush)]" />
            <span className="font-display text-lg italic text-[var(--color-rose)]">❧</span>
            <div className="h-px w-12 bg-[var(--color-blush)]" />
          </div>
        </div>

        {cfg.faqContent.length > 0 ? (
          <FaqAccordion items={cfg.faqContent} />
        ) : (
          <div className="rounded-2xl bg-white border border-[var(--color-cream)] p-10 text-center">
            <p className="text-[var(--color-muted)] italic" style={{ fontFamily: "var(--font-body)" }}>
              FAQ coming soon.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
