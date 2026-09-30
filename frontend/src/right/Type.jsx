import { FiSend } from "react-icons/fi";
import useSendMessage from "../context/useSendMessage.js";
import { useState, useRef, useEffect } from "react";
import { useSocketContext } from "../context/SocketContext.jsx";
import useConversation from "../stateManage/conversation.js";

const Type = () => {
  const [message, setMessage] = useState("");
  const { sendMessages } = useSendMessage();
  const { socket } = useSocketContext();
  const selectConversation = useConversation((s) => s.selectConversation);
  const typingTimeout = useRef(null);
  const isTyping = useRef(false);

  const emitTyping = () => {
    if (!socket || !selectConversation) return;

    if (selectConversation.isGroup) {
      socket.emit("typingGroup", {
        groupId: selectConversation._id,
        participantIds: selectConversation.participants?.map((p) =>
          typeof p === "object" ? p._id : p
        ),
      });
    } else {
      socket.emit("typing", {
        receiverId: selectConversation._id,
        conversationId: selectConversation._id,
      });
    }
    isTyping.current = true;
  };

  const emitStopTyping = () => {
    if (!socket || !selectConversation || !isTyping.current) return;

    if (selectConversation.isGroup) {
      socket.emit("stopTypingGroup", {
        groupId: selectConversation._id,
        participantIds: selectConversation.participants?.map((p) =>
          typeof p === "object" ? p._id : p
        ),
      });
    } else {
      socket.emit("stopTyping", {
        receiverId: selectConversation._id,
        conversationId: selectConversation._id,
      });
    }
    isTyping.current = false;
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    emitTyping();

    // 2 sec baad stopTyping
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      emitStopTyping();
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    emitStopTyping();
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    const sent = await sendMessages(message);
    if (sent) setMessage("");
  };

  // Conversation change pe stop
  useEffect(() => {
    return () => {
      emitStopTyping();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [selectConversation?._id]);

  return (
    <form
      className="flex shrink-0 items-center gap-3 h-[8vh] px-4"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        placeholder="Type here"
        value={message}
        onChange={handleChange}
        className="h-12 flex-1 rounded-lg border border-gray-300 bg-white px-4 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-500"
      />
      <button
        type="submit"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-2xl text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiSend />
      </button>
    </form>
  );
};

export default Type;