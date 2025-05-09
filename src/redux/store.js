import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './taskSlice';
import authReducer from './authSlice';
import userReducer from "./userSlice";
import departmentReducer from "./departmentSlice";
import notificationReducer from './notificationSlice';
import taskCodeReducer from './taskCodeSlice'; // ✅ Single import
import clientReducer from "./clientSlice"; // ✅ new import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    users: userReducer,
    notifications: notificationReducer,
    departments: departmentReducer,
    taskCodes: taskCodeReducer, // ✅ Correct key
    clients: clientReducer, // ✅ add here
  },
  devTools: process.env.NODE_ENV !== 'production',
});
