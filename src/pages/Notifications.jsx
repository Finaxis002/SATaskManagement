// Notifications.js (Frontend)

import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");  // Use your backend URL
    setSocket(newSocket);

    // Register the user on the server with their email
    const userEmail = "user@example.com"; // Replace with actual user email
    newSocket.emit("register", userEmail);

    // Listen for task assignment notifications
    newSocket.on("new-task", (task) => {
      console.log("🔔 Received new task:", task);  // Log the received task
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        `New task assigned: ${task.name}`,
      ]);
    });

    // Clean up on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>{notification}</li>
          ))}
        </ul>
      ) : (
        <p>No notifications yet.</p>
      )}
    </div>
  );
};

export default Notifications;
