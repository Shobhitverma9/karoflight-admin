import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_RENDER_API_BASE_URL;

// ==============================
// THUNKS
// ==============================

export const fetchDashboardAnalytics = createAsyncThunk(
  "dashboard/fetchAnalytics",
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
        err.response?.data?.message || "Failed to load dashboard analytics"
      );
    }
  }
);

export const fetchCustomers = createAsyncThunk(
  "dashboard/fetchCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/v1/admin/flights/customers`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load customers"
      );
    }
  }
);

// ==============================
// SLICE
// ==============================

const dashboardSlice = createSlice({
  name: "dashboard",
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
      bookingGrowth: 0,
      revenueGrowth: 0,
      cancellationGrowth: 0,
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
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -------- ANALYTICS --------
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // -------- CUSTOMERS --------
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
