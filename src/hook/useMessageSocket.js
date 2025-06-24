import { useEffect } from "react";
import axios from "axios";
import socket from "../socket";

// Function to play notification sound
const playNotificationSound = () => {
  const audio = new Audio("/reminder-sound.mp3");
  audio.play();
};

const useMessageSocket = (setInboxCount) => {
  useEffect(() => {
    const fetchUpdatedCount = async () => {
      try {
        const name = localStorage.getItem("name");
        const role = localStorage.getItem("role");

        // Remove groupRes!
        const directRes = await axios.get(
          "https://taskbe.sharda.co.in/api/unread-count",
          {
            params: { name, role },
          }
        );

        const totalUnread = directRes.data.unreadCount || 0; // <-- ONLY THIS
        setInboxCount(totalUnread);
        // playNotificationSound();
      } catch (err) {
        console.error("❌ Failed fetching inbox count:", err.message);
      }
    };

    fetchUpdatedCount();

    const handleReceiveMessage = (msg) => {
      console.log("📨 Message received in hook:", msg);
      fetchUpdatedCount(); // Always update when a message is received
    };

    const handleInboxUpdate = () => {
      console.log("🔔 Inbox update triggered");
      fetchUpdatedCount();
    };

    // Connect listeners
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("inboxCountUpdated", handleInboxUpdate);
    socket.on("markRead", handleInboxUpdate);

    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      // Cleanup listeners
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("inboxCountUpdated", handleInboxUpdate);
      socket.off("markRead", handleInboxUpdate);
    };
  }, [setInboxCount]);
};

export default useMessageSocket;
