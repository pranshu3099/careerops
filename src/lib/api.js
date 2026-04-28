let accessToken = null;
let currentUserId = null;
let currentUserName = null;
let currentUserEmail = null;

const AUTH_REQUEST_TIMEOUT_MS = 8000;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;
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

const extractAccessToken = (payload) => payload?.accessToken 

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
  try {
    const res = await fetchWithTimeout(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
      },
    );

    if (!res.ok) return false;

    const data = await res.json().catch(() => null);
    const token = extractAccessToken(data);

    if (!token) {
      setAccessToken(null);
      return false;
    }

    setAccessToken(token);
    return true;
  } catch (err) {
    setAccessToken(null);
    return false;
  }
};

export const syncCurrentUser = async () => {
  if (!getAccessToken()) {
    setCurrentUserId(null);
    setCurrentUserName(null);
    setCurrentUserEmail(null);
    return null;
  }

  try {
    const res = await apiFetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
      {
        method: "GET",
      },
    );

    if (!res?.ok) {
      setCurrentUserId(null);
      setCurrentUserName(null);
      setCurrentUserEmail(null);
      return null;
    }

    const payload = await res.json().catch(() => null);
    const { userId, userName, userEmail } = extractUserInfo(payload);
    setCurrentUserId(userId);
    setCurrentUserName(userName);
    setCurrentUserEmail(userEmail);
    return userId;
  } catch (err) {
    setCurrentUserId(null);
    setCurrentUserName(null);
    setCurrentUserEmail(null);
    return null;
  }
};
