import { useEffect, useRef, useState } from "react";
import { fetchChannelsWithStreams } from "../services/api";

const CACHE_KEY = "iptv-app-channels";
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

function readCache() {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data.channels;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function writeCache(channels) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ timestamp: Date.now(), channels })
  );
}

export function useChannels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    async function load() {
      setLoading(true);
      setError("");

      const cached = readCache();
      if (cached) {
        setChannels(cached);
        setLoading(false);
      }

      try {
        const fresh = await fetchChannelsWithStreams();
        if (!mounted.current) return;
        setChannels(fresh);
        writeCache(fresh);
      } catch (err) {
        if (!mounted.current) return;
        setError("Unable to load IPTV data. Please refresh.");
      } finally {
        if (!mounted.current) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted.current = false;
    };
  }, []);

  return { channels, loading, error };
}
