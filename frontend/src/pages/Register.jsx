import { useState } from "react";
import { Activity, ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
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
        <div className="hidden bg-teal-700 p-12 text-white lg:flex lg:flex-col lg:justify-center">
          <div className="max-w-md">
            <div className="mb-8 grid h-12 w-12 place-items-center rounded-xl bg-white/15">
              <Activity />
            </div>
            <h1 className="text-4xl font-bold">Create your LungSense AI account.</h1>
            <p className="mt-5 leading-7 text-teal-100">
              Module 1 provides secure doctor authentication and a protected clinical dashboard.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-12">
          <form onSubmit={submit} className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Activity className="text-teal-700" size={34} />
              <h1 className="mt-3 text-2xl font-bold">LungSense AI</h1>
            </div>

            <p className="text-sm font-semibold text-teal-700">DOCTOR REGISTRATION</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Create account</h2>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <label className="mt-7 block text-sm font-medium">Full name</label>
            <div className="relative mt-2">
              <UserRound className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="Dr. Your Name"
              />
            </div>

            <label className="mt-5 block text-sm font-medium">Email</label>
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

            <label className="mt-5 block text-sm font-medium">Password</label>
            <div className="relative mt-2">
              <LockKeyhole className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="password"
                minLength={6}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="Minimum 6 characters"
              />
            </div>

            <button
              disabled={loading}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3.5 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
              {!loading && <ArrowRight size={18} />}
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already registered?{" "}
              <Link className="font-semibold text-teal-700 hover:underline" to="/login">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
