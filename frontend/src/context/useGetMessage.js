import { useEffect } from "react";
import useConversation from "../stateManage/conversation.js";
import axios from "axios";
import API_URL from "../api";

const useGetMessage = () => {
  const { messages, setMessages, selectConversation } = useConversation();

  useEffect(() => {
    let isCurrent = true;
    const controller = new AbortController();

    const getMessages = async () => {
      if (!selectConversation?._id) {
        setMessages([]);
        return;
      }

      try {
        const endpoint = selectConversation.isGroup
          ? `${API_URL}/api/message/groups/${selectConversation._id}/messages`
          : `${API_URL}/api/message/get/${selectConversation._id}`;
        const response = await axios.get(endpoint, {
          signal: controller.signal,
        });

        if (isCurrent) {
          setMessages(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        if (error.name !== "CanceledError") console.log(error);
      }
    };

    getMessages();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [selectConversation?._id, selectConversation?.isGroup, setMessages]);
  return { messages };
};

export default useGetMessage;
