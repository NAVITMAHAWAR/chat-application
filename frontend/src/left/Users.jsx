import useGetAllUsers from "../context/userGetAllUsers";
import User from "./User";
import { FiUsers } from "react-icons/fi";

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
      <div className="flex flex-1 items-center justify-center bg-white text-sm text-[#71807b]">
        Finding your people...
      </div>
    );
  }

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto bg-white px-3 pb-4"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#71807b]">
          <FiUsers aria-hidden="true" size={13} /> People
        </p>
        <span className="rounded-full bg-[#f1f5f3] px-2 py-1 text-[10px] font-semibold text-[#71807b]">
          {visibleUsers.length}
        </span>
      </div>

      <div className="space-y-1">
        {visibleUsers.map((user, index) => (
          <User key={user && user._id ? user._id : index} user={user} />
        ))}
      </div>
      {visibleUsers.length === 0 && <p className="py-8 text-center text-sm text-[#71807b]">No people match that search.</p>}
    </div>
  );
};

export default Users
