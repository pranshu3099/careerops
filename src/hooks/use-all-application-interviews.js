import { getInterviewsByApplication } from "@/lib/interviews";
import { useCallback, useEffect, useRef, useState } from "react";

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

export default function useAllApplicationInterviews(applications = []) {
  const [applicationInterviews, setApplicationInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isMountedRef = useRef(false);

  const refetchAllInterviews = useCallback(async () => {
    const activeApplications = applications.filter((application) => application?.id);
    if (!activeApplications.length) {
      setApplicationInterviews([]);
      return [];
    }

    try {
      setIsLoading(true);
      setError("");
      const result = await Promise.all(
        activeApplications.map(async (application) => {
          const interviews = await getInterviewsByApplication(application.id).catch(() => []);
          return {
            application,
            interviews: sortInterviews(Array.isArray(interviews) ? interviews : []),
          };
        }),
      );

      if (!isMountedRef.current) return result;

      setApplicationInterviews(result);
      return result;
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
  }, [applications]);

  useEffect(() => {
    isMountedRef.current = true;
    refetchAllInterviews();

    return () => {
      isMountedRef.current = false;
    };
  }, [refetchAllInterviews]);

  return {
    applicationInterviews,
    isLoading,
    error,
    refetchAllInterviews,
  };
}
