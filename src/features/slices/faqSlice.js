import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Proper API URL configuration with fallback
const getApiBaseUrl = () => {
  // Use VITE_RENDER_API_BASE_URL if available
  if (import.meta.env.VITE_RENDER_API_BASE_URL) {
    return import.meta.env.VITE_RENDER_API_BASE_URL;
  }
  
  // Fallback to environment-specific URLs
  const isProduction = import.meta.env.VITE_PRODUCTION === "true";
  if (isProduction) {
    return import.meta.env.VITE_REACT_APP_API_BASE_URL_PRODUCTION || "https://demo.com/api";
  } else {
    return import.meta.env.VITE_REACT_APP_API_BASE_URL_DEVELOPMENT || "http://localhost:8000/api/v1";
  }
};

const API_BASE_URL = `${getApiBaseUrl()}/faqs`;

// Fetch all FAQ documents with optional filtering
export const fetchAllFAQs = createAsyncThunk(
  "faq/fetchAllFAQs",
  async ({ pageSlug, status } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (pageSlug) params.append('pageSlug', pageSlug);
      if (status) params.append('status', status);
      
      const queryString = params.toString();
      const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
      
      console.log('Fetching FAQs from:', url); // Debug log
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        return json.data;
      } else {
        return rejectWithValue(json.message || "Invalid response format");
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error); // Debug log
      return rejectWithValue(error.message || "Failed to fetch FAQs");
    }
  }
);

// Get FAQ by page slug (frontend-friendly)
export const fetchFAQByPageSlug = createAsyncThunk(
  "faq/fetchFAQByPageSlug",
  async (slug, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/page/${slug}`;
      console.log('Fetching FAQ by slug from:', url); // Debug log
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();

      if (json.success) {
        return json.data;
      } else {
        return rejectWithValue(json.message || "No FAQs found for this page");
      }
    } catch (error) {
      console.error('Error fetching FAQ by slug:', error); // Debug log
      return rejectWithValue(error.message || "Failed to fetch FAQ");
    }
  }
);

// Get single FAQ document by ID
export const fetchFAQById = createAsyncThunk(
  "faq/fetchFAQById",
  async (id, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/${id}`;
      console.log('Fetching FAQ by ID from:', url); // Debug log
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();

      if (json.success) {
        return json.data;
      } else {
        return rejectWithValue(json.message || "FAQ not found");
      }
    } catch (error) {
      console.error('Error fetching FAQ by ID:', error); // Debug log
      return rejectWithValue(error.message || "Failed to fetch FAQ");
    }
  }
);

// Create new FAQ document
export const createNewFAQ = createAsyncThunk(
  "faq/createFAQ",
  async (faqData, { rejectWithValue }) => {
    try {
      console.log('Creating FAQ at:', API_BASE_URL); // Debug log
      
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();

      if (json.success) {
        return json.data;
      } else {
        return rejectWithValue(json.message || "Failed to create FAQ");
      }
    } catch (error) {
      console.error('Error creating FAQ:', error); // Debug log
      return rejectWithValue(error.message || "Failed to create FAQ");
    }
  }
);

// Update entire FAQ document
export const updateFAQ = createAsyncThunk(
  "faq/updateFAQ",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/${id}`;
      console.log('Updating FAQ at:', url); // Debug log
      
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();

      if (json.success) {
        return json.data;
      } else {
        return rejectWithValue(json.message || "Failed to update FAQ");
      }
    } catch (error) {
      console.error('Error updating FAQ:', error); // Debug log
      return rejectWithValue(error.message || "Failed to update FAQ");
    }
  }
);

// Delete FAQ document (soft delete)
export const deleteFAQ = createAsyncThunk(
  "faq/deleteFAQ",
  async (id, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/${id}`;
      console.log('Deleting FAQ at:', url); // Debug log
      
      const response = await fetch(url, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();

      if (json.success) {
        return { id, message: json.message };
      } else {
        return rejectWithValue(json.message || "Failed to delete FAQ");
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error); // Debug log
      return rejectWithValue(error.message || "Failed to delete FAQ");
    }
  }
);

// Update FAQ document status (draft/published)
export const updateFAQStatus = createAsyncThunk(
  "faq/updateFAQStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/${id}/status`;
      console.log('Updating FAQ status at:', url); // Debug log
      
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();

      if (json.success) {
        return json.data;
      } else {
        return rejectWithValue(json.message || "Failed to update FAQ status");
      }
    } catch (error) {
      console.error('Error updating FAQ status:', error); // Debug log
      return rejectWithValue(error.message || "Failed to update status");
    }
  }
);

