import axios from "axios";
import useConversation from "../stateManage/conversation.js";
import API_URL from "../api";
import toast from "react-hot-toast";

const useSendMessage = () => {
  const { setMessages, selectConversation } = useConversation();

  const sendMessages = async (message, { tempId, onSent } = {}) => {
    if (!message || !message.trim()) return;
    if (!selectConversation || !selectConversation._id) return;

    const conversationId = selectConversation._id;

    try {
      const endpoint = selectConversation.isGroup
        ? `${API_URL}/api/message/groups/${conversationId}/send`
        : `${API_URL}/api/message/send/${conversationId}`;
      const response = await axios.post(endpoint, { message });

      // The backend replies with { message: "...", newMessage: {...} },
      // so the saved message is response.data.newMessage.
      const newMessage = response.data?.newMessage || response.data;
      setMessages((currentMessages) => {
        const optimistic = tempId
          ? currentMessages.find((item) => item._id === tempId)
          : null;
        // Swap the optimistic bubble for the saved one in place so the
        // message does not jump position when the server responds.
        const next = optimistic
          ? currentMessages.map((item) =>
              item._id === tempId
                ? { ...newMessage, _localState: "sent" }
                : item,
            )
          : [...currentMessages, newMessage];
        // Not every client renders the new row from the socket echo;
        // report back so the composer only clears when it is safe.
        onSent?.();
        return next;
      });
      return true;
    } catch (error) {
      setMessages((currentMessages) =>
        tempId
          ? currentMessages.map((item) =>
              item._id === tempId ? { ...item, _localState: "failed" } : item,
            )
          : currentMessages,
      );
      toast.error(error.response?.data?.message || "Message could not be sent");
      return false;
    }
  };

  // ── Send image / file ──
  const sendMedia = async (file, caption = "") => {
    if (!file || !selectConversation?._id) return false;

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (caption) formData.append("message", caption);

      const endpoint = selectConversation.isGroup
        ? `${API_URL}/api/message/groups/${selectConversation._id}/send-media`
        : `${API_URL}/api/message/send-media/${selectConversation._id}`;

      const response = await axios.post(endpoint, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newMessage = response.data?.newMessage || response.data;
      setMessages((currentMessages) => [...currentMessages, newMessage]);
      return true;
    } catch (error) {
      console.log("Error from send media", error);
      alert(error.response?.data?.message || "Failed to send file");
      return false;
    }
  };

  return { sendMessages, sendMedia };
};

export default useSendMessage;
