import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getResponseError = (payload, fallback) => {
  if (!payload) return fallback;
  return payload?.message || payload?.error || payload?.data?.message || fallback;
};

const normalizeFollowupAlertSettings = (payload) => {
  const settings = payload;

  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    throw new Error("Invalid follow-up alert settings response");
  }

  return {
    followUpAlertsEnabled: Boolean(settings.followUpAlertsEnabled),
    followUpAlertDays: Number(settings.followUpAlertDays) || 0,
  };
};

export const getFollowupAlertSettings = async () => {
  const response = await apiFetch(`${BACKEND_URL}/settings/followup-alerts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getResponseError(payload, "Failed to load follow-up alert settings"),
    );
  }

  return normalizeFollowupAlertSettings(payload);
};

export const updateFollowupAlertSettings = async (settings) => {
  const response = await apiFetch(`${BACKEND_URL}/settings/followup-alerts`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getResponseError(payload, "Failed to update follow-up alert settings"),
    );
  }

  return normalizeFollowupAlertSettings(payload);
};
