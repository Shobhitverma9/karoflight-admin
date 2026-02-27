/**
 * Utility functions to extract user data and role from sessionStorage/token
 */

// Decode JWT token payload (no signature verification)
export const decodeTokenPayload = (token) => {
  try {
    if (!token) return null;
    const b64 = token.split(".")[1] || "";
    const json = decodeURIComponent(
      atob(b64.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

// Get effective user from sessionStorage/localStorage (prefers Redux, then sessionStorage)
export const getEffectiveUser = (reduxUserData) => {
  // Prefer Redux user data if available
  if (reduxUserData && Object.keys(reduxUserData).length > 0) {
    return reduxUserData;
  }

  // Try sessionStorage (fresh after login)
  try {
    const sessionUser = sessionStorage.getItem("userData");
    if (sessionUser) {
      const parsed = JSON.parse(sessionUser);
      if (parsed && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  // Fallback to localStorage (persistent)
  try {
    const localUser = localStorage.getItem("userData");
    if (localUser) {
      const parsed = JSON.parse(localUser);
      if (parsed && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  return {};
};

// Get user role from multiple sources (prefers token payload role)
export const getUserRole = () => {
  // Try sessionStorage tokenPayload (extracted from JWT on login)
  try {
    const tokenPayload = sessionStorage.getItem("tokenPayload");
    if (tokenPayload) {
      const payload = JSON.parse(tokenPayload);
      if (payload.role) return payload.role;
    }
  } catch (e) {
    // ignore
  }

  // Try sessionStorage userRole
  const sessionRole = sessionStorage.getItem("userRole");
  if (sessionRole) return sessionRole;

  // Fallback to localStorage userRole
  const localRole = localStorage.getItem("userRole");
  if (localRole) return localRole;

  return "admin"; // default role
};

// Normalize role string (lowercase, handle variants)
export const normalizeRole = (role) => {
  if (!role) return "admin";
  return (role || "").toString().toLowerCase();
};
