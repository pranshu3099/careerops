import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getResponseError = (payload, fallback) => {
  if (!payload) return fallback;
  return (
    payload?.message || payload?.error || payload?.data?.message || fallback
  );
};

const unwrapAnalyticsPayload = (payload) => {
  if (payload?.success === true && payload?.data !== undefined) {
    return payload.data;
  }

  if (payload?.data !== undefined && !Array.isArray(payload)) {
    return payload.data;
  }

  return payload;
};

const getAnalyticsResource = async (path, fallbackError) => {
  const response = await apiFetch(`${BACKEND_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getResponseError(payload, fallbackError));
  }

  return unwrapAnalyticsPayload(payload);
};

export const getAnalyticsOverview = () =>
  getAnalyticsResource("/analytics/overview", "Failed to load analytics overview");

export const getAnalyticsFunnel = () =>
  getAnalyticsResource("/analytics/funnel", "Failed to load analytics funnel");

export const getAnalyticsTimeline = (range = "90d", bucket = "week") => {
  const params = new URLSearchParams({
    range,
    bucket,
  });

  return getAnalyticsResource(
    `/analytics/timeline?${params.toString()}`,
    "Failed to load analytics timeline",
  );
};

export const getAnalyticsSources = () =>
  getAnalyticsResource("/analytics/sources", "Failed to load source analytics");

export const getAnalyticsInterviews = () =>
  getAnalyticsResource(
    "/analytics/interviews",
    "Failed to load interview analytics",
  );

export const getAnalyticsTimeMetrics = () =>
  getAnalyticsResource(
    "/analytics/time-metrics",
    "Failed to load time metrics",
  );
