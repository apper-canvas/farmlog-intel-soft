import { useState, useEffect } from "react";

export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastSync, setLastSync] = useState(
    localStorage.getItem("lastSync") || new Date().toISOString()
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem("lastSync", now);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOffline, lastSync };
}