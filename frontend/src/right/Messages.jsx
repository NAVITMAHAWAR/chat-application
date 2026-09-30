const Messages = ({ message, isGroup = false }) => {
  const getStoredAuthUser = () => {
    try {
      return JSON.parse(localStorage.getItem("messenger") || "null");
    } catch {
      return null;
    }
  };
  const authUser = getStoredAuthUser();

  const senderId =
    typeof message.senderId === "object"
      ? message.senderId?._id
      : message.senderId;
  const itsMe = String(senderId || "") === String(authUser?.user?._id || "");
  const senderName =
    typeof message.senderId === "object" ? message.senderId?.name : "";

  const chatName = itsMe ? "chat-end" : "chat-start";
  const chatColor = itsMe
    ? "bg-gray-800 text-white"
    : "bg-gray-200 text-gray-900";
  const createAt = new Date(message.createdAt || message.createAt);
  const formatedTime = createAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Read receipt ticks
  const renderTicks = () => {
    if (!itsMe) return null;
    const status = message.status || "sent";
    if (status === "read") {
      return <span className="text-blue-400 text-xs ml-1">✓✓</span>;
    }
    if (status === "delivered") {
      return <span className="text-gray-400 text-xs ml-1">✓✓</span>;
    }
    return <span className="text-gray-400 text-xs ml-1">✓</span>;
  };

  return (
    <div className="px-4 py-1">
      <div className={`chat ${chatName}`}>
        {isGroup && !itsMe && senderName && (
          <div className="mb-1 px-1 text-xs font-semibold text-gray-500">
            {senderName}
          </div>
        )}
        <div className={`chat-bubble ${chatColor}`}>{message.message}</div>
        <div className="flex items-center gap-1 text-xs opacity-70">
          <span>{formatedTime}</span>
          {renderTicks()}
        </div>
      </div>
    </div>
  );
};

export default Messages;