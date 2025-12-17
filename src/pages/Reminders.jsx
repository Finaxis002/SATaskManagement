import React, { useState, useEffect } from "react";
import {
  isToday,
  parseISO,
  format,
  startOfToday,
  endOfToday,
  isValid,
  isAfter
} from "date-fns";
import {
  FaCalendarAlt,
  FaClock,
  FaAlignLeft,
  FaUserFriends,
  FaTimes,
  FaPen,
  FaPlus,
  FaBell,
  FaUser,
} from "react-icons/fa";
// Removed unused Swal import

const toLocalParts = (iso) => {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

const DEFAULT_REMINDER = { text: "", date: "", time: "", snoozeBefore: "1" };

const DEFAULT_EVENT = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  guests: [""],
  snoozeBefore: "30",
};

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [events, setEvents] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newReminder, setNewReminder] = useState(DEFAULT_REMINDER);
  const [editId, setEditId] = useState(null);
  const [linkedEmail, setLinkedEmail] = useState(
    localStorage.getItem("googleEmail") || null
  );
  const [editingEventId, setEditingEventId] = useState(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [newEvent, setNewEvent] = useState(DEFAULT_EVENT);
  const [saving, setSaving] = useState(false);

  const rawUser = localStorage.getItem("user");
  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }

  const userId = user?.userId || localStorage.getItem("userId") || null;

  // 1. Fetch data from backend on load
  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        const reminderRes = await fetch(
          `https://taskbe.sharda.co.in/api/reminders?userId=${userId}`
        );
        const reminderData = await reminderRes.json();
        const safeReminders = Array.isArray(reminderData) ? reminderData : [];
        setReminders(safeReminders);
        
        // Save reminders locally for AlertManager (Important for the alert logic)
        localStorage.setItem("reminders", JSON.stringify(safeReminders)); 

        const eventRes = await fetch(
          `https://taskbe.sharda.co.in/api/events?userId=${userId}`
        );
        const eventData = await eventRes.json();
        setEvents(Array.isArray(eventData) ? eventData : []);
      } catch (err) {
        console.error("❌ Failed to load reminders or events:", err);
        setReminders([]);
        setEvents([]);
      }
    };

    fetchData();
  }, [userId]);

  // 2. Local Storage Sync for AlertManager (Watch for changes in reminders)
  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  const handleDeleteReminder = async (id) => {
    try {
      await fetch(
        `https://taskbe.sharda.co.in/api/reminders/${id}?userId=${userId}`,
        { method: "DELETE" }
      );
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete:", err);
    }
  };

  const saveReminder = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (!newReminder.text || !newReminder.date || !newReminder.time) {
        alert("Please fill out all reminder fields.");
        return;
      }

      const combinedDateTime = new Date(
        `${newReminder.date}T${newReminder.time}`
      ).toISOString();

      const reminderPayload = {
        text: newReminder.text,
        datetime: combinedDateTime,
        snoozeBefore: parseInt(newReminder.snoozeBefore, 10),
        userEmail: linkedEmail,
        userId: user?.userId || localStorage.getItem("userId"),
      };
      
      let data;
      const url = `https://taskbe.sharda.co.in/api/reminders${editId ? `/${editId}` : ""}`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reminderPayload),
      });
      
      if (!res.ok) throw new Error("API call failed");
      
      data = await res.json();
      const savedReminder = data.reminder;

      if (editId) {
        setReminders((prev) =>
          prev.map((r) => (r._id === editId ? savedReminder : r))
        );
      } else {
        setReminders((prev) => [...prev, savedReminder]);
      }

      setNewReminder(DEFAULT_REMINDER);
      setEditId(null);
      setShowPopup(false);
    } catch (err) {
      console.error("Error saving reminder:", err);
      alert("Failed to save reminder.");
    } finally {
      setSaving(false);
    }
  };

  const saveEvent = async () => {
    if (saving) return;
    setSaving(true);
    try {
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
        userId: user?.userId || localStorage.getItem("userId"),
        guestEmails: newEvent.guests.filter((email) => email.trim() !== ""),
        snoozeBefore: parseInt(newEvent.snoozeBefore, 10),
      };
      
      let data;
      const url = editingEventId
        ? `https://taskbe.sharda.co.in/api/events/${editingEventId}`
        : "https://taskbe.sharda.co.in/api/events/create";

      const method = editingEventId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload),
      });
      
      if (!res.ok) throw new Error("API call failed");
      
      data = await res.json();
      const savedEvent = data.event || data;

      if (editingEventId) {
        setEvents((prev) =>
          prev.map((e) => (e._id === editingEventId ? savedEvent : e))
        );
      } else {
        setEvents((prev) => [...prev, savedEvent]);
      }

      setShowEventPopup(false);
      setNewEvent(DEFAULT_EVENT);
      setEditingEventId(null);
    } catch (err) {
      console.error("❌ Failed to save event:", err);
      alert("Something went wrong!");
    } finally {
        setSaving(false);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEventId(event._id);

    const { date: sDate, time: sTime } = toLocalParts(event.startDateTime);
    const { time: eTime } = toLocalParts(event.endDateTime);

    setNewEvent({
      title: event.title || event.summary,
      description: event.description || "",
      date: sDate,
      startTime: sTime,
      endTime: eTime,
      guests: event.guestEmails || [""],
      snoozeBefore: String(event.snoozeBefore ?? 30),
    });

    setShowEventPopup(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const res = await fetch(
        `https://taskbe.sharda.co.in/api/events/${eventId}?userId=${userId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("Failed to delete event");
      }

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );
    } catch (err) {
      console.error("❌ Error deleting event:", err);
    }
  };

  // Initial request for Notification permission (optional, handled in manager too)
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Filter, sort, and tag reminders
  const remindersSafe = Array.isArray(reminders)
    ? reminders.filter(r => r && r.datetime && r.text)
    : [];

  const updatedReminders = remindersSafe.map((reminder) => {
    try {
      const parsedDate = parseISO(reminder.datetime);
      const isOutdated = parsedDate < new Date() && !isToday(parsedDate);

      // Simple way to tag missed reminders without permanently modifying the text
      if (isOutdated && !reminder.isMissed) {
        return {
          ...reminder,
          isMissed: true,
        };
      }
      return reminder;
    } catch (err) {
      console.error("Error processing reminder:", reminder, err);
      return reminder;
    }
  });

  const now = new Date();
  
  // Sorting helper
  const sortByDate = (a, b) => parseISO(a.datetime || a.startDateTime) - parseISO(b.datetime || b.startDateTime);

  // Reminders categorization
  const todayReminders = updatedReminders
    .filter((r) => {
      try {
        const date = parseISO(r.datetime);
        return isToday(date) && date >= now;
      } catch {
        return false;
      }
    })
    .sort(sortByDate);

  const laterReminders = updatedReminders
    .filter((r) => {
      try {
        const date = parseISO(r.datetime);
        return isAfter(date, now) && !isToday(date);
      } catch {
        return false;
      }
    })
    .sort(sortByDate);

  const outdatedReminders = updatedReminders
    .filter((r) => {
      try {
        const date = parseISO(r.datetime);
        return date < now;
      } catch {
        return false;
      }
    })
    .sort(sortByDate);


  // Events categorization
  const startToday = startOfToday();
  const endToday = endOfToday();

  const validEvents = (Array.isArray(events) ? events : []).filter((e) => {
    if (!e || !e.startDateTime || !e.endDateTime) return false;
    const s = parseISO(e.startDateTime);
    const en = parseISO(e.endDateTime);
    return isValid(s) && isValid(en);
  });

  const todayEvents = validEvents
    .filter((e) => {
      const s = parseISO(e.startDateTime);
      const en = parseISO(e.endDateTime);
      return s <= endToday && en >= startToday;
    })
    .sort(sortByDate);

  const upcomingEvents = validEvents
    .filter((e) => {
      const s = parseISO(e.startDateTime);
      return isAfter(s, endToday);
    })
    .sort(sortByDate);

  const overdueEvents = validEvents
    .filter((e) => {
      const en = parseISO(e.endDateTime);
      return en < startToday;
    })
    .sort(sortByDate);

  // Handle Google OAuth callback parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");

    if (email) {
      const userId = email;
      localStorage.setItem("googleEmail", email);
      localStorage.setItem("userId", userId);
      setLinkedEmail(email);
      
      // Clean URL after processing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const openCreateReminder = () => {
    setEditId(null);
    setNewReminder(DEFAULT_REMINDER);
    setShowPopup(true);
  };

  return (
    <div className="h-screen overflow-y-auto p-4 pb-35 relative overflow-hidden">
      {/* Backdrop */}
      {(showPopup || showEventPopup) && (
        <div
          className="fixed inset-0 bg-black/50 px-4 bg-opacity-30 z-40"
          onClick={() => {
            setShowPopup(false);
            setShowEventPopup(false);
            setEditId(null);
            setEditingEventId(null);
            setNewReminder(DEFAULT_REMINDER);
            setNewEvent(DEFAULT_EVENT);
          }}
        />
      )}

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span className="hidden sm:inline">📅</span> My Schedule
          </h2>

          <div className="flex flex-col w-full sm:w-auto gap-2">
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={openCreateReminder}
                className="flex items-center gap-1.5 bg-indigo-600 text-white px-2.5 py-1 text-xs sm:text-sm rounded-full shadow hover:bg-indigo-700 transition"
              >
                <FaPlus className="text-xs" /> Add Reminder
              </button>

              <button
                onClick={() => {
                  setEditingEventId(null);
                  setNewEvent(DEFAULT_EVENT);
                  setShowEventPopup(true);
                }}
                className="flex items-center gap-1.5 bg-purple-600 text-white px-2.5 py-1 text-xs sm:text-sm rounded-full shadow hover:bg-purple-700 transition"
              >
                <FaPlus className="text-xs" /> Add Event
              </button>

              <button
                onClick={() => {
                  const user = JSON.parse(localStorage.getItem("user"));
                  const currentUserId = user?.userId || localStorage.getItem("userId");

                  if (!currentUserId) {
                    alert("User not logged in or ID is missing. Please log in.");
                    return;
                  }
                  
                  // NOTE: Update these URLs to your actual deployed backend/frontend URLs
                  const backendUrl = `https://taskbe.sharda.co.in/auth/google?redirect_url=${encodeURIComponent(
                    window.location.origin + "/reminders" 
                  )}&user_id=${encodeURIComponent(currentUserId)}`;

                  window.open(backendUrl, "_blank");
                }}
                className="flex items-center gap-1.5 bg-white text-gray-700 px-2.5 py-1 text-xs sm:text-sm rounded-full shadow border border-gray-200 hover:bg-gray-50 transition"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/1024px-Google_Calendar_icon_%282020%29.svg.png"
                  alt="Google Calendar"
                  className="w-4 h-4"
                />
                Connect Calendar
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

        {/* Buckets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

        {/* Reminder Popup */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-full max-w-sm bg-white p-4 rounded shadow-md max-h-[90vh] overflow-y-auto relative">
              <div className="w-full max-w-md p-6 rounded-2xl animate-fadeIn">
                <button
                  className="absolute top-4 right-4 text-red-400 hover:text-red-700 sm:text-gray-400 sm:hover:text-red-500"
                  onClick={() => {
                    setShowPopup(false);
                    setEditId(null);
                    setNewReminder(DEFAULT_REMINDER);
                  }}
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

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="block sm:hidden text-gray-700">Date:</span>
                    <div className="relative flex-1 sm:flex-none w-full flex items-center">
                      <FaCalendarAlt className="hidden sm:block text-gray-600 mr-2" />
                      <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 sm:hidden" />
                      <input
                        type="date"
                        value={newReminder.date}
                        onChange={(e) =>
                          setNewReminder({
                            ...newReminder,
                            date: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded p-2 pl-10 sm:pl-3"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="block sm:hidden text-gray-700">Time:</span>
                    <div className="relative flex-1 sm:flex-none w-full flex items-center">
                      <FaClock className="hidden sm:block text-gray-600 mr-2" />
                      <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 sm:hidden" />
                      <input
                        type="time"
                        value={newReminder.time}
                        onChange={(e) =>
                          setNewReminder({
                            ...newReminder,
                            time: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded p-2 pl-10 sm:pl-3"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <label htmlFor="snooze" className="text-gray-700">
                    ⏳ Alert Before:
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
                    {[1, 5, 10, 15, 30, 45, 60].map(
                      (minute) => (
                        <option key={minute} value={minute}>
                          {minute} minute{minute > 1 ? "s" : ""}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <button
                  onClick={saveReminder}
                  disabled={saving || !newReminder.text || !newReminder.date || !newReminder.time}
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
          </div>
        )}

        {/* Event Popup */}
        {showEventPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
            <div className="w-full max-w-md mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md relative overflow-y-auto mt-4 sm:mt-10 max-h-[80vh] sm:max-h-[85vh]">
              <button
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-red-400 hover:text-red-700 sm:text-gray-400 sm:hover:text-red-500"
                onClick={() => {
                  setShowEventPopup(false);
                  setEditingEventId(null);
                  setNewEvent(DEFAULT_EVENT);
                }}
              >
                <FaTimes size={18} />
              </button>

              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 mt-2 sm:mt-0">
                📅 {editingEventId ? "Update Event" : "Create Event"}
              </h3>

              <input
                type="text"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                className="w-full border border-gray-300 p-2 sm:p-3 rounded-md mb-4 text-sm"
              />

              <textarea
                placeholder="Event Description"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                className="w-full border border-gray-300 p-2 sm:p-3 rounded-md mb-4 text-sm"
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="block sm:hidden text-gray-700">Date:</span>
                  <div className="relative flex-1 sm:flex-none w-full flex items-center">
                    <FaCalendarAlt className="hidden sm:block text-gray-600 mr-2" />
                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 sm:hidden" />
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, date: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded p-2 pl-10 sm:pl-3 sm:w-32"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="block sm:hidden text-gray-700">Start: ⏰</span>
                  <div className="relative flex-1 sm:flex-none w-full flex items-center">
                    <FaClock className="hidden sm:block text-gray-600 mr-2" />
                    <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 sm:hidden" />
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, startTime: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded p-2 pl-10 sm:pl-3 sm:w-24"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="block sm:hidden text-gray-700">End: ⏰</span>
                  <div className="relative flex-1 sm:flex-none w-full flex items-center">
                    <span className="hidden sm:block text-gray-600 mr-2">to</span>
                    <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 sm:hidden" />
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endTime: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded p-2 pl-10 sm:pl-3 sm:w-24"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <label htmlFor="event-snooze" className="text-gray-700">
                  ⏳ Alert Before:
                </label>
                <select
                  id="event-snooze"
                  value={newEvent.snoozeBefore}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, snoozeBefore: e.target.value })
                  }
                  className="border border-gray-300 rounded p-2"
                >
                  {[5, 10, 15, 20, 25, 30, 45, 60].map((m) => (
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
                    setNewEvent({
                      ...newEvent,
                      guests: [...newEvent.guests, ""],
                    })
                  }
                  className="text-sm text-blue-600 hover:underline"
                >
                  + Add Another Guest
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={saveEvent}
                disabled={saving || !newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime}
                className={`w-full ${saving
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
          </div>
        )}
      </div>
    </div>
  );
};

