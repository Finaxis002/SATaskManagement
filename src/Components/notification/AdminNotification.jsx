// AdminNotifications.jsx
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Connect to the socket server
    const socket = io("http://localhost:5000");  // Adjust the URL if necessary

    // Listen for admin notifications
    socket.on("task-completed", (notification) => {
      console.log("New task update notification received:", notification);
      // Add the notification to the state
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);
    });

    return () => {
      // Cleanup the socket connection on unmount
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Admin Notifications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {notifications.length === 0 ? (
            <li>No notifications</li>
          ) : (
            notifications.map((notification, index) => (
              <li key={index}>
                <div>{notification.taskName} completed by {notification.userName}</div>
                <div>{new Date(notification.date).toLocaleString()}</div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default AdminNotifications;
