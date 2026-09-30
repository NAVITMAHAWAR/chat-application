import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAdminAnalytics } from "../hooks/useAdminAnalytics";
import { useAdminStats } from "../hooks/useAdminStats";
import { FiBarChart2 } from "react-icons/fi";

const COLORS = ["#168263", "#e28b55", "#3488a4", "#d2a83f", "#657c73"];

const Analytics = () => {
  const { analytics, loading, error, fetchAnalytics } = useAdminAnalytics();
  const { stats, fetchStats } = useAdminStats();
  const [range, setRange] = useState("7d");

  useEffect(() => {
    fetchAnalytics(range);
    fetchStats();
  }, [range, fetchAnalytics, fetchStats]);

  if (loading && !analytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between">
        <span>{error}</span>
        <button onClick={() => fetchAnalytics(range)} className="underline text-sm">
          Retry
        </button>
      </div>
    );
  }

  const onlineData = [
    { name: "Online", value: stats?.onlineUsers || 0 },
    { name: "Offline", value: stats?.offlineUsers || 0 },
  ];

  const blockedData = [
    {
      name: "Active",
      value: (stats?.totalUsers || 0) - (stats?.blockedUsers || 0),
    },
    { name: "Blocked", value: stats?.blockedUsers || 0 },
  ];

  const lineData =
    analytics?.signupsPerDay?.map((s, i) => ({
      date: s.date.slice(5),
      signups: s.count,
      logins: analytics.loginCountPerDay?.[i]?.count || 0,
    })) || [];

  const barData =
    analytics?.messagesPerDay?.map((m) => ({
      date: m.date.slice(5),
      messages: m.count,
    })) || [];

  return (
    <div className="page-enter mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#087f68]"><FiBarChart2 size={13} /> Community insights</div>
          <h1 className="font-[Manrope] text-2xl font-bold text-[#17211f]">Analytics</h1>
          <p className="mt-1 text-sm text-[#71807b]">Usage trends and community health</p>
        </div>
        <div className="flex rounded-xl border border-[#dce6e1] bg-white p-1">
          <button
            className={`px-4 py-1.5 text-sm ${
              range === "7d" ? "rounded-lg bg-[#183b32] text-white" : "rounded-lg text-[#66746e] hover:bg-[#f3f7f5]"
            }`}
            onClick={() => setRange("7d")}
          >
            7 Days
          </button>
          <button
            className={`px-4 py-1.5 text-sm ${
              range === "30d" ? "rounded-lg bg-[#183b32] text-white" : "rounded-lg text-[#66746e] hover:bg-[#f3f7f5]"
            }`}
            onClick={() => setRange("30d")}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Line Chart */}
      <div className="rounded-2xl border border-[#e3e9e6] bg-white p-5 shadow-[0_5px_24px_rgba(28,53,44,0.04)] sm:p-6">
        <h2 className="mb-4 font-[Manrope] text-sm font-bold text-[#26332f]">Signups and logins</h2>
        {lineData.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2} name="Signups" />
              <Line type="monotone" dataKey="logins" stroke="#22c55e" strokeWidth={2} name="Logins" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400 py-10">No data for this range</p>
        )}
      </div>

      {/* Bar Chart */}
      <div className="rounded-2xl border border-[#e3e9e6] bg-white p-5 shadow-[0_5px_24px_rgba(28,53,44,0.04)] sm:p-6">
        <h2 className="mb-4 font-[Manrope] text-sm font-bold text-[#26332f]">Messages per day</h2>
        {barData.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="messages" fill="#087f68" radius={[4, 4, 0, 0]} name="Messages" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400 py-10">No message data</p>
        )}
      </div>

      {/* Pie Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#e3e9e6] bg-white p-5 shadow-[0_5px_24px_rgba(28,53,44,0.04)]">
          <h2 className="mb-4 font-[Manrope] text-sm font-bold text-[#26332f]">Online vs offline</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={onlineData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {onlineData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-[#e3e9e6] bg-white p-5 shadow-[0_5px_24px_rgba(28,53,44,0.04)]">
          <h2 className="mb-4 font-[Manrope] text-sm font-bold text-[#26332f]">Active vs blocked</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={blockedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {blockedData.map((_, i) => (
                  <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;