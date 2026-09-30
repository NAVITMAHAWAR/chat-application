import { FiShield, FiWifi, FiX } from "react-icons/fi";

const UserDetailDrawer = ({ user, onClose }) => {
  if (!user) return null;

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-[#e3e9e6] bg-white p-6 shadow-[0_24px_70px_rgba(16,40,31,0.18)]">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e5f4ef] text-xl font-bold text-[#087f68]">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="font-[Manrope] text-lg font-bold text-[#17211f]">{user.name}</h3>
              <p className="text-sm text-[#71807b]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close user details"
            className="grid h-9 w-9 place-items-center rounded-lg text-[#71807b] hover:bg-[#f1f5f3]"
          >
            <FiX />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "Role", value: user.role },
            {
              label: "Status",
              value: user.isBlocked
                ? "Blocked"
                : user.isOnline
                ? "Online"
                : "Offline",
            },
            { label: "Login Count", value: user.loginCount ?? 0 },
            { label: "Joined", value: formatDate(user.createdAt) },
            { label: "Last Login", value: formatDate(user.lastLogin) },
            { label: "Last Logout", value: formatDate(user.lastLogout) },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[#edf1ef] bg-[#f8faf9] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#84918b]">{item.label}</p>
              <p className="mt-1 font-semibold capitalize text-[#26332f]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-[#71807b]"><FiShield aria-hidden="true" /> Account ID: <span className="truncate font-mono">{user._id}</span><FiWifi aria-hidden="true" className="ml-auto shrink-0 text-[#087f68]" /></p>
      </div>
    </div>
  );
};

export default UserDetailDrawer;