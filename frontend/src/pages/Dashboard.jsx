import { useEffect, useState } from "react";
import {
  Activity,
  FileText,
  ScanLine,
  Users,
  ShieldCheck,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

function StatCard({ title, value, icon: Icon, note }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {note}
          </p>
        </div>

        <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const result = await api.getDashboard();

        if (mounted) {
          setData(result);
        }
      } catch (err) {
        console.error("Dashboard error:", err);

        if (mounted) {
          setError(
            err.response?.data?.detail ||
              err.message ||
              "Failed to load dashboard"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-teal-700">
          OVERVIEW
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Good day, {user?.name?.split(" ")[0] || "Doctor"}
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome to your LungSense AI clinical decision-support workspace.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Unable to load dashboard</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && !data && !error && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading dashboard...
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={data?.total_patients ?? "—"}
          icon={Users}
          note="Registered in patient database"
        />

        <StatCard
          title="X-Rays Analyzed"
          value={data?.xrays_analyzed ?? "—"}
          icon={ScanLine}
          note="Uploaded X-rays"
        />

        <StatCard
          title="Reports Generated"
          value={data?.reports_generated ?? "—"}
          icon={FileText}
          note="Coming with report module"
        />

        <StatCard
          title="System Status"
          value="Ready"
          icon={ShieldCheck}
          note="Authentication active"
        />
      </div>

      {/* Main Content */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Recent Analyses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Recent Analyses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest AI-assisted X-ray analyses will appear here.
              </p>
            </div>

            <Activity
              className="text-teal-600"
              size={22}
            />
          </div>

          {data?.recent_analyses?.length ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="pb-3 pr-4">
                      Patient
                    </th>

                    <th className="pb-3 pr-4">
                      X-Ray
                    </th>

                    <th className="pb-3 pr-4">
                      Status
                    </th>

                    <th className="pb-3">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.recent_analyses.map(
                    (item, index) => (
                      <tr
                        key={`${item.filename}-${index}`}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium text-slate-700">
                          {item.patient || "Unknown"}
                        </td>

                        <td className="max-w-xs truncate py-3 pr-4 text-slate-500">
                          {item.filename || "—"}
                        </td>

                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              item.status === "ANALYZED"
                                ? "bg-green-50 text-green-700"
                                : "bg-teal-50 text-teal-700"
                            }`}
                          >
                            {item.status || "UPLOADED"}
                          </span>
                        </td>

                        <td className="py-3 text-slate-500">
                          {item.date || "—"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <ScanLine
                className="mx-auto text-slate-300"
                size={38}
              />

              <p className="mt-3 font-medium text-slate-700">
                No analyses yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Upload an X-ray from the X-Ray Analysis page
                to see it here.
              </p>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Module 1 Status
          </h2>

          <div className="mt-5 space-y-4">
            {[
              "React frontend",
              "FastAPI backend",
              "SQLite database",
              "JWT authentication",
              "Protected dashboard",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >
                <div className="grid h-6 w-6 place-items-center rounded-full bg-teal-100 text-teal-700">
                  ✓
                </div>

                <span className="text-sm text-slate-700">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-900">
            Patient records and X-ray uploads are active.
            AI prediction will be connected next.
          </div>
        </div>
      </div>
    </div>
  );
}
