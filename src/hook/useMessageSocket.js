import { useEffect , useState} from "react";
import socket from "../socket";
import axios from "axios";

const useMessageSocket = (setInboxCount, selectedGroup) => {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    // Fetch the updated inbox count
    const fetchUpdatedCount = async () => {
      try {
        const res = await axios.get("https://sataskmanagementbackend.onrender.com/api/unread-count", {
          params: { name, role },
        });
        const count = res.data.unreadCount;
        console.log("📡 Real-time unread count updated:", count); // ✅
        setInboxCount(count);
      } catch (error) {
        console.error("❌ Real-time fetch failed:", error.message);
      }
    };
    

    // Listen for messages sent to the selected group
    socket.on("receiveMessage", (msg) => {
      console.log("📨 Real-time message received:", msg);
      setMessages((prev) => {
        if (Array.isArray(prev)) {
          return [...prev, msg]; // Append to the array if prev is valid
        }
        return [msg]; // Return an array with the new message if prev is not an array
      });
    });
    

    socket.on("inboxCountUpdated", () => {
      fetchUpdatedCount();
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("inboxCountUpdated");
    };
  }, [setInboxCount, selectedGroup]); // Re-run on selectedGroup change

};

export default useMessageSocket;
