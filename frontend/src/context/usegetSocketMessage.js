import { useEffect } from "react";
import useConversation from "../stateManage/conversation.js";
import { useSocketContext } from "./SocketContext.jsx";
import sound from "../assets/sound.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { setMessages } = useConversation();
  const selectConversation = useConversation(
    (state) => state.selectConversation,
  );

  useEffect(() => {
    if (!socket) return undefined;

    const handleNewMessage = (newMessage) => {
      const isCurrentConversation = selectConversation?.isGroup
        ? String(newMessage.conversationId) === String(selectConversation._id)
        : String(newMessage.senderId?._id || newMessage.senderId) ===
          String(selectConversation?._id);

      const notification = new Audio(sound);
      notification.volume = 1;
      notification.play().catch(() => {
        // Browsers can block audio until the user interacts with the page.
      });
      if (!isCurrentConversation) return;
      setMessages((currentMessages) => [...currentMessages, newMessage]);
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, setMessages, selectConversation]);
};

export default useGetSocketMessage;
