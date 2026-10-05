import { FiSend, FiPaperclip, FiSmile } from "react-icons/fi";
import useSendMessage from "../context/useSendMessage.js";
import { useState, useRef, useEffect } from "react";
import { useSocketContext } from "../context/SocketContext.jsx";
import useConversation from "../stateManage/conversation.js";
import EmojiPicker from "emoji-picker-react";
import API_URL from "../api";
import toast from "react-hot-toast";

const Type = () => {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { sendMessages, sendMedia } = useSendMessage();
  const { socket } = useSocketContext();
  const selectConversation = useConversation((s) => s.selectConversation);
  const typingTimeout = useRef(null);
  const isTyping = useRef(false);
  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);

  // Close emoji on outside click
  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(emitStopTyping, 2000);
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB limit (frontend check)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setUploading(true);
    emitStopTyping();
    await sendMedia(file, message.trim());
    setMessage("");
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    emitStopTyping();
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    const sent = await sendMessages(message);
    if (sent) setMessage("");
    setShowEmoji(false);
  };

  useEffect(() => {
    return () => {
      emitStopTyping();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [selectConversation?._id]);

  return (
    <div className="relative shrink-0">
      {/* Emoji Picker */}
      {showEmoji && (
        <div ref={emojiRef} className="absolute bottom-16 left-4 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={320}
            height={400}
            theme="light"
          />
        </div>
      )}

      <form
        className="flex items-center gap-2 h-[8vh] px-4"
        onSubmit={handleSubmit}
      >
        {/* Emoji button */}
        <button
          type="button"
          onClick={() => setShowEmoji((v) => !v)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl text-gray-600 hover:bg-gray-100 transition-colors"
          title="Emoji"
        >
          <FiSmile />
        </button>

        {/* File attach */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          title="Attach file / photo"
        >
          <FiPaperclip />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.mp4,.mp3"
          className="hidden"
          onChange={handleFileSelect}
        />

        <input
          type="text"
          placeholder={uploading ? "Uploading..." : "Type a message"}
          value={message}
          onChange={handleChange}
          disabled={uploading}
          className="h-12 flex-1 rounded-lg border border-gray-300 bg-white px-4 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-500 disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={uploading || !message.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-2xl text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default Type;