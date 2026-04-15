export function hasRefreshToken(req) {
  const cookieHeader = req?.headers?.cookie || "";
  return cookieHeader
    .split(";")
    .some((cookie) => cookie.trim().startsWith("refreshToken="));
}

export const handleManualLogin = async ({ email, password }) => {
  const response = await fetch("http://localhost:3000/auth/login", {
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
  const response = await fetch("http://localhost:3000/auth/register", {
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
    const response = await fetch("http://localhost:3000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    return response;
  } catch (err) {
    console.log(err);
  }
};
