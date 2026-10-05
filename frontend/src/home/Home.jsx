import Left from "../left/Left"
import LogOut from "../left/left1/LogOut"
import Right from "../right/Right"
import useConversation from "../stateManage/conversation.js"
import useChatNotifications from "../context/useChatNotifications"
import { useEffect } from "react"

const Home = () => {

  // Home.jsx
useEffect(() => {
  const unsub = useConversation.subscribe((state) => {
    const total = Object.values(state.unreadCounts).reduce((a, b) => a + b, 0);
    document.title = total > 0 ? `(${total}) Chat App` : "Chat App";
  });
  return unsub;
}, []);

  useChatNotifications()
  const selectConversation = useConversation((state) => state.selectConversation)

  return (
    <div className="flex h-[100dvh] min-h-[480px] min-h-0 w-full gap-0 overflow-hidden bg-[#f1f5f3] p-0 text-[#17211f] sm:gap-3 sm:p-3">
      <LogOut />
      <aside className={`${selectConversation ? "hidden sm:flex" : "flex"} min-h-0 min-w-0 w-full shrink-0 sm:w-[min(340px,32vw)]`}>
        <Left />
      </aside>
      <main className={`${selectConversation ? "flex" : "hidden sm:flex"} min-h-0 min-w-0 flex-1`}>
        <Right />
      </main>
    </div>
  )
}

export default Home