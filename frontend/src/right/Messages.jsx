import API_URL from "../api";

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

  const renderTicks = () => {
    if (!itsMe) return null;
    const status = message.status || "sent";
    if (status === "read")
      return <span className="text-blue-400 text-xs ml-1">✓✓</span>;
    if (status === "delivered")
      return <span className="text-gray-400 text-xs ml-1">✓✓</span>;
    return <span className="text-gray-400 text-xs ml-1">✓</span>;
  };

  const fileSrc = message.fileUrl
    ? message.fileUrl.startsWith("http")
      ? message.fileUrl
      : `${API_URL}${message.fileUrl}`
    : "";

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderContent = () => {
    const type = message.messageType || "text";

    if (type === "image" && fileSrc) {
      return (
        <div className="space-y-1">
          <a href={fileSrc} target="_blank" rel="noreferrer">
            <img
              src={fileSrc}
              alt={message.fileName || "image"}
              className="max-w-[240px] max-h-[280px] rounded-lg object-cover cursor-pointer hover:opacity-90"
            />
          </a>
          {message.message ? (
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          ) : null}
        </div>
      );
    }

    if (type === "file" && fileSrc) {
      return (
        <div className="space-y-1">
          <a
            href={fileSrc}
            target="_blank"
            rel="noreferrer"
            download={message.fileName}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              itsMe ? "bg-gray-700" : "bg-gray-100"
            } hover:opacity-90 transition-opacity`}
          >
            <span className="text-2xl">📎</span>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate max-w-[180px]">
                {message.fileName || "File"}
              </p>
              <p className="text-xs opacity-70">
                {formatSize(message.fileSize)} · Click to download
              </p>
            </div>
          </a>
          {message.message ? (
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          ) : null}
        </div>
      );
    }

    // Default text (emoji included)
    return (
      <span className="whitespace-pre-wrap break-words">{message.message}</span>
    );
  };

  return (
    <div className="px-4 py-1">
      <div className={`chat ${chatName}`}>
        {isGroup && !itsMe && senderName && (
          <div className="mb-1 px-1 text-xs font-semibold text-gray-500">
            {senderName}
          </div>
        )}
        <div className={`chat-bubble ${chatColor}`}>{renderContent()}</div>
        <div className="flex items-center gap-1 text-xs opacity-70">
          <span>{formatedTime}</span>
          {renderTicks()}
        </div>
      </div>
    </div>
  );
};

export default Messages;