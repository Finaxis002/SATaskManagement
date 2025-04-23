import { useEffect } from "react";
import socket from "../socket"; // Assuming your socket is connected correctly
import axios from "axios";

const useNotificationSocket = (setNotificationCount) => {
  useEffect(() => {
    const email = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (!email) {
      console.log("❌ No user email found, skipping notification setup.");
      return;
    }

    // Log email and role for debugging
    console.log("🟢 Setting up notification socket for user:", email, "Role:", role);

    // Function to fetch unread notification count from backend
    const fetchUpdatedCount = async () => {
      try {
        console.log("🔄 Fetching unread notification count from backend...");
        const res = await axios.get(
          `https://sataskmanagementbackend.onrender.com/api/notifications/unread-count/${email}`, 
          {
            params: { role },  // Pass the role as query param
          }
        );
        const count = res.data.unreadCount;
        console.log("🔄 Unread notification count updated:", count);
        setNotificationCount(count); // Update the count on the frontend
      } catch (err) {
        console.error("❌ Error fetching unread count:", err.message);
      }
    };

    
    socket.on("notificationCountUpdated", () => {
      console.log("📡 Notification count has been updated!");
     fetchUpdatedCount();
    });
    
    // Optionally, you can also fetch the initial count if needed
    console.log("🔄 Fetching initial unread notification count...");
    fetchUpdatedCount();

    // Cleanup socket listener on component unmount
    return () => {
      console.log("🧹 Cleaning up socket listener for 'new-notification' event.");
      socket.off("notificationCountUpdated")
    };
  }, [setNotificationCount]);

  return {}; // Optional: Return any useful data (e.g., notifications, etc.)
};

export default useNotificationSocket;
