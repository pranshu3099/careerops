import { getFollowupsByUser } from "@/lib/applications";
import { useCallback, useEffect, useRef, useState } from "react";

export default function useUserFollowups() {
  const [userfollowUps, setUserFollowups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const isMountedRef = useRef(false);

  const refetchFollowupsByUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const result = await getFollowupsByUser();
      if (!isMountedRef.current) return [];
      const nextFollowups = Array.isArray(result) ? result : [];
      setUserFollowups(nextFollowups);
      return nextFollowups;
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

    refetchFollowupsByUser();

    return () => {
      isMountedRef.current = false;
    };
  }, [refetchFollowupsByUser]);

  return {
    followups: userfollowUps,
    userfollowUps,
    isLoading,
    error,
    refetchFollowups: refetchFollowupsByUser,
    refetchFollowupsByUser,
  };
}