// --- BucketSection Component ---

const BucketSection = ({
  title,
  className = "",
  reminders = [],
  events = [],
  onDeleteReminder,
  onEditReminder,
  onDeleteEvent,
  onEditEvent,
}) => {
    // Combine and sort reminders and events
    const allItems = [
        ...reminders.map(r => ({ ...r, type: 'reminder', datetime: r.datetime, _id: r._id, sortTime: parseISO(r.datetime) })),
        ...events.map(e => ({ ...e, type: 'event', datetime: e.startDateTime, _id: e._id, sortTime: parseISO(e.startDateTime) })),
    ].sort((a, b) => a.sortTime - b.sortTime); // Sort by the earliest time

    const hasItems = allItems.length > 0;

    return (
        <div
            className={`rounded-xl relative p-4 pb-6 shadow-sm bg-gray-200 ${className} 
            sm:max-h-[70vh] sm:overflow-y-auto sm:scrollbar-hide`}
        >
            <h4 className="text-lg font-semibold mb-3 text-gray-700">{title}</h4>

            {!hasItems ? (
                <p className="text-sm text-gray-500">No reminders or events in this category.</p>
            ) : (
                <div className="overflow-x-auto scrollbar-hide sm:overflow-x-visible">
                    <ul
                        className={`flex gap-3 sm:flex-col sm:gap-3 ${allItems.length > 1 ? "snap-x snap-mandatory" : ""
                            }`}
                    >
                        {allItems.map((item, index) => (
                            <li
                                key={`${item.type}-${item._id || index}`}
                                className={`flex-shrink-0 ${allItems.length > 1 ? "w-[85%]" : "w-full"
                                    } sm:w-full bg-white p-4 rounded-lg shadow-xs 
                                    hover:shadow-sm border border-gray-100 
                                    transition-all duration-200 hover:border-blue-100 relative group
                                    ${allItems.length > 1 ? "snap-start" : ""}`}
                            >
                                <div className="pr-8">
                                    {/* Type Tag */}
                                    <div className="mb-2">
                                        {item.type === 'reminder' ? (
                                            <span
                                                className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full
                                                    bg-blue-50 text-blue-700 ring-1 ring-blue-200 ${item.isMissed ? 'bg-red-50 text-red-700 ring-red-200' : ''}`}
                                            >
                                                <FaBell className="text-[10px]" />
                                                {item.isMissed ? '⏰ Missed Reminder' : 'Reminder'}
                                            </span>
                                        ) : (
                                            <span
                                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full
                                                    bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                                            >
                                                <FaCalendarAlt className="text-[10px]" />
                                                Event
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Title/Text */}
                                    <div className="font-medium text-gray-800 flex items-start">
                                        <span className={`w-2 h-2 ${item.type === 'reminder' ? 'bg-blue-500' : 'bg-purple-500'} rounded-full mt-2 mr-2 flex-shrink-0`}></span>
                                        <span className="leading-snug text-base line-clamp-2">{item.text || item.title || item.summary}</span>
                                    </div>
                                    
                                    {/* Time and Date */}
                                    <div className="flex items-center text-xs text-gray-500 mt-2 ml-4">
                                        <FaClock className="mr-1.5 text-gray-400" />
                                        <span>
                                            {format(
                                                parseISO(item.datetime),
                                                "EEE, MMM d, h:mm a"
                                            )}
                                            {item.type === 'event' && 
                                                <span> - {format(parseISO(item.endDateTime), "h:mm a")}</span>
                                            }
                                        </span>
                                    </div>

                                    {/* Guests (for events) and Description */}
                                    {item.type === 'event' && item.description && (
                                        <div className="mt-2 ml-4 text-xs text-gray-600 line-clamp-2">
                                            <FaAlignLeft className="inline-block mr-1.5 text-purple-400" />
                                            {item.description}
                                        </div>
                                    )}
                                    
                                    {item.type === 'event' && item.guestEmails?.length > 0 && (
                                        <div className="mt-2 ml-4 flex items-center gap-1 text-xs text-gray-500">
                                            <FaUserFriends className="text-purple-400" />
                                            <span>{item.guestEmails.length} Guest{item.guestEmails.length > 1 ? 's' : ''}</span>
                                        </div>
                                    )}

                                </div>

                                {/* Action Icons */}
                                <div
                                    className="absolute top-3 right-3 flex items-center space-x-1 
                                            opacity-100 sm:opacity-0 sm:group-hover:opacity-100 
                                            transition-opacity duration-200"
                                >
                                    <button
                                        onClick={() => item.type === 'reminder' ? onEditReminder(item) : onEditEvent(item)}
                                        className="p-1.5 text-blue-600 sm:text-gray-400 hover:text-blue-600 hover:bg-blue-50 
                                            rounded-full transition-colors duration-150"
                                        title="Edit"
                                    >
                                        <FaPen size={12} />
                                    </button>
                                    <button
                                        onClick={() => item.type === 'reminder' ? onDeleteReminder(item._id) : onDeleteEvent(item._id)}
                                        className="p-1.5 text-red-600 sm:text-gray-400 hover:text-red-600 hover:bg-red-50 
                                            rounded-full transition-colors duration-150"
                                        title="Delete"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Reminders;