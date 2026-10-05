import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiEdit2, FiEye, FiPlus, FiShield, FiShieldOff, FiTrash2, FiUserCheck, FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { useSocketContext } from "../../context/SocketContext";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import UserDetailDrawer from "./UserDetailDrawer";

const UsersTable = () => {
  const {
    users,
    setUsers,
    pagination,
    loading,
    fetchUsers,
    deleteUser,
    toggleBlock,
    changeRole,
  } = useAdminUsers();

  const { socket } = useSocketContext() || {};

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const load = () => fetchUsers({ search, status, page, limit: 15 });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchUsers({ search: debouncedSearch, status, page, limit: 15 });
  }, [fetchUsers, debouncedSearch, status, page]);

  // Live socket updates
  useEffect(() => {
    if (!socket) return;

    const onUserUpdated = ({ userId, user }) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, ...user } : u))
      );
    };
    const onUserDeleted = ({ userId }) => {
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    };
    const onStatusChanged = ({ userId, isOnline }) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isOnline } : u))
      );
    };

    socket.on("admin:userUpdated", onUserUpdated);
    socket.on("admin:userDeleted", onUserDeleted);
    socket.on("userStatusChanged", onStatusChanged);

    return () => {
      socket.off("admin:userUpdated", onUserUpdated);
      socket.off("admin:userDeleted", onUserDeleted);
      socket.off("userStatusChanged", onStatusChanged);
    };
  }, [socket, setUsers]);

  const handleDelete = async (user) => {
    try {
      await deleteUser(user._id);
      toast.success(`${user.name} deleted`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
    setConfirmAction(null);
  };

  const handleBlock = async (user) => {
    try {
      const res = await toggleBlock(user._id);
      toast.success(res.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
    setConfirmAction(null);
  };

  const handleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const res = await changeRole(user._id, newRole);
      toast.success(res.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Role change failed");
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "—";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#087f68]"><FiUsers size={13} /> Directory</div>
          <h1 className="font-[Manrope] text-2xl font-bold text-[#17211f]">Users</h1>
          <p className="mt-1 text-sm text-[#71807b]">{pagination.total || 0} accounts in your community</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#183b32] px-4 text-sm font-semibold text-white transition hover:bg-[#245346]"
        >
          <FiPlus aria-hidden="true" /> Add user
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search name or email..."
          className="h-10 w-full rounded-xl border border-[#e1e8e4] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5e6d9] sm:max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-10 w-full rounded-xl border border-[#e1e8e4] bg-white px-3 text-sm text-[#34423d] focus:outline-none focus:ring-2 focus:ring-[#c5e6d9] sm:w-40"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#e3e9e6] bg-white shadow-[0_5px_24px_rgba(28,53,44,0.04)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#edf1ef] bg-[#f8faf9] text-left text-[11px] uppercase tracking-wide text-[#71807b]">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Login</th>
              <th className="px-4 py-3 font-medium">Logins</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-b border-[#f0f3f1] transition-colors hover:bg-[#f8faf9]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e5f4ef] text-xs font-bold text-[#087f68]">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        u.role === "admin"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          u.isBlocked
                            ? "bg-red-500"
                            : u.isOnline
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span className="text-xs text-gray-600">
                        {u.isBlocked ? "Blocked" : u.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDate(u.lastLogin)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {u.loginCount ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => setDetailUser(u)}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-[#e4eae7] text-[#71807b] hover:bg-[#f1f5f3] hover:text-[#17211f]"
                        title="View"
                        aria-label={`View ${u.name}`}
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => setEditUser(u)}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-[#e4eae7] text-[#71807b] hover:bg-[#f1f5f3] hover:text-[#17211f]"
                        title="Edit"
                        aria-label={`Edit ${u.name}`}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: "block", user: u })}
                        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 text-xs font-semibold ${
                          u.isBlocked
                            ? "border-green-300 text-green-700 hover:bg-green-50"
                            : "border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                        }`}
                      >
                        {u.isBlocked ? <><FiShield aria-hidden="true" />Unblock</> : <><FiShieldOff aria-hidden="true" />Block</>}
                      </button>
                      <button
                        onClick={() => handleRole(u)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#d7e8e1] px-2 text-xs font-semibold text-[#087f68] hover:bg-[#eff8f4]"
                      >
                        <FiUserCheck aria-hidden="true" />{u.role === "admin" ? "Demote" : "Promote"}
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: "delete", user: u })}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                        title={`Delete ${u.name}`}
                        aria-label={`Delete ${u.name}`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          className="grid h-9 w-9 place-items-center rounded-lg border border-[#e1e8e4] text-[#53625c] disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          <FiChevronLeft aria-hidden="true" />
        </button>
        <span className="flex items-center text-sm text-gray-500 px-3">
          Page {page} / {pagination.totalPages || 1}
        </span>
        <button
          type="button"
          aria-label="Next page"
          className="grid h-9 w-9 place-items-center rounded-lg border border-[#e1e8e4] text-[#53625c] disabled:opacity-40"
          disabled={page >= (pagination.totalPages || 1)}
          onClick={() => setPage((p) => p + 1)}
        >
          <FiChevronRight aria-hidden="true" />
        </button>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={() => {
            setEditUser(null);
            load();
          }}
        />
      )}
      {detailUser && (
        <UserDetailDrawer user={detailUser} onClose={() => setDetailUser(null)} />
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmAction(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-lg text-gray-800">
              {confirmAction.type === "delete" ? "Delete User?" : "Confirm Action"}
            </h3>
            <p className="py-4 text-sm text-gray-600">
              {confirmAction.type === "delete"
                ? `Permanently delete ${confirmAction.user.name}? This cannot be undone.`
                : `${confirmAction.user.isBlocked ? "Unblock" : "Block"} ${confirmAction.user.name}?`}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  confirmAction.type === "delete"
                    ? handleDelete(confirmAction.user)
                    : handleBlock(confirmAction.user)
                }
                className={`px-4 py-2 text-sm rounded-lg text-white ${
                  confirmAction.type === "delete"
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-yellow-600 hover:bg-yellow-500"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;