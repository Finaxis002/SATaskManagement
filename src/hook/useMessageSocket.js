import { useEffect } from "react";
import socket from "../socket";
import axios from "axios";

const useMessageSocket = (setInboxCount) => {
  useEffect(() => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    const fetchUpdatedCount = async () => {
      try {
        const res = await axios.get("https://sataskmanagementbackend.onrender.com/api/unread-count", {
          params: { name, role },
        });
        setInboxCount(res.data.count);
      } catch (error) {
        console.error("❌ Failed to fetch inbox count:", error);
      }
    };

    socket.on("receiveMessage", (msg) => {
      const currentUser = localStorage.getItem("name");

      const iAmReceiver =
        (msg?.recipient === currentUser || msg?.recipient === "all") &&
        msg?.sender !== currentUser;

      if (iAmReceiver) {
        console.log("📨 I am the receiver. Updating inbox count.");
        fetchUpdatedCount();
      } else {
        console.log("🙅 I am the sender. Skipping inbox count update.");
      }
    });

    socket.on("inboxCountUpdated", () => {
      fetchUpdatedCount();
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("inboxCountUpdated");
    };
  }, [setInboxCount]);
};

export default useMessageSocket;
