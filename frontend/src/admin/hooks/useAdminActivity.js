import { useState, useCallback } from "react";
import axios from "axios";
import API_URL from "../../api";

export const useAdminActivity = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActivity = useCallback(async ({ page = 1, limit = 20 } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/admin/activity`, {
        params: { page, limit },
        withCredentials: true,
      });
      setLogs(data.logs || []);
      setPagination(data.pagination || {});
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load activity");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { logs, pagination, loading, error, fetchActivity };
};
