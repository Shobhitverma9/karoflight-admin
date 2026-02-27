// KFLIGHTupdated\kflight-frontend\Admin\src\features\action\pricingConfig.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/axiosInterceptor";
export const getAllPricingConfig = createAsyncThunk(
  "getPricingConfig",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get("/admin/pricing", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch pricing config"
      );
    }
  }
);

export const addPricingConfig = createAsyncThunk(
  "create/PricingConfig",
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.post(
        "/admin/pricing",
        payload,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create pricing config"
      );
    }
  }
);

export const updatePricingConfig = createAsyncThunk(
  "update/PricingConfig",
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { id, ...body } = payload;
      const { data } = await api.put(
        `/admin/pricing/${id}`,
        body,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update pricing config"
      );
    }
  }
);

export const deletePricingConfig = createAsyncThunk(
  "deletePricingConfig",
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { id, ...body } = payload;
      const { data } = await api.delete(
        `/admin/pricing/${id}`,
        {
          data: body,
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete pricing config"
      );
    }
  }
);
