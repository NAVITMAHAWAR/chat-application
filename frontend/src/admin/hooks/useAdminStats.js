import { useState, useCallback } from "react";
import axios from "axios";
import API_URL from "../../api";

export const useAdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/admin/stats`, {
        withCredentials: true,
      });
      setStats(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load stats");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, error, fetchStats };
};