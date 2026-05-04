import { getApplicationStats } from "@/lib/applications";
import { useCallback, useEffect, useRef, useState } from "react";

const EMPTY_STATS = {
  applied: 0,
  shortlisted: 0,
  interviewing: 0,
  offered: 0,
  rejected: 0,
  ghosted: 0,
};

export default function useApplicationStats() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isMountedRef = useRef(false);

  const refetchApplicationStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const result = await getApplicationStats();
      const nextStats = {
        ...EMPTY_STATS,
        ...result,
      };

      if (!isMountedRef.current) return nextStats;

      setStats(nextStats);
      return nextStats;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err?.message || "Failed to load application stats");
      }
      return EMPTY_STATS;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    refetchApplicationStats();

    return () => {
      isMountedRef.current = false;
    };
  }, [refetchApplicationStats]);

  return {
    stats,
    isLoading,
    error,
    refetchApplicationStats,
  };
}
