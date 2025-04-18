import React, { useState, useEffect } from "react";
import { isToday, isBefore, isTomorrow, parseISO, format } from "date-fns";
import bgImage from "../assets/bg.png";
import { FaCalendarAlt, FaClock, FaPlus, FaTimes } from "react-icons/fa";

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
  });

  const addReminder = () => {
    if (!newReminder.text || !newReminder.date || !newReminder.time) return;

    // Combine date and time into a single ISO string
    const combinedDateTime = new Date(
      `${newReminder.date}T${newReminder.time}`
    ).toISOString();

    setReminders((prev) => [
      ...prev,
      { ...newReminder, datetime: combinedDateTime },
    ]);
    setNewReminder({ text: "", date: "", time: "" });
    setShowPopup(false);
  };

  const handleDeleteReminder = (datetime) => {
    const filtered = reminders.filter((r) => r.datetime !== datetime);
    setReminders(filtered);
  };

  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);


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
    const interval = setInterval(() => {
      setReminders((prevReminders) =>
        prevReminders.map((reminder) => {
          const parsedDate = parseISO(reminder.datetime);
          const isOutdated = parsedDate < new Date() && !isToday(parsedDate);

          if (isOutdated && !reminder.text.includes("⏰ Missed")) {
            return {
              ...reminder,
              text: `${reminder.text} ⏰ Missed`,
            };
          }
          return reminder;
        })
      );
    }, 60000); // check every 60 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(updatedReminders));
  }, [updatedReminders]);

  return (
    <div className="h-screen p-4 relative bg-gradient-to-br from-blue-50 to-purple-100 overflow-hidden">
      <img
        src={bgImage}
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />
      <div className="max-w-5xl relative mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">📅 My Reminders</h2>
          <button
            onClick={() => setShowPopup(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow hover:bg-indigo-700 transition"
          >
            <FaPlus /> Add Reminder
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReminderSection
            title="Today"
            color="bg-blue-300"
            data={todayReminders}
            onDelete={handleDeleteReminder}
          />
          <ReminderSection
            title="Later"
            color="bg-green-300"
            data={laterReminders}
            onDelete={handleDeleteReminder}
          />
          <ReminderSection
            title="Overdue"
            color="bg-red-300"
            data={outdatedReminders}
            onDelete={handleDeleteReminder}
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

              <button
                onClick={addReminder}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
              >
                Save Reminder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 👇 Reminder Card Display with Time
const ReminderSection = ({ title, color, data, onDelete }) => (
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
              onClick={() => onDelete(reminder.datetime)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
              title="Delete Reminder"
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
