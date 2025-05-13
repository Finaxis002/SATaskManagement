// // ReminderAlertManager.jsx
//1st version
// // This component manages reminder alerts, including system notifications, in-app toasts, and sound alerts.
// import React, { useEffect, useRef } from "react";
// import { parseISO, format } from "date-fns";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const ReminderAlertManager = () => {
//   const playedAlertsRef = useRef(new Set());
//   const notificationSound = useRef(new Audio("/reminder-sound.mp3"));

//   // Ask for browser notification permission on mount
//   useEffect(() => {
//     if ("Notification" in window && Notification.permission !== "granted") {
//       Notification.requestPermission().then((perm) => {
//         console.log("🔔 Notification permission:", perm);
//       });
//     }
//   }, []);


//   // Function to show Chrome system-level notification
//   const showDesktopNotification = (title, message, link = "http://localhost:5173/reminders") => {
//     if ("Notification" in window && Notification.permission === "granted") {
//       const notification = new Notification(title, {
//         body: message,
//         icon: "/icon.png", // Replace with your icon path if needed
//         requireInteraction: true,
//       });

//       notification.onclick = () => {
//         window.open(link, "_blank");
//       };
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const saved = localStorage.getItem("reminders");
//       if (!saved) return;

//       const reminders = JSON.parse(saved);
//       const now = new Date();

//       reminders.forEach((reminder) => {
//         const reminderTime = parseISO(reminder.datetime);
//         const snoozeMinutes = parseInt(reminder.snoozeBefore || "1", 10);
//         const snoozeTime = new Date(reminderTime.getTime() - snoozeMinutes * 60000);

//         const isDue =
//           now >= snoozeTime &&
//           now < new Date(snoozeTime.getTime() + 60000) &&
//           !playedAlertsRef.current.has(reminder.datetime);

//         if (isDue) {
//           const reminderTimeStr = format(reminderTime, "dd MMM yyyy, hh:mm a");

//           // ✅ Chrome system-level notification
//           showDesktopNotification("🔔 Reminder Alert!", `${reminder.text} is due at ${reminderTimeStr}`);

//           // ✅ In-app toast
//           toast.info(
//             <div>
//               <strong className="text-red-600">🔔 Reminder Alert!</strong>
//               <div>{reminder.text}</div>
//               <small className="text-gray-500">Due at {reminderTimeStr}</small>
//             </div>,
//             {
//               position: "bottom-right",
//               autoClose: false,
//               closeOnClick: true,
//               draggable: true,
//             }
//           );

//           // ✅ Play sound
//           try {
//             notificationSound.current.play();
//           } catch (err) {
//             console.warn("🔇 Sound play failed:", err);
//           }

//           // ✅ Avoid duplicate alerts
//           playedAlertsRef.current.add(reminder.datetime);
//         }
//       });
//     }, 10000); // Check every 10 seconds

//     return () => clearInterval(interval);
//   }, []);

//   return <ToastContainer position="bottom-right" />;
// };

// export default ReminderAlertManager;


//////////////////////////////////////////////////////////////////////////////////////////
//2nd version
// ReminderAlertManager.jsx
// import React, { useEffect, useRef } from "react";
// import { parseISO, format } from "date-fns";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const ReminderAlertManager = () => {
//   const playedAlertsRef = useRef(new Set());
//   const notificationSound = useRef(new Audio("/reminder-sound.mp3"));

//   // Ask for notification permission on load
//   useEffect(() => {
//     if ("Notification" in window && Notification.permission !== "granted") {
//       Notification.requestPermission().then((perm) => {
//         console.log("🔔 Notification permission:", perm);
//       });
//     }
//   }, []);

//   // Show desktop notification
//   const showDesktopNotification = (title, message, link = "http://localhost:5173/reminders") => {
//     if ("Notification" in window && Notification.permission === "granted") {
//       const notification = new Notification(title, {
//         body: message,
//         icon: "/icon.png",
//         requireInteraction: true,
//       });

//       notification.onclick = () => {
//         window.open(link, "_blank");
//       };
//     }
//   };

//   // Check and fire reminders
//   const checkReminders = () => {
//     const saved = localStorage.getItem("reminders");
//     if (!saved) {
//       setTimeout(checkReminders, 10000);
//       return;
//     }

//     const reminders = JSON.parse(saved);
//     const now = new Date();

//     reminders.forEach((reminder) => {
//       const reminderTime = parseISO(reminder.datetime);
//       const snoozeMinutes = parseInt(reminder.snoozeBefore || "1", 10);
//       const snoozeTime = new Date(reminderTime.getTime() - snoozeMinutes * 60000);

//       const isDue =
//         now >= snoozeTime &&
//         now < new Date(snoozeTime.getTime() + 60000) &&
//         !playedAlertsRef.current.has(reminder.datetime);

