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
    <button type="button" className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-colors hover:bg-[#f5f8f6] ${isSelected ? "border-[#c6e6da] bg-[#eff8f4]" : ""}`} onClick={handleSelect}
    >

      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#e5f4ef] text-sm font-bold text-[#087f68]">
        {profilePic ? (
          <img src={profilePic} alt={userName} className="h-full w-full rounded-[14px] object-cover" />
        ) : (
          initials
        )}
        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${isOnline ? "bg-[#24a47c]" : "bg-[#bdc7c2]"}`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-[#17211f]">{userName}</h3>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-[#71807b]">{isOnline ? "Online now" : userEmail}</p>
          {isOnline && <span className="shrink-0 text-[10px] font-semibold text-[#168263]">Active</span>}
        </div>
      </div>
    </button>
  );
}

export default User