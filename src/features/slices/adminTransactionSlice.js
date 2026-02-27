import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_RENDER_API_BASE_URL;

// ==============================
// 🔐 Helper: Get Auth Header
// ==============================
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token"); // ✅ CORRECT KEY

  if (!token) {
    throw new Error("Authentication token missing");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

// ==============================
// 🚀 THUNKS
// ==============================

// 🔹 Fetch all admin transactions
export const fetchAdminTransactions = createAsyncThunk(
  "adminTransactions/fetch",
  async ({ status = "all", search = "" }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/v1/admin/flights/transactions`,
        {
          params: { status, search },
          headers: getAuthHeaders(),
        }
      );

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.message ||
        "Failed to load transactions"
      );
    }
  }
);

// 🔹 Refund a transaction
export const refundAdminTransaction = createAsyncThunk(
  "adminTransactions/refund",
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      await axios.post(
        `${API_URL}/api/v1/admin/refund/${bookingId}`,
        { reason },
        {
          headers: getAuthHeaders(),
        }
      );

      return { bookingId };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Refund failed"
      );
    }
  }
);

// 🔹 Admin force-cancel a booking via TripJack
export const cancelAdminBooking = createAsyncThunk(
  "adminTransactions/cancel",
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/v1/admin/flights/cancel-booking/${bookingId}`,
        { reason },
        { headers: getAuthHeaders() }
      );
      return { bookingId, message: res.data.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Cancellation failed"
      );
    }
  }
);

// ==============================
// 🧠 SLICE
// ==============================

const adminTransactionSlice = createSlice({
  name: "adminTransactions",
  initialState: {
    transactions: [],
    loading: false,
    refundLoading: false,
    cancelLoading: false,
    error: null,
  },
  reducers: {
    clearAdminTransactionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -------- FETCH TRANSACTIONS --------
      .addCase(fetchAdminTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchAdminTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // -------- REFUND TRANSACTION --------
      .addCase(refundAdminTransaction.pending, (state) => {
        state.refundLoading = true;
      })
      .addCase(refundAdminTransaction.fulfilled, (state, action) => {
        state.refundLoading = false;

        // ✅ Optimistic update
        state.transactions = state.transactions.map((txn) =>
          txn.bookingId === action.payload.bookingId
            ? { ...txn, paymentStatus: "Refunded" }
            : txn
        );
      })
      .addCase(refundAdminTransaction.rejected, (state, action) => {
        state.refundLoading = false;
        state.error = action.payload;
      })

      // -------- CANCEL BOOKING --------
      .addCase(cancelAdminBooking.pending, (state) => {
        state.cancelLoading = true;
        state.error = null;
      })
      .addCase(cancelAdminBooking.fulfilled, (state, action) => {
        state.cancelLoading = false;
        // Optimistic update: mark as Refund_PENDING
        state.transactions = state.transactions.map((txn) =>
          txn.bookingId === action.payload.bookingId
            ? { ...txn, paymentStatus: "Refund_PENDING" }
            : txn
        );
      })
      .addCase(cancelAdminBooking.rejected, (state, action) => {
        state.cancelLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminTransactionError } =
  adminTransactionSlice.actions;

export default adminTransactionSlice.reducer;