//       if (isDue) {
//         const reminderTimeStr = format(reminderTime, "dd MMM yyyy, hh:mm a");

//         showDesktopNotification("🔔 Reminder Alert!", `${reminder.text} is due at ${reminderTimeStr}`);

//         toast.info(
//           <div>
//             <strong className="text-red-600">🔔 Reminder Alert!</strong>
//             <div>{reminder.text}</div>
//             <small className="text-gray-500">Due at {reminderTimeStr}</small>
//           </div>,
//           {
//             position: "bottom-right",
//             autoClose: false,
//             closeOnClick: true,
//             draggable: true,
//           }
//         );

//         try {
//           notificationSound.current.play();
//         } catch (err) {
//           console.warn("🔇 Sound play failed:", err);
//         }

//         playedAlertsRef.current.add(reminder.datetime);
//       }
//     });

//     setTimeout(checkReminders, 10000); // Recursively call every 10 seconds
//   };

//   // Initial trigger
//   useEffect(() => {
//     checkReminders();
//   }, []);

//   // Catch missed reminders when returning to tab
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible") {
//         const saved = localStorage.getItem("reminders");
//         if (!saved) return;

//         const reminders = JSON.parse(saved);
//         const now = new Date();

//         reminders.forEach((reminder) => {
//           const reminderTime = parseISO(reminder.datetime);
//           const snoozeMinutes = parseInt(reminder.snoozeBefore || "1", 10);
//           const snoozeTime = new Date(reminderTime.getTime() - snoozeMinutes * 60000);

//           const isMissed =
//             now >= snoozeTime &&
//             !playedAlertsRef.current.has(reminder.datetime);

//           if (isMissed) {
//             const reminderTimeStr = format(reminderTime, "dd MMM yyyy, hh:mm a");

//             showDesktopNotification("⏰ Missed Reminder!", `${reminder.text} was due at ${reminderTimeStr}`);

//             toast.warn(
//               <div>
//                 <strong>⏰ Missed Reminder!</strong>
//                 <div>{reminder.text}</div>
//                 <small>Was due at {reminderTimeStr}</small>
//               </div>,
//               {
//                 position: "bottom-right",
//                 autoClose: false,
//                 closeOnClick: true,
//                 draggable: true,
//               }
//             );

//             try {
//               notificationSound.current.play();
//             } catch (err) {
//               console.warn("🔇 Sound play failed:", err);
//             }

//             playedAlertsRef.current.add(reminder.datetime);
//           }
//         });
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, []);

//   return <ToastContainer position="bottom-right" />;
// };

// export default ReminderAlertManager;



//////////////////////////////////////////////////////////////////////////////////////////
//3rd version

// ReminderAlertManager.jsx
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

  const showDesktopNotification = (title, message, link = "http://localhost:5173/reminders") => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: message,
        icon: "/icon.png",
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.open(link, "_blank");
      };
    }
  };

  const triggerAlert = (reminder) => {
    const reminderTime = parseISO(reminder.datetime);
    const reminderTimeStr = format(reminderTime, "dd MMM yyyy, hh:mm a");

    // Chrome system-level notification
    showDesktopNotification("🔔 Reminder Alert!", `${reminder.text} is due at ${reminderTimeStr}`);

    // In-app toast
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

    // Play sound
    try {
      notificationSound.current.play();
    } catch (err) {
      console.warn("🔇 Sound play failed:", err);
    }

    // Mark as shown in localStorage
    const shownAlerts = JSON.parse(localStorage.getItem("shownAlerts") || "[]");
    shownAlerts.push(reminder.datetime);
    localStorage.setItem("shownAlerts", JSON.stringify(shownAlerts));
  };

  const checkForMissedAlerts = () => {
    const saved = localStorage.getItem("reminders");
    if (!saved) return;

    const reminders = JSON.parse(saved);
    const shownAlerts = new Set(JSON.parse(localStorage.getItem("shownAlerts") || "[]"));
    const now = new Date();

    reminders.forEach((reminder) => {
      const reminderTime = parseISO(reminder.datetime);
      const snoozeMinutes = parseInt(reminder.snoozeBefore || "1", 10);
      const snoozeTime = new Date(reminderTime.getTime() - snoozeMinutes * 60000);

      // Check if alert should have been shown but wasn't
      if (now >= snoozeTime && !shownAlerts.has(reminder.datetime)) {
        triggerAlert(reminder);
      }
    });
  };

  useEffect(() => {
    // Check every 10 seconds
    const interval = setInterval(checkForMissedAlerts, 10000);
    
    // Also check when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForMissedAlerts();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <ToastContainer position="bottom-right" />;
};

export default ReminderAlertManager;