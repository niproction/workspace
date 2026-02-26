"use client";

import { Vendor, VendorAttachment } from "@prisma/client";
import { useRef, useState } from "react";

type VendorWithAttachments = Vendor & { attachments: VendorAttachment[] };

const VENDOR_TYPES = [
  "photographer", "dj", "catering", "flowers", "venue", "makeup", "band", "other",
] as const;

const TYPE_LABELS: Record<string, string> = {
  photographer: "צלם", dj: "DJ", catering: "קייטרינג", flowers: "פרחים",
  venue: "אולם", makeup: "איפור", band: "להקה", other: "אחר",
};

const STATUSES = ["not_contacted", "negotiating", "booked"] as const;

const STATUS_LABELS: Record<string, string> = {
  not_contacted: "לא פנינו", negotiating: "במשא ומתן", booked: "מוזמן",
};

const STATUS_COLORS: Record<string, string> = {
  not_contacted: "bg-stone-100 text-stone-600",
  negotiating: "bg-amber-50 text-amber-700",
  booked: "bg-green-50 text-green-700",
};

interface VendorForm {
  name: string;
  type: string;
  contactName: string;
  phone: string;
  email: string;
  status: string;
  depositAmount: number;
  depositPaid: boolean;
  depositDueDate: string;
  finalAmount: number;
  finalPaid: boolean;
  finalDueDate: string;
  notes: string;
}

