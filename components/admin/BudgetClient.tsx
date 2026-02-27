"use client";

import { useState } from "react";

interface BudgetItem {
  id: number;
  categoryId: number;
  description: string;
  planned: number;
  actual: number;
  paid: boolean;
  notes: string;
}

interface BudgetCategory {
  id: number;
  name: string;
  sortOrder: number;
  items: BudgetItem[];
}

export function calcTotals(categories: BudgetCategory[]) {
  const items = categories.flatMap((c) => c.items);
  return {
    planned: items.reduce((s, i) => s + i.planned, 0),
    actual: items.reduce((s, i) => s + i.actual, 0),
    paid: items.filter((i) => i.paid).reduce((s, i) => s + i.actual, 0),
  };
}

export function calcCategoryTotals(items: BudgetItem[]) {
  return {
    planned: items.reduce((s, i) => s + i.planned, 0),
    actual: items.reduce((s, i) => s + i.actual, 0),
  };
}

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-stone-200 bg-[var(--color-ivory)] text-sm text-[var(--color-charcoal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blush)] transition";

function fmt(n: number) {
  return n % 1 === 0 ? `₪${n}` : `₪${n.toFixed(2)}`;
}

interface ItemFormState {
  description: string;
  planned: string;
  actual: string;
  paid: boolean;
  notes: string;
}

const EMPTY_ITEM: ItemFormState = { description: "", planned: "", actual: "", paid: false, notes: "" };

