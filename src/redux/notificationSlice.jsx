import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  count: 0,
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
      state.count += 1;
    },
    clearNotifications: (state) => {
      state.count = 0;
      state.notifications = [];
    },
  },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;

export default notificationSlice.reducer;
