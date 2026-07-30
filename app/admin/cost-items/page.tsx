"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertCircle, Edit2, Plus, Trash2, X } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { CostCategory, CostItem, costingService } from "../../services/costingService";

const UNITS = {
  weight: ["kg", "g"],
  volume: ["L", "ml"],
  count: ["piece"],
  time: ["hour", "minute"],
  batch: ["batch"],
} as const;
type UnitType = keyof typeof UNITS;
type PriceHistory = {
  _id: string;
  effectiveFrom: string;
  costPerUnit: number;
};
const requestMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
const emptyForm = {
  name: "",
  categoryId: "",
  unitType: "weight" as UnitType,
  unit: "kg",
  quantity: "",
  cost: "",
  supplier: "",
  effectiveFrom: new Date().toISOString().slice(0, 10),
};
const field = "w-full rounded-md border border-[#b9aca2] bg-white px-3 py-2";

export default function CostItemsPage() {
  const [items, setItems] = useState<CostItem[]>([]);
  const [categories, setCategories] = useState<CostCategory[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<CostItem | null>(null);
  const [history, setHistory] = useState<PriceHistory[] | null>(null);
  const [historyName, setHistoryName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    const [itemRows, categoryRows] = await Promise.all([
      costingService.items(),
      costingService.categories("directProductCost"),
    ]);
    setItems(itemRows.data || []);
    setCategories(categoryRows.data || []);
  };
  useEffect(() => { load().catch(() => setMessage("Could not load costing data.")); }, []);

  const derivedRate = useMemo(() => {
    const quantity = Number(form.quantity);
    const cost = Number(form.cost);
    return quantity > 0 && cost >= 0 ? cost / quantity : 0;
  }, [form.quantity, form.cost]);

  const reset = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      unitType: form.unitType,
      unit: form.unit,
      purchaseBatch: { quantity: Number(form.quantity), cost: Number(form.cost) },
      supplier: form.supplier || undefined,
      effectiveFrom: form.effectiveFrom,
    };
    try {
      if (editing) await costingService.updateItem(editing._id, payload);
      else await costingService.createItem(payload);
      reset();
      await load();
    } catch (error: unknown) {
      setMessage(requestMessage(error, "Could not save cost item."));
    } finally {
      setSaving(false);
    }
  };

  const beginEdit = (item: CostItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      categoryId: typeof item.categoryId === "object" ? item.categoryId._id : item.categoryId,
      unitType: item.unitType,
      unit: item.unit,
      quantity: String(item.purchaseBatch.quantity),
      cost: String(item.purchaseBatch.cost),
      supplier: item.supplier || "",
      effectiveFrom: new Date().toISOString().slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showHistory = async (item: CostItem) => {
    try {
      const response = await costingService.itemHistory(item._id);
      setHistory(response.data || []);
      setHistoryName(item.name);
    } catch {
      setMessage("Could not load price history.");
    }
  };

  return (
    <AdminLayout>
      <main className="space-y-6 p-4 md:p-8">
        <header>
          <h1 className="text-2xl font-bold text-[#222]">Cost Items</h1>
          <p className="text-sm text-[#5d6043]">Rates used to calculate recipe cost and paid-order COGS.</p>
        </header>

        <section className="border-y border-[#b9aca2]/60 bg-white/60 px-4 py-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#5d6043]" />
            <div className="text-sm text-[#5d6043]">
              <p className="font-semibold text-[#222]">Add costs that can be measured per product or batch.</p>
              <p>Use ingredients, packaging, decorating materials, and direct baking labour. Put rent, general electricity, marketing, and administration under Overhead Costs. Record the supplier transaction separately under Purchases.</p>
            </div>
          </div>
        </section>

        <form onSubmit={submit} className="grid gap-3 border-b border-[#b9aca2]/60 pb-6 md:grid-cols-3">
          <label className="text-sm font-medium">Item name<input className={`${field} mt-1`} placeholder="e.g. Bread flour" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label className="text-sm font-medium">Direct-cost category<select className={`${field} mt-1`} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required><option value="">Select category</option>{categories.map((row) => <option key={row._id} value={row._id}>{row.name}</option>)}</select></label>
          <label className="text-sm font-medium">Measurement type<select className={`${field} mt-1`} value={form.unitType} onChange={(e) => { const unitType = e.target.value as UnitType; setForm({ ...form, unitType, unit: UNITS[unitType][0] }); }}>{Object.keys(UNITS).map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
          <label className="text-sm font-medium">Costing unit<select className={`${field} mt-1`} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>{UNITS[form.unitType].map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></label>
          <label className="text-sm font-medium">Purchased quantity<input className={`${field} mt-1`} type="number" min="0.000001" step="any" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder={`Quantity in ${form.unit}`} required /></label>
          <label className="text-sm font-medium">Total batch cost (GHS)<input className={`${field} mt-1`} type="number" min="0" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required /></label>
          <label className="text-sm font-medium">Supplier (optional)<input className={`${field} mt-1`} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></label>
          <label className="text-sm font-medium">Effective from<input className={`${field} mt-1`} type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} required /></label>
          <div className="flex items-end justify-between gap-3 rounded-md border border-[#b9aca2]/60 px-3 py-2">
            <div><p className="text-xs text-[#5d6043]">Calculated rate</p><p className="font-semibold">GHS {derivedRate.toFixed(6)} / {form.unit}</p></div>
            <button disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-[#5d6043] px-4 py-2 text-white disabled:opacity-60">{editing ? <Edit2 size={17} /> : <Plus size={17} />}{editing ? "Update" : "Add"}</button>
          </div>
          {editing && <button type="button" onClick={reset} className="inline-flex w-fit items-center gap-2 text-sm text-[#5d6043]"><X size={16} />Cancel editing</button>}
        </form>

        {message && <p className="text-sm text-red-700">{message}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-b text-left"><th className="py-3">Item</th><th>Category</th><th>Latest batch</th><th>Rate</th><th>Effective</th><th className="text-right">Actions</th></tr></thead>
            <tbody>{items.map((item) => <tr key={item._id} className="border-b">
              <td className="py-3 font-medium">{item.name}<span className="block text-xs font-normal text-[#5d6043]">{item.supplier || "No supplier"}</span></td>
              <td>{typeof item.categoryId === "object" ? item.categoryId.name : ""}</td>
              <td>{item.purchaseBatch.quantity} {item.unit} · GHS {Number(item.purchaseBatch.cost).toFixed(2)}</td>
              <td>GHS {item.costPerUnit.toFixed(6)} / {item.unit}</td>
              <td>{new Date(item.lastUpdated).toLocaleDateString("en-GB")}</td>
              <td><div className="flex justify-end gap-1"><button title="Price history" onClick={() => showHistory(item)} className="p-2"><AlertCircle size={17} /></button><button title="Edit cost item" onClick={() => beginEdit(item)} className="p-2"><Edit2 size={17} /></button><button title="Archive cost item" onClick={async () => { if (confirm(`Archive ${item.name}?`)) { await costingService.archiveItem(item._id); await load(); } }} className="p-2 text-red-700"><Trash2 size={17} /></button></div></td>
            </tr>)}</tbody>
          </table>
        </div>

        {history && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><section className="max-h-[80vh] w-full max-w-xl overflow-auto rounded-md bg-[#faf9f5] p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{historyName} price history</h2><button title="Close" onClick={() => setHistory(null)} className="p-2"><X /></button></div><div className="mt-4 space-y-2">{history.length ? history.map((row) => <div key={row._id} className="flex justify-between border-b py-2 text-sm"><span>{new Date(row.effectiveFrom).toLocaleDateString("en-GB")}</span><span>GHS {Number(row.costPerUnit).toFixed(6)} / unit</span></div>) : <p className="text-sm text-[#5d6043]">No history available.</p>}</div></section></div>}
      </main>
    </AdminLayout>
  );
}
