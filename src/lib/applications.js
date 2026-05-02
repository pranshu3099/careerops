import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getResponseError = (payload, fallback) => {
  if (!payload) return fallback;
  return (
    payload?.message || payload?.error || payload?.data?.message || fallback
  );
};

export const createApplication = async (applicationData) => {
  const userId = applicationData?.userId;

  if (!userId) {
    throw new Error("Missing userId for create application request");
  }

  const response = await apiFetch(`${BACKEND_URL}/applications/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...applicationData,
      userId,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getResponseError(payload, "Failed to create application"));
  }

  if (!payload?.success) {
    throw new Error("Invalid create application response");
  }

  return {
    ...payload,
    data: {
      ...(payload?.data || {}),
    },
  };
};

export const getApplications = async () => {
  const response = await apiFetch(`${BACKEND_URL}/applications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getResponseError(result, "Failed to get applications"));
  }

  if (Array.isArray(result)) {
    return result;
  }

  throw new Error("Invalid applications response");
};

export const updateApplication = async (applicationId, applicationData) => {
  if (!applicationId) {
    throw new Error("Missing applicationId for update application request");
  }

  const response = await apiFetch(`${BACKEND_URL}/applications/update/${applicationId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(applicationData),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getResponseError(payload, "Failed to update application"));
  }

  if (payload?.success) {
    return payload;
  }

  throw new Error("Invalid update application response");
};

export const getCurrentUserFollowups = async () => {
  const response = await apiFetch(
    `${BACKEND_URL}/applications/upcoming-followups`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getResponseError(result, "Failed to get followups"));
  }

  if (Array.isArray(result)) {
    return result;
  }

  throw new Error("Invalid followups response");
};

export const updateApplicationStatus = async (applicationId, newStatus) => {
  const response = await apiFetch(
    `${BACKEND_URL}/applications/${applicationId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    },
  );
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(getResponseError(result, "Failed to delete application"));
  }

  if (result?.success && result?.data) {
    return result;
  }


  throw new Error("Invalid delete application response");
};


export const deleteApplication = async (applicationId) => {
  const response = await apiFetch(
    `${BACKEND_URL}/applications/delete/${applicationId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(getResponseError(result, "Failed to update status"));
  }

  if (result?.success) {
    return result;
  }


  throw new Error("Invalid status update response");
};
