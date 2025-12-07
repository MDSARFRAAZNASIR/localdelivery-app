export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/utils/jwt.js

// decode JWT payload safely
export function decodeToken(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // base64 decode
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (e) {
    console.error("Failed to decode token", e);
    return null;
  }
}

// check if token is expired
export function isTokenExpired(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true; // treat as expired if no exp

  const nowInSeconds = Date.now() / 1000;
  return payload.exp < nowInSeconds;
}
