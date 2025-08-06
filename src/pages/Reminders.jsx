import React, { useState, useEffect } from "react";
import { isToday, isBefore, isTomorrow, parseISO, format } from "date-fns";
import bgImage from "../assets/bg.png";
import { FaCalendarAlt, FaClock, FaPen, FaPlus, FaTimes } from "react-icons/fa";

const Reminders = () => {
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem("reminders");
    return saved ? JSON.parse(saved) : [];
  });
  const [showPopup, setShowPopup] = useState(false);
  const [newReminder, setNewReminder] = useState({
    text: "",
    date: "",
    time: "",
    snoozeBefore: "1", // default value in minutes
  });
  const [editId, setEditId] = useState(null);
  const [linkedEmail, setLinkedEmail] = useState(() => {
    const storedReminders = JSON.parse(localStorage.getItem("reminders"));
    return storedReminders?.[0]?.userEmail || null;
  });

  const userId = JSON.parse(localStorage.getItem("user")).userId; // Get userId from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  console.log("linkedemail :", linkedEmail);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        // Send userId instead of email for fetching reminders
        const res = await fetch(
          `http://localhost:1100/api/reminders?userId=${userId}`
        );
        const data = await res.json();
        setReminders(data);
      } catch (err) {
        console.error("❌ Failed to load reminders:", err);
      }
    };
    fetchReminders();
  }, [userId]); // Rerun when userId changes

  const handleDeleteReminder = async (id) => {
    const userId = JSON.parse(localStorage.getItem("user")).userId; // Get userId from localStorage

    try {
      // Pass userId as a query parameter in the DELETE request
      await fetch(
        `http://localhost:1100/api/reminders/${id}?userId=${userId}`,
        {
          method: "DELETE",
        }
      );
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete:", err);
    }
  };

  const saveReminder = async () => {
    const combinedDateTime = new Date(
      `${newReminder.date}T${newReminder.time}`
    ).toISOString();

    const reminderPayload = {
      text: newReminder.text,
      datetime: combinedDateTime,
      snoozeBefore: parseInt(newReminder.snoozeBefore),
      userEmail: linkedEmail, // ✅ Pass the email here
      userId: user.userId,
    };

    if (editId) {
      const res = await fetch(`http://localhost:1100/api/reminders/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reminderPayload),
      });
      const data = await res.json();
      setReminders((prev) =>
        prev.map((r) => (r._id === editId ? data.reminder : r))
      );
    } else {
      const res = await fetch("http://localhost:1100/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reminderPayload),
      });
      const data = await res.json();
      setReminders((prev) => [...prev, data.reminder]);
    }

    setNewReminder({ text: "", date: "", time: "", snoozeBefore: "1" });
    setEditId(null);
    setShowPopup(false);
  };

  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const updatedReminders = reminders.map((reminder) => {
    const parsedDate = parseISO(reminder.datetime);
    const isOutdated = parsedDate < new Date() && !isToday(parsedDate);

    if (isOutdated && !reminder.text.includes("⏰ Missed")) {
      return {
        ...reminder,
        text: `${reminder.text} ⏰ Missed`,
      };
    }

    return reminder;
  });

  // Filters
  const now = new Date();
  const todayReminders = updatedReminders.filter((r) => {
    const date = parseISO(r.datetime);
    return isToday(date) && date >= now;
  });

  const laterReminders = updatedReminders.filter((r) => {
    const date = parseISO(r.datetime);
    return date > now && !isToday(date);
  });

  const outdatedReminders = updatedReminders.filter((r) => {
    const date = parseISO(r.datetime);
    return date < now;
  });

  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(updatedReminders));
  }, [updatedReminders]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email"); // Get email from the query parameter

    if (email) {
      // Assuming userId is the email, you can store it or a custom userId
      const userId = email; // Or use any other userId if available
      localStorage.setItem("googleEmail", email); // Persist google email
      localStorage.setItem("userId", userId); // Persist userId (using email as an example)

      // You can now proceed with your reminder fetching logic
      setLinkedEmail(email);
    }
  }, []);

  return (
    <div className="h-screen p-4 relative bg-gradient-to-br from-blue-50 to-purple-100 overflow-hidden">
      <img
        src={bgImage}
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />

      <div className="max-w-5xl relative mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span>📅</span> My Reminders
          </h2>

          <div className="flex flex-col w-full sm:w-auto gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowPopup(true)}
                className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 text-sm rounded-full shadow hover:bg-indigo-700 transition"
              >
                <FaPlus className="text-xs" /> Add Reminder
              </button>

              <button
                onClick={() => {
                  document.cookie = `redirect_url=${window.location.origin}; path=/;`;
                  const loggedInUser = JSON.parse(localStorage.getItem("user"));
                  document.cookie = `user_id=${loggedInUser.userId}; path=/;`; // <-- set userId cookie
                  window.open("http://localhost:1100/auth/google", "_blank");
                }}
                className="flex items-center gap-1.5 bg-white text-gray-700 px-3 py-1.5 text-sm rounded-full shadow border border-gray-200 hover:bg-gray-50 transition"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/1024px-Google_Calendar_icon_%282020%29.svg.png"
                  alt="Google Calendar"
                  className="w-4 h-4"
                />
                Connect
              </button>
            </div>

            {linkedEmail ? (
              <div className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Connected: </span>
                <span className="truncate max-w-[180px]">{linkedEmail}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Not connected to Google Calendar</span>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReminderSection
            title="Today"
            color="bg-blue-300"
            data={todayReminders}
            onDelete={handleDeleteReminder}
            onEdit={(reminder) => {
              setNewReminder({
                text: reminder.text,
                date: reminder.datetime.slice(0, 10), // extract yyyy-mm-dd
                time: reminder.datetime.slice(11, 16), // extract hh:mm
                snoozeBefore: reminder.snoozeBefore.toString(),
              });
              setEditId(reminder._id);
              setShowPopup(true);
            }}
          />

          <ReminderSection
            title="Later"
            color="bg-green-300"
            data={laterReminders}
            onDelete={handleDeleteReminder}
            onEdit={(reminder) => {
              setNewReminder({
                text: reminder.text,
                date: reminder.datetime.slice(0, 10),
                time: reminder.datetime.slice(11, 16),
                snoozeBefore: reminder.snoozeBefore.toString(),
              });
              setEditId(reminder._id);
              setShowPopup(true);
            }}
          />

          <ReminderSection
            title="Overdue"
            color="bg-red-300"
            data={outdatedReminders}
            onDelete={handleDeleteReminder}
            onEdit={(reminder) => {
              setNewReminder({
                text: reminder.text,
                date: reminder.datetime.slice(0, 10),
                time: reminder.datetime.slice(11, 16),
                snoozeBefore: reminder.snoozeBefore.toString(),
              });
              setEditId(reminder._id);
              setShowPopup(true);
            }}
          />
        </div>

        {/* Reminder Modal */}
        {showPopup && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm bg-white p-4 rounded shadow-md">
            <div className="w-full max-w-md p-6 rounded-2xl  relative animate-fadeIn">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                onClick={() => setShowPopup(false)}
              >
                <FaTimes size={18} />
              </button>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                📝 Create Reminder
              </h3>

              <input
                type="text"
                placeholder="What's the reminder?"
                value={newReminder.text}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, text: e.target.value })
                }
                className="w-full border border-gray-300 p-3 rounded-md mb-4 text-sm"
              />

              <div className="flex items-center mb-4 gap-2 text-sm text-gray-600">
                <FaCalendarAlt />
                <input
                  type="date"
                  value={newReminder.date}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, date: e.target.value })
                  }
                  className="border border-gray-300 rounded p-2"
                />
                <FaClock />
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, time: e.target.value })
                  }
                  className="border border-gray-300 rounded p-2"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <label htmlFor="snooze" className="text-gray-700">
                  ⏳ Snooze Before:
                </label>
                <select
                  id="snooze"
                  value={newReminder.snoozeBefore}
                  onChange={(e) =>
                    setNewReminder({
                      ...newReminder,
                      snoozeBefore: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2"
                >
                  {Array.from({ length: 60 }, (_, i) => i + 1).map((minute) => (
                    <option key={minute} value={minute}>
                      {minute} minute{minute > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={saveReminder}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
              >
                {editId ? "Update Reminder" : "Save Reminder"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 👇 Reminder Card Display with Time
const ReminderSection = ({ title, color, data, onDelete, onEdit }) => (
  <div className={`rounded-xl relative p-4 shadow-sm ${color}`}>
    <h4 className="text-lg font-semibold mb-3 text-gray-700">{title}</h4>
    {data.length === 0 ? (
      <p className="text-sm text-gray-500">No reminders</p>
    ) : (
      <ul className="space-y-3">
        {data.map((reminder, index) => (
          <li
            key={index}
            className="bg-white p-3 rounded shadow text-sm text-gray-800 border border-gray-200 relative"
          >
            <div className="font-medium pr-6">{reminder.text}</div>
            <div className="text-xs text-gray-500">
              ⏰ {format(parseISO(reminder.datetime), "dd MMM yyyy, hh:mm a")}
            </div>
            <button
              onClick={() => onEdit(reminder)}
              className="absolute top-2 right-6 text-blue-500 hover:text-blue-700"
              title="Edit"
            >
              <FaPen size={12} />
            </button>

            <button
              onClick={() => onDelete(reminder._id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
              title="Delete"
            >
              <FaTimes size={12} />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default Reminders;
