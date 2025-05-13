// ReminderAlertManager.jsx
// This component manages reminder alerts, including system notifications, in-app toasts, and sound alerts.
import React, { useEffect, useRef } from "react";
import { parseISO, format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReminderAlertManager = () => {
  const playedAlertsRef = useRef(new Set());
  const notificationSound = useRef(new Audio("/reminder-sound.mp3"));

  // Ask for browser notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((perm) => {
        console.log("🔔 Notification permission:", perm);
      });
    }
  }, []);


  // Function to show Chrome system-level notification
  const showDesktopNotification = (title, message, link = "http://localhost:5173/reminders") => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: message,
        icon: "/icon.png", // Replace with your icon path if needed
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.open(link, "_blank");
      };
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem("reminders");
      if (!saved) return;

      const reminders = JSON.parse(saved);
      const now = new Date();

      reminders.forEach((reminder) => {
        const reminderTime = parseISO(reminder.datetime);
        const snoozeMinutes = parseInt(reminder.snoozeBefore || "1", 10);
        const snoozeTime = new Date(reminderTime.getTime() - snoozeMinutes * 60000);

        const isDue =
          now >= snoozeTime &&
          now < new Date(snoozeTime.getTime() + 60000) &&
          !playedAlertsRef.current.has(reminder.datetime);

        if (isDue) {
          const reminderTimeStr = format(reminderTime, "dd MMM yyyy, hh:mm a");

          // ✅ Chrome system-level notification
          showDesktopNotification("🔔 Reminder Alert!", `${reminder.text} is due at ${reminderTimeStr}`);

          // ✅ In-app toast
          toast.info(
            <div>
              <strong className="text-red-600">🔔 Reminder Alert!</strong>
              <div>{reminder.text}</div>
              <small className="text-gray-500">Due at {reminderTimeStr}</small>
            </div>,
            {
              position: "bottom-right",
              autoClose: false,
              closeOnClick: true,
              draggable: true,
            }
          );

          // ✅ Play sound
          try {
            notificationSound.current.play();
          } catch (err) {
            console.warn("🔇 Sound play failed:", err);
          }

          // ✅ Avoid duplicate alerts
          playedAlertsRef.current.add(reminder.datetime);
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return <ToastContainer position="bottom-right" />;
};

export default ReminderAlertManager;

