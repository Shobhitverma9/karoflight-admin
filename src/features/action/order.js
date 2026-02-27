import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/axiosInterceptor';


//get all orders api
export const getAllOrders = createAsyncThunk(
  'getAllOrders',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.get(`/order`, payload, {
        withCredentials: true,
      });
      
      return response?.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);
