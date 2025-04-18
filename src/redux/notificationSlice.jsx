// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   count: 0,
//   notifications: [],
// };

// const notificationSlice = createSlice({
//   name: "notification",
//   initialState,
//   reducers: {
//     addNotification: (state, action) => {
//       state.notifications.push(action.payload);
//       state.count += 1;
//     },
//     clearNotifications: (state) => {
//       state.count = 0;
//       state.notifications = [];
//     },
//   },
// });

// export const { addNotification, clearNotifications } = notificationSlice.actions;

// export default notificationSlice.reducer;



// src/redux/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  unreadCount: 0,  // This will track only unread notifications
  allNotifications: [],  // This stores all notifications (read and unread)
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      console.log("Adding notification:", action.payload);
      state.allNotifications.unshift({ 
        ...action.payload,
        isRead: false,
      });
      state.unreadCount += 1;
    },
    clearNotifications: (state) => {
            state.count = 0;
            state.notifications = [];
           },
    markAsRead: (state, action) => {
      const notification = state.allNotifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.allNotifications.forEach((notification) => {
        if (!notification.isRead) {
          notification.isRead = true;
        }
      });
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead ,clearNotifications} = notificationSlice.actions;
export default notificationSlice.reducer;