// campaignSlice.js - FIXED with proper deleteCampaign
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_RENDER_API_BASE_URL;

// Get auth token
const getAuthToken = () => {
  return sessionStorage.getItem("token") || sessionStorage.getItem("authToken");
};

// Create axios instance
const createAxiosInstance = () => {
  const token = getAuthToken();
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return instance;
};

// Create Campaign
export const createCampaign = createAsyncThunk(
  "campaigns/createCampaign",
  async (campaignData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authorization header missing. Please log in.");
      }

      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post("/campaigns", campaignData);
      console.log("Create Campaign Response:", response.data);
      return response.data.campaign || response.data;
    } catch (error) {
      console.error("Create Campaign Error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue(
          error.response.data.message || "Authentication failed"
        );
      }
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create campaign"
      );
    }
  }
);

// Get All Campaigns
export const getAllCampaigns = createAsyncThunk(
  "campaigns/getAllCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authorization header missing. Please log in.");
      }

      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get("/campaigns");
      console.log("Get All Campaigns Response:", response.data);

      // Return the data array directly
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Get All Campaigns Error:", error);
      if (error.response?.status === 401) {
        return rejectWithValue(
          "Authorization header missing. Please log in again."
        );
      }
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch campaigns"
      );
    }
  }
);

// Get Pending Campaigns (Super Admin)
export const getPendingCampaigns = createAsyncThunk(
  "campaigns/getPendingCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authorization header missing. Please log in.");
      }

      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get("/campaigns/pending");
      console.log("Get Pending Campaigns Response:", response.data);

      // Return the data array directly
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Get Pending Campaigns Error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue(
          error.response.data.message || "Authentication failed"
        );
      }
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch pending campaigns"
      );
    }
  }
);

// Get Campaign By ID
export const getCampaignById = createAsyncThunk(
  "campaigns/getCampaignById",
  async (campaignId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authorization header missing. Please log in.");
      }

      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return rejectWithValue("Campaign not found.");
      }
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch campaign"
      );
    }
  }
);

// Update Campaign
export const updateCampaign = createAsyncThunk(
  "campaigns/updateCampaign",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authorization header missing. Please log in.");
      }

      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put(`/campaigns/${id}`, updateData);
      return response.data.updated || response.data;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue(
          error.response.data.message || "Authentication failed"
        );
      }
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update campaign"
      );
    }
  }
);

// Submit for Approval
export const submitForApproval = createAsyncThunk(
  "campaigns/submitForApproval",
  async (campaignId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authorization header missing. Please log in.");
      }

      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post(
        `/campaigns/${campaignId}/submit`
      );
      return response.data.campaign || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit campaign"
      );
    }
  }
);

// Approve Campaign (Super Admin)
export const approveCampaign = createAsyncThunk(
  "campaigns/approveCampaign",
  async (campaignId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authorization header missing. Please log in.");
      }

      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post(
        `/campaigns/${campaignId}/approve`
      );
      return response.data.campaign || response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue(
          "You don't have permission to approve campaigns."
        );
      }
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to approve campaign"
      );
    }
  }
);

// Reject Campaign (Super Admin)
export const rejectCampaign = createAsyncThunk(
  "campaigns/rejectCampaign",
  async ({ campaignId, reason }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authorization header missing. Please log in.");
      }

      if (!reason || reason.trim() === "") {
        return rejectWithValue("Rejection reason is required");
      }

      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post(
        `/campaigns/${campaignId}/reject`,
        { reason }
      );
      return response.data.campaign || response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue(
          "You don't have permission to reject campaigns."
        );
      }
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to reject campaign"
      );
    }
  }
);

// Delete Campaign - FIXED VERSION
export const deleteCampaign = createAsyncThunk(
  "campaigns/delete",
  async (campaignId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.error("No token found");
        return rejectWithValue("Authorization header missing. Please log in.");
      }

      console.log("=== DELETE CAMPAIGN ACTION ===");
      console.log("Campaign ID:", campaignId);
      console.log("API Base URL:", API_BASE_URL);
      console.log("Token present:", !!token);
      
      // Use createAxiosInstance to get properly configured axios instance
      const axiosInstance = createAxiosInstance();
      
      const response = await axiosInstance.delete(`/campaigns/${campaignId}`);
      
      console.log("Delete API response:", response.data);
      
      return { 
        campaignId, 
        message: response.data.message || "Campaign deleted successfully" 
      };
    } catch (error) {
      console.error("=== DELETE CAMPAIGN ERROR ===");
      console.error("Error:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to delete campaign";
      
      return rejectWithValue(message);
    }
  }
);

// Send Campaign
export const sendCampaign = createAsyncThunk(
  "campaigns/sendCampaign",
  async (campaignId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authorization header missing. Please log in.");
      }

      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post(
        `/campaigns/${campaignId}/send`
      );

      return {
        _id: campaignId,
        status: "sent",
        stats: response.data.stats,
        message: response.data.message,
      };
    } catch (error) {
      if (error.response?.status === 400) {
        return rejectWithValue(
          error.response.data.message || "Campaign cannot be sent"
        );
      }
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to send campaign"
      );
    }
  }
);

// Initial state
const initialState = {
  campaigns: [],
  pendingCampaigns: [],
  currentCampaign: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  sending: false,
  approving: false,
  rejecting: false,
  submitting: false,
  error: null,
  success: false,
};

