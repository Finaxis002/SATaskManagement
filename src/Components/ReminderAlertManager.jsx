import React, { useEffect, useState } from "react";
import { parseISO, subMinutes, isAfter, isBefore, format } from "date-fns";

const ReminderAlertManager = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertReminder, setAlertReminder] = useState(null);
  const [playedAlerts, setPlayedAlerts] = useState([]);

  const notificationSound = new Audio("/reminder-sound.mp3"); // Place in public/

  useEffect(() => {
    const checkReminders = () => {
      const saved = localStorage.getItem("reminders");
      if (!saved) return;

      const reminders = JSON.parse(saved);
      const now = new Date();

      for (let reminder of reminders) {
        const reminderDate = parseISO(reminder.datetime);
        const alertTime = subMinutes(reminderDate, 1); // 🔔 1 min before

        const isDueSoon =
          isAfter(now, alertTime) &&
          now <= reminderDate &&
          !playedAlerts.includes(reminder.datetime);

        if (isDueSoon) {
          setAlertReminder(reminder);
          setShowAlert(true);
          try {
            notificationSound.play();
          } catch (err) {
            console.warn("🔇 Sound play was blocked:", err);
          }
          setPlayedAlerts((prev) => [...prev, reminder.datetime]);
        }
      }
    };

    const interval = setInterval(checkReminders, 5000); // ✅ every 5 sec
    return () => clearInterval(interval);
  }, [playedAlerts]);

//   useEffect(() => {
//     const checkReminders = () => {
//       const saved = localStorage.getItem("reminders");
//       if (!saved) return;
  
//       const reminders = JSON.parse(saved);
//       const now = new Date();
  
//       for (let reminder of reminders) {
//         const reminderDate = parseISO(reminder.datetime);
//         const diffInMs = reminderDate - now;
//         const diffInMinutes = Math.floor(diffInMs / 60000); // convert ms to minutes
  
//         const triggerMinutes = [180, 120, 90, 60, 30]; // Time before reminder
  
//         const shouldAlert =
//           triggerMinutes.includes(diffInMinutes) &&
//           !playedAlerts.includes(`${reminder.datetime}-${diffInMinutes}`); // Unique for each stage
  
//         if (shouldAlert) {
//           setAlertReminder(reminder);
//           setShowAlert(true);
  
//           try {
//             notificationSound.play();
//           } catch (err) {
//             console.warn("🔇 Sound play was blocked:", err);
//           }
  
//           // Mark this minute slot as alerted
//           setPlayedAlerts((prev) => [...prev, `${reminder.datetime}-${diffInMinutes}`]);
//         }
//       }
//     };
  
//     const interval = setInterval(checkReminders, 5000); // Check every 5s
//     return () => clearInterval(interval);
//   }, [playedAlerts]);
  

  return (
    showAlert && (
      <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-xl px-6 py-4 rounded-lg z-50 text-center">
        <h3 className="text-lg font-bold text-red-600">🔔 Reminder Alert!</h3>
        <p className="text-gray-800 mt-2">{alertReminder.text}</p>
        {alertReminder && (
          <p className="text-xs text-gray-500 mt-1">
            At {format(parseISO(alertReminder?.datetime), "hh:mm a")}
          </p>
        )}

        <button
          onClick={() => setShowAlert(false)}
          className="mt-3 text-sm text-indigo-600 hover:underline"
        >
          Dismiss
        </button>
      </div>
    )
  );
};

export default ReminderAlertManager;
