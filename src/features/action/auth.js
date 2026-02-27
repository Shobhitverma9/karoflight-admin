import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/axiosInterceptor";

// Helper function to handle common API call patterns
const apiCall = async (method, url, payload = null, options = {}) => {
  const config = {
    method,
    url,
    ...options,
  };

  if (payload && (method === 'post' || method === 'put' || method === 'patch')) {
    config.data = payload;
  }

  const response = await api(config);
  return response.data;
};

// Helper to decode JWT token payload
const decodeTokenPayload = (token) => {
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

// Helper to store auth data
const storeAuthData = (data) => {
  if (data?.token) {
    const staffData = data.staff || data.user || data;
    
    localStorage.setItem("token", data.token);
    localStorage.setItem("userRole", staffData?.role);
    localStorage.setItem("userData", JSON.stringify(staffData));

    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("userRole", staffData?.role);
    sessionStorage.setItem("userData", JSON.stringify(staffData));

    const tokenPayload = decodeTokenPayload(data.token);
    if (tokenPayload) {
      sessionStorage.setItem("tokenPayload", JSON.stringify(tokenPayload));
      if (tokenPayload.role) {
        sessionStorage.setItem("userRole", tokenPayload.role);
      }
    }
    
    console.log("✅ Auth data stored:", { staffData, token: data.token.substring(0, 20) + "..." });
  }
};

// Helper to clear auth data
const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userData");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("userRole");
  sessionStorage.removeItem("userData");
  sessionStorage.removeItem("tokenPayload");
};

// Transform payload for staff creation/update
const transformStaffPayload = (payload, isUpdate = false) => {
  const nameParts = payload.name?.split(" ") || [payload.email?.split("@")[0]];
  const transformed = {
    first_name: nameParts[0],
    last_name: nameParts.slice(1).join(" ") || nameParts[0],
    username: payload.username || payload.email?.split("@")[0],
    email: payload.email,
    role: payload.roleType,
    is_active: payload.is_active ?? true,
  };

  if (isUpdate && payload.id) {
    transformed.staffId = payload.id;
  }

  if (payload.password && (!isUpdate || payload.password.trim() !== "")) {
    transformed.password = payload.password;
  }

  return transformed;
};

// 🔴 NEW: Get current logged-in user details
export const getCurrentUser = createAsyncThunk(
  "staff/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      // Get token from localStorage or sessionStorage
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Make API call to get current user details
      const data = await apiCall("get", "staff/me");
      
      // Update stored user data with fresh data from API
      if (data.staff) {
        localStorage.setItem("userData", JSON.stringify(data.staff));
        sessionStorage.setItem("userData", JSON.stringify(data.staff));
        if (data.staff.role) {
          localStorage.setItem("userRole", data.staff.role);
          sessionStorage.setItem("userRole", data.staff.role);
        }
      }
      
      console.log("✅ Current user data fetched:", data.staff);
      return data;
    } catch (error) {
      // If unauthorized, clear auth data
      if (error.response?.status === 401) {
        clearAuthData();
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch user details"
      );
    }
  }
);

// Login
export const logIn = createAsyncThunk(
  "staff/login",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await apiCall("post", "staff/login", payload);
      storeAuthData(data);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Login failed"
      );
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  "staff/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiCall("post", "staff/logout");
      clearAuthData();
      return { success: true };
    } catch (error) {
      clearAuthData();
      return rejectWithValue(
        error.response?.data?.message || error.message || "Logout failed"
      );
    }
  }
);

// Get All Staff
export const getAdminUsers = createAsyncThunk(
  "staff/getAll",
  async (_, { rejectWithValue }) => {
    try {
      return await apiCall("get", "staff/all");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch staff"
      );
    }
  }
);

// Create Staff User
export const createAdminUser = createAsyncThunk(
  "staff/create",
  async (payload, { rejectWithValue }) => {
    try {
      const transformedPayload = transformStaffPayload(payload, false);
      const data = await apiCall("post", "staff/create-update", transformedPayload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create staff"
      );
    }
  }
);

// Update Staff User
export const editAdminUser = createAsyncThunk(
  "staff/update",
  async (payload, { rejectWithValue }) => {
    try {
      const transformedPayload = transformStaffPayload(payload, true);
      const data = await apiCall("put", "staff/update-profile", transformedPayload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update staff"
      );
    }
  }
);

// Delete Staff User
export const deleteAdminUser = createAsyncThunk(
  "staff/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiCall("delete", `staff/${id}`);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete staff"
      );
    }
  }
);

// Toggle Staff Status
export const toggleStaffStatus = createAsyncThunk(
  "staff/toggleStatus",
  async ({ staffId, is_active }, { rejectWithValue }) => {
    try {
      const data = await apiCall("post", "staff/toggle-status", { staffId, is_active });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update status"
      );
    }
  }
);