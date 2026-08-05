"use client";

import {
  Add01Icon,
  AlertCircleIcon,
  Cancel01Icon,
  Delete02Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { FormEvent, useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import productService from "../../services/productService";
import { CostItem, costingService } from "../../services/costingService";

type ComponentRow = { costItemId: string; quantity: string };
const field = "w-full rounded-md border border-[#b9aca2] bg-white px-3 py-2";

export default function RecipesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [items, setItems] = useState<CostItem[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [yieldQuantity, setYieldQuantity] = useState("1");
  const [components, setComponents] = useState<ComponentRow[]>([{ costItemId: "", quantity: "" }]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [productRows, costRows, recipeRows] = await Promise.all([
      productService.getProducts({ limit: 100 }),
      costingService.items(),
      costingService.recipes(),
    ]);
    setProducts(productRows.data || []);
    setItems(costRows.data || []);
    setRecipes(recipeRows.data || []);
  };
  useEffect(() => { load().catch(() => setMessage("Could not load recipes.")); }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [products, productId]
  );

  const estimate = useMemo(() => {
    const total = components.reduce((sum, row) => {
      const item = items.find((candidate) => candidate._id === row.costItemId);
      return sum + Number(row.quantity || 0) * Number(item?.costPerUnit || 0);
    }, 0);
    const recipeYield = Number(yieldQuantity);
    return { total, perUnit: recipeYield > 0 ? total / recipeYield : 0 };
  }, [components, items, yieldQuantity]);

  const reset = () => {
    setProductId("");
    setVariantId("");
    setYieldQuantity("1");
    setComponents([{ costItemId: "", quantity: "" }]);
    setEditingId(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const payload = {
      productId,
      variantId: variantId || null,
      yieldQuantity: Number(yieldQuantity),
      costComponents: components.map((row) => ({
        costItemId: row.costItemId,
        quantity: Number(row.quantity),
      })),
    };
    try {
      if (editingId) await costingService.updateRecipe(editingId, payload);
      else await costingService.createRecipe(payload);
      reset();
      await load();
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Could not save recipe.");
    } finally {
      setSaving(false);
    }
  };

  const beginEdit = (recipe: any) => {
    setEditingId(recipe._id);
    setProductId(recipe.productId?._id || recipe.productId);
    setVariantId(recipe.variantId || "");
    setYieldQuantity(String(recipe.yieldQuantity));
    setComponents(recipe.costComponents.map((component: any) => ({
      costItemId: component.costItemId?._id || component.costItemId,
      quantity: String(component.quantity),
    })));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AdminLayout>
      <main className="space-y-6 p-4 md:p-8">
        <header>
          <h1 className="text-2xl font-bold">Recipes</h1>
          <p className="text-sm text-[#5d6043]">Combine measurable cost items into the cost of each product or variant.</p>
        </header>

        <section className="border-y border-[#b9aca2]/60 bg-white/60 px-4 py-4">
          <div className="flex gap-3">
            <AdminIcon icon={AlertCircleIcon} size={20} className="mt-0.5 text-[#5d6043]" />
            <div className="text-sm text-[#5d6043]">
              <p className="font-semibold text-[#222]">The yield is how many sellable units this batch produces.</p>
              <p>For 2,000 g flour producing 10 cakes, enter a yield of 10 and flour quantity of 2,000 g. Do not add rent or general marketing here; those belong under Overhead Costs.</p>
            </div>
          </div>
        </section>

        <form onSubmit={submit} className="space-y-4 border-b border-[#b9aca2]/60 pb-6">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium">Product<select className={`${field} mt-1`} value={productId} onChange={(e) => { setProductId(e.target.value); setVariantId(""); }} required><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.productName}</option>)}</select></label>
            <label className="text-sm font-medium">Variant<select className={`${field} mt-1`} value={variantId} onChange={(e) => setVariantId(e.target.value)} disabled={!selectedProduct?.selectOptions?.length}><option value="">Base product</option>{(selectedProduct?.selectOptions || []).map((variant: any) => <option key={variant.variantId} value={variant.variantId}>{variant.label}</option>)}</select></label>
            <label className="text-sm font-medium">Recipe yield<input className={`${field} mt-1`} type="number" min="0.000001" step="any" value={yieldQuantity} onChange={(e) => setYieldQuantity(e.target.value)} required /></label>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">Cost components</h2><button type="button" onClick={() => setComponents([...components, { costItemId: "", quantity: "" }])} className="inline-flex items-center gap-1 text-sm text-[#5d6043]"><AdminIcon icon={Add01Icon} size={16} />Add component</button></div>
            <div className="space-y-2">{components.map((row, index) => {
              const selected = items.find((item) => item._id === row.costItemId);
              return <div key={index} className="grid grid-cols-[1fr_130px_40px] gap-2">
                <select className={field} value={row.costItemId} onChange={(e) => setComponents(components.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, costItemId: e.target.value } : candidate))} required><option value="">Select cost item</option>{items.filter((item) => item._id === row.costItemId || !components.some((candidate) => candidate.costItemId === item._id)).map((item) => <option key={item._id} value={item._id}>{item.name} ({item.unit})</option>)}</select>
                <input className={field} type="number" min="0.000001" step="any" placeholder={selected ? `Qty in ${selected.unit}` : "Quantity"} value={row.quantity} onChange={(e) => setComponents(components.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, quantity: e.target.value } : candidate))} required />
                <button type="button" title="Remove component" disabled={components.length === 1} onClick={() => setComponents(components.filter((_, candidateIndex) => candidateIndex !== index))} className="p-2 text-red-700 disabled:opacity-30"><AdminIcon icon={Delete02Icon} size={17} /></button>
              </div>;
            })}</div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#b9aca2]/60 pt-4">
            <div><p className="text-xs text-[#5d6043]">Estimated direct cost</p><p className="font-semibold">GHS {estimate.total.toFixed(2)} per batch · GHS {estimate.perUnit.toFixed(2)} per unit</p></div>
            <div className="flex gap-2">{editingId && <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-md border px-4 py-2"><AdminIcon icon={Cancel01Icon} size={17} />Cancel</button>}<button disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-[#5d6043] px-4 py-2 text-white disabled:opacity-60">{editingId ? <AdminIcon icon={PencilEdit02Icon} size={17} /> : <AdminIcon icon={Add01Icon} size={17} />}{editingId ? "Save new version" : "Create recipe"}</button></div>
          </div>
        </form>

        {message && <p className="text-sm text-red-700">{message}</p>}
        <div className="grid gap-3 md:grid-cols-2">{recipes.map((recipe) => <article key={recipe._id} className="rounded-md border border-[#b9aca2]/60 bg-white p-4">
          <div className="flex justify-between gap-3"><div><h2 className="font-semibold">{recipe.productId?.productName}</h2><p className="text-sm text-[#5d6043]">{recipe.variantId ? recipe.productId?.selectOptions?.find((option: any) => option.variantId === recipe.variantId)?.label || "Variant" : "Base product"} · Version {recipe.version} · Yield {recipe.yieldQuantity}</p></div><div className="flex"><button title="Edit recipe" onClick={() => beginEdit(recipe)} className="p-2"><AdminIcon icon={PencilEdit02Icon} size={17} /></button><button title="Archive recipe" onClick={async () => { if (confirm("Archive this recipe?")) { await costingService.archiveRecipe(recipe._id); await load(); } }} className="p-2 text-red-700"><AdminIcon icon={Delete02Icon} size={17} /></button></div></div>
          <div className="mt-3 space-y-1 text-sm">{recipe.costComponents.map((component: any) => <div key={component.costItemId?._id || component.costItemId} className="flex justify-between"><span>{component.costItemId?.name}</span><span>{component.quantity} {component.costItemId?.unit}</span></div>)}</div>
          <p className="mt-3 border-t pt-3 font-semibold">GHS {Number(recipe.costing?.costPerProductUnit || 0).toFixed(2)} per sellable unit</p>
        </article>)}</div>
      </main>
    </AdminLayout>
  );
}
