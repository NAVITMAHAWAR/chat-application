import useGetAllUsers from "../context/userGetAllUsers";
import User from "./User";

/**
 * @typedef {{ _id?: string, name?: string, email?: string }} UserItem
 */

const Users = ({ search = "" }) => {
  const [allUsers, loading] = useGetAllUsers();

  /** @type {UserItem[]} */
  const usersList = Array.isArray(allUsers?.filtredUser) ? allUsers.filtredUser : [];
  const normalizedSearch = search.trim().toLowerCase();
  const visibleUsers = normalizedSearch
    ? usersList.filter((user) => `${user.name || ""} ${user.email || ""}`.toLowerCase().includes(normalizedSearch))
    : usersList;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50 text-sm text-gray-500">
        Loading conversations...
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto bg-gray-50 px-3 py-3"
      style={{ maxHeight: "calc(84vh - 1vh)" }}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
          Contacts
        </p>
        <span className="rounded-full border border-gray-300 bg-white px-2 py-1 text-[10px] font-semibold text-gray-600">
          {visibleUsers.length}
        </span>
      </div>

      <div className="space-y-2">
        {visibleUsers.map((user, index) => (
          <User key={user && user._id ? user._id : index} user={user} />
        ))}
      </div>
      {visibleUsers.length === 0 && <p className="py-8 text-center text-sm text-gray-500">No users found.</p>}
    </div>
  );
};

export default Users
