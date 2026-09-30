import ChatUser from "./ChatUser"
import Message from "./Message"
import Type from "./Type"


const Right = () => {
  return (
  <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-none border border-[#e3e9e6] bg-[#f7f9f8] text-[#17211f] sm:rounded-2xl">

  <ChatUser/>
<div className="min-h-0 flex-1 overflow-y-auto px-1 py-4 sm:px-3">
    <Message/>
</div>
  <Type/>
  </div>
  )
}

export default Right