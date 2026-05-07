import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getResponseError = (payload, fallback) => {
  if (!payload) return fallback;
  return payload?.message || payload?.error || payload?.data?.message || fallback;
};

const unwrapInterviewPayload = (payload) => payload?.data || payload?.interview || payload;

export const getInterviewsByApplication = async (applicationId) => {
  if (!applicationId) {
    throw new Error("Missing applicationId for interviews request");
  }

  const response = await apiFetch(
    `${BACKEND_URL}/interviews/application/${applicationId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getResponseError(payload, "Failed to get interviews"));
  }

  if (Array.isArray(payload)) return payload;

  throw new Error("Invalid interviews response");
};

export const getAllInterviews = async () => {
  const response = await apiFetch(`${BACKEND_URL}/interviews/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getResponseError(payload, "Failed to get interviews"));
  }

  if (Array.isArray(payload)) return payload;

  throw new Error("Invalid interviews response");
};

export const createInterview = async (interviewData) => {
  const response = await apiFetch(`${BACKEND_URL}/interviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(interviewData),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getResponseError(payload, "Failed to create interview"));
  }

  return unwrapInterviewPayload(payload);
};

export const updateInterview = async (interviewId, interviewData) => {
  if (!interviewId) {
    throw new Error("Missing interviewId for update interview request");
  }

  const response = await apiFetch(`${BACKEND_URL}/interviews/${interviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(interviewData),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getResponseError(payload, "Failed to update interview"));
  }

  return unwrapInterviewPayload(payload);
};

export const updateInterviewResult = async (interviewId, resultData) => {
  if (!interviewId) {
    throw new Error("Missing interviewId for update result request");
  }

  const response = await apiFetch(`${BACKEND_URL}/interviews/${interviewId}/result`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resultData),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getResponseError(payload, "Failed to update interview result"));
  }

  return unwrapInterviewPayload(payload);
};

export const cancelInterview = async (interviewId) => {
  if (!interviewId) {
    throw new Error("Missing interviewId for cancel interview request");
  }

  const response = await apiFetch(`${BACKEND_URL}/interviews/${interviewId}/cancel`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getResponseError(payload, "Failed to cancel interview"));
  }

  return unwrapInterviewPayload(payload);
};
