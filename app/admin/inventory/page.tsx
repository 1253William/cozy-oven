"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Edit2, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { CostItem, costingService } from "../../services/costingService";
import inventoryService, { InventoryItem, PurchaseInput } from "../../services/inventoryService";

const categories = ["Raw Materials", "Packaging", "Equipment", "Supplies", "Other"];
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
const emptyForm: PurchaseInput = {
  itemName: "",
  quantityPurchased: 1,
  costPrice: 0,
  vendorName: "",
  vendorContact: "",
  purchasePurpose: "",
  itemCategory: "Raw Materials",
  purchasedAt: new Date().toISOString().slice(0, 10),
  paymentMethod: "",
  paymentReference: "",
  costItemId: "",
};
const field = "w-full rounded-md border border-[#b9aca2]/70 bg-white px-3 py-2";

export default function PurchasesPage() {
  const [rows, setRows] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState<PurchaseInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [supplyItems, setSupplyItems] = useState<CostItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getAllInventory({
        search: appliedSearch || undefined,
        page: 1,
        limit: 100,
      });
      setRows(response.data || []);
      setError("");
    } catch {
      setError("Could not load purchases.");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    costingService.items({ tracksStock: true, limit: 100 })
      .then((response) => setSupplyItems(response.data || []))
      .catch(() => setSupplyItems([]));
  }, []);

  const total = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.totalCost || 0), 0),
    [rows]
  );

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) await inventoryService.updateInventory(editingId, form);
      else await inventoryService.createInventory(form);
      reset();
      await load();
    } catch (requestError: unknown) {
      setError(requestMessage(requestError, "Could not save purchase."));
    } finally {
      setSaving(false);
    }
  };

  const edit = (row: InventoryItem) => {
    setEditingId(row._id);
    setForm({
      itemName: row.itemName,
      quantityPurchased: row.quantityPurchased,
      costPrice: row.costPrice,
      vendorName: row.vendorName,
      vendorContact: row.vendorContact || "",
      purchasePurpose: row.purchasePurpose || "",
      itemCategory: row.itemCategory,
      purchasedAt: new Date(row.purchasedAt || row.createdAt || Date.now()).toISOString().slice(0, 10),
      paymentMethod: row.paymentMethod || "",
      paymentReference: row.paymentReference || "",
      costItemId: row.costItemId || "",
    });
    setShowForm(true);
  };

  return (
    <AdminLayout>
      <main className="space-y-6 p-4 md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div><h1 className="text-2xl font-bold">Purchases</h1><p className="text-sm text-[#5d6043]">Supplier transactions and procurement cash outflow.</p></div>
          <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-md bg-[#5d6043] px-4 py-2 text-white"><Plus size={18} />Record purchase</button>
        </header>

        <section className="border-y border-[#b9aca2]/60 bg-white/60 px-4 py-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#5d6043]" />
            <div className="grid gap-3 text-sm text-[#5d6043] md:grid-cols-2">
              <div><p className="font-semibold text-[#222]">Record here</p><p>Supplier purchases of flour, sugar, boxes, equipment, and other supplies. This preserves purchase date, vendor, payment method, and cash spent.</p></div>
              <div><p className="font-semibold text-[#222]">Costing follow-up</p><p>Link a purchase to a stock-tracked <Link href="/admin/cost-items" className="font-semibold underline">Cost Item</Link> when it should increase supply stock and update that item&apos;s recipe rate. Leave it unlinked for equipment or financial-only purchases.</p></div>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={(event) => { event.preventDefault(); setAppliedSearch(search.trim()); }} className="relative w-full max-w-md"><Search className="absolute left-3 top-2.5 h-5 w-5 text-[#5d6043]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search item, reference, or category" className={`${field} pl-10`} /></form>
          <div className="text-right"><p className="text-xs text-[#5d6043]">Visible purchase total</p><p className="text-xl font-semibold">GHS {total.toFixed(2)}</p></div>
        </section>

        {error && <p className="text-sm text-red-700">{error}</p>}
        {loading ? <p className="flex items-center gap-2 text-sm text-[#5d6043]"><Loader2 className="animate-spin" size={17} />Loading purchases...</p> : rows.length === 0 ? <p className="text-sm text-[#5d6043]">No purchases found.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-sm"><thead><tr className="border-b text-left"><th className="py-3">Purchase date</th><th>Item</th><th>Category</th><th>Supplier</th><th>Quantity</th><th>Unit price</th><th>Payment</th><th className="text-right">Total</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={row._id} className="border-b"><td className="py-3">{new Date(row.purchasedAt || row.createdAt || Date.now()).toLocaleDateString("en-GB")}</td><td className="font-medium">{row.itemName}<span className="block text-xs font-normal text-[#5d6043]">{row.purchasePurpose}</span></td><td>{row.itemCategory}</td><td>{row.vendorName}</td><td>{row.quantityPurchased}</td><td>GHS {Number(row.costPrice).toFixed(2)}</td><td>{paymentLabels[row.paymentMethod || ""] || "—"}{row.paymentReference && <span className="block text-xs text-[#5d6043]">{row.paymentReference}</span>}</td><td className="text-right font-semibold">GHS {Number(row.totalCost).toFixed(2)}</td><td><div className="flex justify-end"><button title="Edit purchase" onClick={() => edit(row)} className="p-2"><Edit2 size={17} /></button><button title="Delete purchase" onClick={async () => { if (confirm("Delete this purchase?")) { await inventoryService.deleteInventory(row._id); await load(); } }} className="p-2 text-red-700"><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div>}

        {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><section className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-md bg-[#faf9f5] p-5"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">{editingId ? "Edit purchase" : "Record purchase"}</h2><p className="text-sm text-[#5d6043]">Cost price is the price of one purchased unit.</p></div><button title="Close" onClick={reset} className="p-2"><X /></button></div><form onSubmit={submit} className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium">Item name<input className={`${field} mt-1`} value={form.itemName} onChange={(event) => setForm({ ...form, itemName: event.target.value })} required /></label>
          <label className="text-sm font-medium">Category<select className={`${field} mt-1`} value={form.itemCategory} onChange={(event) => setForm({ ...form, itemCategory: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="text-sm font-medium">Linked supply stock item<select className={`${field} mt-1`} value={form.costItemId || ""} onChange={(event) => {
            const item = supplyItems.find((candidate) => candidate._id === event.target.value);
            setForm({
              ...form,
              costItemId: event.target.value,
              itemName: item?.name || form.itemName,
              itemCategory: item ? "Raw Materials" : form.itemCategory,
            });
          }}><option value="">No stock link</option>{supplyItems.map((item) => <option key={item._id} value={item._id}>{item.name} ({item.unit})</option>)}</select></label>
          <label className="text-sm font-medium">Quantity purchased<input className={`${field} mt-1`} type="number" min="0.000001" step="any" value={form.quantityPurchased} onChange={(event) => setForm({ ...form, quantityPurchased: Number(event.target.value) })} required /></label>
          <label className="text-sm font-medium">Cost per purchased unit (GHS)<input className={`${field} mt-1`} type="number" min="0" step="0.01" value={form.costPrice || ""} onChange={(event) => setForm({ ...form, costPrice: Number(event.target.value) || 0 })} required /></label>
          <label className="text-sm font-medium">Supplier<input className={`${field} mt-1`} value={form.vendorName} onChange={(event) => setForm({ ...form, vendorName: event.target.value })} required /></label>
          <label className="text-sm font-medium">Supplier contact (optional)<input className={`${field} mt-1`} value={form.vendorContact || ""} onChange={(event) => setForm({ ...form, vendorContact: event.target.value })} /></label>
          <label className="text-sm font-medium">Purchase date<input className={`${field} mt-1`} type="date" max={new Date().toISOString().slice(0, 10)} value={form.purchasedAt} onChange={(event) => setForm({ ...form, purchasedAt: event.target.value })} required /></label>
          <label className="text-sm font-medium">Payment method<select className={`${field} mt-1`} value={form.paymentMethod || ""} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}><option value="">Not recorded</option>{Object.entries(paymentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-sm font-medium">Payment reference (optional)<input className={`${field} mt-1`} value={form.paymentReference || ""} onChange={(event) => setForm({ ...form, paymentReference: event.target.value })} /></label>
          <label className="text-sm font-medium">Purchase purpose<textarea className={`${field} mt-1`} rows={2} value={form.purchasePurpose} onChange={(event) => setForm({ ...form, purchasePurpose: event.target.value })} required /></label>
          <div className="flex items-end justify-between rounded-md border px-3 py-2"><div><p className="text-xs text-[#5d6043]">Total purchase</p><p className="font-semibold">GHS {(Number(form.quantityPurchased) * Number(form.costPrice)).toFixed(2)}</p></div><button disabled={saving} className="rounded-md bg-[#5d6043] px-4 py-2 text-white disabled:opacity-60">{editingId ? "Update" : "Record"}</button></div>
        </form></section></div>}
      </main>
    </AdminLayout>
  );
}
