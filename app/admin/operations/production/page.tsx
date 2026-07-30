"use client";
import { useEffect,useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import productService from "../../../services/productService";
import { operationsService } from "../../../services/operationsService";
const field="w-full border border-[#b9aca2] rounded-md px-3 py-2 bg-white";
export default function ProductionPage(){
 const [products,setProducts]=useState<any[]>([]),[message,setMessage]=useState("");
 const [form,setForm]=useState({productId:"",quantityProduced:"",producedAt:new Date().toISOString().slice(0,10),notes:""});
 useEffect(()=>{productService.getProducts({limit:100}).then((r:any)=>setProducts(r.data||[]))},[]);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();try{await operationsService.production({...form,quantityProduced:Number(form.quantityProduced)});setMessage("Production recorded and stock updated.");setForm({...form,quantityProduced:"",notes:""})}catch(error:any){setMessage(error.response?.data?.message||"Could not record production.")}};
 return <AdminLayout><main className="p-4 md:p-8 max-w-3xl space-y-6"><div><h1 className="text-2xl font-bold">Production</h1><p className="text-sm text-[#5d6043]">Record completed batches at their actual production date.</p></div><form onSubmit={submit} className="grid md:grid-cols-2 gap-4 border-y py-6">
 <select className={field} value={form.productId} onChange={e=>setForm({...form,productId:e.target.value})} required><option value="">Select product</option>{products.map(x=><option key={x.id} value={x.id}>{x.productName}</option>)}</select>
 <input className={field} type="number" min="0.000001" step="any" placeholder="Quantity produced" value={form.quantityProduced} onChange={e=>setForm({...form,quantityProduced:e.target.value})} required/>
 <input className={field} type="date" max={new Date().toISOString().slice(0,10)} value={form.producedAt} onChange={e=>setForm({...form,producedAt:e.target.value})} required/>
 <input className={field} placeholder="Batch notes (optional)" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
 <button className="md:col-span-2 bg-[#5d6043] text-white rounded-md px-4 py-2">Record production</button>
 </form>{message&&<p className="text-sm">{message}</p>}</main></AdminLayout>
}
