let accessToken = null;
let currentUserId = null;
let currentUserName = null;
let currentUserEmail = null;
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

export const apiFetch = async (url, options = {}) => {
  const token = getAccessToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  // If access token expired
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();

    if (!refreshed) {
      window.location.href = "/";
      return;
    }

    // retry original request
    return apiFetch(url, options);
  }

  return res;
};

export const refreshAccessToken = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
      },
    );

    if (!res.ok) return false;

    const data = await res.json();

    setAccessToken(data.accessToken);

    return true;
  } catch (err) {
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
