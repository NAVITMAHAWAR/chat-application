import { useEffect } from "react";
import axios from "axios";
import { useSocketContext } from "./SocketContext.jsx";
import useConversation from "../stateManage/conversation.js";
import { useAuth } from "./authContext.js";
import API_URL from "../api";
import {
  isAppActive,
  requestNotificationPermission,
  showBrowserNotification,
  showInAppNotification,
} from "../utils/notifications.js";
import sound from "../assets/sound.mp3";

const useChatNotifications = () => {
  const { socket } = useSocketContext();
  const [authUser] = useAuth();
  const selectConversation = useConversation((s) => s.selectConversation);
  const setSelectConversation = useConversation((s) => s.setSelectConversation);
  const setMessages = useConversation((s) => s.setMessages);
  const incrementUnread = useConversation((s) => s.incrementUnread);
  const clearUnread = useConversation((s) => s.clearUnread);
  const setUnreadCounts = useConversation((s) => s.setUnreadCounts);

  useEffect(() => {
    if (!authUser?.user?._id) return undefined;

    let isCurrent = true;
    axios
      .get(`${API_URL}/api/message/unread-counts`, { withCredentials: true })
      .then(({ data }) => {
        if (isCurrent) setUnreadCounts(data.unreadCounts || {});
      })
      .catch((error) => console.log("getUnreadCounts error", error));

    return () => {
      isCurrent = false;
    };
  }, [authUser?.user?._id, setUnreadCounts]);

  // Ask permission once after login
  useEffect(() => {
    if (authUser?.user?._id) {
      requestNotificationPermission();
    }
  }, [authUser?.user?._id]);

  useEffect(() => {
    if (!socket || !authUser?.user?._id) return;

    const handleNewMessage = (newMessage) => {
      const myId = String(authUser.user._id);
      const senderId =
        typeof newMessage.senderId === "object"
          ? newMessage.senderId?._id
          : newMessage.senderId;
      const senderName =
        typeof newMessage.senderId === "object"
          ? newMessage.senderId?.name
          : "Someone";
      const receiverId =
        typeof newMessage.receiverId === "object"
          ? newMessage.receiverId?._id
          : newMessage.receiverId;

      // Apna message ignore
      if (String(senderId) === myId) return;
      if (receiverId && String(receiverId) !== myId) return;

      const isCurrentChat = selectConversation
        ? selectConversation.isGroup
          ? String(selectConversation._id) === String(newMessage.conversationId)
          : String(selectConversation._id) === String(senderId)
        : false;

      // Sound (always on new message from others)
      const audio = new Audio(sound);
      audio.volume = 0.6;
      audio.play().catch(() => {});

      if (isCurrentChat) {
        // Already handled by useGetSocketMessage — optional double-add avoid
        // setMessages((prev) => [...prev, newMessage]);
        return;
      }

      // For DM, badge on sender's user id (matches left list user._id)
      const unreadKey = newMessage.receiverId
        ? String(senderId) // DM
        : String(newMessage.conversationId); // Group-ish

      incrementUnread(unreadKey);

      // Preview text
      let preview = newMessage.message || "";
      if (newMessage.messageType === "image") preview = "📷 Photo";
      else if (newMessage.messageType === "file")
        preview = `📎 ${newMessage.fileName || "File"}`;
      if (!preview) preview = "New message";

      const openConversation = receiverId
        ? () => {
            setSelectConversation(newMessage.senderId);
            setMessages([]);
            clearUnread(String(senderId));
          }
        : undefined;

      if (isAppActive()) {
        showInAppNotification({
          title: senderName,
          body: preview,
          onClick: openConversation,
        });
      } else {
        showBrowserNotification({
          title: senderName,
          body: preview,
          // Per-conversation tag: ek chat ki notification dusri ko replace na kare
          tag: `chat-${newMessage.conversationId || senderId}`,
          onClick: openConversation,
        });
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [
    socket,
    authUser?.user?._id,
    selectConversation,
    setMessages,
    setSelectConversation,
    incrementUnread,
    clearUnread,
  ]);
};

export default useChatNotifications;