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
import axios from "axios";

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
    setNotifications: (state, action) => {
      // This will set the notifications in the Redux store
      state.allNotifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
  },
});

// Thunk for fetching admin notifications from the backend
// export const fetchNotifications = () => async (dispatch) => {
//   try {
//     const response = await axios.get('http://localhost:5000/api/notifications/admin');
//     console.log("Fetched Notifications:", response.data);
//     dispatch(setNotifications(response.data)); // Save notifications to Redux store
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//   }
// };

// export const fetchNotifications = () => async (dispatch) => {
//   try {
//     const role = localStorage.getItem("role");  // Check if the user is an admin
//     let url = 'http://localhost:5000/api/notifications/admin';
    
//     // Only fetch notifications for admins
//     if (role !== 'admin') {
//       // Fetch user-specific notifications (based on email)
//       const email = localStorage.getItem("userId");
//       url = `http://localhost:5000/api/notifications/${email}`;
//     }

//     const response = await axios.get(url);
//     console.log("Fetched Notifications:", response.data);
//     dispatch(setNotifications(response.data));  // Save notifications to Redux store
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//   }
// };


export const fetchNotifications = () => async (dispatch) => {
  try {
    const role = localStorage.getItem("role");  // Get the role from localStorage
console.log("Logged in role:", role);
    let url = 'http://localhost:5000/api/notifications/admin'; // Default to admin notifications
    
    // Check if the user is not admin (employee)
    if (role !== 'admin') {
      const email = localStorage.getItem("userId"); // Get user ID for employee
      url = `http://localhost:5000/api/notifications/${email}`; // Fetch employee notifications
    }

    // Fetch notifications
    const response = await axios.get(url); 
    console.log("Fetched Notifications:", response.data); // Log the fetched notifications
    console.log("Fetching notifications from URL:", url);  // Log the URL being called

    // Add 'type' for employee notifications
    if (role === 'admin') {
      dispatch(setNotifications(response.data)); // Dispatch admin notifications to Redux store
    } else {
      // For employees, map notifications with 'type' as 'employee'
      const updatedNotifications = response.data.map(notification => ({
        ...notification,
        type: 'employee', // Assign type to 'employee' for employee notifications
      }));
      dispatch(setNotifications(updatedNotifications)); // Dispatch employee notifications to Redux store
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};




export const { addNotification, markAsRead, markAllAsRead ,clearNotifications,setNotifications} = notificationSlice.actions;
export default notificationSlice.reducer;