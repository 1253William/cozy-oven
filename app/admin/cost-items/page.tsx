"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { CostCategory, CostItem, costingService } from "../../services/costingService";
const field = "w-full border border-[#b9aca2] rounded-md px-3 py-2 bg-white";
export default function CostItemsPage() {
  const [items, setItems] = useState<CostItem[]>([]);
  const [categories, setCategories] = useState<CostCategory[]>([]);
  const [form, setForm] = useState({ name: "", categoryId: "", unitType: "mass", unit: "gram", quantity: "", totalCost: "" });
  const [message, setMessage] = useState("");
  const load = async () => {
    const [a, b] = await Promise.all([costingService.items(), costingService.categories("directProductCost")]);
    setItems(a.data || []); setCategories(b.data || []);
  };
  useEffect(() => { load().catch(() => setMessage("Could not load costing data.")); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await costingService.createItem({ name: form.name, categoryId: form.categoryId, unitType: form.unitType, unit: form.unit, purchaseBatch: { quantity: Number(form.quantity), totalCost: Number(form.totalCost) } });
      setForm({ ...form, name: "", quantity: "", totalCost: "" }); setMessage(""); await load();
    } catch (error: any) { setMessage(error.response?.data?.message || "Could not add cost item."); }
  };
  return <AdminLayout><main className="p-4 md:p-8 space-y-6">
    <div><h1 className="text-2xl font-bold">Cost Items</h1><p className="text-sm text-[#5d6043]">Ingredients, packaging, labour, and other direct costs.</p></div>
    <form onSubmit={submit} className="grid md:grid-cols-3 gap-3 border-y border-[#b9aca2]/60 py-5">
      <input className={field} placeholder="Item name" value={form.name} onChange={e => setForm({...form,name:e.target.value})} required/>
      <select className={field} value={form.categoryId} onChange={e => setForm({...form,categoryId:e.target.value})} required><option value="">Cost category</option>{categories.map(x=><option key={x._id} value={x._id}>{x.name}</option>)}</select>
      <select className={field} value={form.unitType} onChange={e=>{const t=e.target.value;setForm({...form,unitType:t,unit:t==="mass"?"gram":t==="volume"?"millilitre":t==="time"?"minute":"piece"})}}><option value="mass">Mass</option><option value="volume">Volume</option><option value="count">Count</option><option value="time">Time</option></select>
      <input className={field} placeholder="Batch quantity" type="number" min="0.000001" step="any" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} required/>
      <input className={field} placeholder="Batch cost (GHS)" type="number" min="0" step="0.01" value={form.totalCost} onChange={e=>setForm({...form,totalCost:e.target.value})} required/>
      <button className="flex items-center justify-center gap-2 bg-[#5d6043] text-white rounded-md px-4 py-2"><Plus size={18}/>Add cost item</button>
    </form>
    {message&&<p className="text-sm text-red-700">{message}</p>}
    <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead><tr className="text-left border-b"><th className="py-3">Item</th><th>Category</th><th>Unit</th><th>Latest batch</th><th>Cost per unit</th></tr></thead><tbody>{items.map(x=><tr key={x._id} className="border-b"><td className="py-3 font-medium">{x.name}</td><td>{typeof x.categoryId==="object"?x.categoryId.name:""}</td><td>{x.unit}</td><td>{x.purchaseBatch.quantity} for GHS {x.purchaseBatch.totalCost.toFixed(2)}</td><td>GHS {x.costPerUnit.toFixed(4)}</td></tr>)}</tbody></table></div>
  </main></AdminLayout>;
}
