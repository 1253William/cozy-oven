"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import productService, { Product } from "../../../services/productService";
import { operationsService } from "../../../services/operationsService";

const field = "w-full border border-[#b9aca2] rounded-md px-3 py-2 bg-white";

type ProductionLine = {
  productId: string;
  variantId: string;
  quantityProduced: string;
};

const emptyLine: ProductionLine = { productId: "", variantId: "", quantityProduced: "" };

export default function ProductionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [producedAt, setProducedAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ProductionLine[]>([{ ...emptyLine }]);

  useEffect(() => {
    productService
      .getProducts({ limit: 100, sortBy: "productName", order: "asc" })
      .then((response) => setProducts((response.data || []).filter((product) => product.productType !== "package")))
      .catch(() => setProducts([]));
  }, []);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const updateLine = (index: number, updates: Partial<ProductionLine>) => {
    setItems((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...updates } : line
      )
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await operationsService.production({
        producedAt,
        notes,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantityProduced: Number(item.quantityProduced),
        })),
      });
      setMessage("Production recorded and stock updated.");
      setItems([{ ...emptyLine }]);
      setNotes("");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Could not record production.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <main className="p-4 md:p-8 max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Production</h1>
          <p className="text-sm text-[#5d6043]">
            Record completed products and sizes at their actual production date.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4 border-y py-6">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-medium">
              Production date
              <input
                className={`${field} mt-1`}
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={producedAt}
                onChange={(event) => setProducedAt(event.target.value)}
                required
              />
            </label>
            <label className="text-sm font-medium">
              Batch notes
              <input
                className={`${field} mt-1`}
                placeholder="Optional"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const product = productMap.get(item.productId);
              return (
                <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_130px_auto]">
                  <select
                    className={field}
                    value={item.productId}
                    onChange={(event) => {
                      const product = productMap.get(event.target.value);
                      updateLine(index, {
                        productId: event.target.value,
                        variantId: product?.selectOptions?.[0]?.variantId || "",
                      });
                    }}
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.productName}</option>
                    ))}
                  </select>
                  <select
                    className={field}
                    value={item.variantId}
                    onChange={(event) => updateLine(index, { variantId: event.target.value })}
                  >
                    <option value="">Base size</option>
                    {(product?.selectOptions || []).map((variant) => (
                      <option key={variant.variantId || variant.label} value={variant.variantId || ""}>{variant.label}</option>
                    ))}
                  </select>
                  <input
                    className={field}
                    type="number"
                    min="0.000001"
                    step="any"
                    placeholder="Quantity"
                    value={item.quantityProduced}
                    onChange={(event) => updateLine(index, { quantityProduced: event.target.value })}
                    required
                  />
                  <button
                    type="button"
                    title="Remove line"
                    onClick={() => setItems((current) => current.filter((_, lineIndex) => lineIndex !== index))}
                    disabled={items.length === 1}
                    className="rounded-md border border-[#b9aca2] p-2 text-red-700 disabled:opacity-40"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() => setItems((current) => [...current, { ...emptyLine }])}
              className="inline-flex items-center gap-2 rounded-md border border-[#b9aca2] px-4 py-2"
            >
              <Plus size={18} /> Add line
            </button>
            <button disabled={saving} className="bg-[#5d6043] text-white rounded-md px-4 py-2 disabled:opacity-60">
              Record production
            </button>
          </div>
        </form>

        {message && <p className="text-sm">{message}</p>}
      </main>
    </AdminLayout>
  );
}
