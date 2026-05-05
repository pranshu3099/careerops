import { getInterviewsByApplication } from "@/lib/interviews";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const getTime = (value) => {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const sortInterviews = (interviews) =>
  [...interviews].sort((a, b) => {
    const roundDiff = (Number(a?.round) || 0) - (Number(b?.round) || 0);
    if (roundDiff) return roundDiff;
    return getTime(a?.scheduledAt) - getTime(b?.scheduledAt);
  });

export default function useInterviews(applicationId, enabled = true) {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isMountedRef = useRef(false);

  const refetchInterviews = useCallback(async () => {
    if (!applicationId || !enabled) return [];

    try {
      setIsLoading(true);
      setError("");
      const result = await getInterviewsByApplication(applicationId);
      const nextInterviews = sortInterviews(Array.isArray(result) ? result : []);

      if (!isMountedRef.current) return nextInterviews;

      setInterviews(nextInterviews);
      return nextInterviews;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err?.message || "Failed to load interviews");
      }
      return [];
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [applicationId, enabled]);

  useEffect(() => {
    isMountedRef.current = true;
    refetchInterviews();

    return () => {
      isMountedRef.current = false;
    };
  }, [refetchInterviews]);

  const nextRound = useMemo(
    () =>
      interviews.reduce(
        (maxRound, interview) => Math.max(maxRound, Number(interview?.round) || 0),
        0,
      ) + 1,
    [interviews],
  );

  return {
    interviews,
    isLoading,
    error,
    nextRound,
    refetchInterviews,
  };
}
