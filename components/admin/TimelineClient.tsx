"use client";

import { useState } from "react";

interface TimelineItem {
  id: number;
  time: string;
  title: string;
  owner: string;
  done: boolean;
  category: string;
  notes: string;
  sortOrder: number;
}

const CATEGORIES: Record<string, string> = {
  general: "כללי",
  ceremony: "טקס",
  reception: "קבלת פנים",
  logistics: "לוגיסטיקה",
  vendors: "ספקים",
  personal: "אישי",
};

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-stone-200 bg-[var(--color-ivory)] text-sm text-[var(--color-charcoal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blush)] transition";

interface ItemForm {
  time: string;
  title: string;
  owner: string;
  category: string;
  notes: string;
}

const EMPTY_FORM: ItemForm = { time: "", title: "", owner: "", category: "general", notes: "" };

export default function TimelineClient({ initialItems }: { initialItems: TimelineItem[] }) {
  const [items, setItems] = useState<TimelineItem[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<TimelineItem | null>(null);
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const done = items.filter((i) => i.done).length;
  const total = items.length;

  // Group by category
  const byCategory = Object.entries(CATEGORIES)
    .map(([key, label]) => ({ key, label, items: items.filter((i) => i.category === key) }))
    .filter((g) => g.items.length > 0);

  // Items with no known category
  const knownKeys = Object.keys(CATEGORIES);
  const uncategorized = items.filter((i) => !knownKeys.includes(i.category));
  if (uncategorized.length > 0) byCategory.push({ key: "other", label: "אחר", items: uncategorized });

  function openAdd() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(item: TimelineItem) {
    setEditItem(item);
    setForm({ time: item.time, title: item.title, owner: item.owner, category: item.category, notes: item.notes });
    setShowForm(true);
  }

  async function toggleDone(item: TimelineItem) {
    const res = await fetch(`/api/timeline/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !item.done }),
    });
    const updated: TimelineItem = await res.json();
    setItems((is) => is.map((i) => (i.id === updated.id ? updated : i)));
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editItem) {
        const res = await fetch(`/api/timeline/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated: TimelineItem = await res.json();
        setItems((is) => is.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const res = await fetch("/api/timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, sortOrder: items.length }),
        });
        const created: TimelineItem = await res.json();
        setItems((is) => [...is, created]);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("למחוק פריט זה?")) return;
    await fetch(`/api/timeline/${id}`, { method: "DELETE" });
    setItems((is) => is.filter((i) => i.id !== id));
  }

  return (
    <div dir="rtl" className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-[var(--color-charcoal)]">לוח זמנים</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-lg bg-[var(--color-charcoal)] text-white text-sm hover:bg-[var(--color-rose)] transition"
        >
          + הוסף פריט
        </button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-muted)]">התקדמות</span>
            <span className="text-sm font-medium text-[var(--color-charcoal)]">{done} / {total}</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-sage)] rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {total === 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
          <p className="font-display text-lg italic text-[var(--color-muted)]">אין פריטים עדיין</p>
        </div>
      )}

      {/* Grouped list */}
      {byCategory.map((group) => (
        <div key={group.key} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-50 bg-stone-50/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">{group.label}</span>
          </div>
          <ul className="divide-y divide-stone-50">
            {group.items
              .slice()
              .sort((a, b) => (a.time || "").localeCompare(b.time || "") || a.sortOrder - b.sortOrder)
              .map((item) => (
                <li key={item.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-stone-50/50 transition ${item.done ? "opacity-60" : ""}`}>
                  {/* Done toggle */}
                  <button
                    onClick={() => toggleDone(item)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                      item.done
                        ? "bg-[var(--color-sage)] border-[var(--color-sage)] text-white"
                        : "border-stone-300 hover:border-[var(--color-sage)]"
                    }`}
                  >
                    {item.done && <span className="text-xs">✓</span>}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      {item.time && (
                        <span className="text-xs font-mono text-[var(--color-muted)] shrink-0">{item.time}</span>
                      )}
                      <span className={`font-medium text-sm ${item.done ? "line-through text-[var(--color-muted)]" : "text-[var(--color-charcoal)]"}`}>
                        {item.title}
                      </span>
                      {item.owner && (
                        <span className="text-xs text-[var(--color-muted)]">· {item.owner}</span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">{item.notes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(item)} className="text-xs text-[var(--color-muted)] hover:text-[var(--color-charcoal)] px-2 py-1 rounded hover:bg-stone-100 transition">עריכה</button>
                    <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition">מחק</button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h3 className="font-display text-lg italic text-[var(--color-charcoal)]">
                {editItem ? "עריכת פריט" : "פריט חדש"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-[var(--color-muted)]">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">כותרת *</label>
                <input className={INPUT} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">שעה</label>
                <input type="time" className={INPUT} dir="ltr" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">אחראי</label>
                <input className={INPUT} value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">קטגוריה</label>
                <select className={INPUT} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {Object.entries(CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">הערות</label>
                <input className={INPUT} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-stone-100">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-stone-200 text-sm hover:bg-stone-50 transition">ביטול</button>
              <button onClick={handleSave} disabled={saving || !form.title.trim()} className="flex-1 py-2.5 rounded-lg bg-[var(--color-charcoal)] text-white text-sm font-medium hover:bg-[var(--color-rose)] transition disabled:opacity-50">
                {saving ? "שומר..." : "שמור"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
