import { getCurrentUserFollowups } from "@/lib/applications";
import { useEffect, useState } from "react";

export default function useUpcomingFollowups() {
  const [followUps, setFollowUps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadFollowups = async () => {
      try {
        setIsLoading(true);
        setError("");
        const result = await getCurrentUserFollowups();

        if (!isMounted) return;
        setFollowUps(Array.isArray(result) ? result : []);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load followups");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFollowups();

    return () => {
      isMounted = false;
    };
  }, []);

  return { followUps, isLoading, error };
}
