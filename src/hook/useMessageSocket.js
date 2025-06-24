import { useEffect } from "react";
import axios from "axios";
import socket from "../socket";

const useMessageSocket = (setInboxCount) => {
  useEffect(() => {
    const fetchUpdatedCount = async () => {
      try {
        const name = localStorage.getItem("name");
        const role = localStorage.getItem("role");

        const [directRes, groupRes] = await Promise.all([
          axios.get("http://localhost:1100/api/unread-count", {
            params: { name, role },
          }),
          axios.get("http://localhost:1100/api/group-unread-counts", {
            params: { name },
          }),
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

    // Initial fetch
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