
export default function Settings() {
 return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Settings</h1><p className="text-slate-500">Application and clinical workflow settings.</p></div>
 <div className="rounded-2xl border bg-white p-6 space-y-4"><div><b>Application</b><p className="text-sm text-slate-500">LungSense AI — Deep Learning Clinical Decision Support Prototype</p></div><div><b>Model status</b><p className="text-sm text-amber-700">Demo model — replace with a trained and validated model for real evaluation.</p></div><div><b>Data storage</b><p className="text-sm text-slate-500">SQLite database with local X-ray uploads.</p></div></div></div>
}
