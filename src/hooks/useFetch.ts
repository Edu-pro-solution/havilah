import { useCallback, useEffect, useState } from "react";
import axios from "axios";

/**
 * ClassMarkweb-compatible GET hook: requests `${VITE_API_URL}/api${url}`.
 * Pass `null` to skip fetching. Sends Bearer token when `jwtToken` exists.
 */
export default function useFetch(url: string | null) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchData = useCallback(async () => {
    if (!url) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${apiUrl}/api${url}`, { headers });
      const body = response.data;
      setData(body?.data !== undefined ? body.data : body);
      setError(null);
    } catch (err: any) {
      // 404 = resource not found / empty — treat as empty, not error
      if (err?.response?.status === 404) {
        setData(null);
        setError(null);
      } else {
        console.error("useFetch error:", url, err);
        setError(err);
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [apiUrl, url]);

  useEffect(() => {
    if (!url) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    void fetchData();
  }, [url, fetchData]);

  const reFetch = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${apiUrl}/api${url}`, { headers });
      const body = res.data;
      setData(body?.data !== undefined ? body.data : body);
      setError(null);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setData(null);
        setError(null);
      } else {
        console.error("useFetch reFetch error:", url, err);
        setError(err);
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [apiUrl, url]);

  return { data, loading, error, reFetch };
}
