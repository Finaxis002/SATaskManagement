import { useEffect } from "react";
import axios from "axios";
import socket from "../socket";

// Create socket only once globally (not inside hook)

const useMessageSocket = (setInboxCount) => {
  useEffect(() => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    const fetchUpdatedCount = async () => {
      try {
        const name = localStorage.getItem("name");
        const role = localStorage.getItem("role");

        const [directRes, groupRes] = await Promise.all([
          axios.get(
            "https://taskbe.sharda.co.in/api/unread-count",
            {
              params: { name, role },
            }
          ),
          axios.get(
            "https://taskbe.sharda.co.in/api/group-unread-counts",
            {
              params: { name },
            }
          ),
        ]);

        const directCount = directRes.data.unreadCount || 0;

        const groupCountsObj = groupRes.data.groupUnreadCounts || {};
        const groupCount = Object.values(groupCountsObj).reduce(
          (acc, val) => acc + val,
          0
        );

        const totalUnread = directCount + groupCount;

        console.log("📩 Combined unread count:", totalUnread);
        setInboxCount(totalUnread);
      } catch (err) {
        console.error("❌ Failed fetching combined inbox count:", err.message);
      }
    };

    fetchUpdatedCount(); // Fetch once on mount

    const handleReceiveMessage = (msg) => {
      console.log("📨 Message received in hook:", msg); // Add this
      const currentUser = localStorage.getItem("name");
      const currentRole = localStorage.getItem("role");

      const isGroupMessage = !!msg.group?.trim();
      const isRecipient = msg.recipient === currentUser;
      const isSender = msg.sender === currentUser;

      if (
        (isGroupMessage && currentRole === "admin") ||
        isRecipient ||
        isSender
      ) {
        console.log("📥 Relevant message, updating inbox count");
        fetchUpdatedCount();
      } else {
        console.log("🚫 Message not relevant to this user");
      }
    };

    // 🔄 Attach listeners ONCE
    socket.off("receiveMessage", handleReceiveMessage); // Clear previous
    socket.on("receiveMessage", handleReceiveMessage);

    socket.off("inboxCountUpdated");
    socket.on("inboxCountUpdated", fetchUpdatedCount);

    socket.off("markRead");
    socket.on("markRead", fetchUpdatedCount);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("inboxCountUpdated", fetchUpdatedCount);
      socket.off("markRead", fetchUpdatedCount);
    };
  }, [setInboxCount]);
};

export default useMessageSocket;
