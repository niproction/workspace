import { buildWeddingDateISO, getWeddingConfig, toPublicConfig } from "@/lib/config";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function buildGoogleCalendarLink(cfg: ReturnType<typeof toPublicConfig>, iso: string): string {
  const start = iso.replace(/[-:]/g, "").replace(/\+.*/, "") + "Z";
  const title = encodeURIComponent(`${cfg.groomNameEn} & ${cfg.brideNameEn} Wedding`);
  const location = encodeURIComponent(cfg.venueAddress || cfg.venueNameEn || "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}&location=${location}`;
}

function buildICSContent(cfg: ReturnType<typeof toPublicConfig>, iso: string): string {
  const dt = new Date(iso);
  const dtEnd = new Date(dt.getTime() + 5 * 60 * 60 * 1000); // +5 hours
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(dt)}`,
    `DTEND:${fmt(dtEnd)}`,
    `SUMMARY:${cfg.groomNameEn} & ${cfg.brideNameEn} Wedding`,
    `LOCATION:${cfg.venueAddress}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default async function DetailsPage() {
  const raw = await getWeddingConfig();
  const cfg = toPublicConfig(raw);
  const iso = buildWeddingDateISO(cfg);

  const [y, m, d] = cfg.weddingDate.split("-").map(Number);
  const weddingDate = new Date(y, m - 1, d);
  const formattedDate = format(weddingDate, "EEEE, MMMM d, yyyy");

  const googleCalLink = buildGoogleCalendarLink(cfg, iso);
  const icsData = buildICSContent(cfg, iso);
  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsData)}`;

  const hasVenue = cfg.venueNameHe || cfg.venueNameEn;
  const hasNav = cfg.venueWazeUrl || cfg.venueMapsUrl;

  return (
    <main className="min-h-screen bg-[var(--color-ivory)] px-6 py-20">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-light uppercase tracking-[0.3em] text-[var(--color-muted)] mb-3"
            style={{ fontFamily: "var(--font-body)" }}>
            Event Details
          </p>
          <h1 className="font-display text-4xl font-light italic text-[var(--color-charcoal)] mb-2 sm:text-5xl">
            Join Us
          </h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-12 bg-[var(--color-blush)]" />
            <span className="font-display text-lg italic text-[var(--color-rose)]">❧</span>
            <div className="h-px w-12 bg-[var(--color-blush)]" />
          </div>
        </div>

        <div className="space-y-6">
          {/* Date & Time Card */}
          <div className="rounded-2xl bg-white border border-[var(--color-cream)] p-7">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] mb-4"
              style={{ fontFamily: "var(--font-body)" }}>
              Date &amp; Time
            </h2>
            <p className="font-display text-2xl italic text-[var(--color-charcoal)] mb-1">
              {formattedDate}
            </p>
            {cfg.ceremonyTime && (
              <p className="text-[var(--color-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                Ceremony at {cfg.ceremonyTime}
                {cfg.receptionTime ? ` · Reception at ${cfg.receptionTime}` : ""}
              </p>
            )}

            {/* Calendar buttons */}
            <div className="flex flex-wrap gap-3 mt-5">
              <a
                href={googleCalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-blush)] px-4 py-2 text-sm text-[var(--color-charcoal)] hover:bg-[var(--color-blush)]/20 transition"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <CalendarIcon />
                Google Calendar
              </a>
              <a
                href={icsHref}
                download="wedding.ics"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-blush)] px-4 py-2 text-sm text-[var(--color-charcoal)] hover:bg-[var(--color-blush)]/20 transition"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <CalendarIcon />
                Apple / Outlook (.ics)
              </a>
            </div>
          </div>

          {/* Venue Card */}
          <div className="rounded-2xl bg-white border border-[var(--color-cream)] p-7">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] mb-4"
              style={{ fontFamily: "var(--font-body)" }}>
              Venue
            </h2>

            {hasVenue ? (
              <>
                <p className="font-display text-2xl italic text-[var(--color-charcoal)] mb-1">
                  {cfg.venueNameHe || cfg.venueNameEn}
                </p>
                {cfg.venueAddress && (
                  <p className="text-[var(--color-muted)] text-sm mt-1" style={{ fontFamily: "var(--font-body)" }}>
                    {cfg.venueAddress}
                  </p>
                )}

                {hasNav && (
                  <div className="flex flex-wrap gap-3 mt-5">
                    {cfg.venueWazeUrl && (
                      <a
                        href={cfg.venueWazeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-charcoal)] px-5 py-2.5 text-sm text-white hover:bg-[var(--color-rose)] transition"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <MapIcon />
                        Navigate with Waze
                      </a>
                    )}
                    {cfg.venueMapsUrl && (
                      <a
                        href={cfg.venueMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-blush)] px-5 py-2.5 text-sm text-[var(--color-charcoal)] hover:bg-[var(--color-blush)]/20 transition"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <MapIcon />
                        Google Maps
                      </a>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-[var(--color-muted)] text-sm italic" style={{ fontFamily: "var(--font-body)" }}>
                Venue details coming soon.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
