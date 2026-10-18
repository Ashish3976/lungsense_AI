import { useState } from "react";
import { Activity, ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
        <div className="hidden bg-teal-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-10 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">
                <Activity />
              </div>
              <div>
                <p className="text-lg font-bold">LungSense AI</p>
                <p className="text-xs text-teal-100">Intelligent Clinical Decision Support</p>
              </div>
            </div>
            <h1 className="max-w-md text-4xl font-bold leading-tight">
              Smarter chest X-ray analysis for healthcare professionals.
            </h1>
            <p className="mt-5 max-w-lg text-teal-100">
              A project platform for multi-lung-disease detection, explainable AI and digital
              patient records.
            </p>
          </div>
          <p className="text-sm text-teal-100">Module 1 • Secure doctor access</p>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-12">
          <form onSubmit={submit} className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 inline-flex rounded-xl bg-teal-100 p-3 text-teal-700">
                <Activity />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">LungSense AI</h1>
            </div>

            <p className="text-sm font-semibold text-teal-700">DOCTOR PORTAL</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Sign in to access your dashboard.</p>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <label className="mt-7 block text-sm font-medium text-slate-700">Email</label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="doctor@example.com"
              />
            </div>

            <label className="mt-5 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative mt-2">
              <LockKeyhole className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="••••••••"
              />
            </div>

            <button
              disabled={loading}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3.5 font-semibold text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              New doctor?{" "}
              <Link className="font-semibold text-teal-700 hover:underline" to="/register">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
