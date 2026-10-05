import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import API_URL from "../api";
import { useSocketContext } from "./SocketContext";

const useGetFriends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket, friendsVersion } = useSocketContext();

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/friends/friends`, {
        withCredentials: true,
      });
      setFriends(data.friends || []);
    } catch (err) {
      console.log("getFriends error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends, friendsVersion]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleNewMessage = (message) => {
      if (!message.receiverId) return;

      const senderId = String(
        typeof message.senderId === "object"
          ? message.senderId?._id
          : message.senderId,
      );
      if (!senderId || senderId === "undefined") return;

      setFriends((currentFriends) => {
        const senderIndex = currentFriends.findIndex(
          (friend) => String(friend._id) === senderId,
        );
        if (senderIndex <= 0) return currentFriends;

        const nextFriends = [...currentFriends];
        const [sender] = nextFriends.splice(senderIndex, 1);
        nextFriends.unshift(sender);
        return nextFriends;
      });
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket]);

  return { friends, loading, fetchFriends, setFriends };
};

export default useGetFriends;
