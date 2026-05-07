import { getAllInterviews } from "@/lib/interviews";
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

const buildApplicationFromInterview = (interview) => ({
  id: interview?.applicationId,
  company: interview?.company,
  role: interview?.role,
  location: interview?.location,
  currentStatus: interview?.applicationStatus,
  status: interview?.applicationStatus,
  appliedAt: interview?.appliedAt,
});

export default function useAllApplicationInterviews(applications = []) {
  const [applicationInterviews, setApplicationInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isMountedRef = useRef(false);

  const refetchAllInterviews = useCallback(async () => {
    const validApplications = applications.filter((application) => application?.id);

    try {
      setIsLoading(true);
      setError("");
      const allInterviews = await getAllInterviews();
      const interviewsByApplication = new Map();

      (Array.isArray(allInterviews) ? allInterviews : []).forEach((interview) => {
        const applicationId = interview?.applicationId;
        if (!applicationId) return;

        const currentGroup = interviewsByApplication.get(applicationId) || [];
        interviewsByApplication.set(applicationId, [...currentGroup, interview]);
      });

      const applicationIds = new Set(validApplications.map((application) => application.id));
      const result = validApplications.map((application) => ({
        application,
        interviews: sortInterviews(interviewsByApplication.get(application.id) || []),
      }));

      interviewsByApplication.forEach((interviews, applicationId) => {
        if (applicationIds.has(applicationId)) return;

        result.push({
          application: buildApplicationFromInterview(interviews[0]),
          interviews: sortInterviews(interviews),
        });
      });

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
