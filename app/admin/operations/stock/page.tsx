"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { operationsService } from "../../../services/operationsService";
export default function StockPage(){
 const [rows,setRows]=useState<any[]>([]),[moves,setMoves]=useState<any[]>([]),[error,setError]=useState("");
 useEffect(()=>{Promise.all([operationsService.stock(),operationsService.movements()]).then(([a,b])=>{setRows(a.data||[]);setMoves(b.data||[])}).catch(()=>setError("Could not load finished stock."))},[]);
 return <AdminLayout><main className="p-4 md:p-8 space-y-7"><div><h1 className="text-2xl font-bold">Finished Stock</h1><p className="text-sm text-[#5d6043]">Current sellable quantities and immutable movements.</p></div>{error&&<p className="text-red-700">{error}</p>}
 <section><h2 className="font-semibold mb-3">Balances</h2><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">{rows.map(x=><div key={x._id} className="border border-[#b9aca2] rounded-md p-4 bg-white"><p className="font-semibold">{x.productId?.productName}</p><p className="text-sm text-[#5d6043]">{x.variantId||"Base product"}</p><p className="text-2xl mt-3">{x.onHand}</p></div>)}</div></section>
 <section className="overflow-x-auto"><h2 className="font-semibold mb-3">Recent movements</h2><table className="w-full min-w-[650px] text-sm"><thead><tr className="text-left border-b"><th className="py-2">Date</th><th>Product</th><th>Type</th><th>Change</th><th>Balance</th></tr></thead><tbody>{moves.map(x=><tr key={x._id} className="border-b"><td className="py-3">{new Date(x.occurredAt).toLocaleDateString("en-GB")}</td><td>{x.productId?.productName}</td><td>{x.movementType}</td><td className={x.quantityChange<0?"text-red-700":"text-green-700"}>{x.quantityChange}</td><td>{x.balanceAfter}</td></tr>)}</tbody></table></section>
 </main></AdminLayout>
}
