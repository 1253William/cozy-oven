"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Edit2, Loader2, Plus, Trash2, X } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import expenseService, { Expense, ExpenseInput, OverheadCategory } from "../../services/expenseService";
import { costingService } from "../../services/costingService";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const emptyForm: ExpenseInput = {
  title: "",
  categoryId: "",
  amount: 0,
  expenseDate: new Date().toISOString().slice(0, 10),
  notes: "",
  vendor: "",
  paymentMethod: "",
  paymentReference: "",
};
const field = "w-full rounded-md border border-[#b9aca2]/70 bg-white px-3 py-2";
const paymentLabels: Record<string, string> = {
  cash: "Cash",
  "mobile-money": "Mobile Money",
  "bank-transfer": "Bank Transfer",
  cheque: "Cheque",
  card: "Card",
  other: "Other",
};
const requestMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

export default function AdminOverheadCostsPage() {
  const [rows, setRows] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<OverheadCategory[]>([]);
  const [month, setMonth] = useState(() => MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState<ExpenseInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await expenseService.list(month, year);
      setRows(response.data || []);
      setCategories(response.categories || []);
      setError("");
    } catch {
      setError("Could not load overhead costs.");
    } finally {
      setLoading(false);
    }
  }, [month, year]);
  useEffect(() => { load(); }, [load]);

  const total = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    [rows]
  );

  const reset = () => {
    setEditingId(null);
    setForm({ ...emptyForm, categoryId: categories[0]?._id || "" });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) await expenseService.update(editingId, form);
      else await expenseService.create(form);
      reset();
      await load();
    } catch (requestError: unknown) {
      setError(requestMessage(requestError, "Could not save overhead cost."));
    } finally {
      setSaving(false);
    }
  };

  const edit = (row: Expense) => {
    const fallbackCategory = categories.find((category) =>
      category.name.toLowerCase() === String(row.categoryName || row.category).toLowerCase()
    );
    setEditingId(row.id);
    setForm({
      title: row.title,
      categoryId: row.categoryId || fallbackCategory?._id || "",
      amount: row.amount,
      expenseDate: new Date(row.expenseDate).toISOString().slice(0, 10),
      notes: row.notes || "",
      vendor: row.vendor || "",
      paymentMethod: row.paymentMethod || "",
      paymentReference: row.paymentReference || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const response = await costingService.createCategory({
        name: newCategory.trim(),
        costClass: "operatingExpense",
        subtype: "custom",
      });
      setNewCategory("");
      setShowCategoryForm(false);
      await load();
      setForm((current) => ({ ...current, categoryId: response.data?._id || current.categoryId }));
    } catch (requestError: unknown) {
      setError(requestMessage(requestError, "Could not add overhead category."));
    }
  };

  return (
    <AdminLayout>
      <main className="space-y-6 p-4 md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div><h1 className="text-2xl font-semibold text-[#222]">Overhead Costs</h1><p className="text-sm text-[#5d6043]">General business costs that cannot be measured directly per product.</p></div>
          <div className="text-right"><p className="text-xs text-[#5d6043]">{month} {year}</p><p className="text-2xl font-semibold">GHS {total.toFixed(2)}</p></div>
        </header>

        <section className="border-y border-[#b9aca2]/60 bg-white/60 px-4 py-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#5d6043]" />
            <div className="grid gap-3 text-sm text-[#5d6043] md:grid-cols-2">
              <div><p className="font-semibold text-[#222]">Add here</p><p>Rent, general utilities, internet, marketing, administration, bank charges, software, maintenance, and professional fees.</p></div>
              <div><p className="font-semibold text-[#222]">Do not add here</p><p>Flour, sugar, boxes, decorations, or direct baking labour go in Cost Items. Supplier purchases go in Purchases. Discounts and refunds are handled by Orders.</p></div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <select value={month} onChange={(event) => setMonth(event.target.value)} className={field}>{MONTHS.map((name) => <option key={name}>{name}</option>)}</select>
          <input type="number" value={year} onChange={(event) => setYear(Number(event.target.value) || year)} className="w-28 rounded-md border border-[#b9aca2]/70 px-3 py-2" />
        </div>

        <form onSubmit={submit} className="grid gap-3 border-y border-[#b9aca2]/60 py-5 md:grid-cols-2">
          <label className="text-sm font-medium">Description<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. July shop rent" className={`${field} mt-1`} required /></label>
          <label className="text-sm font-medium">Overhead category<div className="mt-1 flex gap-2"><select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className={field} required><option value="">Select category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select><button type="button" title="Add category" onClick={() => setShowCategoryForm(true)} className="rounded-md border px-3"><Plus size={18} /></button></div></label>
          <label className="text-sm font-medium">Amount (GHS)<input type="number" min={0} step="0.01" value={form.amount || ""} onChange={(event) => setForm({ ...form, amount: Number(event.target.value) || 0 })} className={`${field} mt-1`} required /></label>
          <label className="text-sm font-medium">Cost date<input type="date" max={new Date().toISOString().slice(0, 10)} value={form.expenseDate} onChange={(event) => setForm({ ...form, expenseDate: event.target.value })} className={`${field} mt-1`} required /></label>
          <label className="text-sm font-medium">Vendor or payee (optional)<input value={form.vendor || ""} onChange={(event) => setForm({ ...form, vendor: event.target.value })} className={`${field} mt-1`} /></label>
          <label className="text-sm font-medium">Payment method<select value={form.paymentMethod || ""} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })} className={`${field} mt-1`}><option value="">Not recorded</option>{Object.entries(paymentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-sm font-medium">Payment reference (optional)<input value={form.paymentReference || ""} onChange={(event) => setForm({ ...form, paymentReference: event.target.value })} className={`${field} mt-1`} /></label>
          <label className="text-sm font-medium">Notes (optional)<input value={form.notes || ""} onChange={(event) => setForm({ ...form, notes: event.target.value })} className={`${field} mt-1`} /></label>
          <div className="flex gap-2 md:col-span-2"><button disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-[#5d6043] px-4 py-2 text-white disabled:opacity-60">{editingId ? <Edit2 size={17} /> : <Plus size={17} />}{editingId ? "Update overhead" : "Add overhead"}</button>{editingId && <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-md border px-4 py-2"><X size={17} />Cancel</button>}</div>
        </form>

        {error && <p className="text-sm text-red-700">{error}</p>}
        {loading ? <p className="flex items-center gap-2 text-sm text-[#5d6043]"><Loader2 className="animate-spin" size={17} />Loading overhead costs...</p> : rows.length === 0 ? <p className="text-sm text-[#5d6043]">No overhead costs for this period.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b text-left"><th className="py-3">Description</th><th>Category</th><th>Date</th><th>Payee</th><th>Payment</th><th className="text-right">Amount</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b"><td className="py-3 font-medium">{row.title}{row.notes && <span className="block text-xs font-normal text-[#5d6043]">{row.notes}</span>}</td><td>{row.categoryName}</td><td>{new Date(row.expenseDate).toLocaleDateString("en-GB")}</td><td>{row.vendor || "—"}</td><td>{paymentLabels[row.paymentMethod || ""] || "—"}{row.paymentReference && <span className="block text-xs text-[#5d6043]">{row.paymentReference}</span>}</td><td className="text-right font-semibold">GHS {Number(row.amount).toFixed(2)}</td><td><div className="flex justify-end"><button title="Edit overhead" onClick={() => edit(row)} className="p-2"><Edit2 size={17} /></button><button title="Delete overhead" onClick={async () => { if (confirm("Delete this overhead cost?")) { await expenseService.remove(row.id); await load(); } }} className="p-2 text-red-700"><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div>}

        {showCategoryForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><section className="w-full max-w-md rounded-md bg-[#faf9f5] p-5"><div className="flex justify-between"><h2 className="font-semibold">New overhead category</h2><button title="Close" onClick={() => setShowCategoryForm(false)}><X size={20} /></button></div><input autoFocus className={`${field} mt-4`} value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Category name" /><button type="button" onClick={addCategory} className="mt-3 rounded-md bg-[#5d6043] px-4 py-2 text-white">Add category</button></section></div>}
      </main>
    </AdminLayout>
  );
}
