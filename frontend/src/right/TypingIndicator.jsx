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
    <div className="px-4 py-1 text-xs text-gray-500 italic flex items-center gap-1">
      <span className="flex gap-0.5">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </span>
      {name} is typing...
    </div>
  );
};

export default TypingIndicator;