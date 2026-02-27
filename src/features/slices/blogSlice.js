// src/features/slices/blogSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_RENDER_API_BASE_URL;

// Helper: Get auth token
const getAuthToken = () => {
  return sessionStorage.getItem("token") || sessionStorage.getItem("authToken");
};

// ============================================
// BLOG ASYNC THUNKS
// ============================================

// === Fetch all blogs (Public) ===
export const fetchBlogs = createAsyncThunk(
  "blogs/fetchBlogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.tag) queryParams.append('tag', params.tag);
      if (params.category) queryParams.append('category', params.category);
      if (params.author_id) queryParams.append('author_id', params.author_id);
      if (params.search) queryParams.append('search', params.search);

      const url = `${API_BASE_URL}/blogs/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to fetch blogs" }));
        throw new Error(errorData.message || "Failed to fetch blogs");
      }
      
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      console.error("Fetch blogs error:", err);
      return rejectWithValue(err.message);
    }
  }
);

// === Fetch single blog by ID or slug (Public) ===
export const fetchBlogById = createAsyncThunk(
  "blogs/fetchBlogById",
  async (slugOrId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/one/${slugOrId}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch blog");
      }
      
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// === Create blog (SEO or SuperAdmin) ===
export const createBlog = createAsyncThunk(
  "blogs/createBlog",
  async ({ formData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authorization token missing. Please log in again.");
      }

      let payload;
      let headers = {
        Authorization: `Bearer ${token}`,
      };

      if (formData instanceof FormData) {
        payload = formData;
      } else {
        payload = JSON.stringify(formData);
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(`${API_BASE_URL}/blogs/create`, {
        method: "POST",
        headers,
        body: payload,
      });

      const responseData = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized: Please log in again.");
        }
        if (res.status === 403) {
          throw new Error("Forbidden: You don't have permission to create blogs.");
        }
        throw new Error(
          responseData?.message || responseData?.error || "Failed to create blog"
        );
      }

      const createdBlog = responseData.data;
      if (!createdBlog || !createdBlog._id) {
        throw new Error("Invalid response: No blog data returned");
      }

      return createdBlog;
    } catch (err) {
      console.error("Create blog error:", err);
      return rejectWithValue(err.message);
    }
  }
);

// === Update blog (SEO or SuperAdmin) ===
export const updateBlog = createAsyncThunk(
  "blogs/updateBlog",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authorization token missing. Please log in again.");
      }

      const isFormData = formData instanceof FormData;
      const headers = {};

      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }
      headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/blogs/update/${id}`, {
        method: "PUT",
        headers: headers,
        body: isFormData ? formData : JSON.stringify(formData),
      });

      const responseData = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized: Please log in again.");
        }
        if (res.status === 403) {
          throw new Error("Forbidden: You don't have permission to update blogs.");
        }
        throw new Error(
          responseData?.message || responseData?.error || `Failed to update blog (${res.status})`
        );
      }

      const updatedBlog = responseData.data;
      if (!updatedBlog || !updatedBlog._id) {
        throw new Error("Invalid response: Missing updated blog data");
      }

      return updatedBlog;
    } catch (err) {
      console.error("Update blog error:", err);
      return rejectWithValue(err.message);
    }
  }
);

// === Delete blog (SEO or SuperAdmin) ===
export const deleteBlog = createAsyncThunk(
  "blogs/deleteBlog",
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authorization token missing. Please log in again.");
      }

      const res = await fetch(`${API_BASE_URL}/blogs/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized: Please log in again.");
        }
        if (res.status === 403) {
          throw new Error("Forbidden: You don't have permission to delete blogs.");
        }
        const responseData = await res.json().catch(() => null);
        throw new Error(
          responseData?.message || responseData?.error || "Failed to delete blog"
        );
      }
      return id;
    } catch (err) {
      console.error("Delete blog error:", err);
      return rejectWithValue(err.message);
    }
  }
);

// === Approve or Reject blog (SuperAdmin only) ===
export const approveOrRejectBlog = createAsyncThunk(
  "blogs/approveOrRejectBlog",
  async ({ id, action, reason }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authorization token missing. Please log in again.");
      }

      const body = { action };
      if (action === 'reject' && reason) {
        body.reason = reason;
      }

      const res = await fetch(`${API_BASE_URL}/blogs/approve-reject/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const responseData = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized: Please log in again.");
        }
        if (res.status === 403) {
          throw new Error("Forbidden: Only SuperAdmin can approve/reject blogs.");
        }
        throw new Error(
          responseData?.message || responseData?.error || "Failed to process blog approval"
        );
      }

      return responseData.data;
    } catch (err) {
      console.error("Approve/Reject blog error:", err);
      return rejectWithValue(err.message);
    }
  }
);

