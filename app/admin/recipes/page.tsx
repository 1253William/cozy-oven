"use client";
import { useEffect,useState } from "react";
import AdminLayout from "../components/AdminLayout";
import productService from "../../services/productService";
import { CostItem,costingService } from "../../services/costingService";
const field="w-full border border-[#b9aca2] rounded-md px-3 py-2 bg-white";
export default function RecipesPage(){
 const [products,setProducts]=useState<any[]>([]),[items,setItems]=useState<CostItem[]>([]),[recipes,setRecipes]=useState<any[]>([]),[message,setMessage]=useState("");
 const [form,setForm]=useState({productId:"",yieldQuantity:"1",costItemId:"",quantity:""});
 const load=async()=>{const [p,c,r]=await Promise.all([productService.getProducts({limit:100}),costingService.items(),costingService.recipes()]);setProducts((p as any).data||[]);setItems(c.data||[]);setRecipes(r.data||[])};
 useEffect(()=>{load().catch(()=>setMessage("Could not load recipes."))},[]);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();try{await costingService.createRecipe({productId:form.productId,yieldQuantity:Number(form.yieldQuantity),costComponents:[{costItemId:form.costItemId,quantity:Number(form.quantity)}]});setMessage("");await load()}catch(error:any){setMessage(error.response?.data?.message||"Could not save recipe.")}};
 return <AdminLayout><main className="p-4 md:p-8 space-y-6"><div><h1 className="text-2xl font-bold">Recipes</h1><p className="text-sm text-[#5d6043]">Define direct cost quantities for each product yield.</p></div>
 <form onSubmit={submit} className="grid md:grid-cols-2 gap-3 border-y py-5"><select className={field} value={form.productId} onChange={e=>setForm({...form,productId:e.target.value})} required><option value="">Product</option>{products.map(x=><option key={x._id||x.id} value={x._id||x.id}>{x.productName}</option>)}</select><input className={field} type="number" min="0.000001" step="any" value={form.yieldQuantity} onChange={e=>setForm({...form,yieldQuantity:e.target.value})} placeholder="Recipe yield" required/><select className={field} value={form.costItemId} onChange={e=>setForm({...form,costItemId:e.target.value})} required><option value="">Cost item</option>{items.map(x=><option key={x._id} value={x._id}>{x.name} ({x.unit})</option>)}</select><input className={field} type="number" min="0.000001" step="any" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} placeholder="Quantity used" required/><button className="md:col-span-2 bg-[#5d6043] text-white rounded-md px-4 py-2">Save recipe</button></form>
 {message&&<p className="text-red-700 text-sm">{message}</p>}<div className="grid md:grid-cols-2 gap-3">{recipes.map(x=><div key={x._id} className="border rounded-md p-4 bg-white"><p className="font-semibold">{x.productId?.productName}</p><p className="text-sm text-[#5d6043]">Version {x.version} · Yield {x.yieldQuantity}</p><p className="mt-2">GHS {Number(x.calculatedCost?.costPerProductUnit||0).toFixed(2)} per unit</p></div>)}</div>
 </main></AdminLayout>
}
