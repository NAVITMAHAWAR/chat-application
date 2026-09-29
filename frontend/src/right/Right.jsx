import ChatUser from "./ChatUser"
import Message from "./Message"
import Type from "./Type"


const Right = () => {
  return (
  <div className="flex h-full w-[70%] flex-col bg-gray-50 text-gray-900">

  <ChatUser/>
<div className="flex-1 overflow-y-auto py-2" style={{maxHeight:"calc(92vh - 8vh)"}}>
    <Message/>
</div>
  <Type/>
  </div>
  )
}

export default Right