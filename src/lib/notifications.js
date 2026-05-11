import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getResponseError = (payload, fallback) => {
  if (!payload) return fallback;
  return (
    payload?.message || payload?.error || payload?.data?.message || fallback
  );
};

const unwrapPayload = (payload) => {
  if (payload?.success === true && payload?.data !== undefined) {
    return payload.data;
  }

  if (payload?.data !== undefined && !Array.isArray(payload)) {
    return payload.data;
  }

  return payload;
};

const notificationRequest = async (path, options, fallbackError) => {
  const response = await apiFetch(`${BACKEND_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getResponseError(payload, fallbackError));
  }

  return unwrapPayload(payload);
};

export const getNotifications = async () => {
  const result = await notificationRequest(
    "/notifications",
    { method: "GET" },
    "Failed to load notifications",
  );

  return Array.isArray(result) ? result : [];
};

export const getUnreadNotificationCount = async () => {
  const result = await notificationRequest(
    "/notifications/unread-count",
    { method: "GET" },
    "Failed to load unread notification count",
  );

  return Number(result?.unread) || 0;
};

export const markNotificationRead = (notificationId) =>
  notificationRequest(
    `/notifications/${notificationId}/read`,
    { method: "PATCH" },
    "Failed to mark notification as read",
  );

export const markAllNotificationsRead = () =>
  notificationRequest(
    "/notifications/read-all",
    { method: "PATCH" },
    "Failed to mark notifications as read",
  );

export const deleteNotification = (notificationId) =>
  notificationRequest(
    `/notifications/${notificationId}`,
    { method: "DELETE" },
    "Failed to delete notification",
  );