const EMPTY_FORM: VendorForm = {
  name: "", type: "other", contactName: "", phone: "", email: "",
  status: "not_contacted", depositAmount: 0, depositPaid: false,
  depositDueDate: "", finalAmount: 0, finalPaid: false, finalDueDate: "", notes: "",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function VendorsClient({ initialVendors }: { initialVendors: VendorWithAttachments[] }) {
  const [vendors, setVendors] = useState<VendorWithAttachments[]>(initialVendors);
  const [showForm, setShowForm] = useState(false);
  const [editVendor, setEditVendor] = useState<VendorWithAttachments | null>(null);
  const [form, setForm] = useState<VendorForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const booked = vendors.filter((v) => v.status === "booked").length;
  const pendingPayments = vendors.filter(
    (v) =>
      (v.depositAmount > 0 && !v.depositPaid) ||
      (v.finalAmount > 0 && !v.finalPaid)
  ).length;

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditVendor(null);
    setShowForm(true);
  }

  function openEdit(vendor: VendorWithAttachments) {
    setForm({
      name: vendor.name, type: vendor.type, contactName: vendor.contactName,
      phone: vendor.phone, email: vendor.email, status: vendor.status,
      depositAmount: vendor.depositAmount, depositPaid: vendor.depositPaid,
      depositDueDate: vendor.depositDueDate, finalAmount: vendor.finalAmount,
      finalPaid: vendor.finalPaid, finalDueDate: vendor.finalDueDate, notes: vendor.notes,
    });
    setEditVendor(vendor);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editVendor) {
        const res = await fetch(`/api/vendors/${editVendor.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated: VendorWithAttachments = await res.json();
        setVendors((vs) => vs.map((v) => (v.id === updated.id ? updated : v)));
      } else {
        const res = await fetch("/api/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const created: VendorWithAttachments = await res.json();
        setVendors((vs) => [created, ...vs]);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("למחוק ספק זה וכל המסמכים שלו?")) return;
    await fetch(`/api/vendors/${id}`, { method: "DELETE" });
    setVendors((vs) => vs.filter((v) => v.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  async function handleUpload(vendorId: number, file: File) {
    setUploading(vendorId);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/vendors/${vendorId}/attachments`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "שגיאה בהעלאת הקובץ");
        return;
      }
      const attachment: VendorAttachment = await res.json();
      setVendors((vs) =>
        vs.map((v) =>
          v.id === vendorId
            ? { ...v, attachments: [...v.attachments, attachment] }
            : v
        )
      );
    } finally {
      setUploading(null);
      // Reset file input
      const input = fileInputRefs.current[vendorId];
      if (input) input.value = "";
    }
  }

  async function handleDeleteAttachment(vendorId: number, attachmentId: number) {
    if (!confirm("למחוק קובץ זה?")) return;
    await fetch(`/api/vendors/${vendorId}/attachments?attachmentId=${attachmentId}`, {
      method: "DELETE",
    });
    setVendors((vs) =>
      vs.map((v) =>
        v.id === vendorId
          ? { ...v, attachments: v.attachments.filter((a) => a.id !== attachmentId) }
          : v
      )
    );
  }

  return (
    <div dir="rtl" className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-[var(--color-charcoal)]">ספקים</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-lg bg-[var(--color-charcoal)] text-white text-sm hover:bg-[var(--color-rose)] transition"
        >
          + הוסף ספק
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-light text-[var(--color-charcoal)] font-display">{vendors.length}</p>
          <p className="text-xs text-[var(--color-muted)] mt-1">ספקים</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-light text-[var(--color-sage)] font-display">{booked}</p>
          <p className="text-xs text-[var(--color-muted)] mt-1">מוזמנים</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm text-center">
          <p className={`text-2xl font-light font-display ${pendingPayments > 0 ? "text-amber-600" : "text-[var(--color-charcoal)]"}`}>
            {pendingPayments}
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-1">תשלומים ממתינים</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {vendors.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-lg italic text-[var(--color-muted)]">אין ספקים עדיין</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: "var(--font-body)" }}>
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-right">
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">שם</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">סוג</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">איש קשר</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">סטטוס</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">מקדמה</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">סופי</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {vendors.map((vendor) => (
                  <>
                    <tr key={vendor.id} className="hover:bg-stone-50/50 transition">
                      <td className="px-4 py-3 font-medium text-[var(--color-charcoal)]">{vendor.name}</td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">{TYPE_LABELS[vendor.type] ?? vendor.type}</td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">
                        {vendor.contactName || "—"}
                        {vendor.phone && (
                          <span className="block text-xs" dir="ltr">{vendor.phone}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[vendor.status] ?? "bg-stone-100 text-stone-600"}`}>
                          {STATUS_LABELS[vendor.status] ?? vendor.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">
                        {vendor.depositAmount > 0 ? (
                          <span className={vendor.depositPaid ? "line-through opacity-50" : ""}>
                            ₪{vendor.depositAmount.toLocaleString()}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">
                        {vendor.finalAmount > 0 ? (
                          <span className={vendor.finalPaid ? "line-through opacity-50" : ""}>
                            ₪{vendor.finalAmount.toLocaleString()}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setExpandedId(expandedId === vendor.id ? null : vendor.id)}
                            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-charcoal)] px-2 py-1 rounded hover:bg-stone-100 transition"
                            title="מסמכים"
                          >
                            📎{vendor.attachments.length > 0 && ` ${vendor.attachments.length}`}
                          </button>
                          <button
                            onClick={() => openEdit(vendor)}
                            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-charcoal)] px-2 py-1 rounded hover:bg-stone-100 transition"
                          >
                            עריכה
                          </button>
                          <button
                            onClick={() => handleDelete(vendor.id)}
                            className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition"
                          >
                            מחק
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Attachment panel */}
                    {expandedId === vendor.id && (
                      <tr key={`${vendor.id}-attachments`}>
                        <td colSpan={7} className="px-4 py-3 bg-stone-50/70 border-t border-stone-100">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                              מסמכים מצורפים
                            </p>

                            {vendor.attachments.length === 0 ? (
                              <p className="text-xs text-[var(--color-muted)] italic">אין מסמכים</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {vendor.attachments.map((att) => (
                                  <div
                                    key={att.id}
                                    className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs"
                                  >
                                    <a
                                      href={`/api/vendors/files/${att.filename}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[var(--color-charcoal)] hover:text-[var(--color-rose)] transition max-w-[180px] truncate"
                                      title={att.originalName}
                                    >
                                      {att.originalName}
                                    </a>
                                    <span className="text-[var(--color-muted)]">{formatBytes(att.sizeBytes)}</span>
                                    <button
                                      onClick={() => handleDeleteAttachment(vendor.id, att.id)}
                                      className="text-red-400 hover:text-red-600 transition"
                                      title="מחק קובץ"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Upload */}
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                ref={(el) => { fileInputRefs.current[vendor.id] = el; }}
                                type="file"
                                accept="application/pdf,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUpload(vendor.id, file);
                                }}
                              />
                              <button
                                onClick={() => fileInputRefs.current[vendor.id]?.click()}
                                disabled={uploading === vendor.id}
                                className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs text-[var(--color-charcoal)] hover:bg-stone-100 transition disabled:opacity-50"
                              >
                                {uploading === vendor.id ? "מעלה..." : "+ צרף קובץ"}
                              </button>
                              <span className="text-xs text-[var(--color-muted)]">PDF, JPG, PNG, WEBP, DOC — עד 10MB</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h3 className="font-display text-lg italic text-[var(--color-charcoal)]">
                {editVendor ? "עריכת ספק" : "הוספת ספק"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-[var(--color-muted)] p-1">✕</button>
            </div>

            <div className="p-5 grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">שם ספק *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">סוג</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
                >
                  {VENDOR_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">סטטוס</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>

              {/* Contact name */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">איש קשר</label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">טלפון</label>
                <input
                  type="tel"
                  value={form.phone}
                  dir="ltr"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              {/* Email */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">אימייל</label>
                <input
                  type="email"
                  value={form.email}
                  dir="ltr"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              {/* Deposit */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">מקדמה (₪)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.depositAmount}
                  onChange={(e) => setForm({ ...form, depositAmount: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              {/* Deposit due date */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">תאריך מקדמה</label>
                <input
                  type="date"
                  value={form.depositDueDate}
                  onChange={(e) => setForm({ ...form, depositDueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              {/* Deposit paid */}
              <div className="col-span-2 flex items-center gap-2">
                <input
                  id="depositPaid"
                  type="checkbox"
                  checked={form.depositPaid}
                  onChange={(e) => setForm({ ...form, depositPaid: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="depositPaid" className="text-sm text-[var(--color-charcoal)]">מקדמה שולמה</label>
              </div>

              {/* Final */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">תשלום סופי (₪)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.finalAmount}
                  onChange={(e) => setForm({ ...form, finalAmount: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              {/* Final due date */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">תאריך תשלום סופי</label>
                <input
                  type="date"
                  value={form.finalDueDate}
                  onChange={(e) => setForm({ ...form, finalDueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              {/* Final paid */}
              <div className="col-span-2 flex items-center gap-2">
                <input
                  id="finalPaid"
                  type="checkbox"
                  checked={form.finalPaid}
                  onChange={(e) => setForm({ ...form, finalPaid: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="finalPaid" className="text-sm text-[var(--color-charcoal)]">תשלום סופי שולם</label>
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">הערות</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-stone-100">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-lg border border-stone-200 text-sm hover:bg-stone-50 transition"
              >
                ביטול
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex-1 py-2.5 rounded-lg bg-[var(--color-charcoal)] text-white text-sm font-medium hover:bg-[var(--color-rose)] transition disabled:opacity-50"
              >
                {saving ? "שומר..." : "שמור"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
