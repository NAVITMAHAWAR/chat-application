import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../api";
import { useSocketContext } from "./SocketContext.jsx";

const useGetGroups = () => {
  const [groups, setGroups] = useState([]);
  const { socket } = useSocketContext();

  useEffect(() => {
    let active = true;
    axios
      .get(`${API_URL}/api/message/groups`)
      .then((response) => {
        if (active)
          setGroups(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => console.log("Error from get groups", error));

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const handleGroupCreated = (group) => {
      setGroups((currentGroups) =>
        currentGroups.some((item) => item._id === group._id)
          ? currentGroups
          : [group, ...currentGroups],
      );
    };
    socket.on("groupCreated", handleGroupCreated);
    return () => socket.off("groupCreated", handleGroupCreated);
  }, [socket]);

  return { groups, setGroups };
};

export default useGetGroups;