export default function BudgetClient({ initialCategories }: { initialCategories: BudgetCategory[] }) {
  const [categories, setCategories] = useState<BudgetCategory[]>(initialCategories);
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  // Category form
  const [showCatForm, setShowCatForm] = useState(false);
  const [editCat, setEditCat] = useState<BudgetCategory | null>(null);
  const [catName, setCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);

  // Item form
  const [itemForm, setItemForm] = useState<{ catId: number; item: BudgetItem | null } | null>(null);
  const [itemDraft, setItemDraft] = useState<ItemFormState>(EMPTY_ITEM);
  const [itemSaving, setItemSaving] = useState(false);

  const totals = calcTotals(categories);

  function toggleCollapse(id: number) {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  }

  // ── Category CRUD ──────────────────────────────────────────────────

  function openAddCat() {
    setEditCat(null);
    setCatName("");
    setShowCatForm(true);
  }

  function openEditCat(cat: BudgetCategory) {
    setEditCat(cat);
    setCatName(cat.name);
    setShowCatForm(true);
  }

  async function saveCat() {
    if (!catName.trim()) return;
    setCatSaving(true);
    try {
      if (editCat) {
        const res = await fetch(`/api/budget/categories/${editCat.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: catName.trim() }),
        });
        const updated: BudgetCategory = await res.json();
        setCategories((cs) => cs.map((c) => (c.id === updated.id ? { ...updated, items: c.items } : c)));
      } else {
        const res = await fetch("/api/budget/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: catName.trim(), sortOrder: categories.length }),
        });
        const created: BudgetCategory = await res.json();
        setCategories((cs) => [...cs, created]);
      }
      setShowCatForm(false);
    } finally {
      setCatSaving(false);
    }
  }

  async function deleteCat(id: number) {
    if (!confirm("למחוק קטגוריה זו וכל הפריטים שלה?")) return;
    await fetch(`/api/budget/categories/${id}`, { method: "DELETE" });
    setCategories((cs) => cs.filter((c) => c.id !== id));
  }

  // ── Item CRUD ──────────────────────────────────────────────────────

  function openAddItem(catId: number) {
    setItemForm({ catId, item: null });
    setItemDraft(EMPTY_ITEM);
  }

  function openEditItem(catId: number, item: BudgetItem) {
    setItemForm({ catId, item });
    setItemDraft({
      description: item.description,
      planned: item.planned ? String(item.planned) : "",
      actual: item.actual ? String(item.actual) : "",
      paid: item.paid,
      notes: item.notes,
    });
  }

  async function saveItem() {
    if (!itemForm || !itemDraft.description.trim()) return;
    setItemSaving(true);
    const payload = {
      description: itemDraft.description.trim(),
      planned: parseFloat(itemDraft.planned) || 0,
      actual: parseFloat(itemDraft.actual) || 0,
      paid: itemDraft.paid,
      notes: itemDraft.notes,
    };
    try {
      if (itemForm.item) {
        const res = await fetch(`/api/budget/items/${itemForm.item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated: BudgetItem = await res.json();
        setCategories((cs) =>
          cs.map((c) =>
            c.id === itemForm.catId
              ? { ...c, items: c.items.map((i) => (i.id === updated.id ? updated : i)) }
              : c
          )
        );
      } else {
        const res = await fetch("/api/budget/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryId: itemForm.catId, ...payload }),
        });
        const created: BudgetItem = await res.json();
        setCategories((cs) =>
          cs.map((c) => (c.id === itemForm.catId ? { ...c, items: [...c.items, created] } : c))
        );
      }
      setItemForm(null);
    } finally {
      setItemSaving(false);
    }
  }

  async function deleteItem(catId: number, itemId: number) {
    if (!confirm("למחוק פריט זה?")) return;
    await fetch(`/api/budget/items/${itemId}`, { method: "DELETE" });
    setCategories((cs) =>
      cs.map((c) => (c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c))
    );
  }

  async function togglePaid(catId: number, item: BudgetItem) {
    const res = await fetch(`/api/budget/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: !item.paid }),
    });
    const updated: BudgetItem = await res.json();
    setCategories((cs) =>
      cs.map((c) =>
        c.id === catId ? { ...c, items: c.items.map((i) => (i.id === updated.id ? updated : i)) } : c
      )
    );
  }

  return (
    <div dir="rtl" className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-[var(--color-charcoal)]">תקציב</h1>
        <button
          onClick={openAddCat}
          className="px-4 py-2 rounded-lg bg-[var(--color-charcoal)] text-white text-sm hover:bg-[var(--color-rose)] transition"
        >
          + קטגוריה חדשה
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-light font-display text-[var(--color-charcoal)]">{fmt(totals.planned)}</p>
          <p className="text-xs text-[var(--color-muted)] mt-1">מתוכנן</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 text-center">
          <p className={`text-2xl font-light font-display ${totals.actual > totals.planned ? "text-red-500" : "text-[var(--color-charcoal)]"}`}>
            {fmt(totals.actual)}
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-1">בפועל</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-light font-display text-[var(--color-sage)]">{fmt(totals.paid)}</p>
          <p className="text-xs text-[var(--color-muted)] mt-1">שולם</p>
        </div>
      </div>

      {/* Categories */}
      {categories.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
          <p className="font-display text-lg italic text-[var(--color-muted)]">אין קטגוריות עדיין</p>
        </div>
      )}

      {categories.map((cat) => {
        const catTotals = calcCategoryTotals(cat.items);
        const isCollapsed = collapsed[cat.id];
        return (
          <div key={cat.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {/* Category header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-50">
              <button
                onClick={() => toggleCollapse(cat.id)}
                className="flex items-center gap-2 font-medium text-[var(--color-charcoal)] hover:text-[var(--color-rose)] transition"
              >
                <span className="text-xs text-[var(--color-muted)]">{isCollapsed ? "▶" : "▼"}</span>
                {cat.name}
              </button>
              <div className="flex items-center gap-4">
                <span className="text-xs text-[var(--color-muted)]">
                  {fmt(catTotals.planned)} מתוכנן · {fmt(catTotals.actual)} בפועל
                </span>
                <button onClick={() => openEditCat(cat)} className="text-xs text-[var(--color-muted)] hover:text-[var(--color-charcoal)] px-2 py-1 rounded hover:bg-stone-100 transition">עריכה</button>
                <button onClick={() => deleteCat(cat.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition">מחק</button>
              </div>
            </div>

            {/* Items */}
            {!isCollapsed && (
              <div>
                {cat.items.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-[var(--color-muted)] italic">אין פריטים</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-stone-50 text-right">
                        <th className="px-5 py-2 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">תיאור</th>
                        <th className="px-4 py-2 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">מתוכנן</th>
                        <th className="px-4 py-2 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">בפועל</th>
                        <th className="px-4 py-2 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">שולם</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {cat.items.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/50 transition">
                          <td className="px-5 py-3">
                            <div className="font-medium text-[var(--color-charcoal)]">{item.description}</div>
                            {item.notes && <div className="text-xs text-[var(--color-muted)] mt-0.5">{item.notes}</div>}
                          </td>
                          <td className="px-4 py-3 text-[var(--color-muted)]">{item.planned > 0 ? fmt(item.planned) : "—"}</td>
                          <td className={`px-4 py-3 ${item.actual > item.planned && item.planned > 0 ? "text-red-500 font-medium" : "text-[var(--color-muted)]"}`}>
                            {item.actual > 0 ? fmt(item.actual) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => togglePaid(cat.id, item)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${item.paid ? "bg-[var(--color-sage)] border-[var(--color-sage)] text-white" : "border-stone-300 hover:border-[var(--color-sage)]"}`}
                            >
                              {item.paid && <span className="text-xs">✓</span>}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => openEditItem(cat.id, item)} className="text-xs text-[var(--color-muted)] hover:text-[var(--color-charcoal)] px-2 py-1 rounded hover:bg-stone-100 transition">עריכה</button>
                              <button onClick={() => deleteItem(cat.id, item.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition">מחק</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="px-5 py-3 border-t border-stone-50">
                  <button
                    onClick={() => openAddItem(cat.id)}
                    className="text-sm text-[var(--color-muted)] hover:text-[var(--color-charcoal)] transition"
                  >
                    + הוסף פריט
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Category modal */}
      {showCatForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h3 className="font-display text-lg italic text-[var(--color-charcoal)]">
                {editCat ? "עריכת קטגוריה" : "קטגוריה חדשה"}
              </h3>
              <button onClick={() => setShowCatForm(false)} className="text-[var(--color-muted)]">✕</button>
            </div>
            <div className="p-5">
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">שם הקטגוריה</label>
              <input
                className={INPUT}
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveCat()}
                autoFocus
              />
            </div>
            <div className="flex gap-3 p-5 border-t border-stone-100">
              <button onClick={() => setShowCatForm(false)} className="flex-1 py-2.5 rounded-lg border border-stone-200 text-sm hover:bg-stone-50 transition">ביטול</button>
              <button onClick={saveCat} disabled={catSaving || !catName.trim()} className="flex-1 py-2.5 rounded-lg bg-[var(--color-charcoal)] text-white text-sm font-medium hover:bg-[var(--color-rose)] transition disabled:opacity-50">
                {catSaving ? "שומר..." : "שמור"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item modal */}
      {itemForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h3 className="font-display text-lg italic text-[var(--color-charcoal)]">
                {itemForm.item ? "עריכת פריט" : "פריט חדש"}
              </h3>
              <button onClick={() => setItemForm(null)} className="text-[var(--color-muted)]">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">תיאור *</label>
                <input className={INPUT} value={itemDraft.description} onChange={(e) => setItemDraft({ ...itemDraft, description: e.target.value })} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">מתוכנן (₪)</label>
                <input type="number" min={0} step={1} className={INPUT} dir="ltr" value={itemDraft.planned} onChange={(e) => setItemDraft({ ...itemDraft, planned: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">בפועל (₪)</label>
                <input type="number" min={0} step={1} className={INPUT} dir="ltr" value={itemDraft.actual} onChange={(e) => setItemDraft({ ...itemDraft, actual: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">הערות</label>
                <input className={INPUT} value={itemDraft.notes} onChange={(e) => setItemDraft({ ...itemDraft, notes: e.target.value })} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <button
                  onClick={() => setItemDraft({ ...itemDraft, paid: !itemDraft.paid })}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${itemDraft.paid ? "bg-[var(--color-sage)] border-[var(--color-sage)] text-white" : "border-stone-300"}`}
                >
                  {itemDraft.paid && <span className="text-xs">✓</span>}
                </button>
                <label className="text-sm text-[var(--color-charcoal)]">שולם</label>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-stone-100">
              <button onClick={() => setItemForm(null)} className="flex-1 py-2.5 rounded-lg border border-stone-200 text-sm hover:bg-stone-50 transition">ביטול</button>
              <button onClick={saveItem} disabled={itemSaving || !itemDraft.description.trim()} className="flex-1 py-2.5 rounded-lg bg-[var(--color-charcoal)] text-white text-sm font-medium hover:bg-[var(--color-rose)] transition disabled:opacity-50">
                {itemSaving ? "שומר..." : "שמור"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
