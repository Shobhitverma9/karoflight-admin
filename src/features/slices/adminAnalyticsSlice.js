import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_RENDER_API_BASE_URL;

// ==============================
// THUNK
// ==============================
export const fetchAdminAnalytics = createAsyncThunk(
  "adminAnalytics/fetch",
  async ({ range = "7days" }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/v1/admin/flights/analytics`,
        {
          params: { range },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load analytics"
      );
    }
  }
);

// ==============================
// SLICE
// ==============================
const adminAnalyticsSlice = createSlice({
  name: "adminAnalytics",
 initialState: {
  analytics: {
    analytics: {
      totalBookings: 0,
      completedBookings: 0,
      pendingBookings: 0,
      totalCancellations: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
      cancellationRate: 0,
    },
    chartData: {
      dailyBookings: [],
      revenueByService: [],
      topPerformers: [],
      cancellationReasons: [],
    },
    recentActivity: [],
  },
  customers: [],
  loading: false,
  error: null,
},

  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -------- FETCH --------
      .addCase(fetchAdminAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload.analytics;
        state.chartData = action.payload.chartData;
        state.recentActivity = action.payload.recentActivity;
      })
      .addCase(fetchAdminAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAnalyticsError } = adminAnalyticsSlice.actions;
export default adminAnalyticsSlice.reducer;
