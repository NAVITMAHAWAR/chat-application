import useConversation from "../stateManage/conversation.js";

const TypingIndicator = () => {
  const selectConversation = useConversation((s) => s.selectConversation);
  const typingUsers = useConversation((s) => s.typingUsers);

  if (!selectConversation) return null;

  const typingSenderId = typingUsers[selectConversation._id];
  if (!typingSenderId) return null;

  const name = selectConversation.isGroup
    ? "Someone"
    : selectConversation.name || "User";

  return (
    <div className="flex items-center gap-2.5 px-4 py-2">
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#e5f4ef] px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#087f68] animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-[#087f68] animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-[#087f68] animate-bounce" style={{ animationDelay: "300ms" }} />
      </span>
      <span className="text-xs font-medium text-[#087f68]">{name} is typing…</span>
    </div>
  );
};

export default TypingIndicator;