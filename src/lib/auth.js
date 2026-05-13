import { authFetch, clearAuthState } from "@/lib/api";
import { clearCsrfToken } from "@/lib/csrf";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function hasRefreshToken(req) {
  const cookieHeader = req?.headers?.cookie || "";
  return cookieHeader
    .split(";")
    .some((cookie) => cookie.trim().startsWith("refreshToken="));
}

export const handleManualLogin = async ({ email, password }) => {
  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Login failed");
  }
  return data;
};

export const handleSignup = async ({ name, email, password }) => {
  const response = await fetch(`${BACKEND_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
      name,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "signup failed");
  }
  return data;
};

export const handleLogout = async () => {
  try {
    const response = await authFetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
    });

    if (response.ok) {
      clearAuthState();
      clearCsrfToken();
    }

    return response;
  } catch (err) {
    console.log(err);
  }
};
