import { useState, useCallback } from "react";
import axios from "axios";
import API_URL from "../../api";

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(
    async ({ search = "", status = "all", page = 1, limit = 20 } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API_URL}/admin/users`, {
          params: { search, status, page, limit },
          withCredentials: true,
        });
        setUsers(data.users || []);
        setPagination(data.pagination || {});
        return data;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load users");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createUser = async (payload) => {
    const { data } = await axios.post(`${API_URL}/admin/users`, payload, {
      withCredentials: true,
    });
    return data;
  };

  const updateUser = async (id, payload) => {
    const { data } = await axios.put(`${API_URL}/admin/users/${id}`, payload, {
      withCredentials: true,
    });
    return data;
  };

  const deleteUser = async (id) => {
    const { data } = await axios.delete(`${API_URL}/admin/users/${id}`, {
      withCredentials: true,
    });
    return data;
  };

  const toggleBlock = async (id) => {
    const { data } = await axios.patch(
      `${API_URL}/admin/users/${id}/block`,
      {},
      { withCredentials: true }
    );
    return data;
  };

  const changeRole = async (id, role) => {
    const { data } = await axios.patch(
      `${API_URL}/admin/users/${id}/role`,
      { role },
      { withCredentials: true }
    );
    return data;
  };

  const getUser = async (id) => {
    const { data } = await axios.get(`${API_URL}/admin/users/${id}`, {
      withCredentials: true,
    });
    return data;
  };

  return {
    users,
    setUsers,
    pagination,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleBlock,
    changeRole,
    getUser,
  };
};