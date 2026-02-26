"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if setup is still required
    fetch("/api/setup")
      .then((r) => r.json())
      .then((data) => {
        if (!data.setupRequired) {
          router.replace("/admin/login");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("הסיסמאות אינן תואמות.");
      return;
    }
    if (password.length < 8) {
      setError("הסיסמה חייבת להכיל לפחות 8 תווים.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "שגיאה ביצירת המשתמש.");
      } else {
        router.push("/admin/login?setup=done");
      }
    } catch {
      setError("שגיאת רשת. נסה שוב.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[var(--color-ivory)] flex items-center justify-center">
        <p className="text-[var(--color-muted)]">טוען...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-[var(--color-charcoal)] mb-2">
            הגדרת מנהל
          </h1>
          <p className="text-[var(--color-muted)] text-sm">
            צור את חשבון המנהל הראשון לאתר
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-cream)] p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                כתובת אימייל
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
                minLength={8}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-cream)] bg-[var(--color-ivory)] text-[var(--color-charcoal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blush)] transition"
                placeholder="לפחות 8 תווים"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                אימות סיסמה
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-cream)] bg-[var(--color-ivory)] text-[var(--color-charcoal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blush)] transition"
                placeholder="הזן שוב את הסיסמה"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--color-charcoal)] text-white rounded-lg font-medium hover:bg-[var(--color-rose)] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "יוצר חשבון..." : "צור חשבון מנהל"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
