import { useEffect, useState } from "react";
import axios from "axios";

import { io } from "socket.io-client";

const socket = io("https://sataskmanagementbackend.onrender.com", {
  withCredentials: true,
});

const useMessageSocket = (setInboxCount) => {
  useEffect(() => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    const fetchUpdatedCount = async () => {
      try {
        const res = await axios.get(
          "https://sataskmanagementbackend.onrender.com/api/unread-count",
          {
            params: { name, role },
          }
        );
        console.log("📩 Updated inbox count:", res.data.unreadCount);
        setInboxCount(res.data.unreadCount);
      } catch (err) {
        console.error("❌ Failed fetching inbox count:", err.message);
      }
    };

    fetchUpdatedCount(); // ✅ Immediately fetch on mount

    // Listen for real-time incoming messages
   socket.on("receiveMessage", (msg) => {
  const currentUser = localStorage.getItem("name");
  const currentRole = localStorage.getItem("role");

  const isGroupMessage = !!msg.group?.trim();
  const isRecipient = msg.recipient === currentUser;
  const isSender = msg.sender === currentUser;

  // ✅ Filter logic:
  if (
    (isGroupMessage && currentRole === "admin") || // admin receives group messages
    isRecipient || // user is the recipient of a personal message
    isSender       // user sent the message
  ) {
    console.log("📥 Relevant message, updating inbox count");
    fetchUpdatedCount();
  } else {
    console.log("🚫 Irrelevant message ignored by inbox count");
  }
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
