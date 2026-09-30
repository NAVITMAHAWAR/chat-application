import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiActivity, FiBarChart2, FiClock, FiLogOut, FiMenu, FiMessageCircle, FiUsers, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import axios from "axios";
import API_URL from "../api";

const navItems = [
  { to: "/admin", end: true, label: "Overview", icon: FiActivity },
  { to: "/admin/users", label: "Users", icon: FiUsers },
  { to: "/admin/activity", label: "Activity log", icon: FiClock },
  { to: "/admin/analytics", label: "Analytics", icon: FiBarChart2 },
];

const AdminDashboard = () => {
  const [authUser, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/user/LogOut`, {}, { withCredentials: true });
    } catch {
      toast.error("Could not reach the server. Signing out locally.");
    }
    localStorage.removeItem("messenger");
    setAuthUser(null);
    navigate("/login");
  };

  const userName = authUser?.user?.name || "Administrator";

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] text-[#17211f]">
      {sidebarOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-30 bg-[#10231e]/35 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-66 flex-col border-r border-[#e2eae6] bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-19 items-center gap-3 border-b border-[#edf1ef] px-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e5f4ef] text-[#087f68]"><FiMessageCircle size={19} /></div>
          <div className="min-w-0 flex-1">
            <p className="font-[Manrope] text-[15px] font-extrabold text-[#17211f]">Chatly</p>
            <p className="text-[11px] text-[#84918b]">Workspace admin</p>
          </div>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-[#71807b] hover:bg-[#f1f5f3] lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><FiX /></button>
        </div>

        <div className="px-4 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#96a29d]">Workspace</div>
        <nav className="space-y-1 px-3">
          {navItems.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${isActive ? "bg-[#eaf5f0] text-[#087f68]" : "text-[#66746e] hover:bg-[#f5f8f6] hover:text-[#17211f]"}`}>
              <Icon aria-hidden="true" size={17} strokeWidth={1.8} />{label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-[#edf1ef] p-4">
          <div className="mb-4 flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#183b32] text-sm font-bold text-white">{userName[0]?.toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#26332f]">{userName}</p>
              <p className="truncate text-xs text-[#84918b]">{authUser?.user?.email}</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-[#71807b] transition hover:bg-rose-50 hover:text-rose-700">
            <FiLogOut aria-hidden="true" size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-17 items-center gap-3 border-b border-[#e4ebe7] bg-white/90 px-4 backdrop-blur sm:px-7">
          <button type="button" className="grid h-9 w-9 place-items-center rounded-lg text-[#53625c] hover:bg-[#f1f5f3] lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><FiMenu size={19} /></button>
          <div className="min-w-0 flex-1">
            <p className="font-[Manrope] text-sm font-bold text-[#17211f]">Administration</p>
            <p className="text-[11px] text-[#84918b]">Manage your community</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dcece4] bg-[#f3faf6] px-3 py-1.5 text-[11px] font-semibold text-[#168263]"><span className="h-1.5 w-1.5 rounded-full bg-[#24a47c]" />System live</span>
        </header>
        <main className="min-w-0 flex-1 overflow-auto px-4 py-6 sm:px-7 sm:py-7"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminDashboard;