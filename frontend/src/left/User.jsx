/**
 * @typedef {{ _id?: string, name?: string, email?: string, profilePic?: string }} UserItem
 */
/**
 * @typedef {{ user?: UserItem }} UserProps
 */

import { useSocketContext } from "../context/SocketContext.jsx";
import useConversation from "../stateManage/conversation.js";

/**
 * @param {UserProps} props
 */
function User(props) {

  const {online} = useSocketContext()
  const user = props && props.user ? props.user : {};
  const isOnline = online.includes(user._id)

  const selectConversation = useConversation((state) => state.selectConversation);
  const setSelectConversation = useConversation((state) => state.setSelectConversation);
  const setMessages = useConversation((state) => state.setMessages);

  const isSelected = selectConversation?._id === user._id;

  const initials = user.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const userName = user.name ? user.name : "Unknown User";
  const userEmail = user.email ? user.email : "No recent message";
  const profilePic = user.profilePic ? user.profilePic : "";

  const handleSelect = () => {
    if (selectConversation?._id === user._id) return;
    setSelectConversation(user);
    // Clear the previous chat immediately so stale messages are not
    // shown while the new conversation is being fetched.
    setMessages([]);
  };

  return (
    <div className={`group flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50 ${isSelected ? "border-gray-500 bg-gray-100" : ""}`}   onClick={handleSelect}
    >

      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-700 text-sm font-bold text-white shadow-md shadow-gray-300">
        {profilePic ? (
          <img src={profilePic} alt={userName} className="h-full w-full rounded-2xl object-cover" />
        ) : (
          initials
        )}
        <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900">{userName}</h3>
          <span className="text-[10px] text-gray-400">Now</span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-gray-500">{userEmail}</p>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isOnline ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
           {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default User