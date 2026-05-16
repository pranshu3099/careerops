import { clearCsrfToken, getCsrfToken } from "@/lib/csrf";

let accessToken = null;
let currentUserId = null;
let currentUserName = null;
let currentUserEmail = null;
let refreshAccessTokenPromise = null;

const AUTH_REQUEST_TIMEOUT_MS = 8000;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;
export const clearAuthState = () => {
  accessToken = null;
  currentUserId = null;
  currentUserName = null;
  currentUserEmail = null;
};

export const setCurrentUserId = (userId) => {
  currentUserId = userId;
};
export const setCurrentUserName = (userName) => {
  currentUserName = userName;
};
export const setCurrentUserEmail = (userEmail) => {
  currentUserEmail = userEmail;
};
export const getCurrentUserId = () => currentUserId;
export const getCurrentUserName = () => currentUserName;
export const getCurrentUserEmail = () => currentUserEmail;

const extractUserInfo = (payload) => {
  const data = payload?.data || {};
  return {
    userId: data?.id || null,
    userName: data?.name || null,
    userEmail: data?.email || null,
  };
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = AUTH_REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const extractAccessToken = (payload) => payload?.accessToken;

const redirectToLoginIfProtected = () => {
  if (typeof window === "undefined") return;
  if (!window.location.pathname.startsWith("/dashboard")) return;

  const nextPath = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/login?next=${encodeURIComponent(nextPath)}`);
};

export const authFetch = async (url, options = {}, hasRetriedCsrf = false) => {
  const csrfToken = await getCsrfToken({
    forceRefresh: hasRetriedCsrf,
  });

  const response = await fetchWithTimeout(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      "x-csrf-token": csrfToken,
    },
  });

  if (response.status === 403 && !hasRetriedCsrf) {
    clearCsrfToken();
    return authFetch(url, options, true);
  }

  return response;
};

export const apiFetch = async (url, options = {}, hasRetried = false) => {
  const token = getAccessToken();

  const res = await fetchWithTimeout(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  // If access token expired
  if (res.status === 401 && !hasRetried) {
    const refreshed = await refreshAccessToken();

    if (!refreshed) {
      return res;
    }

    // retry original request
    return apiFetch(url, options, true);
  }

  return res;
};

export const refreshAccessToken = async () => {
  if (refreshAccessTokenPromise) {
    return refreshAccessTokenPromise;
  }

  refreshAccessTokenPromise = refreshAccessTokenRequest().finally(() => {
    refreshAccessTokenPromise = null;
  });

  return refreshAccessTokenPromise;
};

const refreshAccessTokenRequest = async () => {
  try {
    const res = await authFetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`,
      {
        method: "POST",
      },
    );

    if (!res.ok) {
      clearAuthState();
      redirectToLoginIfProtected();
      return false;
    }

    const data = await res.json().catch(() => null);
    const token = extractAccessToken(data);

    if (!token) {
      clearAuthState();
      redirectToLoginIfProtected();
      return false;
    }

    setAccessToken(token);
    return true;
  } catch (err) {
    clearAuthState();
    redirectToLoginIfProtected();
    return false;
  }
};

export const syncCurrentUser = async () => {
  if (!getAccessToken()) {
    clearAuthState();
    return null;
  }

  try {
    const res = await apiFetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!res?.ok) {
      clearAuthState();
      return null;
    }

    const payload = await res.json().catch(() => null);
    const { userId, userName, userEmail } = extractUserInfo(payload);
    setCurrentUserId(userId);
    setCurrentUserName(userName);
    setCurrentUserEmail(userEmail);
    return userId;
  } catch (err) {
    clearAuthState();
    return null;
  }
};
