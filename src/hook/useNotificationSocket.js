import { useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://sataskmanagementbackend.onrender.com", {
  withCredentials: true,
});

const useNotificationSocket = (setNotificationCount) => {
  const lockRef = useRef(false);

  useEffect(() => {
    const email = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (!email && role !== "admin") {
      console.log("❌ No userId and not admin, skipping notifications socket.");
      return;
    }

    const fetchCount = async () => {
      if (lockRef.current) return;
      lockRef.current = true;

      try {
        const userToQuery = role === "admin" ? "admin" : email;

        // console.log("🔄 Fetching unread notification count from backend...");
        const res = await axios.get(`https://sataskmanagementbackend.onrender.com/api/notifications/unread-count/${userToQuery}`, {
          params: { role },
        });

        // console.log("✅ Notification count fetched:", res.data.unreadCount);
        setNotificationCount(res.data.unreadCount);
      } catch (err) {
        console.error("❌ Error fetching notification count:", err.message);
      } finally {
        lockRef.current = false;
      }
    };

    // ✅ Listen to real-time socket event
    socket.on("notificationCountUpdated", (payload) => {
      const currentRole = localStorage.getItem("role");
      const currentUser = localStorage.getItem("userId");
    
      if (!payload || typeof payload !== "object") {
        console.warn("⚠️ Skipping socket event: invalid or missing payload");
        return;
      }
    
      const { email } = payload; // ❗ Ignore payload.count completely here
    
      if (currentRole === "admin" && email === "admin") {
        console.log("✅ Admin match, refetching count...");
        fetchCount(); // ✅ REFETCH count from backend
        return;
      }
    
      if (email === currentUser) {
        console.log("✅ User match, refetching count...");
        fetchCount(); // ✅ REFETCH count from backend
      }
    });
    
    
    

    // ✅ Fetch once on component mount
    fetchCount();

    return () => {
      // console.log("🧹 Cleaning up socket listener");
      socket.off("notificationCountUpdated");
    };
  }, [setNotificationCount]);

  return {};
};

export default useNotificationSocket;
