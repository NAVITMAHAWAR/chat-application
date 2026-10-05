import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import API_URL from "../api";

/**
 * @typedef {{ _id?: string, name?: string, email?: string }} UserItem
 */

/**
 * @typedef {{ filtredUser?: UserItem[] }} UserResponse
 */

const useGetAllUsers = () => {
  const [allUsers, setAllUsers] = useState(/** @type {UserResponse} */ ({ filtredUser: [] }));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getAllUsers = async () => {
      setLoading(true);

      try {
        const token = Cookies.get("jwt");

        const response = await axios.get(`${API_URL}/user/getUserProfile`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let loggedInUserId;
        try {
          loggedInUserId = JSON.parse(localStorage.getItem("messenger") || "null")?.user?._id;
        } catch {
          loggedInUserId = null;
        }

        const users = Array.isArray(response.data?.filtredUser)
          ? response.data.filtredUser
          : [];
        setAllUsers({
          ...response.data,
          filtredUser: loggedInUserId
            ? users.filter((user) => String(user?._id) !== String(loggedInUserId))
            : users,
        });
      } catch (error) {
        console.log("error from getAll users", error);
      } finally {
        setLoading(false);
      }
    };

    getAllUsers();
  }, []);

  return /** @type {[UserResponse, boolean]} */ ([allUsers, loading]);
};

export default useGetAllUsers;