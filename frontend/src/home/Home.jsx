import Left from "../left/Left"
import LogOut from "../left/left1/LogOut"
import Right from "../right/Right"
import useConversation from "../stateManage/conversation.js"

const Home = () => {
  const selectConversation = useConversation((state) => state.selectConversation)

  return (
    <div className="flex h-[100dvh] min-h-[480px] w-full gap-0 overflow-hidden bg-[#f1f5f3] p-0 text-[#17211f] sm:gap-3 sm:p-3">
      <LogOut />
      <aside className={`${selectConversation ? "hidden sm:flex" : "flex"} min-w-0 w-full shrink-0 sm:w-[min(340px,32vw)]`}>
        <Left />
      </aside>
      <main className={`${selectConversation ? "flex" : "hidden sm:flex"} min-w-0 flex-1`}>
        <Right />
      </main>
    </div>
  )
}

export default Home