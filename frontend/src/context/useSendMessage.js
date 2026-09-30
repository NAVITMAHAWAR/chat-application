import axios from "axios";
import useConversation from "../stateManage/conversation.js";
import API_URL from "../api";
import toast from "react-hot-toast";

const useSendMessage = () => {
  const { setMessages, selectConversation } = useConversation();

  const sendMessages = async (message) => {
    if (!message || !message.trim()) return;
    if (!selectConversation || !selectConversation._id) return;

    try {
      const endpoint = selectConversation.isGroup
        ? `${API_URL}/api/message/groups/${selectConversation._id}/send`
        : `${API_URL}/api/message/send/${selectConversation._id}`;
      const response = await axios.post(
        endpoint,
        { message },
      );

      // The backend replies with { message: "...", newMessage: {...} },
      // so the saved message is response.data.newMessage.
      const newMessage = response.data?.newMessage || response.data;
      setMessages((currentMessages) => [...currentMessages, newMessage]);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Message could not be sent");
      return false;
    }
  };

  return { sendMessages };
};

export default useSendMessage;
