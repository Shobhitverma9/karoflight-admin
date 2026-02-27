import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  getCurrentUser, // 🔴 NEW: Import the new action
  logIn,
  logout,
  editAdminUser,
  toggleStaffStatus,
} from "../action/auth";

// Initial state
const initialState = {
  isLoading: false,
  errorMessage: "",
  isUserLoggedIn: false,
  userData: {},
  adminsData: [],
  isDeleted: false,
};

// Toast configuration
const toastConfig = {
  position: "top-right",
};

// Helper function to handle common state updates
const handleAsyncAction = (builder, action, {
  pending,
  fulfilled,
  rejected,
  successMessage = null,
  errorMessage = "Operation failed"
}) => {
  builder
    .addCase(action.pending, (state) => {
      state.isLoading = true;
      state.errorMessage = "";
      if (pending) pending(state);
    })
    .addCase(action.fulfilled, (state, action) => {
      state.isLoading = false;
      state.errorMessage = "";
      if (fulfilled) fulfilled(state, action);
      if (successMessage) {
        toast.success(
          typeof successMessage === "function" ? successMessage(action.payload) : successMessage,
          toastConfig
        );
      }
    })
    .addCase(action.rejected, (state, action) => {
      state.isLoading = false;
      state.errorMessage = action.payload;
      if (rejected) rejected(state, action);
      toast.error(action.payload || errorMessage, toastConfig);
    });
};

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearReduxStore: () => initialState,
    setUserFromStorage: (state, action) => {
      state.isUserLoggedIn = true;
      state.userData = action.payload;
    },
    clearAuth: (state) => {
      state.isUserLoggedIn = false;
      state.userData = {};
      state.errorMessage = "";
    },
    clearError: (state) => {
      state.errorMessage = "";
    },
    // 🔴 NEW: Set user data directly
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 🔴 NEW: Get Current User
    handleAsyncAction(builder, getCurrentUser, {
      fulfilled: (state, action) => {
        const staffData = action.payload.staff || action.payload;
        state.userData = staffData;
        state.isUserLoggedIn = true;
        console.log("✅ Current user data updated in Redux:", staffData);
      },
      rejected: (state) => {
        state.isUserLoggedIn = false;
        state.userData = {};
      },
      errorMessage: "Failed to fetch user details"
    });

    // Login
    handleAsyncAction(builder, logIn, {
      pending: (state) => {
        state.isUserLoggedIn = false;
      },
      fulfilled: (state, action) => {
        state.isUserLoggedIn = true;
        const staffData = action.payload.staff || action.payload.user || action.payload;
        state.userData = staffData;
        console.log("✅ Redux userData set:", staffData);
      },
      rejected: (state) => {
        state.isUserLoggedIn = false;
        state.userData = {};
      },
      successMessage: "Login Successfully",
      errorMessage: "Login failed"
    });

    // Logout
    handleAsyncAction(builder, logout, {
      fulfilled: (state) => {
        state.isUserLoggedIn = false;
        state.userData = {};
      },
      successMessage: "Logout Successfully",
      errorMessage: "Logout failed"
    });

    // Get All Staff
    handleAsyncAction(builder, getAdminUsers, {
      fulfilled: (state, action) => {
        state.adminsData = action.payload.staff;
        state.isDeleted = false;
      },
      errorMessage: "Failed to fetch staff"
    });

    // Create Staff
    handleAsyncAction(builder, createAdminUser, {
      fulfilled: (state, action) => {
        if (action.payload.staff) {
          state.adminsData.push(action.payload.staff);
        }
      },
      successMessage: "Staff Created Successfully",
      errorMessage: "Failed to create staff"
    });

    // Update Staff
    handleAsyncAction(builder, editAdminUser, {
      fulfilled: (state, action) => {
        if (action.payload.staff) {
          const index = state.adminsData.findIndex(
            admin => admin._id === action.payload.staff._id
          );
          if (index !== -1) {
            state.adminsData[index] = action.payload.staff;
          }
        }
      },
      successMessage: "Staff Updated Successfully",
      errorMessage: "Failed to update staff"
    });

    // Delete Staff
    handleAsyncAction(builder, deleteAdminUser, {
      pending: (state) => {
        state.isDeleted = false;
      },
      fulfilled: (state) => {
        state.isDeleted = true;
      },
      rejected: (state) => {
        state.isDeleted = false;
      },
      successMessage: "Staff Deleted Successfully",
      errorMessage: "Failed to delete staff"
    });

    // Toggle Staff Status
    handleAsyncAction(builder, toggleStaffStatus, {
      fulfilled: (state, action) => {
        if (action.payload.staff) {
          const index = state.adminsData.findIndex(
            admin => admin._id === action.payload.staff._id
          );
          if (index !== -1) {
            state.adminsData[index] = action.payload.staff;
          }
        }
      },
      successMessage: (payload) => payload.message || "Status Updated Successfully",
      errorMessage: "Failed to update status"
    });
  },
});

export default authSlice.reducer;
export const { 
  clearReduxStore, 
  setUserFromStorage, 
  clearAuth, 
  clearError,
  setUserData // 🔴 NEW: Export the new action
} = authSlice.actions;