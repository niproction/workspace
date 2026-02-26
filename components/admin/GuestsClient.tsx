"use client";

import { Guest } from "@prisma/client";
import { useState } from "react";

interface GuestsClientProps {
  initialGuests: Guest[];
}

function formatSide(side: string) {
  return side === "groom" ? "ניסן" : side === "bride" ? "רוני" : "אחר";
}

function formatAttending(attending: boolean | null) {
  if (attending === null) return { label: "ממתין", cls: "bg-stone-100 text-stone-600" };
  return attending
    ? { label: "מגיע", cls: "bg-green-50 text-green-700" }
    : { label: "לא מגיע", cls: "bg-red-50 text-red-700" };
}

function Badge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function EditModal({
  guest,
  mealOptions,
  onClose,
  onSave,
}: {
  guest: Guest;
  mealOptions: string[];
  onClose: () => void;
  onSave: (updated: Guest) => void;
}) {
  const [form, setForm] = useState({
    name: guest.name,
    phone: guest.phone,
    email: guest.email,
    side: guest.side,
    attending: guest.attending,
    guestCount: guest.guestCount,
    mealChoice: guest.mealChoice,
    allergies: guest.allergies,
    notes: guest.notes,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/guests/${guest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("שגיאה בשמירה");
      const updated = await res.json();
      onSave(updated);
    } catch {
      setError("שגיאה בשמירה. נסה שוב.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h3 className="font-display text-lg italic text-[var(--color-charcoal)]">עריכת אורח</h3>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-charcoal)] p-1">✕</button>
        </div>
        <div className="p-5 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {[
            { label: "שם", key: "name", type: "text" },
            { label: "טלפון", key: "phone", type: "tel" },
            { label: "אימייל", key: "email", type: "email" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">{label}</label>
              <input
                type={type}
                value={(form as Record<string, unknown>)[key] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-blush)]"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">השתתפות</label>
            <select
              value={form.attending === null ? "null" : String(form.attending)}
              onChange={(e) => setForm({ ...form, attending: e.target.value === "null" ? null : e.target.value === "true" })}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
            >
              <option value="null">ממתין</option>
              <option value="true">מגיע</option>
              <option value="false">לא מגיע</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">מספר אורחים</label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.guestCount}
              onChange={(e) => setForm({ ...form, guestCount: parseInt(e.target.value, 10) || 1 })}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">צד</label>
            <select
              value={form.side}
              onChange={(e) => setForm({ ...form, side: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
            >
              <option value="groom">ניסן</option>
              <option value="bride">רוני</option>
              <option value="other">אחר</option>
            </select>
          </div>

          {mealOptions.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">מנה</label>
              <select
                value={form.mealChoice}
                onChange={(e) => setForm({ ...form, mealChoice: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
              >
                <option value="">לא נבחר</option>
                {mealOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">אלרגיות</label>
            <input
              type="text"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">הערות</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-stone-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-stone-200 text-sm text-[var(--color-charcoal)] hover:bg-stone-50 transition"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-[var(--color-charcoal)] text-white text-sm font-medium hover:bg-[var(--color-rose)] transition disabled:opacity-50"
          >
            {saving ? "שומר..." : "שמור"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GuestsClient({ initialGuests }: GuestsClientProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [search, setSearch] = useState("");
  const [filterSide, setFilterSide] = useState("");
  const [filterAttending, setFilterAttending] = useState("");
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const filtered = guests.filter((g) => {
    if (search) {
      const q = search.toLowerCase();
      if (!g.name.toLowerCase().includes(q) && !g.phone.includes(q) && !g.email.toLowerCase().includes(q))
        return false;
    }
    if (filterSide && g.side !== filterSide) return false;
    if (filterAttending === "yes" && !g.attending) return false;
    if (filterAttending === "no" && g.attending !== false) return false;
    if (filterAttending === "pending" && g.attending !== null) return false;
    return true;
  });

  const totalFiltered = filtered.reduce((s, g) => s + g.guestCount, 0);

  async function handleDelete(id: number) {
    if (!confirm("למחוק אורח זה?")) return;
    setDeleting(id);
    await fetch(`/api/guests/${id}`, { method: "DELETE" });
    setGuests((gs) => gs.filter((g) => g.id !== id));
    setDeleting(null);
  }

  return (
    <div dir="rtl" className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-[var(--color-charcoal)]">אורחים</h1>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/guests/export"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-charcoal)] text-white text-sm hover:bg-[var(--color-rose)] transition"
        >
          ⬇ ייצוא CSV
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="חיפוש שם / טלפון..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-4 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-blush)]"
        />
        <select
          value={filterSide}
          onChange={(e) => setFilterSide(e.target.value)}
          className="px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
        >
          <option value="">כל הצדדים</option>
          <option value="groom">ניסן</option>
          <option value="bride">רוני</option>
          <option value="other">אחר</option>
        </select>
        <select
          value={filterAttending}
          onChange={(e) => setFilterAttending(e.target.value)}
          className="px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
        >
          <option value="">כל הסטטוסים</option>
          <option value="yes">מגיעים</option>
          <option value="no">לא מגיעים</option>
          <option value="pending">ממתינים</option>
        </select>
      </div>

      <p className="text-xs text-[var(--color-muted)]" style={{ fontFamily: "var(--font-body)" }}>
        מציג {filtered.length} רשומות · {totalFiltered} אורחים
      </p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[var(--color-muted)] italic font-display text-lg">אין אורחים</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: "var(--font-body)" }}>
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-right">
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">שם</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">טלפון</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">צד</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">סטטוס</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">מנה</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((g) => {
                  const att = formatAttending(g.attending);
                  return (
                    <tr key={g.id} className="hover:bg-stone-50/50 transition">
                      <td className="px-4 py-3 font-medium text-[var(--color-charcoal)]">
                        {g.name}
                        {g.allergies && <span className="mr-1 text-amber-500" title={g.allergies}>⚠</span>}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-muted)] text-xs" dir="ltr">{g.phone || "—"}</td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">{formatSide(g.side)}</td>
                      <td className="px-4 py-3"><Badge label={att.label} cls={att.cls} /></td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">{g.guestCount}</td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">{g.mealChoice || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditGuest(g)}
                            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-charcoal)] px-2 py-1 rounded hover:bg-stone-100 transition"
                          >
                            עריכה
                          </button>
                          <button
                            onClick={() => handleDelete(g.id)}
                            disabled={deleting === g.id}
                            className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition"
                          >
                            מחק
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editGuest && (
        <EditModal
          guest={editGuest}
          mealOptions={[]}
          onClose={() => setEditGuest(null)}
          onSave={(updated) => {
            setGuests((gs) => gs.map((g) => (g.id === updated.id ? updated : g)));
            setEditGuest(null);
          }}
        />
      )}
    </div>
  );
}
