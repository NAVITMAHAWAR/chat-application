import { useEffect, useState } from "react";
import { FiActivity, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useAdminActivity } from "../hooks/useAdminActivity";

const actionColors = {
  CREATE_USER: "bg-green-50 text-green-700 border-green-200",
  UPDATE_USER: "bg-blue-50 text-blue-700 border-blue-200",
  DELETE_USER: "bg-red-50 text-red-700 border-red-200",
  BLOCK_USER: "bg-yellow-50 text-yellow-700 border-yellow-200",
  UNBLOCK_USER: "bg-green-50 text-green-700 border-green-200",
  PROMOTE_USER: "bg-purple-50 text-purple-700 border-purple-200",
  DEMOTE_USER: "bg-gray-50 text-gray-600 border-gray-200",
};

const ActivityLog = () => {
  const { logs, pagination, loading, error, fetchActivity } = useAdminActivity();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchActivity({ page, limit: 10 });
  }, [page, fetchActivity]);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          dateStyle: "short",
          timeStyle: "medium",
        })
      : "—";

  return (
    <div className="page-enter mx-auto max-w-7xl space-y-5">
      <div>
        <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#087f68]"><FiActivity size={13} /> Audit trail</div>
        <h1 className="font-[Manrope] text-2xl font-bold text-[#17211f]">Activity log</h1>
        <p className="mt-1 text-sm text-[#71807b]">A record of changes across your community</p>
      </div>

      {error && (
        <div className="flex justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{error}</span>
          <button onClick={() => fetchActivity({ page })} className="underline text-sm">
            Retry
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[#e3e9e6] bg-white shadow-[0_5px_24px_rgba(28,53,44,0.04)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#edf1ef] bg-[#f8faf9] text-left text-[11px] uppercase tracking-wide text-[#71807b]">
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Performed By</th>
              <th className="px-4 py-3 font-medium">Target User</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  No activity yet
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="border-b border-[#f0f3f1] transition-colors hover:bg-[#f8faf9]">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        actionColors[log.action] || "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-800">{log.performedBy?.name || "—"}</div>
                    <div className="text-xs text-gray-400">{log.performedBy?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-800">{log.targetUser?.name || "—"}</div>
                    <div className="text-xs text-gray-400">{log.targetUser?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">
                    {log.meta && Object.keys(log.meta).length > 0
                      ? JSON.stringify(log.meta)
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-[#e1e8e4] text-[#53625c] disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <FiChevronLeft aria-label="Previous page" />
          </button>
          <span className="flex items-center text-sm text-gray-500 px-3">
            Page {page} / {pagination.totalPages}
          </span>
          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-[#e1e8e4] text-[#53625c] disabled:opacity-40"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <FiChevronRight aria-label="Next page" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;