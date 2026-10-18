
import { useEffect, useState } from "react";
import api from "../services/api";
export default function History() {
 const [items,setItems]=useState([]);
 useEffect(()=>{api.get("/api/xrays").then(r=>setItems(r.data)).catch(()=>{})},[]);
 return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Analysis History</h1><p className="text-slate-500">Previously uploaded X-rays and analysis status.</p></div>
 <div className="rounded-2xl border bg-white overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50"><tr><th className="p-4">ID</th><th className="p-4">File</th><th className="p-4">Patient</th><th className="p-4">Status</th></tr></thead><tbody>{items.map(x=><tr className="border-t" key={x.id}><td className="p-4">{x.id}</td><td className="p-4">{x.filename}</td><td className="p-4">{x.patient_id}</td><td className="p-4">{x.status}</td></tr>)}</tbody></table></div></div>
}
