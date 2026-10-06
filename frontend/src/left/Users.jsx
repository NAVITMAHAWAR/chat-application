import useGetFriends from "../context/useGetFriends";
import { useSocketContext } from "../context/SocketContext.jsx";
import User from "./User";

const Users = ({ search = "" }) => {
  const { friends, loading } = useGetFriends();
  const { online } = useSocketContext();
  const onlineIds = new Set(online.map(String));
  const sortedFriends = [...friends].sort(
    (left, right) =>
      Number(onlineIds.has(String(right._id))) -
      Number(onlineIds.has(String(left._id)))
  );

  const normalizedSearch = search.trim().toLowerCase();
  const visibleUsers = normalizedSearch
    ? sortedFriends.filter((user) =>
        `${user.name || ""} ${user.email || ""}`
          .toLowerCase()
          .includes(normalizedSearch)
      )
    : sortedFriends;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50 text-sm text-gray-500">
        Loading friends...
      </div>
    );
  }

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-3 py-3"
      style={{ maxHeight: "calc(84vh - 1vh)" }}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
          Friends
        </p>
        <span className="rounded-full border border-gray-300 bg-white px-2 py-1 text-[10px] font-semibold text-gray-600">
          {visibleUsers.length}
        </span>
      </div>

      <div className="space-y-2">
        {visibleUsers.map((user) => (
          <User key={user._id} user={user} />
        ))}
      </div>
      {visibleUsers.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          No friends yet. Find people and send requests!
        </p>
      )}
    </div>
  );
};

export default Users;