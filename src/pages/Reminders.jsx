import React, { useState, useEffect } from "react";
import { isToday, parseISO, format, startOfToday, endOfToday } from "date-fns";

import bgImage from "../assets/bg.png";
import {
  FaCalendarAlt,
  FaClock,
  FaAlignLeft,
  FaUserFriends,
  FaTimes,
  FaPen,
  FaPlus,
  FaBell,
} from "react-icons/fa";
import Swal from "sweetalert2";

// put this near the top of the file, outside any component
const toLocalParts = (iso) => {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

const Reminders = () => {
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem("reminders");
    return saved ? JSON.parse(saved) : [];
  });
  const [events, setEvents] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [newReminder, setNewReminder] = useState({
    text: "",
    date: "",
    time: "",
    snoozeBefore: "1", // default value in minutes
  });
  const [editId, setEditId] = useState(null);
  const [linkedEmail, setLinkedEmail] = useState(
    localStorage.getItem("googleEmail") || null
  );
  const [editingEventId, setEditingEventId] = useState(null); // null = creating

  const [showEventPopup, setShowEventPopup] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    guests: [""],
    snoozeBefore: "30",
  });
  const [saving, setSaving] = useState(false);

  const userId = JSON.parse(localStorage.getItem("user")).userId; // Get userId from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  console.log("linkedemail :", linkedEmail);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        // Send userId instead of email for fetching reminders
        const res = await fetch(
          `https://taskbe.sharda.co.in/api/reminders?userId=${userId}`
        );
        const data = await res.json();

        setReminders(data);
      } catch (err) {
        console.error("❌ Failed to load reminders:", err);
      }
    };
    fetchReminders();
  }, [userId]); // Rerun when userId changes

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Reminders
        const reminderRes = await fetch(
          `https://taskbe.sharda.co.in/api/reminders?userId=${userId}`
        );
        const reminderData = await reminderRes.json();
        setReminders(reminderData);

        // Events
        const eventRes = await fetch(
          `https://taskbe.sharda.co.in/api/events?userId=${userId}`
        );
        const eventData = await eventRes.json();
        setEvents(eventData);
      } catch (err) {
        console.error("❌ Failed to load reminders or events:", err);
      }
    };

    fetchData();
  }, [userId]);

  const handleDeleteReminder = async (id) => {
    const userId = JSON.parse(localStorage.getItem("user")).userId; // Get userId from localStorage

    try {
      // Pass userId as a query parameter in the DELETE request
      await fetch(
        `https://taskbe.sharda.co.in/api/reminders/${id}?userId=${userId}`,
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
    if (saving) return; // prevent multiple submissions
    setSaving(true); // block until finished
    try {
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
        const res = await fetch(
          `https://taskbe.sharda.co.in/api/reminders/${editId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reminderPayload),
          }
        );
        const data = await res.json();
        setReminders((prev) =>
          prev.map((r) => (r._id === editId ? data.reminder : r))
        );
      } else {
        const res = await fetch("https://taskbe.sharda.co.in/api/reminders", {
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
    } finally {
      setSaving(false); // reset after save
    }
  };

  const saveEvent = async () => {
    const startDateTime = new Date(
      `${newEvent.date}T${newEvent.startTime}`
    ).toISOString();
    const endDateTime = new Date(
      `${newEvent.date}T${newEvent.endTime}`
    ).toISOString();

    const eventPayload = {
      summary: newEvent.title,
      description: newEvent.description,
      startDateTime,
      endDateTime,
      userEmail: linkedEmail,
      userId: user.userId,
      guestEmails: newEvent.guests.filter((email) => email.trim() !== ""),
      snoozeBefore: parseInt(newEvent.snoozeBefore, 10),
    };

    try {
      const url = editingEventId
        ? `https://taskbe.sharda.co.in/api/events/${editingEventId}`
        : "https://taskbe.sharda.co.in/api/events/create";

      const method = editingEventId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload),
      });

      const data = await res.json();

      if (editingEventId) {
        setEvents((prev) =>
          prev.map((e) => (e._id === editingEventId ? data.event : e))
        );
      } else {
        setEvents((prev) => [...prev, data.event || data]);
      }

      setShowEventPopup(false);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        guests: [""],
        snoozeBefore: "30",
      });
      setEditingEventId(null); // reset
    } catch (err) {
      console.error("❌ Failed to save event:", err);
      alert("Something went wrong!");
    }
  };

  const handleEditEvent = (event) => {
    setEditingEventId(event._id);

    const { date: sDate, time: sTime } = toLocalParts(event.startDateTime);
    const { time: eTime } = toLocalParts(event.endDateTime);

    setNewEvent({
      title: event.title || event.summary,
      description: event.description || "",
      date: sDate, // local
      startTime: sTime, // local
      endTime: eTime, // local
      guests: event.guestEmails || [""],
      snoozeBefore: String(event.snoozeBefore ?? 30), // <-- NEW
    });

    setShowEventPopup(true);
  };

  const handleDeleteEvent = async (eventId) => {
    const userId = JSON.parse(localStorage.getItem("user")).userId;

    try {
      const res = await fetch(
        `https://taskbe.sharda.co.in/api/events/${eventId}?userId=${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete event");
      }

      // ✅ Don't call res.json() unless needed

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );
    } catch (err) {
      console.error("❌ Error deleting event:", err);
    }
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

  // ---- Event buckets (same three columns as reminders) ----
  const startToday = startOfToday();
  const endToday = endOfToday();

  // extra safety: only well-formed events
  const validEvents = (events || []).filter(
    (e) => e && e.startDateTime && e.endDateTime
  );

  // An event is "Today" if it overlaps the [startToday, endToday] window
  const todayEvents = validEvents.filter((e) => {
    const s = parseISO(e.startDateTime);
    const en = parseISO(e.endDateTime);
    return s <= endToday && en >= startToday;
  });

  // Starts after today -> Upcoming
  const upcomingEvents = validEvents.filter((e) => {
    const s = parseISO(e.startDateTime);
    return s > endToday;
  });

  // Ended before today -> Overdue (missed)
  const overdueEvents = validEvents.filter((e) => {
    const en = parseISO(e.endDateTime);
    return en < startToday;
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

  // put near other handlers
  const DEFAULT_REMINDER = { text: "", date: "", time: "", snoozeBefore: "1" };

  const openCreateReminder = () => {
    setEditId(null); // ✅ clear edit mode
    setNewReminder(DEFAULT_REMINDER); // ✅ blank form
    setShowPopup(true);
  };

  return (
    <div className="h-screen  overflow-y-auto p-4 relative overflow-hidden">
      <div className=" relative mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span>📅</span> My Reminders
          </h2>

          <div className="flex flex-col w-full sm:w-auto gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={openCreateReminder}
                className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 text-sm rounded-full shadow hover:bg-indigo-700 transition"
              >
                <FaPlus className="text-xs" /> Add Reminder
              </button>

              <button
                onClick={() => {
                  setEditingEventId(null); // <-- important
                  setNewEvent({
                    title: "",
                    description: "",
                    date: "",
                    startTime: "",
                    endTime: "",
                    guests: [""],
                    snoozeBefore: "30",
                  });
                  setShowEventPopup(true);
                }}
                className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 text-sm rounded-full shadow hover:bg-purple-700 transition"
              >
                <FaPlus className="text-xs" /> Add Event
              </button>

              <button
                onClick={() => {
                  const user = JSON.parse(localStorage.getItem("user"));
                  const userId = user?.userId;

                  if (!userId) {
                    alert("User not logged in");
                    return;
                  }

                  // Directly pass redirect_url and user_id as query params
                  const backendUrl = `https://taskbe.sharda.co.in/auth/google?redirect_url=${encodeURIComponent(
                    "https://tasks.sharda.co.in/reminders"
                  )}&user_id=${encodeURIComponent(userId)}`;

                  window.open(backendUrl, "_blank");
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Today */}
          <BucketSection
            title="Today"
            className="border-l-4 border-blue-500 bg-blue-50"
            reminders={todayReminders}
            events={todayEvents}
            onDeleteReminder={handleDeleteReminder}
            onEditReminder={(reminder) => {
              const { date, time } = toLocalParts(reminder.datetime);
              setNewReminder({
                text: reminder.text,
                date,
                time,
                snoozeBefore: String(reminder.snoozeBefore ?? 1),
              });
              setEditId(reminder._id);
              setShowPopup(true);
            }}
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={handleEditEvent}
          />

          {/* Upcoming */}
          <BucketSection
            title="Upcoming"
            className="border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white"
            reminders={laterReminders}
            events={upcomingEvents}
            onDeleteReminder={handleDeleteReminder}
            onEditReminder={(reminder) => {
              const { date, time } = toLocalParts(reminder.datetime);
              setNewReminder({
                text: reminder.text,
                date,
                time,
                snoozeBefore: String(reminder.snoozeBefore ?? 1),
              });
              setEditId(reminder._id);
              setShowPopup(true);
            }}
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={handleEditEvent}
          />

          {/* Overdue */}
          <BucketSection
            title="Overdue"
            className="border-l-4 border-rose-500 bg-gradient-to-br from-rose-50 to-white"
            reminders={outdatedReminders}
            events={overdueEvents}
            onDeleteReminder={handleDeleteReminder}
            onEditReminder={(reminder) => {
              const { date, time } = toLocalParts(reminder.datetime);
              setNewReminder({
                text: reminder.text,
                date,
                time,
                snoozeBefore: String(reminder.snoozeBefore ?? 1),
              });
              setEditId(reminder._id);
              setShowPopup(true);
            }}
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={handleEditEvent}
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
                📝 {editId ? "Update Reminder" : "Create Reminder"}
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
                disabled={saving}
                className={`w-full ${
                  saving
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white py-2 rounded-md transition`}
              >
                {editId
                  ? "Update Reminder"
                  : saving
                  ? "Saving..."
                  : "Save Reminder"}
              </button>
            </div>
          </div>
        )}

        {showEventPopup && (
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md bg-white p-6 rounded shadow-md">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              onClick={() => setShowEventPopup(false)}
            >
              <FaTimes size={18} />
            </button>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              📅 {editingEventId?"Update Event" : "Create Event"}
            </h3>

            <input
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-md mb-4 text-sm"
            />

            <textarea
              placeholder="Event Description"
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-md mb-4 text-sm"
            />

            <div className="flex items-center mb-4 gap-2 text-sm text-gray-600">
              <FaCalendarAlt />
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
                className="border border-gray-300 rounded p-2"
              />
              <FaClock />
              <input
                type="time"
                value={newEvent.startTime}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, startTime: e.target.value })
                }
                className="border border-gray-300 rounded p-2"
              />
              <span>to</span>
              <input
                type="time"
                value={newEvent.endTime}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, endTime: e.target.value })
                }
                className="border border-gray-300 rounded p-2"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <label htmlFor="event-snooze" className="text-gray-700">
                ⏳ Snooze Before:
              </label>
              <select
                id="event-snooze"
                value={newEvent.snoozeBefore}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, snoozeBefore: e.target.value })
                }
                className="border border-gray-300 rounded p-2"
              >
                {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((m) => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </select>
            </div>

            {/* Guest Emails */}
            <div className="mb-4 max-h-[20vh] overflow-y-auto">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Add Guests
              </label>
              {newEvent.guests.map((guest, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={guest}
                    onChange={(e) => {
                      const updated = [...newEvent.guests];
                      updated[index] = e.target.value;
                      setNewEvent({ ...newEvent, guests: updated });
                    }}
                    className="w-full border border-gray-300 rounded p-2"
                  />
                  <button
                    onClick={() => {
                      const updated = newEvent.guests.filter(
                        (_, i) => i !== index
                      );
                      setNewEvent({ ...newEvent, guests: updated });
                    }}
                    className="text-red-500"
                    title="Remove Guest"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setNewEvent({ ...newEvent, guests: [...newEvent.guests, ""] })
                }
                className="text-sm text-blue-600 hover:underline"
              >
                + Add Another Guest
              </button>
            </div>

            <button
              onClick={saveEvent}
              disabled={saving}
              className={`w-full ${
                saving
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white py-2 rounded-md transition`}
            >
              {saving
                ? "Saving..."
                : editingEventId
                ? "Save Changes"
                : "Create Event"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 👇 Reminder Card Display with Time
// One column that shows BOTH reminders and events with their existing card UIs
const BucketSection = ({
  title,
  className = "",
  reminders = [],
  events = [],
  onDeleteReminder,
  onEditReminder,
  onDeleteEvent,
  onEditEvent,
}) => (
  <div
    className={`rounded-xl relative p-4 shadow-sm bg-gray-200 max-h-[70vh] overflow-y-auto ${className}`}
  >
    <h4 className="text-lg font-semibold mb-3 text-gray-700">{title}</h4>

    {reminders.length === 0 && events.length === 0 ? (
      <p className="text-sm text-gray-500">No reminders or events</p>
    ) : (
      <ul className="space-y-3">
        {/* ---- Reminders (existing UI) ---- */}
        {reminders.map((reminder, index) => (
          <li
            key={`r-${reminder._id || index}`}
            className="bg-white p-4 rounded-lg shadow-xs hover:shadow-sm border border-gray-100 transition-all duration-200 hover:border-blue-100 relative group"
          >
            <div className="pr-8">
              <div className="mb-2">
                <span
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full
                    bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                >
                  <FaBell className="text-[10px]" />
                  Reminder
                </span>
              </div>
              <div className="font-medium text-gray-800 flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                <span className="leading-snug">{reminder.text}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-2 ml-4">
                <FaClock className="mr-1.5 text-gray-400" />
                <span>
                  {format(parseISO(reminder.datetime), "EEE, MMM d, h:mm a")}
                </span>
              </div>
            </div>

            <div className="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => onEditReminder(reminder)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-150"
                title="Edit"
              >
                <FaPen size={12} />
              </button>
              <button
                onClick={() => onDeleteReminder(reminder._id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-150"
                title="Delete"
              >
                <FaTimes size={12} />
              </button>
            </div>
          </li>
        ))}

        {/* ---- Events (existing UI) ---- */}
        {events
          .filter((e) => e && (e.title || e.summary))
          .map((event, index) => (
            <li
              key={`e-${event._id || index}`}
              className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 hover:border-purple-100"
            >
              {/* Type chip */}
              <div className="mb-2">
                <span
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full
                    bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                >
                  <FaCalendarAlt className="text-[10px]" />
                  Event
                </span>
              </div>

              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></span>
                  <span className="line-clamp-2">
                    {event.title || event.summary}
                  </span>
                </h3>
                <button
                  onClick={() => onDeleteEvent(event._id)}
                  className="text-gray-300 hover:text-red-500 p-1 transition-colors duration-200"
                  aria-label="Delete event"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendarAlt className="text-purple-400 flex-shrink-0" />
                    <span className="font-medium text-gray-700">
                      {format(parseISO(event.startDateTime), "EEE, MMM d")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaClock className="text-purple-400 flex-shrink-0" />
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">
                        {format(parseISO(event.startDateTime), "h:mm a")}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className="font-medium text-gray-700">
                        {format(parseISO(event.endDateTime), "h:mm a")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="mb-4">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <FaAlignLeft className="text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="whitespace-pre-line text-gray-700">
                      {event.description}
                    </p>
                  </div>
                </div>
              )}

              {event.guestEmails?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-start gap-3 text-sm">
                    <FaUserFriends className="text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-700 mb-2">
                        Invited Guests
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {event.guestEmails.map((email, i) => (
                          <span
                            key={i}
                            className="bg-gray-50 px-3 py-1.5 rounded-full text-xs text-gray-700 border border-gray-200 flex items-center gap-1"
                          >
                            <FaUser className="text-gray-400 text-xs" />
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => onEditEvent(event)}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                >
                  <FaPen size={12} />
                  <span>Edit Event</span>
                </button>
              </div>
            </li>
          ))}
      </ul>
    )}
  </div>
);

export default Reminders;
