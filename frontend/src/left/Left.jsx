import { useState } from "react"
import Search from "./Search"
import Users from "./Users"
import CreateGroup from "./CreateGroup"
import useGetGroups from "../context/useGetGroups"
import useConversation from "../stateManage/conversation.js"
import FindPeople from "./FindPeople";


const Left = () => {
  const [search, setSearch] = useState("")
  const [showFind, setShowFind] = useState(false);
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
	<div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-none border border-[#e3e9e6] bg-white text-[#17211f] shadow-[0_12px_40px_rgba(26,53,43,0.06)] sm:rounded-2xl">
	 <div className="flex items-center justify-between border-b border-[#edf1ef] px-5 py-5"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#087f68]">Your space</p><h1 className="mt-1 font-[Manrope] text-2xl font-bold">Messages</h1></div><div className="flex items-center gap-2"><button type="button" onClick={() => setShowFind(true)} className="h-10 rounded-xl border border-[#dce5e0] px-3 text-sm font-semibold text-[#34423d] transition hover:bg-[#f4f8f6]" title="Find people">Add people</button><CreateGroup onCreated={(group) => { setGroups((current) => [group, ...current]); selectGroup(group); }} /></div></div>
		<Search value={search} onChange={setSearch}/>
		<Users search={search}/>
		{groups.length > 0 && <div className="max-h-52 min-h-0 overflow-y-auto border-t border-[#edf1ef] bg-white px-4 py-4">
			<p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#71807b]">Groups</p>
			<div className="space-y-1.5">{groups.map((group) => <button type="button" key={group._id} onClick={() => selectGroup(group)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${selectConversation?._id === group._id ? "border-[#b9e1d3] bg-[#eff8f4]" : "border-transparent bg-white hover:bg-[#f5f8f6]"}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e5f4ef] text-sm font-bold text-[#087f68]">G</span><span className="truncate text-sm font-semibold text-[#17211f]">{group.name}</span></button>)}</div>
		</div>}
		{showFind && <FindPeople onClose={() => setShowFind(false)} />}
	</div>
  )
}

export default Left