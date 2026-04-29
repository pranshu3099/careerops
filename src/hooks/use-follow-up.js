import { getCurrentUserFollowups } from "@/lib/applications";
import { useCallback, useEffect, useRef, useState } from "react";

export default function useUpcomingFollowups() {
  const [followUps, setFollowUps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isMountedRef = useRef(false);

  const refetchFollowups = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const result = await getCurrentUserFollowups();

      if (!isMountedRef.current) return [];

      const nextFollowUps = Array.isArray(result) ? result : [];
      setFollowUps(nextFollowUps);
      return nextFollowUps;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err?.message || "Failed to load followups");
      }
      return [];
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    refetchFollowups();

    return () => {
      isMountedRef.current = false;
    };
  }, [refetchFollowups]);

  return { followUps, isLoading, error, refetchFollowups };
}
