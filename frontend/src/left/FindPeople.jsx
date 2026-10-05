import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FiCheck, FiChevronDown, FiLoader, FiSearch, FiUserPlus, FiX } from "react-icons/fi";
import API_URL from "../api";
import toast from "react-hot-toast"

const FindPeople = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const searchRequestId = useRef(0);

  const fetchUsers = useCallback(async (endpoint, q = query, cursor = null, append = false) => {
    const requestId = append ? searchRequestId.current : ++searchRequestId.current;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setLoadingMore(false);
      setNextCursor(null);
    }
    try {
      const { data } = await axios.get(`${API_URL}/api/friends/${endpoint}`, {
        params: { q, ...(cursor ? { cursor } : {}) },
        withCredentials: true,
      });
      if (requestId !== searchRequestId.current) return;
      setUsers((current) =>
        append ? [...current, ...(data.users || [])] : data.users || [],
      );
      setNextCursor(data.nextCursor || null);
    } catch (err) {
      console.log(err);
    } finally {
      if (requestId === searchRequestId.current) {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    }
  }, [query]);

  const search = useCallback(
    (q = query, cursor = null, append = false) =>
      fetchUsers("search", q, cursor, append),
    [fetchUsers, query],
  );

  const loadPeople = useCallback(
    (cursor = null, append = false) =>
      fetchUsers("people", "", cursor, append),
    [fetchUsers],
  );

  useEffect(() => {
    const searchTerm = query.trim();
    const timeout = setTimeout(
      () => searchTerm ? search(searchTerm) : loadPeople(),
      searchTerm ? 500 : 0,
    );
    return () => clearTimeout(timeout);
  }, [query, search, loadPeople]);

  const sendRequest = async (toUserId) => {
    try {
      await axios.post(
        `${API_URL}/api/friends/request`,
        { toUserId },
        { withCredentials: true }
      );
      toast.success("Request sent!");
      if (query.trim()) search(query.trim());
      else loadPeople();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const initialOf = (name) => (name ? name.trim()[0].toUpperCase() : "?");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border border-[#e3e9e6] bg-white shadow-[0_24px_70px_rgba(16,40,31,0.18)]">
        <div className="mb-1 flex items-center gap-3 border-b border-[#edf1ef] p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e5f4ef] text-[#087f68]"><FiUserPlus /></span>
          <div><h2 className="font-[Manrope] text-lg font-bold text-[#17211f]">Find people</h2><p className="text-xs text-[#71807b]">Grow your circle</p></div>
          <button type="button" onClick={onClose} aria-label="Close" className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-[#71807b] hover:bg-[#f1f5f3]"><FiX /></button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4">
          <div className="flex h-11 items-center gap-2.5 rounded-xl border border-[#e3e9e6] bg-[#f7f9f8] px-3.5 transition focus-within:border-[#9acdbb] focus-within:bg-white">
            <FiSearch aria-hidden="true" className="shrink-0 text-[#84918c]" size={16} />
            <input
              type="text"
              aria-label="Search people by name or email"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => {
                searchRequestId.current += 1;
                setNextCursor(null);
                setQuery(e.target.value);
              }}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#17211f] outline-none placeholder:text-[#9aa6a1]"
            />
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <FiLoader aria-hidden="true" className="animate-spin text-[#087f68]" size={20} />
              <p className="text-sm text-[#71807b]">Searching...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f1f5f3] text-[#71807b]"><FiSearch aria-hidden="true" size={17} /></span>
              <p className="text-sm text-[#71807b]">{query.trim() ? `No results for “${query.trim()}”` : "Search for people to add them as friends."}</p>
            </div>
          ) : (
            <>
              {users.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#e3e9e6] p-3 transition hover:border-[#c6e6da] hover:bg-[#f8faf9]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#e5f4ef] text-xs font-bold text-[#087f68]">{initialOf(u.name)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#17211f]">{u.name}</p>
                      <p className="truncate text-xs text-[#71807b]">{u.email}</p>
                    </div>
                  </div>
                  {u.requestStatus === "none" && (
                    <button
                      type="button"
                      onClick={() => sendRequest(u._id)}
                      className="shrink-0 rounded-lg bg-[#183b32] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#245346]"
                    >
                      Add friend
                    </button>
                  )}
                  {u.requestStatus === "sent" && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#dcece4] bg-[#f3faf6] px-2.5 py-1 text-xs font-semibold text-[#168263]">
                      <FiCheck aria-hidden="true" size={12} />Request sent
                    </span>
                  )}
                  {u.requestStatus === "received" && (
                    <span className="shrink-0 text-xs font-semibold text-[#71807b]">
                      Request received
                    </span>
                  )}
                </div>
              ))}
              {nextCursor && (
                <button
                  type="button"
                  onClick={() => query.trim()
                    ? search(query.trim(), nextCursor, true)
                    : loadPeople(nextCursor, true)}
                  disabled={loadingMore}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#e3e9e6] py-2.5 text-sm font-semibold text-[#35544b] transition hover:bg-[#f1f7f4] disabled:cursor-wait disabled:opacity-60"
                >
                  {loadingMore ? (
                    <FiLoader aria-hidden="true" className="animate-spin" />
                  ) : (
                    <FiChevronDown aria-hidden="true" />
                  )}
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindPeople;