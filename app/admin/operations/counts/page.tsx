"use client";
import { useEffect,useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { operationsService } from "../../../services/operationsService";
export default function CountsPage(){
 const [stock,setStock]=useState<any[]>([]),[counts,setCounts]=useState<Record<string,string>>({}),[message,setMessage]=useState("");
 useEffect(()=>{operationsService.stock().then(r=>setStock(r.data||[])).catch(()=>setMessage("Could not load stock."))},[]);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();try{await operationsService.count({countedAt:new Date().toISOString(),lines:stock.map(x=>({productId:x.productId?._id||x.productId,variantId:x.variantId,countedQuantity:Number(counts[x._id]??x.onHand)}))});setMessage("Count posted and variances recorded.");const r=await operationsService.stock();setStock(r.data||[])}catch(error:any){setMessage(error.response?.data?.message||"Could not post count.")}};
 return <AdminLayout><main className="p-4 md:p-8 space-y-6"><div><h1 className="text-2xl font-bold">Physical Count</h1><p className="text-sm text-[#5d6043]">Enter actual finished quantities. Variances post to the movement ledger.</p></div><form onSubmit={submit} className="space-y-3">{stock.map(x=><label key={x._id} className="grid grid-cols-[1fr_110px] items-center gap-3 border-b py-3"><span><strong>{x.productId?.productName}</strong><small className="block text-[#5d6043]">Expected {x.onHand}</small></span><input className="border rounded-md px-3 py-2 w-full" type="number" min="0" step="any" value={counts[x._id]??String(x.onHand)} onChange={e=>setCounts({...counts,[x._id]:e.target.value})}/></label>)}<button className="bg-[#5d6043] text-white rounded-md px-5 py-2">Post count</button></form>{message&&<p className="text-sm">{message}</p>}</main></AdminLayout>
}
