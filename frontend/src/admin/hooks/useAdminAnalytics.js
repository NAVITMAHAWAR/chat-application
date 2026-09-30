import { useState, useCallback } from "react";
import axios from "axios";
import API_URL from "../../api";

export const useAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (range = "7d") => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/admin/analytics`, {
        params: { range },
        withCredentials: true,
      });
      setAnalytics(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analytics, loading, error, fetchAnalytics };
};