"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

interface Config {
  groomNameHe: string;
  groomNameEn: string;
  brideNameHe: string;
  brideNameEn: string;
  weddingDate: string;
  ceremonyTime: string;
  receptionTime: string;
  timezone: string;
  venueNameHe: string;
  venueNameEn: string;
  venueAddress: string;
  venueWazeUrl: string;
  venueMapsUrl: string;
  rsvpDeadline: string;
  mealOptions: string[];
  faqContent: FaqItem[];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
      <h2 className="font-display text-lg italic text-[var(--color-charcoal)] border-b border-stone-100 pb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">{label}</label>
      {children}
    </div>
  );
}

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-stone-200 bg-[var(--color-ivory)] text-sm text-[var(--color-charcoal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blush)] transition";

export default function SettingsClient({ initial }: { initial: Config }) {
  const [cfg, setCfg] = useState<Config>(initial);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // FAQ draft
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  // Meal option draft
  const [newMeal, setNewMeal] = useState("");

  function set(field: keyof Config, value: unknown) {
    setCfg((c) => ({ ...c, [field]: value }));
  }

  async function save(section: string, payload: Partial<Config>) {
    setSaving(section);
    setError(null);
    setSaved(null);
    try {
      const res = await fetch("/api/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("שגיאה בשמירה");
      setSaved(section);
      setTimeout(() => setSaved(null), 2500);
    } catch {
      setError("שגיאה בשמירה. נסה שוב.");
    } finally {
      setSaving(null);
    }
  }

  function SaveButton({ section, payload }: { section: string; payload: Partial<Config> }) {
    const isSaving = saving === section;
    const isDone = saved === section;
    return (
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => save(section, payload)}
          disabled={!!saving}
          className="px-5 py-2 rounded-lg bg-[var(--color-charcoal)] text-white text-sm font-medium hover:bg-[var(--color-rose)] transition disabled:opacity-50"
        >
          {isSaving ? "שומר..." : "שמור"}
        </button>
        {isDone && <span className="text-xs text-[var(--color-sage)]">נשמר ✓</span>}
        {error && saving === null && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl italic text-[var(--color-charcoal)]">הגדרות</h1>

      {/* Details */}
      <Section title="פרטי החתונה">
        <div className="grid grid-cols-2 gap-4">
          <Field label="שם החתן (עברית)">
            <input className={INPUT} value={cfg.groomNameHe} onChange={(e) => set("groomNameHe", e.target.value)} />
          </Field>
          <Field label="שם החתן (אנגלית)">
            <input className={INPUT} dir="ltr" value={cfg.groomNameEn} onChange={(e) => set("groomNameEn", e.target.value)} />
          </Field>
          <Field label="שם הכלה (עברית)">
            <input className={INPUT} value={cfg.brideNameHe} onChange={(e) => set("brideNameHe", e.target.value)} />
          </Field>
          <Field label="שם הכלה (אנגלית)">
            <input className={INPUT} dir="ltr" value={cfg.brideNameEn} onChange={(e) => set("brideNameEn", e.target.value)} />
          </Field>
          <Field label="תאריך החתונה">
            <input type="date" className={INPUT} dir="ltr" value={cfg.weddingDate} onChange={(e) => set("weddingDate", e.target.value)} />
          </Field>
          <Field label="אזור זמן">
            <input className={INPUT} dir="ltr" value={cfg.timezone} onChange={(e) => set("timezone", e.target.value)} />
          </Field>
          <Field label="שעת טקס">
            <input type="time" className={INPUT} dir="ltr" value={cfg.ceremonyTime} onChange={(e) => set("ceremonyTime", e.target.value)} />
          </Field>
          <Field label="שעת קבלת פנים">
            <input type="time" className={INPUT} dir="ltr" value={cfg.receptionTime} onChange={(e) => set("receptionTime", e.target.value)} />
          </Field>
          <Field label="דדליין RSVP">
            <input type="date" className={INPUT} dir="ltr" value={cfg.rsvpDeadline} onChange={(e) => set("rsvpDeadline", e.target.value)} />
          </Field>
        </div>
        <SaveButton
          section="details"
          payload={{
            groomNameHe: cfg.groomNameHe,
            groomNameEn: cfg.groomNameEn,
            brideNameHe: cfg.brideNameHe,
            brideNameEn: cfg.brideNameEn,
            weddingDate: cfg.weddingDate,
            ceremonyTime: cfg.ceremonyTime,
            receptionTime: cfg.receptionTime,
            timezone: cfg.timezone,
            rsvpDeadline: cfg.rsvpDeadline,
          }}
        />
      </Section>

      {/* Venue */}
      <Section title="מקום האירוע">
        <div className="grid grid-cols-2 gap-4">
          <Field label="שם האולם (עברית)">
            <input className={INPUT} value={cfg.venueNameHe} onChange={(e) => set("venueNameHe", e.target.value)} />
          </Field>
          <Field label="שם האולם (אנגלית)">
            <input className={INPUT} dir="ltr" value={cfg.venueNameEn} onChange={(e) => set("venueNameEn", e.target.value)} />
          </Field>
          <div className="col-span-2">
            <Field label="כתובת">
              <input className={INPUT} value={cfg.venueAddress} onChange={(e) => set("venueAddress", e.target.value)} />
            </Field>
          </div>
          <Field label="קישור Waze">
            <input className={INPUT} dir="ltr" placeholder="https://waze.com/..." value={cfg.venueWazeUrl} onChange={(e) => set("venueWazeUrl", e.target.value)} />
          </Field>
          <Field label="קישור Google Maps">
            <input className={INPUT} dir="ltr" placeholder="https://maps.google.com/..." value={cfg.venueMapsUrl} onChange={(e) => set("venueMapsUrl", e.target.value)} />
          </Field>
        </div>
        <SaveButton
          section="venue"
          payload={{
            venueNameHe: cfg.venueNameHe,
            venueNameEn: cfg.venueNameEn,
            venueAddress: cfg.venueAddress,
            venueWazeUrl: cfg.venueWazeUrl,
            venueMapsUrl: cfg.venueMapsUrl,
          }}
        />
      </Section>

      {/* Meal options */}
      <Section title="אפשרויות ארוחה">
        <div className="flex flex-wrap gap-2">
          {cfg.mealOptions.map((opt, i) => (
            <span key={i} className="flex items-center gap-1 px-3 py-1 bg-stone-100 rounded-full text-sm text-[var(--color-charcoal)]">
              {opt}
              <button
                onClick={() => set("mealOptions", cfg.mealOptions.filter((_, j) => j !== i))}
                disabled={cfg.mealOptions.length <= 1}
                className="text-[var(--color-muted)] hover:text-red-500 disabled:opacity-30 transition ml-1"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className={INPUT}
            placeholder="אפשרות חדשה..."
            value={newMeal}
            onChange={(e) => setNewMeal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newMeal.trim()) {
                set("mealOptions", [...cfg.mealOptions, newMeal.trim()]);
                setNewMeal("");
              }
            }}
          />
          <button
            onClick={() => {
              if (newMeal.trim()) {
                set("mealOptions", [...cfg.mealOptions, newMeal.trim()]);
                setNewMeal("");
              }
            }}
            className="px-4 py-2 rounded-lg bg-stone-100 text-sm hover:bg-stone-200 transition whitespace-nowrap"
          >
            + הוסף
          </button>
        </div>
        <SaveButton section="meals" payload={{ mealOptions: cfg.mealOptions }} />
      </Section>

      {/* FAQ */}
      <Section title="שאלות נפוצות (FAQ)">
        <div className="space-y-3">
          {cfg.faqContent.map((item, i) => (
            <div key={i} className="border border-stone-100 rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <input
                    className={INPUT}
                    placeholder="שאלה"
                    value={item.q}
                    onChange={(e) => {
                      const updated = [...cfg.faqContent];
                      updated[i] = { ...updated[i], q: e.target.value };
                      set("faqContent", updated);
                    }}
                  />
                  <textarea
                    className={INPUT + " resize-none"}
                    rows={2}
                    placeholder="תשובה"
                    value={item.a}
                    onChange={(e) => {
                      const updated = [...cfg.faqContent];
                      updated[i] = { ...updated[i], a: e.target.value };
                      set("faqContent", updated);
                    }}
                  />
                </div>
                <button
                  onClick={() => set("faqContent", cfg.faqContent.filter((_, j) => j !== i))}
                  className="text-[var(--color-muted)] hover:text-red-500 transition mt-1 shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new FAQ */}
        <div className="border border-dashed border-stone-200 rounded-xl p-4 space-y-2">
          <input
            className={INPUT}
            placeholder="שאלה חדשה..."
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
          />
          <textarea
            className={INPUT + " resize-none"}
            rows={2}
            placeholder="תשובה..."
            value={newA}
            onChange={(e) => setNewA(e.target.value)}
          />
          <button
            onClick={() => {
              if (newQ.trim() && newA.trim()) {
                set("faqContent", [...cfg.faqContent, { q: newQ.trim(), a: newA.trim() }]);
                setNewQ("");
                setNewA("");
              }
            }}
            disabled={!newQ.trim() || !newA.trim()}
            className="px-4 py-2 rounded-lg bg-stone-100 text-sm hover:bg-stone-200 transition disabled:opacity-40"
          >
            + הוסף שאלה
          </button>
        </div>

        <SaveButton section="faq" payload={{ faqContent: cfg.faqContent }} />
      </Section>
    </div>
  );
}
