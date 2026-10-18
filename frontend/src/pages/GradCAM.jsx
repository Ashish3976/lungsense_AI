
import { useState } from "react";
import api from "../services/api";
import { ScanSearch, Loader2, AlertTriangle } from "lucide-react";

export default function GradCAM() {
  const [id, setId] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    if (!id) return;
    setBusy(true); setMessage(""); setUrl("");
    try {
      const r = await api.post(`/api/explainability/gradcam/${id}`);
      setUrl(`${api.defaults.baseURL}/files/${r.data.path}`);
    } catch (e) {
      setMessage(e.response?.data?.detail || "Could not generate Grad-CAM.");
    } finally { setBusy(false); }
  }

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold">Explainable AI — Grad-CAM</h1><p className="text-slate-500">Visualize the region used by the model. Current visualization is a demo.</p></div>
    <div className="rounded-2xl border bg-white p-6">
      <label className="mb-2 block text-sm font-medium">X-Ray ID</label>
      <div className="flex gap-3"><input value={id} onChange={e=>setId(e.target.value)} className="w-full rounded-xl border px-4 py-3" placeholder="Example: 1"/>
      <button onClick={run} disabled={busy} className="rounded-xl bg-slate-900 px-5 py-3 text-white">{busy?<Loader2 className="animate-spin"/>:<ScanSearch/>}</button></div>
      {message && <div className="mt-4 flex gap-2 rounded-xl bg-red-50 p-4 text-red-700"><AlertTriangle size={18}/>{message}</div>}
      {url && <img src={url} alt="Grad-CAM visualization" className="mt-6 max-w-lg rounded-xl border"/>}
    </div>
  </div>
}