// Campaign slice
const campaignSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentCampaign: (state) => {
      state.currentCampaign = null;
    },
    resetCampaignState: (state) => {
      state.loading = false;
      state.creating = false;
      state.updating = false;
      state.deleting = false;
      state.sending = false;
      state.approving = false;
      state.rejecting = false;
      state.submitting = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Campaign
      .addCase(createCampaign.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.creating = false;
        state.success = true;
        state.campaigns.unshift(action.payload);
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // Get All Campaigns
      .addCase(getAllCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.campaigns = [];
      })

      // Get Pending Campaigns
      .addCase(getPendingCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingCampaigns = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(getPendingCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.pendingCampaigns = [];
      })

      // Get Campaign By ID
      .addCase(getCampaignById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCampaignById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCampaign = action.payload;
      })
      .addCase(getCampaignById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Campaign
      .addCase(updateCampaign.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        state.updating = false;
        state.success = true;
        const updatedCampaign = action.payload;

        const index = state.campaigns.findIndex(
          (c) => c._id === updatedCampaign._id
        );
        if (index !== -1) {
          state.campaigns[index] = updatedCampaign;
        }

        if (state.currentCampaign?._id === updatedCampaign._id) {
          state.currentCampaign = updatedCampaign;
        }
      })
      .addCase(updateCampaign.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      // Submit for Approval
      .addCase(submitForApproval.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitForApproval.fulfilled, (state, action) => {
        state.submitting = false;
        state.success = true;
        const updatedCampaign = action.payload;

        const index = state.campaigns.findIndex(
          (c) => c._id === updatedCampaign._id
        );
        if (index !== -1) {
          state.campaigns[index] = updatedCampaign;
        }

        if (state.currentCampaign?._id === updatedCampaign._id) {
          state.currentCampaign = updatedCampaign;
        }
      })
      .addCase(submitForApproval.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Approve Campaign
      .addCase(approveCampaign.pending, (state) => {
        state.approving = true;
        state.error = null;
        state.success = false;
      })
      .addCase(approveCampaign.fulfilled, (state, action) => {
        state.approving = false;
        state.success = true;
        const approvedCampaign = action.payload;

        // Remove from pending list
        state.pendingCampaigns = state.pendingCampaigns.filter(
          (c) => c._id !== approvedCampaign._id
        );

        // Update in campaigns list
        const index = state.campaigns.findIndex(
          (c) => c._id === approvedCampaign._id
        );
        if (index !== -1) {
          state.campaigns[index] = approvedCampaign;
        }

        if (state.currentCampaign?._id === approvedCampaign._id) {
          state.currentCampaign = approvedCampaign;
        }
      })
      .addCase(approveCampaign.rejected, (state, action) => {
        state.approving = false;
        state.error = action.payload;
      })

      // Reject Campaign
      .addCase(rejectCampaign.pending, (state) => {
        state.rejecting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(rejectCampaign.fulfilled, (state, action) => {
        state.rejecting = false;
        state.success = true;
        const rejectedCampaign = action.payload;

        // Remove from pending list
        state.pendingCampaigns = state.pendingCampaigns.filter(
          (c) => c._id !== rejectedCampaign._id
        );

        // Update in campaigns list
        const index = state.campaigns.findIndex(
          (c) => c._id === rejectedCampaign._id
        );
        if (index !== -1) {
          state.campaigns[index] = rejectedCampaign;
        }

        if (state.currentCampaign?._id === rejectedCampaign._id) {
          state.currentCampaign = rejectedCampaign;
        }
      })
      .addCase(rejectCampaign.rejected, (state, action) => {
        state.rejecting = false;
        state.error = action.payload;
      })

      // Delete Campaign - FIXED
      .addCase(deleteCampaign.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        console.log("Delete fulfilled, payload:", action.payload);
        state.deleting = false;
        state.success = true;
        
        // Filter out the deleted campaign using campaignId from payload
        const deletedId = action.payload.campaignId;
        state.campaigns = state.campaigns.filter((c) => c._id !== deletedId);
        state.pendingCampaigns = state.pendingCampaigns.filter((c) => c._id !== deletedId);

        if (state.currentCampaign?._id === deletedId) {
          state.currentCampaign = null;
        }
      })
      .addCase(deleteCampaign.rejected, (state, action) => {
        console.log("Delete rejected, payload:", action.payload);
        state.deleting = false;
        state.error = action.payload;
      })

      // Send Campaign
      .addCase(sendCampaign.pending, (state) => {
        state.sending = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendCampaign.fulfilled, (state, action) => {
        state.sending = false;
        state.success = true;
        const sentCampaign = action.payload;

        const index = state.campaigns.findIndex(
          (c) => c._id === sentCampaign._id
        );
        if (index !== -1) {
          state.campaigns[index] = {
            ...state.campaigns[index],
            status: sentCampaign.status,
            stats: sentCampaign.stats,
          };
        }

        if (state.currentCampaign?._id === sentCampaign._id) {
          state.currentCampaign = {
            ...state.currentCampaign,
            status: sentCampaign.status,
            stats: sentCampaign.stats,
          };
        }
      })
      .addCase(sendCampaign.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentCampaign,
  resetCampaignState,
} = campaignSlice.actions;

export default campaignSlice.reducer;