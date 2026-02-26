"use client";

import { useState } from "react";

interface RsvpFormProps {
  mealOptions: string[];
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  attending: boolean | null;
  guestCount: number;
  side: "groom" | "bride" | "other" | "";
  mealChoice: string;
  allergies: string;
  notes: string;
  website: string; // honeypot
}

const INITIAL: FormData = {
  name: "",
  phone: "",
  email: "",
  attending: null,
  guestCount: 1,
  side: "",
  mealChoice: "",
  allergies: "",
  notes: "",
  website: "",
};

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < step
              ? "w-6 bg-[var(--color-charcoal)]"
              : i === step
              ? "w-6 bg-[var(--color-rose)]"
              : "w-4 bg-[var(--color-cream)]"
          }`}
        />
      ))}
    </div>
  );
}

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-cream)] p-7 shadow-sm">
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5"
      style={{ fontFamily: "var(--font-body)" }}>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-2.5 rounded-lg border border-[var(--color-cream)] bg-[var(--color-ivory)] text-[var(--color-charcoal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blush)] transition text-sm ${props.className ?? ""}`}
    />
  );
}

function RadioCard({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition ${
        checked
          ? "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-white"
          : "border-[var(--color-cream)] text-[var(--color-charcoal)] hover:border-[var(--color-blush)]"
      }`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {label}
    </button>
  );
}

export default function RsvpForm({ mealOptions }: RsvpFormProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const TOTAL_STEPS = 3;

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function canProceed(): boolean {
    if (step === 0) return data.name.trim().length >= 2 && data.attending !== null;
    if (step === 1) return data.side !== "" && data.guestCount >= 1;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email,
          attending: data.attending ?? false,
          guestCount: data.guestCount,
          side: data.side || "other",
          mealChoice: data.mealChoice,
          allergies: data.allergies,
          notes: data.notes,
          website: data.website, // honeypot
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "שגיאה. נסה שוב.");
      } else {
        setDone(true);
      }
    } catch {
      setError("שגיאת רשת. נסה שוב.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <FormCard>
        <div className="text-center py-4" dir="rtl">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-2xl italic text-[var(--color-charcoal)] mb-2">
            {data.attending ? "!מחכים לך" : "תודה על העדכון"}
          </h2>
          <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-body)" }}>
            {data.attending
              ? "קיבלנו את האישור שלך. נתראה בשמחה!"
              : "קיבלנו את תשובתך. תודה רבה!"}
          </p>
        </div>
      </FormCard>
    );
  }

  return (
    <div dir="rtl">
      <StepIndicator step={step} total={TOTAL_STEPS} />

      {/* Honeypot - visually hidden */}
      <div style={{ display: "none" }} aria-hidden>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={data.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>

      {step === 0 && (
        <FormCard>
          <h2 className="font-display text-xl italic text-[var(--color-charcoal)] mb-6">
            פרטים אישיים
          </h2>
          <div className="space-y-4">
            <div>
              <Label>שם מלא *</Label>
              <Input
                type="text"
                value={data.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="שם ושם משפחה"
                required
                maxLength={100}
              />
            </div>
            <div>
              <Label>טלפון</Label>
              <Input
                type="tel"
                value={data.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="050-0000000"
                dir="ltr"
              />
            </div>
            <div>
              <Label>האם מגיעים? *</Label>
              <div className="flex gap-3">
                <RadioCard
                  label="כן, מגיעים! 🎉"
                  checked={data.attending === true}
                  onClick={() => set("attending", true)}
                />
                <RadioCard
                  label="לא יכולים"
                  checked={data.attending === false}
                  onClick={() => set("attending", false)}
                />
              </div>
            </div>
          </div>
        </FormCard>
      )}

      {step === 1 && (
        <FormCard>
          <h2 className="font-display text-xl italic text-[var(--color-charcoal)] mb-6">
            פרטי הגעה
          </h2>
          <div className="space-y-4">
            {data.attending && (
              <div>
                <Label>מספר אורחים (כולל אתם) *</Label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set("guestCount", Math.max(1, data.guestCount - 1))}
                    className="w-10 h-10 rounded-full border border-[var(--color-cream)] flex items-center justify-center text-lg hover:bg-[var(--color-cream)] transition"
                  >
                    −
                  </button>
                  <span className="text-xl font-light text-[var(--color-charcoal)] w-8 text-center">
                    {data.guestCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => set("guestCount", Math.min(20, data.guestCount + 1))}
                    className="w-10 h-10 rounded-full border border-[var(--color-cream)] flex items-center justify-center text-lg hover:bg-[var(--color-cream)] transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            <div>
              <Label>מצד מי? *</Label>
              <div className="flex gap-3">
                <RadioCard
                  label="ניסן"
                  checked={data.side === "groom"}
                  onClick={() => set("side", "groom")}
                />
                <RadioCard
                  label="רוני"
                  checked={data.side === "bride"}
                  onClick={() => set("side", "bride")}
                />
                <RadioCard
                  label="שניהם"
                  checked={data.side === "other"}
                  onClick={() => set("side", "other")}
                />
              </div>
            </div>
          </div>
        </FormCard>
      )}

      {step === 2 && (
        <FormCard>
          <h2 className="font-display text-xl italic text-[var(--color-charcoal)] mb-6">
            העדפות
          </h2>
          <div className="space-y-4">
            {data.attending && mealOptions.length > 0 && (
              <div>
                <Label>העדפת מנה</Label>
                <div className="flex flex-wrap gap-2">
                  {mealOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set("mealChoice", data.mealChoice === opt ? "" : opt)}
                      className={`px-4 py-2 rounded-full border text-sm transition ${
                        data.mealChoice === opt
                          ? "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-white"
                          : "border-[var(--color-cream)] text-[var(--color-charcoal)] hover:border-[var(--color-blush)]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label>אלרגיות / דיאטה מיוחדת</Label>
              <Input
                type="text"
                value={data.allergies}
                onChange={(e) => set("allergies", e.target.value)}
                placeholder="גלוטן, חלב, אגוזים..."
                maxLength={500}
              />
            </div>
            <div>
              <Label>הערות</Label>
              <textarea
                value={data.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="כל הערה נוספת..."
                maxLength={1000}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-cream)] bg-[var(--color-ivory)] text-[var(--color-charcoal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blush)] transition text-sm resize-none"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>
          </div>
        </FormCard>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600 text-center" style={{ fontFamily: "var(--font-body)" }}>
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-5">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 rounded-xl border border-[var(--color-cream)] text-sm text-[var(--color-charcoal)] hover:bg-[var(--color-cream)] transition"
            style={{ fontFamily: "var(--font-body)" }}
          >
            חזרה
          </button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex-1 py-3 rounded-xl bg-[var(--color-charcoal)] text-white text-sm font-medium hover:bg-[var(--color-rose)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            המשך
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-[var(--color-charcoal)] text-white text-sm font-medium hover:bg-[var(--color-rose)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {submitting ? "שולח..." : "שלח אישור"}
          </button>
        )}
      </div>
    </div>
  );
}
