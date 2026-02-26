import { getWeddingConfig, toPublicConfig } from "@/lib/config";
import { prisma } from "@/lib/db";
import Link from "next/link";

function StatCard({
  label,
  value,
  sub,
  color = "charcoal",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "charcoal" | "rose" | "sage" | "blush";
}) {
  const accent = {
    charcoal: "border-[var(--color-charcoal)]",
    rose: "border-[var(--color-rose)]",
    sage: "border-[var(--color-sage)]",
    blush: "border-[var(--color-blush)]",
  }[color];

  return (
    <div className={`bg-white rounded-2xl border-t-2 ${accent} border-x border-b border-stone-100 p-5 shadow-sm`}>
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-muted)] mb-2"
        style={{ fontFamily: "var(--font-body)" }}>
        {label}
      </p>
      <p className="text-3xl font-light text-[var(--color-charcoal)]"
        style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-body)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const [raw, guests, vendors, budgetItems, alcoholItems, timeline] =
    await Promise.all([
      getWeddingConfig(),
      prisma.guest.findMany(),
      prisma.vendor.findMany(),
      prisma.budgetItem.findMany(),
      prisma.alcoholItem.findMany(),
      prisma.timelineItem.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

  const cfg = toPublicConfig(raw);

  // Guest stats
  const totalGuests = guests.reduce((s, g) => s + g.guestCount, 0);
  const confirmedGuests = guests.filter((g) => g.attending).reduce((s, g) => s + g.guestCount, 0);
  const declinedGuests = guests.filter((g) => g.attending === false).reduce((s, g) => s + g.guestCount, 0);
  const pendingRSVP = guests.filter((g) => g.attending === null).length;

  const groomSide = guests.filter((g) => g.side === "groom").reduce((s, g) => s + g.guestCount, 0);
  const brideSide = guests.filter((g) => g.side === "bride").reduce((s, g) => s + g.guestCount, 0);

  // Meal breakdown
  const mealMap: Record<string, number> = {};
  for (const g of guests.filter((g) => g.attending && g.mealChoice)) {
    mealMap[g.mealChoice] = (mealMap[g.mealChoice] ?? 0) + g.guestCount;
  }

  // Allergies
  const allergiesCount = guests.filter((g) => g.attending && g.allergies).length;

  // Budget
  const totalPlanned = budgetItems.reduce((s, i) => s + i.planned, 0);
  const totalActual = budgetItems.reduce((s, i) => s + i.actual, 0);

  // Alcohol low stock
  const lowStock = alcoholItems.filter((a) => a.quantity > 0 && a.quantity <= a.lowStockAt).length;

  // Vendors
  const bookedVendors = vendors.filter((v) => v.status === "booked").length;

  // Upcoming payments
  const today = new Date().toISOString().split("T")[0];
  const upcoming = vendors
    .flatMap((v) => {
      const payments = [];
      if (!v.depositPaid && v.depositDueDate && v.depositDueDate >= today) {
        payments.push({ vendor: v.name, label: "מקדמה", amount: v.depositAmount, date: v.depositDueDate });
      }
      if (!v.finalPaid && v.finalDueDate && v.finalDueDate >= today) {
        payments.push({ vendor: v.name, label: "תשלום סופי", amount: v.finalAmount, date: v.finalDueDate });
      }
      return payments;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Next timeline items
  const nextTasks = timeline.filter((t) => !t.done).slice(0, 3);

  // Days to wedding
  const weddingDate = new Date(cfg.weddingDate + "T18:00:00+03:00");
  const daysLeft = Math.max(0, Math.ceil((weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div dir="rtl" className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl italic text-[var(--color-charcoal)]">
          {cfg.groomNameHe} &amp; {cfg.brideNameHe}
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-body)" }}>
          {cfg.weddingDate} · {cfg.ceremonyTime} · {daysLeft} ימים לחתונה
        </p>
      </div>

      {/* Guest stats */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-3"
          style={{ fontFamily: "var(--font-body)" }}>
          אורחים
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="מוזמנים (כולל)" value={totalGuests} color="charcoal" />
          <StatCard label="מגיעים" value={confirmedGuests} color="sage" />
          <StatCard label="לא מגיעים" value={declinedGuests} color="rose" />
          <StatCard label="ממתינים לתשובה" value={pendingRSVP} sub="רשומות" color="blush" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <StatCard label="צד ניסן" value={groomSide} />
          <StatCard label="צד רוני" value={brideSide} />
        </div>
      </section>

      {/* Meals & Allergies */}
      {(Object.keys(mealMap).length > 0 || allergiesCount > 0) && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-3"
            style={{ fontFamily: "var(--font-body)" }}>
            מנות ואלרגיות
          </h2>
          <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
            {Object.keys(mealMap).length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {Object.entries(mealMap).map(([meal, count]) => (
                  <div key={meal} className="flex items-center gap-2 bg-stone-50 rounded-lg px-3 py-1.5">
                    <span className="text-sm text-[var(--color-charcoal)]">{meal}</span>
                    <span className="text-sm font-medium text-[var(--color-rose)]">{count}</span>
                  </div>
                ))}
              </div>
            )}
            {allergiesCount > 0 && (
              <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                <span className="font-medium text-[var(--color-charcoal)]">{allergiesCount}</span> אורחים ציינו אלרגיות / דיאטה מיוחדת.{" "}
                <Link href="/admin/guests" className="text-[var(--color-rose)] hover:underline">צפה בפרטים ←</Link>
              </p>
            )}
          </div>
        </section>
      )}

      {/* Budget + Alcohol row */}
      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-3"
            style={{ fontFamily: "var(--font-body)" }}>
            תקציב
          </h2>
          <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">מתוכנן</span>
              <span className="font-medium text-[var(--color-charcoal)]">₪{totalPlanned.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">בפועל</span>
              <span className="font-medium text-[var(--color-charcoal)]">₪{totalActual.toLocaleString()}</span>
            </div>
            {totalPlanned > 0 && (
              <div className="pt-1">
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-rose)] transition-all"
                    style={{ width: `${Math.min(100, (totalActual / totalPlanned) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {Math.round((totalActual / totalPlanned) * 100)}% נוצל
                </p>
              </div>
            )}
            <Link href="/admin/budget" className="block text-xs text-[var(--color-rose)] hover:underline mt-2">
              פרטי תקציב ←
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-3"
            style={{ fontFamily: "var(--font-body)" }}>
            אלכוהול
          </h2>
          <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">סה״כ פריטים</span>
              <span className="font-medium text-[var(--color-charcoal)]">{alcoholItems.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">סה״כ בקבוקים</span>
              <span className="font-medium text-[var(--color-charcoal)]">
                {alcoholItems.reduce((s, a) => s + a.quantity, 0)}
              </span>
            </div>
            {lowStock > 0 && (
              <p className="text-xs text-amber-600 font-medium">
                ⚠️ {lowStock} פריטים במלאי נמוך
              </p>
            )}
            <Link href="/admin/alcohol" className="block text-xs text-[var(--color-rose)] hover:underline mt-2">
              ניהול מלאי ←
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming payments */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-3"
            style={{ fontFamily: "var(--font-body)" }}>
            תשלומים קרובים
          </h2>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-stone-50">
              {upcoming.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <div>
                    <span className="font-medium text-[var(--color-charcoal)]">{p.vendor}</span>
                    <span className="text-[var(--color-muted)] mr-2">{p.label}</span>
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-[var(--color-rose)]">₪{p.amount.toLocaleString()}</span>
                    <span className="text-[var(--color-muted)] text-xs mr-2">{p.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Next checklist tasks */}
      {nextTasks.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-3"
            style={{ fontFamily: "var(--font-body)" }}>
            משימות הבאות
          </h2>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-stone-50">
              {nextTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3.5 text-sm">
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--color-blush)] flex-shrink-0" />
                  <span className="text-[var(--color-charcoal)]">{t.title}</span>
                  {t.time && <span className="text-xs text-[var(--color-muted)] mr-auto">{t.time}</span>}
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-stone-50">
              <Link href="/admin/timeline" className="text-xs text-[var(--color-rose)] hover:underline">
                לוח זמנים מלא ←
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Quick links */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-3"
          style={{ fontFamily: "var(--font-body)" }}>
          קישורים מהירים
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: "/admin/guests", label: "אורחים" },
            { href: "/admin/vendors", label: "ספקים" },
            { href: "/admin/alcohol", label: "אלכוהול" },
            { href: "/admin/budget", label: "תקציב" },
            { href: "/admin/timeline", label: "לוח זמנים" },
            { href: "/admin/settings", label: "הגדרות" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="bg-white border border-stone-100 rounded-xl px-4 py-3 text-sm text-center text-[var(--color-charcoal)] hover:bg-stone-50 transition"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Vendors booked */}
      <div className="text-xs text-[var(--color-muted)] text-center pb-4"
        style={{ fontFamily: "var(--font-body)" }}>
        {bookedVendors} ספקים מאושרים · {vendors.length} ספקים סה״כ
      </div>
    </div>
  );
}
