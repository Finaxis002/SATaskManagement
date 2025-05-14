// import React, { useEffect, useRef, useState } from "react";
// import { parseISO, format, isAfter, isBefore, subMinutes } from "date-fns";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const ReminderAlertManager = () => {
//   const [activeAlerts, setActiveAlerts] = useState([]);
//   const notificationSound = useRef(null);

//   // Initialize audio when user interacts with page
//   useEffect(() => {
//     const initAudio = () => {
//       notificationSound.current = new Audio("/reminder-sound.mp3");
//       document.removeEventListener("click", initAudio);
//     };
//     document.addEventListener("click", initAudio);
//     return () => document.removeEventListener("click", initAudio);
//   }, []);

//   // Request notification permission on user interaction
//   useEffect(() => {
//     const requestPermission = () => {
//       if ("Notification" in window && Notification.permission !== "granted") {
//         Notification.requestPermission();
//       }
//     };
//     document.addEventListener("click", requestPermission);
//     return () => document.removeEventListener("click", requestPermission);
//   }, []);

//   const showDesktopNotification = (title, message) => {
//     if ("Notification" in window && Notification.permission === "granted") {
//       new Notification(title, {
//         body: message,
//         icon: "/icon.png",
//         requireInteraction: true,
//       });
//     }
//   };

//   const playNotificationSound = () => {
//     try {
//       if (notificationSound.current) {
//         notificationSound.current.currentTime = 0;
//         notificationSound.current.play();
//       }
//     } catch (err) {
//       console.warn("Sound play failed:", err);
//     }
//   };
//   const lastAlertTimes = useRef({});
//   const showAlert = (reminder) => {
//     // Skip if this reminder was shown in the last minute
//     if (
//       lastAlertTimes.current[reminder.id] &&
//       Date.now() - lastAlertTimes.current[reminder.id] < 60000
//     ) {
//       return;
//     }

//     lastAlertTimes.current[reminder.id] = Date.now();
//     const reminderTime = parseISO(reminder.datetime);
//     const reminderTimeStr = format(reminderTime, "dd MMM yyyy, hh:mm a");
//     const message = `${reminder.text} is due at ${reminderTimeStr}`;

//     // System notification (works even if tab is backgrounded)
//     showDesktopNotification("🔔 Reminder Alert!", message);

//     // In-app toast (only shows when tab is active)
//     if (document.visibilityState === "visible") {
//       toast.info(
//         <div>
//           <strong className="text-red-600">🔔 Reminder Alert!</strong>
//           <div>{reminder.text}</div>
//           <small className="text-gray-500">Due at {reminderTimeStr}</small>
//         </div>,
//         {
//           position: "bottom-right",
//           autoClose: false,
//           closeOnClick: true,
//           draggable: true,
//         }
//       );
//     }

//     // Play sound (works even if tab is backgrounded)
//     playNotificationSound();
//   };

//   useEffect(() => {
//     const checkAlerts = () => {
//       const saved = localStorage.getItem("reminders");
//       if (!saved) return;

//       const reminders = JSON.parse(saved);
//       const now = new Date();

//       setActiveAlerts((prevActiveAlerts) => {
//         const newActiveAlerts = [];
//         const alertsToShow = [];

//         reminders.forEach((reminder) => {
//           const reminderTime = parseISO(reminder.datetime);
//           const snoozeMinutes = parseInt(reminder.snoozeBefore || "1", 10);
//           const alertTime = subMinutes(reminderTime, snoozeMinutes);

//           if (
//             isAfter(now, alertTime) &&
//             isBefore(now, new Date(alertTime.getTime() + 60000))
//           ) {
//             newActiveAlerts.push(reminder.id);
//             if (!prevActiveAlerts.includes(reminder.id)) {
//               alertsToShow.push(reminder);
//             }
//           }
//         });

//         // Show all new alerts at once
//         alertsToShow.forEach(showAlert);

//         return newActiveAlerts;
//       });
//     };

