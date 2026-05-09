import {
  getAnalyticsFunnel,
  getAnalyticsInterviews,
  getAnalyticsOverview,
  getAnalyticsSources,
  getAnalyticsTimeMetrics,
  getAnalyticsTimeline,
} from "@/lib/analytics";
import { useCallback, useEffect, useRef, useState } from "react";

const EMPTY_ANALYTICS = {
  overview: null,
  funnel: null,
  timeline: [],
  sources: [],
  interviews: null,
  timeMetrics: null,
};

const normalizeArrayPayload = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};

export default function useAnalytics(range = "90d", bucket = "week") {
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);
  const [error, setError] = useState("");
  const [timelineError, setTimelineError] = useState("");
  const isMountedRef = useRef(false);
  const hasLoadedInitialAnalyticsRef = useRef(false);
  const rangeRef = useRef(range);
  const bucketRef = useRef(bucket);

  rangeRef.current = range;
  bucketRef.current = bucket;

  const refetchTimeline = useCallback(async () => {
    try {
      setIsTimelineLoading(true);
      setTimelineError("");

      const timeline = await getAnalyticsTimeline(
        rangeRef.current,
        bucketRef.current,
      );
      const nextTimeline = normalizeArrayPayload(timeline, "timeline");

      if (!isMountedRef.current) return nextTimeline;

      setAnalytics((currentAnalytics) => ({
        ...currentAnalytics,
        timeline: nextTimeline,
      }));
      return nextTimeline;
    } catch (err) {
      if (isMountedRef.current) {
        setTimelineError(err?.message || "Failed to load analytics timeline");
      }
      return [];
    } finally {
      if (isMountedRef.current) {
        setIsTimelineLoading(false);
      }
    }
  }, []);

  const refetchAnalytics = useCallback(async () => {
    try {
      setIsRefetching(true);
      setError("");
      setTimelineError("");

      const [
        overview,
        funnel,
        timeline,
        sources,
        interviews,
        timeMetrics,
      ] = await Promise.all([
        getAnalyticsOverview(),
        getAnalyticsFunnel(),
        getAnalyticsTimeline(rangeRef.current, bucketRef.current),
        getAnalyticsSources(),
        getAnalyticsInterviews(),
        getAnalyticsTimeMetrics(),
      ]);

      const nextAnalytics = {
        overview,
        funnel,
        timeline: normalizeArrayPayload(timeline, "timeline"),
        sources,
        interviews,
        timeMetrics,
      };

      if (!isMountedRef.current) return nextAnalytics;

      setAnalytics(nextAnalytics);
      hasLoadedInitialAnalyticsRef.current = true;
      return nextAnalytics;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err?.message || "Failed to load analytics");
      }
      return EMPTY_ANALYTICS;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefetching(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    setIsLoading(true);
    refetchAnalytics();

    return () => {
      isMountedRef.current = false;
    };
  }, [refetchAnalytics]);

  useEffect(() => {
    if (!hasLoadedInitialAnalyticsRef.current) return;

    refetchTimeline();
  }, [refetchTimeline]);

  return {
    ...analytics,
    isLoading,
    isRefetching,
    isTimelineLoading,
    error,
    timelineError,
    refetchAnalytics,
    refetchTimeline,
  };
}
