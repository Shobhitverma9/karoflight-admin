import { createSlice } from "@reduxjs/toolkit";
import {
  getFlightBookings,
  getHotelBookings,
  updateHotelBookingStatus,
} from "../action/booking";

const initialState = {
  isLoading: false,
  errorMessage: "",
  isUpdated: false,
  flightData: [],
  hotelData: [],
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(getHotelBookings.pending, (state, action) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(getHotelBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isUpdated = false;
        state.errorMessage = "";
        state.hotelData = action.payload;
      })
      .addCase(getHotelBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload;
      })
      .addCase(updateHotelBookingStatus.pending, (state, action) => {
        state.isLoading = true;
        state.isUpdated = false;
        state.errorMessage = "";
      })
      .addCase(updateHotelBookingStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isUpdated = true;
        state.errorMessage = "";
      })
      .addCase(updateHotelBookingStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isUpdated = false;
        state.errorMessage = action.payload;
        toast.error(state?.errorMessage, {
          position: "top-right",
        });
      })
      .addCase(getFlightBookings.pending, (state, action) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(getFlightBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.errorMessage = "";
        state.flightData = action.payload.data;
      })
      .addCase(getFlightBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload;
      });
  },
});

export default bookingSlice.reducer;
export const {} = bookingSlice.actions;
