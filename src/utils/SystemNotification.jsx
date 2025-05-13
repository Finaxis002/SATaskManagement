import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SystemNotification() {
  function handleSend() {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("✅ Permission granted, creating notification...");

        // ✅ Show system-level browser notification
        const notification = new Notification("Reminder Alert", {
          body: "Your reminder is due!",
          icon: "https://via.placeholder.com/128", // use external icon for testing
          requireInteraction: true,
        });

        notification.onclick = () => {
          window.open("http://localhost:5173/reminders", "_blank");
        };

        // ✅ Also show in-app toast for visibility inside your app
        toast.info("🔔 Reminder Alert: Your reminder is due!", {
          position: "bottom-right",
        });
      } else {
        toast.warning("❌ Notification permission denied.");
      }
    });
  }

  return (
    <div className="mb-4">
      <button
        onClick={handleSend}
        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
      >
        🔔 Send Test Notification
      </button>
    </div>
  );
}

export default SystemNotification;
