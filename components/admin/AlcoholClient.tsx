"use client";

import { AlcoholItem } from "@prisma/client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CATEGORIES = ["whisky", "vodka", "gin", "arak", "wine", "beer", "champagne", "other"] as const;
const STATUSES = ["planned", "purchased", "arrived", "opened"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  whisky: "ויסקי", vodka: "וודקה", gin: "ג׳ין", arak: "ערק",
  wine: "יין", beer: "בירה", champagne: "שמפנייה", other: "אחר",
};
const STATUS_LABELS: Record<string, string> = {
  planned: "מתוכנן", purchased: "נרכש", arrived: "הגיע", opened: "נפתח",
};
const STATUS_COLORS: Record<string, string> = {
  planned: "bg-stone-100 text-stone-600",
  purchased: "bg-blue-50 text-blue-700",
  arrived: "bg-green-50 text-green-700",
  opened: "bg-amber-50 text-amber-700",
};

const CHART_COLORS = ["#e8c4b0", "#c9897a", "#8fa68e", "#b5c9b4", "#d4c5b0", "#a8b5a0", "#e0d0c0", "#c0b8b0"];

interface ItemForm {
  category: string;
  name: string;
  volumeMl: number;
  abv: number;
  pricePerUnit: number;
  quantity: number;
  lowStockAt: number;
  status: string;
  notes: string;
}

const EMPTY_FORM: ItemForm = {
  category: "wine", name: "", volumeMl: 750, abv: 0,
  pricePerUnit: 0, quantity: 0, lowStockAt: 2, status: "planned", notes: "",
};

export default function AlcoholClient({ initialItems }: { initialItems: AlcoholItem[] }) {
  const [items, setItems] = useState<AlcoholItem[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<AlcoholItem | null>(null);
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Analytics
  const byCategory = CATEGORIES.map((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    return {
      name: CATEGORY_LABELS[cat],
      bottles: catItems.reduce((s, i) => s + i.quantity, 0),
      liters: catItems.reduce((s, i) => s + (i.quantity * i.volumeMl) / 1000, 0),
    };
  }).filter((c) => c.bottles > 0);

  const totalBottles = items.reduce((s, i) => s + i.quantity, 0);
  const totalLiters = items.reduce((s, i) => s + (i.quantity * i.volumeMl) / 1000, 0);
  const lowStock = items.filter((i) => i.quantity > 0 && i.quantity <= i.lowStockAt);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditItem(null);
    setShowForm(true);
  }

  function openEdit(item: AlcoholItem) {
    setForm({
      category: item.category, name: item.name, volumeMl: item.volumeMl,
      abv: item.abv, pricePerUnit: item.pricePerUnit, quantity: item.quantity,
      lowStockAt: item.lowStockAt, status: item.status, notes: item.notes,
    });
    setEditItem(item);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) {
        const res = await fetch(`/api/alcohol/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setItems((is) => is.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const res = await fetch("/api/alcohol", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const created = await res.json();
        setItems((is) => [...is, created]);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("למחוק פריט זה?")) return;
    await fetch(`/api/alcohol/${id}`, { method: "DELETE" });
    setItems((is) => is.filter((i) => i.id !== id));
  }

  return (
    <div dir="rtl" className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-[var(--color-charcoal)]">מלאי אלכוהול</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-lg bg-[var(--color-charcoal)] text-white text-sm hover:bg-[var(--color-rose)] transition"
        >
          + הוסף פריט
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-light text-[var(--color-charcoal)] font-display">{totalBottles}</p>
          <p className="text-xs text-[var(--color-muted)] mt-1">בקבוקים</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-light text-[var(--color-charcoal)] font-display">{totalLiters.toFixed(1)}L</p>
          <p className="text-xs text-[var(--color-muted)] mt-1">נפח כולל</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm text-center">
          <p className={`text-2xl font-light font-display ${lowStock.length > 0 ? "text-amber-600" : "text-[var(--color-sage)]"}`}>
            {lowStock.length}
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-1">מלאי נמוך</p>
        </div>
      </div>

      {/* Chart */}
      {byCategory.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-4">
            בקבוקים לפי קטגוריה
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byCategory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number | undefined) => [`${v ?? 0} בקבוקים`]} />
              <Bar dataKey="bottles" radius={[4, 4, 0, 0]}>
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm font-medium text-amber-800 mb-2">⚠️ מלאי נמוך</p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((i) => (
              <span key={i.id} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                {i.name} ({i.quantity})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Items table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-lg italic text-[var(--color-muted)]">אין פריטים עדיין</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: "var(--font-body)" }}>
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-right">
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">קטגוריה</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">שם</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">נפח</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">כמות</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">סטטוס</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">מחיר</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {items.map((item) => (
                  <tr key={item.id} className={`hover:bg-stone-50/50 transition ${item.quantity > 0 && item.quantity <= item.lowStockAt ? "bg-amber-50/30" : ""}`}>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{CATEGORY_LABELS[item.category] || item.category}</td>
                    <td className="px-4 py-3 font-medium text-[var(--color-charcoal)]">{item.name}</td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{item.volumeMl}ml</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${item.quantity <= item.lowStockAt && item.quantity > 0 ? "text-amber-600" : "text-[var(--color-charcoal)]"}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || "bg-stone-100 text-stone-600"}`}>
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">
                      {item.pricePerUnit > 0 ? `₪${item.pricePerUnit}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(item)} className="text-xs text-[var(--color-muted)] hover:text-[var(--color-charcoal)] px-2 py-1 rounded hover:bg-stone-100 transition">עריכה</button>
                        <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition">מחק</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h3 className="font-display text-lg italic text-[var(--color-charcoal)]">
                {editItem ? "עריכת פריט" : "הוספת פריט"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-[var(--color-muted)] p-1">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">קטגוריה</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">שם / מותג *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">נפח (ml)</label>
                <input type="number" min={1} value={form.volumeMl} onChange={(e) => setForm({ ...form, volumeMl: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">כמות</label>
                <input type="number" min={0} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">ABV (%)</label>
                <input type="number" min={0} max={100} step={0.1} value={form.abv} onChange={(e) => setForm({ ...form, abv: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">מחיר ליחידה (₪)</label>
                <input type="number" min={0} step={0.01} value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">התראת מלאי נמוך</label>
                <input type="number" min={0} value={form.lowStockAt} onChange={(e) => setForm({ ...form, lowStockAt: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">סטטוס</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none">
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">הערות</label>
                <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-stone-100">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-stone-200 text-sm hover:bg-stone-50 transition">ביטול</button>
              <button onClick={handleSave} disabled={saving || !form.name} className="flex-1 py-2.5 rounded-lg bg-[var(--color-charcoal)] text-white text-sm font-medium hover:bg-[var(--color-rose)] transition disabled:opacity-50">
                {saving ? "שומר..." : "שמור"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