//     checkAlerts();
//     const interval = setInterval(checkAlerts, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   // Clear old alerts when they expire
//   useEffect(() => {
//     const cleanupInterval = setInterval(() => {
//       setActiveAlerts((prev) =>
//         prev.filter((id) => {
//           const saved = localStorage.getItem("reminders");
//           if (!saved) return false;

//           const reminders = JSON.parse(saved);
//           const reminder = reminders.find((r) => r.id === id);
//           if (!reminder) return false;

//           const reminderTime = parseISO(reminder.datetime);
//           const snoozeMinutes = parseInt(reminder.snoozeBefore || "1", 10);
//           const alertTime = subMinutes(reminderTime, snoozeMinutes);
//           return isBefore(new Date(), new Date(alertTime.getTime() + 60000));
//         })
//       );
//     }, 60000); // Every minute

//     return () => clearInterval(cleanupInterval);
//   }, []);

//   return <ToastContainer position="bottom-right" />;
// };

// export default ReminderAlertManager;

import React, { useEffect, useRef, useState } from "react";
import { parseISO, format, isAfter, isBefore, subMinutes } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReminderAlertManager = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const notificationSound = useRef(null);
  const alertHistory = useRef(new Set()); // Tracks shown alerts

  // Initialize audio when user interacts with page
  useEffect(() => {
    const initAudio = () => {
      notificationSound.current = new Audio("/reminder-sound.mp3");
      document.removeEventListener("click", initAudio);
    };
    document.addEventListener("click", initAudio);
    return () => document.removeEventListener("click", initAudio);
  }, []);

  // Request notification permission on user interaction
  useEffect(() => {
    const requestPermission = () => {
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    };
    document.addEventListener("click", requestPermission);
    return () => document.removeEventListener("click", requestPermission);
  }, []);

  const showDesktopNotification = (title, message) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/icon.png",
        requireInteraction: true,
      });
    }
  };

  const playNotificationSound = () => {
    try {
      if (notificationSound.current) {
        notificationSound.current.currentTime = 0;
        notificationSound.current.play();
      }
    } catch (err) {
      console.warn("Sound play failed:", err);
    }
  };

  const showAlert = (reminder) => {
    const alertKey = `${reminder.id}_${reminder.datetime}`;

    // Skip if this alert was already shown
    if (alertHistory.current.has(alertKey)) {
      return;
    }

    alertHistory.current.add(alertKey);

    const reminderTime = parseISO(reminder.datetime);
    const reminderTimeStr = format(reminderTime, "dd MMM yyyy, hh:mm a");
    const message = `${reminder.text} is due at ${reminderTimeStr}`;

    // Show either desktop notification OR toast, not both
    if (document.visibilityState !== "visible") {
      showDesktopNotification("🔔 Reminder Alert!", message);
    } else {
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
          toastId: alertKey, // Unique ID for each toast
        }
      );
    }

    playNotificationSound();
  };

  useEffect(() => {
    const checkAlerts = () => {
      const saved = localStorage.getItem("reminders");
      if (!saved) return;

      const reminders = JSON.parse(saved);
      const now = new Date();

      reminders.forEach((reminder) => {
        const reminderTime = parseISO(reminder.datetime);
        const snoozeMinutes = parseInt(reminder.snoozeBefore || "1", 10);
        const alertTime = subMinutes(reminderTime, snoozeMinutes);

        if (
          isAfter(now, alertTime) &&
          isBefore(now, new Date(alertTime.getTime() + 60000))
        ) {
          showAlert(reminder);
        }
      });
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup old alerts from history
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = new Date();
      const newHistory = new Set();

      alertHistory.current.forEach((key) => {
        const [, datetime] = key.split("_");
        const reminderTime = parseISO(datetime);
        const snoozeMinutes = 1; // Default
        const alertTime = subMinutes(reminderTime, snoozeMinutes);

        if (isBefore(now, new Date(alertTime.getTime() + 60000))) {
          newHistory.add(key);
        }
      });

      alertHistory.current = newHistory;
    }, 60000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return <ToastContainer position="bottom-right" />;
};

export default ReminderAlertManager;