// Add FAQ item to a document
export const addFAQItem = createAsyncThunk(
  "faq/addFAQItem",
  async ({ faqId, question, answer, order }, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/${faqId}/items`;
      console.log('Adding FAQ item at:', url); // Debug log
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, order }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();

      if (json.success) {
        return { faqId, item: json.data };
      } else {
        return rejectWithValue(json.message || "Failed to add FAQ item");
      }
    } catch (error) {
      console.error('Error adding FAQ item:', error); // Debug log
      return rejectWithValue(error.message || "Failed to add FAQ item");
    }
  }
);

// Update FAQ item
export const updateFAQItem = createAsyncThunk(
  "faq/updateFAQItem",
  async ({ faqId, itemId, updates }, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/${faqId}/items/${itemId}`;
      console.log('Updating FAQ item at:', url); // Debug log
      
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();

      if (json.success) {
        return { faqId, itemId, item: json.data };
      } else {
        return rejectWithValue(json.message || "Failed to update FAQ item");
      }
    } catch (error) {
      console.error('Error updating FAQ item:', error); // Debug log
      return rejectWithValue(error.message || "Failed to update FAQ item");
    }
  }
);

// Delete FAQ item
export const deleteFAQItem = createAsyncThunk(
  "faq/deleteFAQItem",
  async ({ faqId, itemId }, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/${faqId}/items/${itemId}`;
      console.log('Deleting FAQ item at:', url); // Debug log
      
      const response = await fetch(url, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();

      if (json.success) {
        return { faqId, itemId, message: json.message };
      } else {
        return rejectWithValue(json.message || "Failed to delete FAQ item");
      }
    } catch (error) {
      console.error('Error deleting FAQ item:', error); // Debug log
      return rejectWithValue(error.message || "Failed to delete FAQ item");
    }
  }
);

// Toggle FAQ item visibility (hide/show)
export const toggleFAQItemVisibility = createAsyncThunk(
  "faq/toggleFAQItemVisibility",
  async ({ faqId, itemId, is_hidden }, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/${faqId}/items/${itemId}/visibility`;
      console.log('Toggling FAQ item visibility at:', url); // Debug log
      
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_hidden }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();

      if (json.success) {
        return { faqId, itemId, item: json.data };
      } else {
        return rejectWithValue(json.message || "Failed to toggle FAQ item visibility");
      }
    } catch (error) {
      console.error('Error toggling FAQ item visibility:', error); // Debug log
      return rejectWithValue(error.message || "Failed to toggle visibility");
    }
  }
);

