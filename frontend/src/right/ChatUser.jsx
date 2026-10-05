import { FiArrowLeft, FiUsers } from "react-icons/fi"
import { useSocketContext } from "../context/SocketContext.jsx"
import useConversation from "../stateManage/conversation.js"
import { formatLastSeen } from "../utils/presence.js"
const ChatUser = () => {
	const selectConversation = useConversation((state) => state.selectConversation)
	const setSelectConversation = useConversation((state) => state.setSelectConversation)
	const {online, presence, now} = useSocketContext()


	if (!selectConversation) {
	return <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e5f4ef] text-[#087f68]"><FiUsers size={23} /></span><div><h2 className="font-[Manrope] text-lg font-bold text-[#17211f]">Your conversations, together</h2><p className="mt-1 text-sm text-[#71807b]">Choose someone from your people list to start a chat.</p></div></div>;
	}
	const isGroup = selectConversation.isGroup;
	const isOnline = online.includes(String(selectConversation._id));
	const latestPresence = presence[String(selectConversation._id)];
	const lastSeen = latestPresence?.lastLogout || latestPresence?.lastLogin || selectConversation.lastLogout || selectConversation.lastLogin;
  return (
<>
		<div className="flex min-h-[76px] items-center gap-3 border-b border-[#e7edeb] bg-white px-4 py-3 sm:px-6">
			<button type="button" onClick={() => setSelectConversation(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#71807b] hover:bg-[#f1f5f3] sm:hidden" aria-label="Back to conversations"><FiArrowLeft /></button>
			<div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#e5f4ef] text-sm font-bold text-[#087f68]">{isGroup ? <FiUsers /> : (selectConversation.name?.[0] || "?").toUpperCase()}</div>

		<div className="min-w-0 flex-1">
			<h1 className="truncate font-[Manrope] text-base font-bold text-[#17211f]">{selectConversation?.name}</h1>
			<span className="flex items-center gap-1.5 text-xs text-[#71807b]">{!isGroup && <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-[#24a47c]" : "bg-[#bdc7c2]"}`} />}{isGroup ? `${selectConversation.participants?.length || 0} members` : isOnline ? "Online now" : formatLastSeen(lastSeen, now)}</span>
		</div>
		</div>
		
	</>
  )
}

export default ChatUser