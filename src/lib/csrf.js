const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

let csrfToken = null;
let csrfTokenPromise = null;

export const clearCsrfToken = () => {
  csrfToken = null;
  csrfTokenPromise = null;
};

export const getCsrfToken = async ({ forceRefresh = false } = {}) => {
  if (csrfToken && !forceRefresh) {
    return csrfToken;
  }

  if (csrfTokenPromise && !forceRefresh) {
    return csrfTokenPromise;
  }

  csrfTokenPromise = await fetch(`${BACKEND_URL}/auth/csrf`, {
    method: "GET",
    credentials: "include",
  })
    .then(async (response) => {
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.csrfToken) {
        throw new Error("Failed to get CSRF token");
      }

      csrfToken = payload.csrfToken;
      return csrfToken;
    })
    .finally(() => {
      csrfTokenPromise = null;
    });

  return csrfTokenPromise;
};
