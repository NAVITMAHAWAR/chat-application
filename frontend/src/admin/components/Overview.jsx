import { useEffect, useState } from "react";
import {
  FiActivity,
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiLayers,
  FiMessageSquare,
  FiRefreshCw,
  FiShield,
  FiUserPlus,
  FiUsers,
  FiWifi,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAdminStats } from "../hooks/useAdminStats";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { useSocketContext } from "../../context/SocketContext";

const statCards = [
  { key: "totalUsers", title: "Total users", icon: FiUsers, tone: "teal" },
  { key: "onlineUsers", title: "Online now", icon: FiWifi, tone: "green" },
  { key: "offlineUsers", title: "Offline", icon: FiClock, tone: "slate" },
  { key: "blockedUsers", title: "Blocked", icon: FiShield, tone: "rose" },
  { key: "totalMessages", title: "Messages", icon: FiMessageSquare, tone: "blue" },
  { key: "totalGroups", title: "Groups", icon: FiUsers, tone: "amber" },
  { key: "totalConversations", title: "Conversations", icon: FiLayers, tone: "indigo" },
  { key: "newUsersToday", title: "New today", icon: FiUserPlus, tone: "orange" },
];

const toneStyles = {
  teal: "bg-teal-50 text-teal-700",
  green: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-600",
  rose: "bg-rose-50 text-rose-700",
  blue: "bg-sky-50 text-sky-700",
  amber: "bg-amber-50 text-amber-700",
  indigo: "bg-indigo-50 text-indigo-700",
  orange: "bg-orange-50 text-orange-700",
};

const StatCard = ({ title, value, icon: Icon, tone }) => (
  <article className="group relative overflow-hidden rounded-lg border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</p>
        <p className="mt-3 text-3xl font-semibold leading-none tabular-nums tracking-tight text-slate-900">
          {value == null ? <span className="text-slate-300">--</span> : Number(value).toLocaleString()}
        </p>
      </div>
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${toneStyles[tone]}`}>
        <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
      </span>
    </div>
  </article>
);

const Overview = () => {
  const { stats, loading, error, fetchStats } = useAdminStats();
  const { users, fetchUsers } = useAdminUsers();
  const { online = [] } = useSocketContext() || {};
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats().catch(() => {});
    const interval = setInterval(() => fetchStats().catch(() => {}), 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers({ limit: 1000 }).catch(() => {});
  }, [fetchUsers]);

  /** @type {Array<{ _id: string, name: string }>} */
  const userRecords = users;
  const usersById = new Map(userRecords.map((user) => [String(user._id), user]));

  const refreshOverview = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchStats(), fetchUsers({ limit: 1000 })]);
      toast.success("Overview updated");
    } catch (refreshError) {
      toast.error(refreshError.response?.data?.message || "Unable to refresh overview");
    } finally {
      setRefreshing(false);
    }
  };

  const updatedAt = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-8">
      <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
            <FiActivity aria-hidden="true" size={14} /> Platform pulse
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Overview</h1>
          <p className="mt-1.5 text-sm text-slate-500">A live view of your chat community and activity.</p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <span className="text-xs text-slate-500">Updated {updatedAt}</span>
          <button
            type="button"
            onClick={refreshOverview}
            disabled={refreshing || loading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
          >
            <FiRefreshCw aria-hidden="true" className={refreshing || loading ? "animate-spin" : ""} size={15} />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" />
          <div className="flex-1">{error}</div>
          <button type="button" onClick={() => fetchStats().catch(() => {})} className="font-semibold underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      <section aria-label="Platform statistics">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Platform statistics</h2>
          {loading && <span className="text-xs text-slate-400">Syncing</span>}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ key, ...card }) => (
            <StatCard key={key} {...card} value={stats?.[key]} />
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900">Live online users</h2>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Currently connected to your community</p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <FiCheck aria-hidden="true" size={13} /> {online.length} online
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {online.length === 0 ? (
            <div className="flex min-h-24 flex-col items-center justify-center gap-2 text-center">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500">
                <FiWifi aria-hidden="true" size={17} />
              </span>
              <p className="text-sm text-slate-500">No users are connected right now.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {online.map((id) => {
                const name = usersById.get(String(id))?.name;
                const displayName = name || `User ${String(id).slice(-6)}`;
                return (
                  <li key={id} className="flex min-w-0 items-center gap-3 rounded-md border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">
                      {displayName.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{displayName}</span>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-label="Online" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default Overview;