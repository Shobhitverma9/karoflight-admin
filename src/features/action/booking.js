import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/axiosInterceptor";

export const getHotelBookings = createAsyncThunk(
  "getHotelBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `hotel-booking/?search=${_?.search}&page=${_?.page}&limit=${_?.limit}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response?.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const updateHotelBookingStatus = createAsyncThunk(
  "updateHotelBookingStatus",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.patch(`hotel-booking/status`, payload, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response?.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const getFlightBookings = createAsyncThunk(
  "getFlightBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`flight-booking`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response?.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);
