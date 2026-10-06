import Left from "../left/Left"
import LogOut from "../left/left1/LogOut"
import Right from "../right/Right"
import useConversation from "../stateManage/conversation.js"
import useChatNotifications from "../context/useChatNotifications"
import { useEffect } from "react"

const Home = () => {

  // Home.jsx
useEffect(() => {
  const applyBadge = (state) => {
    const total = Object.values(state.unreadCounts).reduce((a, b) => a + b, 0);
    document.title = total > 0 ? `(${total}) Chat App` : "Chat App";
    // OS-level badge (Chrome/Edge/Android): taskbar/dock pe unread count
    if (navigator.setAppBadge) {
      if (total > 0) navigator.setAppBadge(total).catch(() => {});
      else navigator.clearAppBadge?.().catch(() => {});
    }
  };

  applyBadge(useConversation.getState()); // initial value
  return useConversation.subscribe(applyBadge);
}, []);

  useChatNotifications()
  const selectConversation = useConversation((state) => state.selectConversation)

  return (
    <div className="flex h-[100dvh] min-h-[480px] min-h-0 w-full gap-0 overflow-hidden bg-[#f1f5f3] p-0 text-[#17211f] sm:gap-3 sm:p-3">
      <div className={`${selectConversation ? "hidden sm:flex" : "flex"} h-full w-16 shrink-0 sm:w-[72px]`}>
        <LogOut />
      </div>
      <aside className={`${selectConversation ? "hidden sm:flex" : "flex"} min-h-0 min-w-0 flex-1 sm:flex-none sm:w-[min(340px,32vw)]`}>
        <Left />
      </aside>
      <main className={`${selectConversation ? "flex" : "hidden sm:flex"} min-h-0 min-w-0 flex-1`}>
        <Right />
      </main>
    </div>
  )
}

export default Home