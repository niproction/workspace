export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[var(--color-ivory)] px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <p className="text-xs font-light uppercase tracking-[0.3em] text-[var(--color-muted)] mb-3"
            style={{ fontFamily: "var(--font-body)" }}>
            Memories
          </p>
          <h1 className="font-display text-4xl font-light italic text-[var(--color-charcoal)] sm:text-5xl">
            Gallery
          </h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-12 bg-[var(--color-blush)]" />
            <span className="font-display text-lg italic text-[var(--color-rose)]">❧</span>
            <div className="h-px w-12 bg-[var(--color-blush)]" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[var(--color-cream)] p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-cream)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-blush)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-display text-xl italic text-[var(--color-charcoal)] mb-2">
            Photos coming soon
          </p>
          <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-body)" }}>
            We&apos;ll share our favourite moments here after the celebration.
          </p>
        </div>
      </div>
    </main>
  );
}
