const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://rithu-bl-web-side.vercel.app/api";

export const signup = async (data) => {
  const res = await fetch(`${API_URL}/users/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const login = async (data) => {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const getProfile = async (token) => {
  const res = await fetch(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};
