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
// ReminderAlertManager.jsx
import React, { useEffect, useRef, useState } from "react";
import { parseISO, format, isAfter, isBefore, subMinutes } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReminderAlertManager = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const notificationSound = useRef(null);

  // Initialize audio when user interacts with page
  useEffect(() => {
    const initAudio = () => {
      notificationSound.current = new Audio("/reminder-sound.mp3");
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, []);

  // Request notification permission on user interaction
  useEffect(() => {
    const requestPermission = () => {
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    };
    document.addEventListener('click', requestPermission);
    return () => document.removeEventListener('click', requestPermission);
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
    const reminderTime = parseISO(reminder.datetime);
    const reminderTimeStr = format(reminderTime, "dd MMM yyyy, hh:mm a");
    const message = `${reminder.text} is due at ${reminderTimeStr}`;

    // System notification (works even if tab is backgrounded)
    showDesktopNotification("🔔 Reminder Alert!", message);

    // In-app toast (only shows when tab is active)
    if (document.visibilityState === 'visible') {
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
    }

    // Play sound (works even if tab is backgrounded)
    playNotificationSound();
  };

  useEffect(() => {
    const checkAlerts = () => {
      const saved = localStorage.getItem("reminders");
      if (!saved) return;

      const reminders = JSON.parse(saved);
      const now = new Date();
      const newActiveAlerts = [];

      reminders.forEach(reminder => {
        const reminderTime = parseISO(reminder.datetime);
        const snoozeMinutes = parseInt(reminder.snoozeBefore || "1", 10);
        const alertTime = subMinutes(reminderTime, snoozeMinutes);

        if (isAfter(now, alertTime) && isBefore(now, new Date(alertTime.getTime() + 60000))) {
          newActiveAlerts.push(reminder.id);
          if (!activeAlerts.includes(reminder.id)) {
            showAlert(reminder);
          }
        }
      });

      setActiveAlerts(newActiveAlerts);
    };

    // Check immediately
    checkAlerts();

    // Then check every 5 seconds
    const interval = setInterval(checkAlerts, 5000);
    return () => clearInterval(interval);
  }, [activeAlerts]);

  // Clear old alerts when they expire
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setActiveAlerts(prev => prev.filter(id => {
        const saved = localStorage.getItem("reminders");
        if (!saved) return false;
        
        const reminders = JSON.parse(saved);
        const reminder = reminders.find(r => r.id === id);
        if (!reminder) return false;

        const reminderTime = parseISO(reminder.datetime);
        const snoozeMinutes = parseInt(reminder.snoozeBefore || "1", 10);
        const alertTime = subMinutes(reminderTime, snoozeMinutes);
        return isBefore(new Date(), new Date(alertTime.getTime() + 60000));
      }));
    }, 60000); // Every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  return <ToastContainer position="bottom-right" />;
};

export default ReminderAlertManager;