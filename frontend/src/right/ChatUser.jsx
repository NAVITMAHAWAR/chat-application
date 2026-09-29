
import { useSocketContext } from "../context/SocketContext.jsx"
import useConversation from "../stateManage/conversation.js"
const ChatUser = () => {
	const {selectConversation}=useConversation()
	console.log(selectConversation)
	const {online} = useSocketContext()

	const getOnlineUserStatus = (userId)=>{
		return online.includes(userId)? "Online": "Offline"
	}
	

	if (!selectConversation) {
    return <div className="p-5 text-gray-400">Select a user to start chatting</div>;
	}
	const isGroup = selectConversation.isGroup;
  return (
<>
		<div className="flex h-[8vh] space-x-4 border-b border-gray-200 bg-white p-5 duration-300 hover:bg-gray-100">
			<div>
			<div className="avatar avatar-online">
  <div className="w-14 rounded-full">
    <img alt="Tailwind-CSS-Avatar-component" src="https://img.daisyui.com/images/profile/demo/gordon@192.webp" />
  </div>
</div>
		</div>

		<div>
			<h1 className="text-xl font-semibold text-gray-900">{selectConversation?.name}</h1>
			<span className="text-sm text-gray-500">{isGroup ? `${selectConversation.participants?.length || 0} members` : getOnlineUserStatus(selectConversation._id)}</span>
		</div>
		</div>
		
	</>
  )
}

export default ChatUser