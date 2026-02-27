import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotificationsAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
  deleteNotificationAPI,
  deleteAllNotificationsAPI,
} from "../../API/notification.api";


/* ======================================================
   THUNKS
====================================================== */

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const res = await getNotificationsAPI(page, limit);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await markNotificationReadAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark notification as read"
      );
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsReadAPI();
      return true;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Failed to mark all notifications as read"
      );
    }
  }
);



export const deleteNotification = createAsyncThunk(
  "notifications/deleteOne",
  async (id, { rejectWithValue }) => {
    try {
      await deleteNotificationAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete notification"
      );
    }
  }
);

export const deleteAllNotifications = createAsyncThunk(
  "notifications/deleteAll",
  async (_, { rejectWithValue }) => {
    try {
      await deleteAllNotificationsAPI();
      return true;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete notifications"
      );
    }
  }
);

/* ======================================================
   SLICE
====================================================== */

const notificationSlice = createSlice({
  name: "notifications",

  initialState: {
    list: [],
    page: 1,
    limit: 20,
    unreadCount: 0,
    hasMore: true,
    loading: false,
    error: null,
  },

  reducers: {
    resetNotifications: (state) => {
      state.list = [];
      state.page = 1;
      state.unreadCount = 0;
      state.hasMore = true;
    },

    // 🔥 For realtime (Socket / FCM foreground)
    pushNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------------- FETCH ---------------- */
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;

        const { data, page, limit, unreadCount } = action.payload;

        // Append for pagination
        if (page === 1) {
          state.list = data;
        } else {
          state.list.push(...data);
        }

        state.page = page;
        state.limit = limit;
        state.unreadCount = unreadCount;
        state.hasMore = data.length === limit;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------------- MARK SINGLE READ ---------------- */
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notif = state.list.find((n) => n._id === action.payload);
        if (notif && !notif.isRead) {
          notif.isRead = true;
          notif.readAt = new Date().toISOString();
          state.unreadCount = Math.max(state.unreadCount - 1, 0);
        }
      })
/* ---------------- DELETE SINGLE ---------------- */
.addCase(deleteNotification.fulfilled, (state, action) => {
  const notif = state.list.find(n => n._id === action.payload);
  state.list = state.list.filter(n => n._id !== action.payload);

  if (notif && !notif.isRead) {
    state.unreadCount = Math.max(state.unreadCount - 1, 0);
  }
})


/* ---------------- DELETE ALL ---------------- */
.addCase(deleteAllNotifications.fulfilled, (state) => {
  state.list = [];
  state.unreadCount = 0;
  state.page = 1;
  state.hasMore = false;
})

      /* ---------------- MARK ALL READ ---------------- */
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.list.forEach((n) => {
          n.isRead = true;
          n.readAt = new Date().toISOString();
        });
        state.unreadCount = 0;
      });

      
  },
});

export const {
  resetNotifications,
  pushNotification, // 👈 realtime-ready
} = notificationSlice.actions;

export default notificationSlice.reducer;
