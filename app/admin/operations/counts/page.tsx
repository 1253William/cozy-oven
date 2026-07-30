"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { operationsService } from "../../../services/operationsService";

type ProductRef = { _id: string; productName: string; selectOptions?: Array<{ variantId: string; label: string }> };
type SupplyRef = { _id: string; name: string; unit?: string };
type ReviewRow = {
  id: string;
  stockType: "product" | "supply";
  productId?: ProductRef | string;
  variantId?: string;
  costItemId?: SupplyRef | string;
  onHand: number;
};
type ReviewLine = {
  stockType?: "product" | "supply";
  productId?: ProductRef | string;
  variantId?: string;
  costItemId?: SupplyRef | string;
  expectedQuantity: number;
  countedQuantity: number;
  variance: number;
};
type Review = {
  _id: string;
  countedAt: string;
  notes?: string;
  actorId?: { fullName?: string };
  lines: ReviewLine[];
};

const requestMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

export default function InventoryReviewPage() {
  const [stock, setStock] = useState<ReviewRow[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [productResponse, supplyResponse, reviewResponse] = await Promise.all([
        operationsService.stock(),
        operationsService.supplyStock(),
        operationsService.reviews(),
      ]);
      const productRows = (productResponse.data || []).map((row: any) => ({
        ...row,
        id: `product:${row._id}`,
        stockType: "product" as const,
      }));
      const supplyRows = (supplyResponse.data || []).map((row: any) => ({
        ...row,
        id: `supply:${row._id}`,
        stockType: "supply" as const,
      }));
      const nextStock = [...productRows, ...supplyRows] as ReviewRow[];
      setStock(nextStock);
      setReviews((reviewResponse.data || []) as Review[]);
      setCounts(Object.fromEntries(nextStock.map((row) => [row.id, String(row.onHand)])));
      setMessage("");
    } catch {
      setMessage("Could not load inventory review data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const variances = useMemo(
    () => stock.map((row) => ({
      id: row.id,
      variance: Number(counts[row.id] ?? row.onHand) - Number(row.onHand),
    })),
    [stock, counts]
  );
  const changedLines = variances.filter((row) => row.variance !== 0);
  const netVariance = variances.reduce((sum, row) => sum + row.variance, 0);

  const productName = (product?: ProductRef | string) =>
    !product || typeof product === "string" ? "Product" : product.productName;
  const supplyName = (supply?: SupplyRef | string) =>
    !supply || typeof supply === "string" ? "Supply" : supply.name;
  const rowName = (row: ReviewRow | ReviewLine) =>
    row.stockType === "supply" ? supplyName(row.costItemId) : productName(row.productId);
  const rowDetail = (row: ReviewRow | ReviewLine) => {
    if (row.stockType === "supply") {
      return typeof row.costItemId === "string" ? "Supply item" : row.costItemId?.unit || "Supply item";
    }
    if (row.variantId && row.productId && typeof row.productId !== "string") {
      return row.productId.selectOptions?.find((option) => option.variantId === row.variantId)?.label || "Variant";
    }
    return "Base product";
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stock.length) return;
    if (changedLines.length && !window.confirm(
      `Post this review? ${changedLines.length} stock balance${changedLines.length === 1 ? "" : "s"} will be corrected.`
    )) return;
    setSaving(true);
    try {
      await operationsService.count({
        countedAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
        lines: stock.map((row) =>
          row.stockType === "supply"
            ? {
                stockType: "supply",
                costItemId: typeof row.costItemId === "string" ? row.costItemId : row.costItemId?._id,
                countedQuantity: Number(counts[row.id] ?? row.onHand),
              }
            : {
                stockType: "product",
                productId: typeof row.productId === "string" ? row.productId : row.productId?._id,
                variantId: row.variantId,
                countedQuantity: Number(counts[row.id] ?? row.onHand),
              }
        ),
      });
      setNotes("");
      await load();
      setMessage("Inventory review posted. Stock now matches the counted quantities.");
    } catch (error: unknown) {
      setMessage(requestMessage(error, "Could not post inventory review."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <main className="space-y-7 p-4 md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Inventory Review</h1>
            <p className="text-sm text-[#5d6043]">Compare expected stock with the quantities physically present.</p>
          </div>
          <button onClick={load} disabled={loading} title="Refresh stock" className="rounded-md border border-[#b9aca2] p-2 disabled:opacity-50"><RefreshCw size={18} /></button>
        </header>

        <section className="border-y border-[#b9aca2]/60 bg-white/60 px-4 py-4">
          <div className="flex gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#5d6043]" /><div className="text-sm text-[#5d6043]"><p className="font-semibold text-[#222]">Review finished goods and tracked supplies.</p><p>Enter what is physically available now. Posting the review adjusts stock by the difference for loaves, yogurt, packaging cards, boxes, and any cost item marked for stock tracking.</p></div></div>
        </section>

        {loading ? <p className="flex items-center gap-2 text-sm text-[#5d6043]"><Loader2 className="animate-spin" size={17} />Loading stock...</p> : stock.length === 0 ? <p className="text-sm text-[#5d6043]">There is no stock to review. Record production, purchases, or an opening balance first.</p> : <form onSubmit={submit} className="space-y-4">
          <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead><tr className="border-b text-left"><th className="py-3">Item</th><th>Type</th><th>Expected</th><th className="w-36">Counted</th><th>Variance</th></tr></thead><tbody>{stock.map((row) => {
            const variance = Number(counts[row.id] ?? row.onHand) - Number(row.onHand);
            return <tr key={row.id} className="border-b"><td className="py-3 font-medium">{rowName(row)}<span className="block text-xs font-normal text-[#5d6043]">{rowDetail(row)}</span></td><td>{row.stockType === "supply" ? "Supply" : "Finished good"}</td><td>{row.onHand}</td><td><input aria-label={`Counted quantity for ${rowName(row)}`} className="w-28 rounded-md border border-[#b9aca2] px-3 py-2" type="number" min="0" step="any" value={counts[row.id] ?? String(row.onHand)} onChange={(event) => setCounts({ ...counts, [row.id]: event.target.value })} required /></td><td className={variance < 0 ? "font-semibold text-red-700" : variance > 0 ? "font-semibold text-green-700" : "text-[#5d6043]"}>{variance > 0 ? `+${variance}` : variance}</td></tr>;
          })}</tbody></table></div>
          <label className="block text-sm font-medium">Review notes (optional)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="mt-1 w-full max-w-2xl rounded-md border border-[#b9aca2] px-3 py-2" placeholder="Reason for discrepancies or review context" /></label>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#b9aca2]/60 pt-4"><div className="text-sm"><p><strong>{changedLines.length}</strong> balances will change</p><p className="text-[#5d6043]">Net quantity adjustment: {netVariance > 0 ? `+${netVariance}` : netVariance}</p></div><button disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-[#5d6043] px-5 py-2 text-white disabled:opacity-60"><CheckCircle size={18} />Post inventory review</button></div>
        </form>}
        {message && <p className="text-sm text-[#5d6043]">{message}</p>}

        <section>
          <h2 className="mb-3 text-lg font-semibold">Review history</h2>
          {reviews.length === 0 ? <p className="text-sm text-[#5d6043]">No inventory reviews have been posted.</p> : <div className="space-y-2">{reviews.map((review) => {
            const changed = review.lines.filter((line) => line.variance !== 0);
            return <article key={review._id} className="grid gap-2 border-b border-[#b9aca2]/60 py-3 md:grid-cols-[180px_1fr_auto]"><div><p className="font-medium">{new Date(review.countedAt).toLocaleString("en-GB")}</p><p className="text-xs text-[#5d6043]">{review.actorId?.fullName || "Admin"}</p></div><div><p className="text-sm">{review.notes || "No notes"}</p>{changed.length > 0 && <p className="text-xs text-[#5d6043]">{changed.map((line) => `${rowName(line)} ${line.variance > 0 ? "+" : ""}${line.variance}`).join(", ")}</p>}</div><p className="text-sm font-medium">{changed.length} corrections</p></article>;
          })}</div>}
        </section>
      </main>
    </AdminLayout>
  );
}
