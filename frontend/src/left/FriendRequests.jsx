import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiBell, FiCheck, FiLoader, FiX } from "react-icons/fi";
import API_URL from "../api";
import { useSocketContext } from "../context/SocketContext";
import toast from "react-hot-toast";

const FriendRequests = () => {
  const [requests, setRequests] = useState(
    /** @type {Array<{ _id: string, from?: { name?: string, email?: string } }>} */
    ([]),
  );
  const [loading, setLoading] = useState(true);
  const [busyRequestId, setBusyRequestId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { socket, notifyFriendsChanged } = useSocketContext();

  const loadRequests = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/friends/requests/incoming`,
        { withCredentials: true },
      );
      setRequests(data.requests || []);
    } catch (err) {
      console.log("getIncomingRequests error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadRequests);
  }, [loadRequests]);

  useEffect(() => {
    if (!socket) return undefined;
    socket.on("friendRequest", loadRequests);
    return () => socket.off("friendRequest", loadRequests);
  }, [socket, loadRequests]);

  /**
   * @param {string} requestId
   * @param {"accept" | "reject"} action
   */
  const respondToRequest = async (requestId, action) => {
    setBusyRequestId(requestId);
    try {
      await axios.patch(
        `${API_URL}/api/friends/request/${requestId}/${action}`,
        {},
        { withCredentials: true },
      );
      setRequests((current) => current.filter((request) => request._id !== requestId));
      if (action === "accept") {
        toast.success("Friend request accepted");
        notifyFriendsChanged();
      }
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(message || "Could not update request");
    } finally {
      setBusyRequestId(null);
    }
  };

  /** @param {string | undefined} name */
  const initialOf = (name) => (name ? name.trim()[0].toUpperCase() : "?");

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          loadRequests();
        }}
        className="relative h-10 rounded-xl border border-[#dce5e0] px-3 text-sm font-semibold text-[#34423d] transition hover:bg-[#f4f8f6]"
        title="Friend requests"
      >
        Requests
        {requests.length > 0 && (
          <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#087f68] px-1 text-[10px] font-bold text-white">
            {requests.length > 99 ? "99+" : requests.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <button
            type="button"
            aria-label="Close friend requests"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <section className="relative flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border border-[#e3e9e6] bg-white shadow-[0_24px_70px_rgba(16,40,31,0.18)]">
            <header className="flex items-center gap-3 border-b border-[#edf1ef] p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e5f4ef] text-[#087f68]">
                <FiBell aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-[Manrope] text-lg font-bold text-[#17211f]">Friend requests</h2>
                <p className="text-xs text-[#71807b]">{requests.length} pending</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-[#71807b] hover:bg-[#f1f5f3]"
              >
                <FiX />
              </button>
            </header>
            <div className="min-h-40 space-y-2 overflow-y-auto p-5">
              {loading ? (
                <div className="flex justify-center py-8 text-[#087f68]">
                  <FiLoader aria-label="Loading requests" className="animate-spin" size={20} />
                </div>
              ) : requests.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#71807b]">No pending friend requests.</p>
              ) : (
                requests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#e7efeb] bg-[#f8faf9] p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#e5f4ef] text-xs font-bold text-[#087f68]">
                        {initialOf(request.from?.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#17211f]">{request.from?.name}</p>
                        <p className="truncate text-xs text-[#71807b]">{request.from?.email}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        disabled={busyRequestId === request._id}
                        onClick={() => respondToRequest(request._id, "accept")}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#183b32] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#245346] disabled:opacity-50"
                      >
                        <FiCheck aria-hidden="true" /> Accept
                      </button>
                      <button
                        type="button"
                        disabled={busyRequestId === request._id}
                        onClick={() => respondToRequest(request._id, "reject")}
                        className="rounded-lg border border-[#e1e8e4] px-2.5 py-1.5 text-xs font-semibold text-[#71807b] transition hover:bg-[#f1f5f3] hover:text-[#17211f] disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default FriendRequests;