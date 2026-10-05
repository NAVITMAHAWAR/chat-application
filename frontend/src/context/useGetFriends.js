import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import API_URL from "../api";
import { useSocketContext } from "./SocketContext";

const useGetFriends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const { friendsVersion } = useSocketContext();

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

  return { friends, loading, fetchFriends, setFriends };
};

export default useGetFriends;
