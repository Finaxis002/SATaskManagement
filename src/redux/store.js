// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './taskSlice';
import authReducer from './authSlice';
import userReducer from "./userSlice";
import notificationReducer from './notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    users: userReducer,
    notifications: notificationReducer,
  },
  // Redux DevTools is enabled by default in development mode
  devTools: process.env.NODE_ENV !== 'production',
});
