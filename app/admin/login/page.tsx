"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  useEffect(() => {
    if (params.get("setup") === "done") setSetupDone(true);
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "שגיאת התחברות.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("שגיאת רשת. נסה שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-[var(--color-charcoal)] mb-2">
            כניסה למנהל
          </h1>
          <p className="text-[var(--color-muted)] text-sm">
            לוח הבקרה של האירוע
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-cream)] p-8">
          {setupDone && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              החשבון נוצר בהצלחה. אנא התחבר.
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                אימייל
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-cream)] bg-[var(--color-ivory)] text-[var(--color-charcoal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blush)] transition"
                placeholder="admin@example.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                סיסמה
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-cream)] bg-[var(--color-ivory)] text-[var(--color-charcoal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blush)] transition"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--color-charcoal)] text-white rounded-lg font-medium hover:bg-[var(--color-rose)] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "מתחבר..." : "כניסה"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
