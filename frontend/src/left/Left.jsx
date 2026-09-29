import { useState } from "react"
import Search from "./Search"
import Users from "./Users"
import CreateGroup from "./CreateGroup"
import useGetGroups from "../context/useGetGroups"
import useConversation from "../stateManage/conversation.js"


const Left = () => {
  const [search, setSearch] = useState("")
	const { groups, setGroups } = useGetGroups()
	const selectConversation = useConversation((state) => state.selectConversation)
	const setSelectConversation = useConversation((state) => state.setSelectConversation)
	const setMessages = useConversation((state) => state.setMessages)

	const selectGroup = (group) => {
		if (selectConversation?._id === group._id) return
		setSelectConversation(group)
		setMessages([])
	}

  return (
	<div className="flex h-full w-[30%] flex-col border-r border-gray-200 bg-white text-gray-900">
	 <div className="flex items-center justify-between p-2"><h1 className="m-2 text-3xl font-bold">Chats</h1><CreateGroup onCreated={(group) => { setGroups((current) => [group, ...current]); selectGroup(group); }} /></div>
		<Search value={search} onChange={setSearch}/>
		<hr className="border-gray-200" />
		<Users search={search}/>
		{groups.length > 0 && <div className="max-h-48 overflow-y-auto border-t border-gray-200 bg-white px-3 py-3">
			<p className="mb-2 px-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Groups</p>
			<div className="space-y-2">{groups.map((group) => <button type="button" key={group._id} onClick={() => selectGroup(group)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${selectConversation?._id === group._id ? "border-gray-500 bg-gray-100" : "border-gray-200 bg-white hover:bg-gray-50"}`}><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 text-sm font-bold text-white">G</span><span className="truncate text-sm font-semibold text-gray-900">{group.name}</span></button>)}</div>
		</div>}
	</div>
  )
}

export default Left