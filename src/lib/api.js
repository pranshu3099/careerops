let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

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
      }
    );

    if (!res.ok) return false;

    const data = await res.json();

    setAccessToken(data.accessToken);

    return true;
  } catch (err) {
    return false;
  }
};