import { useEffect, useState } from "react";
import axios from "axios";

import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

const useMessageSocket = (setInboxCount) => {
  useEffect(() => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    const fetchUpdatedCount = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/unread-count", {
          params: { name, role },
        });
        console.log("📩 Updated inbox count:", res.data.unreadCount);
        setInboxCount(res.data.unreadCount);
      } catch (err) {
        console.error("❌ Failed fetching inbox count:", err.message);
      }
    };

    fetchUpdatedCount(); // ✅ Immediately fetch on mount

    // Listen for real-time incoming messages
    socket.on("receiveMessage", (msg) => {
      console.log("📥 Received new message in Sidebar socket");
      fetchUpdatedCount(); // Fetch unread count immediately when new message arrives
    });

    // Listen for inbox count updates separately
    socket.on("inboxCountUpdated", () => {
      console.log("📡 inboxCountUpdated event received");
      fetchUpdatedCount();
    });

      // 🆕 Whenever any message is marked as read
      socket.on("markRead", () => {
        console.log("📬 Message marked as read");
        fetchUpdatedCount();
      });
  

    return () => {
      socket.off("receiveMessage");
      socket.off("inboxCountUpdated");
      socket.off("markRead"); // Cleanup
    };
  }, [setInboxCount]);
};

export default useMessageSocket;

