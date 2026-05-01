// src/features/slices/blogSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/axiosInterceptor";

// ============================================
// BLOG ASYNC THUNKS
// ============================================

// === Fetch all blogs (Public) ===
export const fetchBlogs = createAsyncThunk(
  "blogs/fetchBlogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/blogs/list", { params });
      return res.data.data || [];
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
      const res = await api.get(`/blogs/one/${slugOrId}`);
      return res.data.data;
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
      const res = await api.post("/blogs/create", formData);
      const createdBlog = res.data.data;
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
      const res = await api.put(`/blogs/update/${id}`, formData);
      const updatedBlog = res.data.data;
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
      await api.delete(`/blogs/delete/${id}`);
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
      const body = { action };
      if (action === 'reject' && reason) {
        body.reason = reason;
      }

      const res = await api.post(`/blogs/approve-reject/${id}`, body);
      return res.data.data;
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
      const res = await api.get("/blogs/analytics/summary");
      return res.data.data;
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
      const res = await api.post(`/blogs/${blogId}/comment`, {
        authorName, authorEmail, text, sectionId
      });
      return { blogId, comment: res.data.data };
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
      const res = await api.get(`/blogs/${blogId}/comments`);
      return res.data.data || [];
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
      const res = await api.post(
        `/blogs/${blogId}/comments/${commentId}/moderate`,
        { action, moderator_id }
      );
      return res.data.data;
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