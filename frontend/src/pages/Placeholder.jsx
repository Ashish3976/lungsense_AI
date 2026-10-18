export default function Placeholder({ title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
      <p className="text-sm font-semibold text-teal-700">COMING NEXT</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-3 max-w-2xl text-slate-500">{description}</p>
    </div>
  );
}
