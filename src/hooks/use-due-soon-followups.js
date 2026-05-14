import { getDueSoonFollowups } from "@/lib/applications";
import { useCallback, useEffect, useRef, useState } from "react";

const sortByScheduledAt = (followups) =>
  [...followups].sort(
    (a, b) => {
      const firstDate = new Date(a?.scheduledAt).getTime();
      const secondDate = new Date(b?.scheduledAt).getTime();

      return (
        (Number.isFinite(firstDate) ? firstDate : Number.MAX_SAFE_INTEGER) -
        (Number.isFinite(secondDate) ? secondDate : Number.MAX_SAFE_INTEGER)
      );
    },
  );

export default function useDueSoonFollowups({ autoFetch = false } = {}) {
  const [dueSoonFollowups, setDueSoonFollowups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isMountedRef = useRef(false);

  const refetchDueSoonFollowups = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const result = await getDueSoonFollowups();
      const nextFollowups = Array.isArray(result) ? sortByScheduledAt(result) : [];

      if (!isMountedRef.current) return nextFollowups;

      setDueSoonFollowups(nextFollowups);
      return nextFollowups;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err?.message || "Failed to load due-soon followups");
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

    if (autoFetch) {
      refetchDueSoonFollowups();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [autoFetch, refetchDueSoonFollowups]);

  return {
    dueSoonFollowups,
    isLoading,
    error,
    refetchDueSoonFollowups,
  };
}