// === Get blog analytics (SuperAdmin only) ===
export const getBlogAnalytics = createAsyncThunk(
  "blogs/getBlogAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authorization token missing. Please log in again.");
      }

      const res = await fetch(`${API_BASE_URL}/blogs/analytics/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized: Please log in again.");
        }
        if (res.status === 403) {
          throw new Error("Forbidden: Only SuperAdmin can view analytics.");
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch analytics");
      }

      const data = await res.json();
      return data.data;
    } catch (err) {
      console.error("Fetch analytics error:", err);
      return rejectWithValue(err.message);
    }
  }
);

// ============================================
// COMMENT ASYNC THUNKS
// ============================================

// === Add Comment (Public) ===
export const addComment = createAsyncThunk(
  "blogs/addComment",
  async ({ blogId, authorName, authorEmail, text, sectionId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ authorName, authorEmail, text, sectionId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to add comment",
        }));
        throw new Error(errorData.message || "Failed to add comment");
      }

      const data = await response.json();
      return { blogId, comment: data.data };
    } catch (error) {
      console.error("Add comment error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// === Fetch Comments for a Blog (Admin) ===
export const fetchComments = createAsyncThunk(
  "blogs/fetchComments",
  async (blogId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authorization token missing. Please log in again.");
      }

      const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Please log in again.");
        }
        const errorData = await response.json().catch(() => ({
          message: "Failed to fetch comments",
        }));
        throw new Error(errorData.message || "Failed to fetch comments");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Fetch comments error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// === Moderate Comment (Admin: Approve/Reject) ===
export const moderateComment = createAsyncThunk(
  "blogs/moderateComment",
  async ({ blogId, commentId, action, moderator_id }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authorization token missing. Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/blogs/${blogId}/comments/${commentId}/moderate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action, moderator_id }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Please log in again.");
        }
        if (response.status === 403) {
          throw new Error("Forbidden: Only SuperAdmin can moderate comments.");
        }
        const errorData = await response.json().catch(() => ({
          message: "Failed to moderate comment",
        }));
        throw new Error(errorData.message || "Failed to moderate comment");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Moderate comment error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// BLOG SLICE
// ============================================

const blogSlice = createSlice({
  name: "blogs",
  initialState: {
    // Blog states
    items: [],
    selectedBlog: null,
    loading: false,
    error: null,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    fetchBlogLoading: false,
    approveLoading: false,

    // Analytics
    analytics: null,
    analyticsLoading: false,

    // Comment states
    comments: [],
    commentsLoading: false,
    moderating: false,
    commentError: null,
    commentSuccess: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.commentError = null;
    },
    clearCommentSuccess: (state) => {
      state.commentSuccess = null;
    },
    resetCreateState: (state) => {
      state.createLoading = false;
      state.error = null;
    },
    clearSelectedBlog: (state) => {
      state.selectedBlog = null;
      state.fetchBlogLoading = false;
    },
    resetComments: (state) => {
      state.comments = [];
      state.commentsLoading = false;
      state.moderating = false;
      state.commentError = null;
      state.commentSuccess = null;
    },
    resetModeratingState: (state) => {
      state.moderating = false;
    },
    updateCommentStatusLocally: (state, action) => {
      const { commentId, status } = action.payload;
      const comment = state.comments.find((c) => c._id === commentId);
      if (comment) {
        comment.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================
      // BLOG REDUCERS
      // ============================================

      // Fetch all blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single blog
      .addCase(fetchBlogById.pending, (state) => {
        state.fetchBlogLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.fetchBlogLoading = false;
        state.selectedBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.fetchBlogLoading = false;
        state.error = action.payload;
      })

      // Create blog
      .addCase(createBlog.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.createLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Update blog
      .addCase(updateBlog.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updated = action.payload;
        const index = state.items.findIndex((b) => b._id === updated._id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updated };
        }
        if (state.selectedBlog && state.selectedBlog._id === updated._id) {
          state.selectedBlog = { ...state.selectedBlog, ...updated };
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Delete blog
      .addCase(deleteBlog.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.error = null;
        state.items = state.items.filter((b) => b._id !== action.payload);
        if (state.selectedBlog && state.selectedBlog._id === action.payload) {
          state.selectedBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })

      // Approve or Reject blog
      .addCase(approveOrRejectBlog.pending, (state) => {
        state.approveLoading = true;
        state.error = null;
      })
      .addCase(approveOrRejectBlog.fulfilled, (state, action) => {
        state.approveLoading = false;
        const updated = action.payload;
        const index = state.items.findIndex((b) => b._id === updated._id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updated };
        }
        if (state.selectedBlog && state.selectedBlog._id === updated._id) {
          state.selectedBlog = { ...state.selectedBlog, ...updated };
        }
      })
      .addCase(approveOrRejectBlog.rejected, (state, action) => {
        state.approveLoading = false;
        state.error = action.payload;
      })

      // Get blog analytics
      .addCase(getBlogAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(getBlogAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(getBlogAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      })

      // ============================================
      // COMMENT REDUCERS
      // ============================================

      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.commentError = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.commentSuccess = "Comment submitted and pending moderation";
        // Optionally add to comments array if needed
        if (action.payload.comment) {
          state.comments.push(action.payload.comment);
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.commentError = action.payload || "Failed to add comment";
      })

      // Fetch Comments
      .addCase(fetchComments.pending, (state) => {
        state.commentsLoading = true;
        state.commentError = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentError = action.payload || "Failed to fetch comments";
      })

      // Moderate Comment (Approve/Reject)
      .addCase(moderateComment.pending, (state) => {
        state.moderating = true;
        state.commentError = null;
        state.commentSuccess = null;
      })
      .addCase(moderateComment.fulfilled, (state, action) => {
        state.moderating = false;
        state.commentSuccess = "Comment moderated successfully";

        const updatedComment = action.payload;
        if (updatedComment && updatedComment._id) {
          const index = state.comments.findIndex(
            (c) => c._id === updatedComment._id
          );
          if (index !== -1) {
            state.comments[index] = updatedComment;
          }
        }
      })
      .addCase(moderateComment.rejected, (state, action) => {
        state.moderating = false;
        state.commentError = action.payload || "Failed to moderate comment";
      });
  },
});

export const {
  clearError,
  clearCommentSuccess,
  resetCreateState,
  clearSelectedBlog,
  resetComments,
  resetModeratingState,
  updateCommentStatusLocally,
} = blogSlice.actions;

export default blogSlice.reducer;