// Rest of the slice remains the same...
const faqSlice = createSlice({
  name: "faq",
  initialState: {
    faqs: [],
    currentFAQ: null, // For single FAQ view
    pageFAQ: null, // For page-specific FAQ
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFAQ: (state) => {
      state.currentFAQ = null;
    },
    clearPageFAQ: (state) => {
      state.pageFAQ = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All FAQ Documents
      .addCase(fetchAllFAQs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFAQs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload || [];
      })
      .addCase(fetchAllFAQs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch FAQs";
        state.faqs = [];
      })

      // Fetch FAQ by Page Slug
      .addCase(fetchFAQByPageSlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFAQByPageSlug.fulfilled, (state, action) => {
        state.loading = false;
        state.pageFAQ = action.payload;
      })
      .addCase(fetchFAQByPageSlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch FAQ";
        state.pageFAQ = null;
      })

      // Fetch Single FAQ by ID
      .addCase(fetchFAQById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFAQById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFAQ = action.payload;
      })
      .addCase(fetchFAQById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch FAQ";
        state.currentFAQ = null;
      })

      // Create New FAQ Document
      .addCase(createNewFAQ.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createNewFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload) {
          state.faqs.unshift(action.payload);
        }
      })
      .addCase(createNewFAQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create FAQ";
      })

      // Update FAQ Document
      .addCase(updateFAQ.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload) {
          // Update in faqs array
          const index = state.faqs.findIndex((f) => f._id === action.payload._id);
          if (index !== -1) {
            state.faqs[index] = action.payload;
          }
          // Update currentFAQ if it's the one being edited
          if (state.currentFAQ && state.currentFAQ._id === action.payload._id) {
            state.currentFAQ = action.payload;
          }
        }
      })
      .addCase(updateFAQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update FAQ";
      })

      // Delete FAQ Document
      .addCase(deleteFAQ.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = state.faqs.filter((faq) => faq._id !== action.payload.id);
        state.success = true;
        // Clear currentFAQ if it was deleted
        if (state.currentFAQ && state.currentFAQ._id === action.payload.id) {
          state.currentFAQ = null;
        }
      })
      .addCase(deleteFAQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete FAQ";
      })

      // Update FAQ Document Status
      .addCase(updateFAQStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFAQStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.faqs.findIndex((f) => f._id === action.payload._id);
          if (index !== -1) {
            state.faqs[index] = action.payload;
          }
          // Update currentFAQ if it's the one being updated
          if (state.currentFAQ && state.currentFAQ._id === action.payload._id) {
            state.currentFAQ = action.payload;
          }
        }
        state.success = true;
      })
      .addCase(updateFAQStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update status";
      })

      // Add FAQ Item
      .addCase(addFAQItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(addFAQItem.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const { faqId, item } = action.payload;
          const faq = state.faqs.find((f) => f._id === faqId);
          if (faq && item) {
            if (!Array.isArray(faq.faqs)) {
              faq.faqs = [];
            }
            faq.faqs.push(item);
          }
          // Update currentFAQ if it's the one being modified
          if (state.currentFAQ && state.currentFAQ._id === faqId && item) {
            if (!Array.isArray(state.currentFAQ.faqs)) {
              state.currentFAQ.faqs = [];
            }
            state.currentFAQ.faqs.push(item);
          }
        }
        state.success = true;
      })
      .addCase(addFAQItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add FAQ item";
      })

      // Update FAQ Item
      .addCase(updateFAQItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFAQItem.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const { faqId, itemId, item } = action.payload;
          const faq = state.faqs.find((f) => f._id === faqId);
          if (faq && Array.isArray(faq.faqs)) {
            const itemIndex = faq.faqs.findIndex((i) => i._id === itemId);
            if (itemIndex !== -1 && item) {
              faq.faqs[itemIndex] = item;
            }
          }
          // Update currentFAQ if it's the one being modified
          if (state.currentFAQ && state.currentFAQ._id === faqId && Array.isArray(state.currentFAQ.faqs)) {
            const itemIndex = state.currentFAQ.faqs.findIndex((i) => i._id === itemId);
            if (itemIndex !== -1 && item) {
              state.currentFAQ.faqs[itemIndex] = item;
            }
          }
        }
        state.success = true;
      })
      .addCase(updateFAQItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update FAQ item";
      })

      // Delete FAQ Item
      .addCase(deleteFAQItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFAQItem.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const { faqId, itemId } = action.payload;
          const faq = state.faqs.find((f) => f._id === faqId);
          if (faq && Array.isArray(faq.faqs)) {
            faq.faqs = faq.faqs.filter((i) => i._id !== itemId);
          }
          // Update currentFAQ if it's the one being modified
          if (state.currentFAQ && state.currentFAQ._id === faqId && Array.isArray(state.currentFAQ.faqs)) {
            state.currentFAQ.faqs = state.currentFAQ.faqs.filter((i) => i._id !== itemId);
          }
        }
        state.success = true;
      })
      .addCase(deleteFAQItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete FAQ item";
      })

      // Toggle FAQ Item Visibility
      .addCase(toggleFAQItemVisibility.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleFAQItemVisibility.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const { faqId, itemId, item } = action.payload;
          const faq = state.faqs.find((f) => f._id === faqId);
          if (faq && Array.isArray(faq.faqs)) {
            const faqItem = faq.faqs.find((i) => i._id === itemId);
            if (faqItem && item) {
              faqItem.is_hidden = item.is_hidden;
            }
          }
          // Update currentFAQ if it's the one being modified
          if (state.currentFAQ && state.currentFAQ._id === faqId && Array.isArray(state.currentFAQ.faqs)) {
            const faqItem = state.currentFAQ.faqs.find((i) => i._id === itemId);
            if (faqItem && item) {
              faqItem.is_hidden = item.is_hidden;
            }
          }
        }
        state.success = true;
      })
      .addCase(toggleFAQItemVisibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to toggle FAQ item visibility";
      });
  },
});

export const { 
  clearSuccess, 
  clearError, 
  clearCurrentFAQ, 
  clearPageFAQ 
} = faqSlice.actions;
export default faqSlice.reducer;