import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_RENDER_API_BASE_URL || "http://localhost:5000/api";

// Create SEO Page
export const createSeoPage = createAsyncThunk(
  "seo/createSeoPage",
  async (seoData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/seo`, seoData);
      console.log("Create Response:", response.data); // Debug log
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create SEO page"
      );
    }
  }
);

// Get All SEO Pages
export const getAllSeoPages = createAsyncThunk(
  "seo/getAllSeoPages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/seo`);
      console.log("Get All Response:", response.data); // Debug log
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch SEO pages"
      );
    }
  }
);

// Get SEO Page by Slug
export const getSeoPageBySlug = createAsyncThunk(
  "seo/getSeoPageBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/seo/${slug}`);
      console.log("Get By Slug Response:", response.data); // Debug log
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch SEO page"
      );
    }
  }
);

// Update SEO Page
export const updateSeoPage = createAsyncThunk(
  "seo/updateSeoPage",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/seo/${id}`, data);
      console.log("Update Response:", response.data); // Debug log
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update SEO page"
      );
    }
  }
);

// Publish SEO Page
export const publishSeoPage = createAsyncThunk(
  "seo/publishSeoPage",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/seo/${id}/publish`);
      console.log("Publish Response:", response.data); // Debug log
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to publish SEO page"
      );
    }
  }
);

// Delete SEO Page
export const deleteSeoPage = createAsyncThunk(
  "seo/deleteSeoPage",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/seo/${id}`);
      console.log("Delete Response:", response.data); // Debug log
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete SEO page"
      );
    }
  }
);

// Delete All SEO Pages
export const deleteAllSeoPages = createAsyncThunk(
  "seo/deleteAllSeoPages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/seo`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete all SEO pages"
      );
    }
  }
);

// Generate Sitemap
export const generateSitemap = createAsyncThunk(
  "seo/generateSitemap",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/seo/sitemap.xml`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate sitemap"
      );
    }
  }
);

const initialState = {
  seoPages: [],
  currentPage: null,
  sitemap: null,
  loading: false,
  error: null,
  success: false,
};

const seoSlice = createSlice({
  name: "seo",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentPage: (state) => {
      state.currentPage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create SEO Page
      .addCase(createSeoPage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSeoPage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Handle both response formats: {data: {...}} or direct object
        const newPage = action.payload.data || action.payload;
        state.seoPages.unshift(newPage);
      })
      .addCase(createSeoPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All SEO Pages
      .addCase(getAllSeoPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSeoPages.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both response formats: {data: [...]} or direct array
        const pages = action.payload.data || action.payload;
        state.seoPages = Array.isArray(pages) ? pages : [];
        console.log("Stored pages:", state.seoPages); // Debug log
      })
      .addCase(getAllSeoPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.seoPages = []; // Ensure it's always an array
      })

      // Get SEO Page by Slug
      .addCase(getSeoPageBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSeoPageBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPage = action.payload.data || action.payload;
      })
      .addCase(getSeoPageBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update SEO Page
      .addCase(updateSeoPage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSeoPage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updatedPage = action.payload.data || action.payload;
        state.currentPage = updatedPage;
        const index = state.seoPages.findIndex(
          (page) => page._id === updatedPage._id
        );
        if (index !== -1) {
          state.seoPages[index] = updatedPage;
        }
      })
      .addCase(updateSeoPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Publish SEO Page
      .addCase(publishSeoPage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(publishSeoPage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const publishedPage = action.payload.data || action.payload;
        state.currentPage = publishedPage;
        const index = state.seoPages.findIndex(
          (page) => page._id === publishedPage._id
        );
        if (index !== -1) {
          state.seoPages[index] = publishedPage;
        }
      })
      .addCase(publishSeoPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete SEO Page
      .addCase(deleteSeoPage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteSeoPage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const deletedPage = action.payload.data || action.payload;
        const deletedId = deletedPage._id || deletedPage.id;
        state.seoPages = state.seoPages.filter(
          (page) => page._id !== deletedId
        );
        if (state.currentPage?._id === deletedId) {
          state.currentPage = null;
        }
      })
      .addCase(deleteSeoPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete All SEO Pages
      .addCase(deleteAllSeoPages.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteAllSeoPages.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.seoPages = [];
        state.currentPage = null;
      })
      .addCase(deleteAllSeoPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generate Sitemap
      .addCase(generateSitemap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateSitemap.fulfilled, (state, action) => {
        state.loading = false;
        state.sitemap = action.payload;
      })
      .addCase(generateSitemap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearCurrentPage } = seoSlice.actions;
export default seoSlice.reducer;