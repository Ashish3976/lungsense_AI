
import { useState } from "react";
import api from "../services/api";
import { FileText, Loader2, AlertTriangle } from "lucide-react";

export default function Reports() {
  const [id, setId] = useState("");
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function generate() {
    if (!id) return;
    setBusy(true); setMessage(""); setReport(null);
    try { setReport((await api.get(`/api/reports/xray/${id}`)).data); }
    catch(e) { setMessage(e.response?.data?.detail || "Generate the analysis first."); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold">Clinical Reports</h1><p className="text-slate-500">Generate a preliminary report from an analyzed X-ray.</p></div>
    <div className="rounded-2xl border bg-white p-6">
      <div className="flex gap-3"><input value={id} onChange={e=>setId(e.target.value)} className="w-full rounded-xl border px-4 py-3" placeholder="X-Ray ID"/>
      <button onClick={generate} disabled={busy} className="rounded-xl bg-slate-900 px-5 py-3 text-white">{busy?<Loader2 className="animate-spin"/>:<FileText/>}</button></div>
      {message && <div className="mt-4 flex gap-2 rounded-xl bg-red-50 p-4 text-red-700"><AlertTriangle size={18}/>{message}</div>}
    </div>
    {report && <div className="rounded-2xl border bg-white p-6">
      <h2 className="text-xl font-bold">Preliminary Report</h2>
      <p className="mt-2 text-slate-500">Patient: {report.patient.name} · X-Ray: {report.xray.filename}</p>
      <div className="mt-5 rounded-xl bg-slate-50 p-4"><b>Summary:</b> {report.summary}</div>
      <div className="mt-5"><b>Disease Scores</b>{Object.entries(report.findings).map(([n,s])=><div className="mt-2 flex justify-between border-b py-2" key={n}><span>{n}</span><span>{s}%</span></div>)}</div>
      <div className="mt-5 rounded-xl bg-amber-50 p-4 text-amber-800">{report.recommendation}</div>
    </div>}
  </div>
}
