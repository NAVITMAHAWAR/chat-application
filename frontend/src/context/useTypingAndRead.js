import { useEffect } from "react";
import { useSocketContext } from "./SocketContext.jsx";
import useConversation from "../stateManage/conversation.js";
import { useAuth } from "./authContext.js";

const useTypingAndRead = () => {
  const { socket } = useSocketContext();
  const [authUser] = useAuth();
  const { setMessages, setTyping, clearTyping, selectConversation, messages } =
    useConversation();

  // Listen typing + status updates
  useEffect(() => {
    if (!socket) return;

    const onTyping = ({ senderId, conversationId }) => {
      setTyping(conversationId, senderId);
    };

    const onStopTyping = ({ conversationId }) => {
      clearTyping(conversationId);
    };

    const onStatusUpdate = ({ messageId, messageIds, status }) => {
      const ids = messageIds || (messageId ? [messageId] : []);
      setMessages((prev) =>
        prev.map((msg) =>
          ids.some((id) => String(id) === String(msg._id))
            ? { ...msg, status }
            : msg,
        ),
      );
    };

    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);
    socket.on("messageStatusUpdate", onStatusUpdate);

    return () => {
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
      socket.off("messageStatusUpdate", onStatusUpdate);
    };
  }, [socket, setMessages, setTyping, clearTyping]);

  // Jab conversation open ho → unread messages ko "read" mark karo
  useEffect(() => {
    if (!socket || !selectConversation || !authUser?.user?._id) return;

    const myId = String(authUser.user._id);
    const unread = (messages || []).filter((msg) => {
      const senderId =
        typeof msg.senderId === "object" ? msg.senderId?._id : msg.senderId;
      return String(senderId) !== myId && msg.status !== "read";
    });

    if (unread.length === 0) return;

    // DM case
    if (!selectConversation.isGroup) {
      const senderId = selectConversation._id; // selected user id
      socket.emit("messageRead", {
        messageIds: unread.map((m) => m._id),
        senderId,
        conversationId: selectConversation._id,
      });
    }
    // Group: optional — aap baad mein enhance kar sakte ho
  }, [socket, selectConversation?._id, messages?.length, authUser?.user?._id]);
};

export default useTypingAndRead;
