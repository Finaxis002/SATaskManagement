import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
<<<<<<< HEAD
} from "react";
=======
 
} from "react";

import { useLocation, useNavigate } from "react-router-dom";

>>>>>>> 37de8b36c2864a74f920419a70aae2f8292902fd
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence, useInView } from "framer-motion";
import useSocketSetup from "../hook/useSocketSetup";
import useStickyNotes from "../hook/useStickyNotes";
import StickyNotesDashboard from "../Components/notes/StickyNotesDashboard";
import { ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { FaCalendarAlt, FaClock, FaTimes, FaPlus } from "react-icons/fa";
import { isToday, parseISO, format, startOfToday, endOfToday } from "date-fns";
import TaskOverview from "../Components/TaskOverview";

<<<<<<< HEAD
=======


>>>>>>> 37de8b36c2864a74f920419a70aae2f8292902fd
/* ------------------ cache & helpers ------------------ */
const K = {
  TOKEN: "authToken",
  USER: "user",
  USER_ID: "userId",
  GOOGLE_EMAIL: "googleEmail",
};
const evKey = (uid) => `events_cache__${uid || "anon"}`;
const rmKey = (uid) => `reminders_cache__${uid || "anon"}`;

const loadCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const saveCache = (key, list) => {
  try {
    localStorage.setItem(key, JSON.stringify(list || []));
  } catch {}
};
const mergeById = (serverList = [], cachedList = []) => {
  const out = [];
  const byId = new Map();
  for (const it of cachedList) {
    const id = it?._id || it?.tempId;
    if (id) byId.set(id, it);
  }
  for (const it of serverList) {
    const id = it?._id || it?.tempId;
    if (id) byId.set(id, { ...(byId.get(id) || {}), ...it, optimistic: false });
  }
  if ((serverList || []).length === 0) return cachedList;
  byId.forEach((v) => out.push(v));
  return out;
};

const toLocalParts = (isoString) => {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
};

function getTimeBasedGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

const openGoogleConnect = () => {
  const raw = localStorage.getItem(K.USER);
  const u = raw ? JSON.parse(raw) : null;
  const uid = u?.userId || localStorage.getItem(K.USER_ID);
  if (!uid) {
    alert("Please login first.");
    return;
  }
  const redirect = window.location.origin + "/reminders";
  const backendUrl = `https://taskbe.sharda.co.in/auth/google?redirect_url=${encodeURIComponent(
    redirect
  )}&user_id=${encodeURIComponent(uid)}`;
  window.open(backendUrl, "_blank");
};

const ensureLinkedOrPrompt = async () => {
  const token = localStorage.getItem(K.TOKEN);
  const email = localStorage.getItem(K.GOOGLE_EMAIL);
  if (!token || !email) {
    if (
      window.confirm(
        "Google Calendar is not linked. Do you want to connect it now?"
      )
    ) {
      openGoogleConnect();
    }
    throw new Error("Google not linked");
  }
};

/* ------------------ Portal (fixes hidden/clipped modals) ------------------ */
function ModalPortal({ children }) {
  const elRef = useRef(null);
  if (!elRef.current) {
    elRef.current = document.createElement("div");
  }
  useEffect(() => {
    const el = elRef.current;
    el.setAttribute("id", "portal-root");
    document.body.appendChild(el);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.removeChild(el);
    };
  }, []);
  return createPortal(children, elRef.current);
}

/* ------------------ styles ------------------ */
const glass =
  "backdrop-blur-xl bg-white/60 border border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.08)]";

/* ------------------ TodaysList ------------------ */
const TodaysList = forwardRef(function TodaysList(
  { rows = [], events, setEvents, userId },
  ref
) {
  const DEFAULT_EVENT = {
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    guests: [""],
    snoozeBefore: "30",
  };

  const [showEventPopup, setShowEventPopup] = useState(false);
  const [newEvent, setNewEvent] = useState({ ...DEFAULT_EVENT });
  const [editingEventId, setEditingEventId] = useState(null);
  const [saving, setSaving] = useState(false);

  useImperativeHandle(ref, () => ({
    openCreateEvent: () => {
      setEditingEventId(null);
      setNewEvent({ ...DEFAULT_EVENT });
      setShowEventPopup(true);
    },
  }));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    theToken: {
      const token = params.get("token");
      const uid = params.get("user_id");
      if (email) localStorage.setItem(K.GOOGLE_EMAIL, email);
      if (token) localStorage.setItem(K.TOKEN, token);
      if (uid) localStorage.setItem(K.USER_ID, uid);
    }
  }, []);

  const saveEvent = async () => {
    if (saving) return;
    setSaving(true);

    try {
      if (!newEvent.title?.trim()) {
        alert("Please enter an event title.");
        setSaving(false);
        return;
      }
      if (!newEvent.date || !newEvent.startTime || !newEvent.endTime) {
        alert("Please select date, start time and end time.");
        setSaving(false);
        return;
      }

      const start = new Date(`${newEvent.date}T${newEvent.startTime}`);
      const end = new Date(`${newEvent.date}T${newEvent.endTime}`);

      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        alert("Invalid time range.");
        setSaving(false);
        return;
      }

      await ensureLinkedOrPrompt();

      const token = localStorage.getItem(K.TOKEN);
      const userEmail = localStorage.getItem(K.GOOGLE_EMAIL) || "";

      const payload = {
        summary: newEvent.title.trim(),
        description: (newEvent.description || "").trim(),
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        userId,
        userEmail,
        guestEmails: (newEvent.guests || [])
          .map((e) => e.trim())
          .filter(Boolean),
        snoozeBefore: Number.parseInt(newEvent.snoozeBefore, 10) || 30,
      };

      const isEdit = Boolean(editingEventId);
      let tempId = `tmp_${Date.now()}`;

      if (!isEdit) {
        const optimisticItem = {
          _id: null,
          tempId,
          title: payload.summary,
          description: payload.description,
          startDateTime: payload.startDateTime,
          endDateTime: payload.endDateTime,
          guestEmails: payload.guestEmails,
          snoozeBefore: payload.snoozeBefore,
          optimistic: true,
          createdAt: Date.now(),
        };
        setEvents((prev) => {
          const next = [...prev, optimisticItem];
          saveCache(evKey(userId), next);
          return next;
        });
      } else {
        setEvents((prev) => {
          const next = prev.map((e) =>
            e._id === editingEventId
              ? { ...e, ...payload, title: payload.summary, optimistic: true }
              : e
          );
          saveCache(evKey(userId), next);
          return next;
        });
      }

      const url = isEdit
        ? `https://taskbe.sharda.co.in/api/events/${editingEventId}`
        : "https://taskbe.sharda.co.in/api/events/create";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        const go = window.confirm(
          "Google account not linked or token expired. Connect now?"
        );
        if (go) openGoogleConnect();
        return;
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        alert(`Failed to save event (${res.status}). Kept locally.`);
        console.error("saveEvent server error:", msg);
        return;
      }

      const data = await res.json().catch(() => ({}));
      const saved = data?.event || data || {};

      setEvents((prev) => {
        let next;
        if (!isEdit) {
          next = prev.map((e) =>
            e.tempId === tempId ? { ...saved, optimistic: false } : e
          );
        } else {
          next = prev.map((e) =>
            e._id === editingEventId ? { ...e, ...saved, optimistic: false } : e
          );
        }
        saveCache(evKey(userId), next);
        return next;
      });
    } catch (err) {
      if (err?.message !== "Google not linked") {
        console.error("❌ Failed to save event:", err);
        alert(
          "Network error — Event stored locally. It will persist across refresh."
        );
      }
    } finally {
      setSaving(false);
      setShowEventPopup(false);
      setEditingEventId(null);
      setNewEvent({ ...DEFAULT_EVENT });
    }
  };

  const handleEditEvent = (event) => {
    setEditingEventId(event._id);
    const { date: sDate, time: sTime } = toLocalParts(event.startDateTime);
    const { time: eTime } = toLocalParts(event.endDateTime);
    setNewEvent({
      title: event.title || event.summary || "",
      description: event.description || "",
      date: sDate,
      startTime: sTime,
      endTime: eTime,
      guests: event.guestEmails || [""],
      snoozeBefore: String(event.snoozeBefore ?? 30),
    });
    setShowEventPopup(true);
  };

  const handleDeleteEvent = async (idOrTemp) => {
    setEvents((prev) => {
      const next = prev.filter((e) => (e._id || e.tempId) !== idOrTemp);
      saveCache(evKey(userId), next);
      return next;
    });
    if (String(idOrTemp).startsWith("tmp_")) return;

    try {
      const uid =
        userId || JSON.parse(localStorage.getItem(K.USER) || "{}")?.userId;
      await fetch(
        `https://taskbe.sharda.co.in/api/events/${idOrTemp}?userId=${encodeURIComponent(
          uid
        )}`,
        { method: "DELETE" }
      );
    } catch (err) {
      console.error("❌ Error deleting event:", err);
    }
  };

  const tagCls = (c) =>
    ({
      indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200",
      emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      amber: "bg-amber-50 text-amber-700 border border-amber-200",
      rose: "bg-rose-50 text-rose-700 border border-rose-200",
      gray: "bg-gray-100 text-gray-700 border border-gray-200",
    }[c] || "bg-gray-100 text-gray-700 border border-gray-200");

  return (
    <motion.div
      className={`mt-4 mb-4 rounded-3xl ${glass} overflow-hidden flex flex-col relative`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/40 bg-gradient-to-r from-white/60 to-white/20 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <svg
              className="h-4 w-4 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Today’s Event
          </h3>

          <motion.button
            onClick={() => {
              setEditingEventId(null);
              setNewEvent({ ...DEFAULT_EVENT });
              setShowEventPopup(true);
<<<<<<< HEAD
            }}
=======
              
            }
          }
>>>>>>> 37de8b36c2864a74f920419a70aae2f8292902fd
            className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 text-sm rounded-full shadow hover:bg-purple-700 transition focus:outline-none focus:ring-2 focus:ring-purple-400"
            type="button"
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -1 }}
<<<<<<< HEAD
          >
            <FaPlus className="text-xs" /> Add Event
=======
            title="Shortcut: Alt + A"
          >
            <FaPlus className="text-xs"   /> Add Event
>>>>>>> 37de8b36c2864a74f920419a70aae2f8292902fd
          </motion.button>
        </div>
      </div>

      {/* List with vertical scroll */}
      <div className="min-h-0 max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {rows.length === 0 ? (
          <div className="px-6 py-10 text-sm text-gray-500 text-center">
            No events for today.
          </div>
        ) : (
          <ul className="divide-y divide-white/50">
            <AnimatePresence initial={false}>
              {rows.map((row, i) => (
                <motion.li
                  key={`${row.time}-${i}`}
                  className="px-5 py-3 flex flex-col md:flex-row gap-2 md:gap-0 hover:bg-white/40 transition"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <div className="flex items-center w-full md:w-36">
                    <span className="relative flex items-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-gray-300 to-gray-400 mr-2 shadow-inner" />
                      <span className="text-xs font-medium text-gray-700">
                        {row.time}
                      </span>
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-semibold truncate tracking-wide">
                      {row.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {/* {row.location || "—"}{" "} */}
                      {row.duration ? `• ${row.duration}` : ""}
                    </p>
                  </div>

                  <div className="flex w-full md:w-auto justify-between items-center">
                    {row.tag && (
                      <span
                        className={`text-[11px] px-2 py-1 rounded-full ${tagCls(
                          row.color
                        )}`}
                      >
                        {row.tag}
                      </span>
                    )}
                    <motion.svg
                      className="ml-3 h-4 w-4 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      initial={{ x: 0 }}
                      whileHover={{ x: 3 }}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </motion.svg>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/40 bg-white/60 flex items-center justify-between">
        <span className="text-xs text-gray-600">
          {rows.length} event{rows.length > 1 ? "s" : ""} today
        </span>
      </div>

      {/* Modal (via Portal so it never hides/clips) */}
      <AnimatePresence>
        {showEventPopup && (
          <ModalPortal>
            <motion.div
              className="fixed inset-0 z-[9999] grid place-items-center bg-black/40 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-full max-w-md sm:max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-200"
                initial={{ scale: 0.95, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 160, damping: 18 }}
              >
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  onClick={() => {
                    setShowEventPopup(false);
                    setEditingEventId(null);
                    setNewEvent({ ...DEFAULT_EVENT });
                  }}
                  type="button"
                >
                  <FaTimes size={18} />
                </button>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  📅 {editingEventId ? "Update Event" : "Create Event"}
                </h3>

                <input
                  type="text"
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="w-full border border-gray-300 p-3 rounded-md mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />

                <textarea
                  placeholder="Event Description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className="w-full border border-gray-300 p-3 rounded-md mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />

                <div className="flex flex-col sm:flex-row sm:gap-4 mb-4 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt />
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, date: e.target.value })
                      }
                      className="w-full sm:w-auto border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock />
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, startTime: e.target.value })
                      }
                      className="w-full sm:w-auto border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>to</span>
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endTime: e.target.value })
                      }
                      className="w-full sm:w-auto border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-4 mb-4 gap-2 text-sm text-gray-700">
                  <label htmlFor="event-snooze" className="text-gray-700">
                    ⏳ Snooze Before:
                  </label>
                  <select
                    id="event-snooze"
                    value={newEvent.snoozeBefore}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, snoozeBefore: e.target.value })
                    }
                    className="w-full sm:w-auto border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(
                      (m) => (
                        <option key={m} value={m}>
                          {m} minutes
                        </option>
                      )
                    )}
                  </select>
                </div>

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
                        className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
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
                        type="button"
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
                    type="button"
                  >
                    + Add Another Guest
                  </button>
                </div>

                <motion.button
                  onClick={saveEvent}
                  disabled={saving}
                  className={`w-full ${
                    saving
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white py-2 rounded-md transition shadow`}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                >
                  {saving
                    ? "Saving..."
                    : editingEventId
                    ? "Save Changes"
                    : "Create Event"}
                </motion.button>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

/* ---------- Dashboard ---------- */
const Dashboard = () => {
  useSocketSetup();
  useStickyNotes(3);
  const { loading } = useSelector((s) => s.auth);

  const rawUser = localStorage.getItem(K.USER);
  const userObj = rawUser ? JSON.parse(rawUser) : null;
  const userId = userObj?.userId || localStorage.getItem(K.USER_ID) || null;
  const name = userObj?.name || "Guest";

  const [events, setEvents] = useState(() => loadCache(evKey(userId)));
  const [reminders, setReminders] = useState(() => loadCache(rmKey(userId)));
  const [showStats, setShowStats] = useState(false);

<<<<<<< HEAD
=======
  

   useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.altKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      if (todaysListRef.current?.openCreateEvent) {
        todaysListRef.current.openCreateEvent(); // 👈 triggers button click
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);

const location = useLocation();
const navigate = useNavigate();
// const todaysListRef = useRef(null);

useEffect(() => {
  const params = new URLSearchParams(location.search);
  if (params.get("openEvent") === "1") {
    setTimeout(() => {
      todaysListRef.current?.openCreateEvent();
      // clean up query param so it doesn’t persist
      navigate(location.pathname, { replace: true });
    }, 200);
  }
}, [location, navigate]);

>>>>>>> 37de8b36c2864a74f920419a70aae2f8292902fd
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    const token = params.get("token");
    const uid = params.get("user_id");
    if (email) localStorage.setItem(K.GOOGLE_EMAIL, email);
    if (token) localStorage.setItem(K.TOKEN, token);
    if (uid) localStorage.setItem(K.USER_ID, uid);
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const [evRes, remRes] = await Promise.all([
          fetch(`https://taskbe.sharda.co.in/api/events?userId=${userId}`),
          fetch(`https://taskbe.sharda.co.in/api/reminders?userId=${userId}`),
        ]);
        const [serverEv, serverRm] = await Promise.all([
          evRes.json(),
          remRes.json(),
        ]);
        const currentEvCache = loadCache(evKey(userId));
        const currentRmCache = loadCache(rmKey(userId));

        const mergedEv = mergeById(
          Array.isArray(serverEv) ? serverEv : [],
          currentEvCache
        );
        const mergedRm = mergeById(
          Array.isArray(serverRm) ? serverRm : [],
          currentRmCache
        );

        setEvents(mergedEv);
        setReminders(mergedRm);
        saveCache(evKey(userId), mergedEv);
        saveCache(rmKey(userId), mergedRm);
      } catch (e) {
        console.error("Failed to load rows:", e);
      }
    })();
  }, [userId]);

  useEffect(() => {
    saveCache(evKey(userId), events);
  }, [events, userId]);
  useEffect(() => {
    saveCache(rmKey(userId), reminders);
  }, [reminders, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <svg
          className="animate-spin h-10 w-10 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a 8 8 0 018-8v8z"
          />
        </svg>
        <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  const [stats, setStats] = useState({
    TotalTask: 0,
    Completed: 0,
    Progress: 0,
    Overdue: 0,
  });
  useEffect(() => {
    window.updateDashboardStats = (counts) => {
      setStats({
        TotalTask: counts.total,
        Completed: counts.completed,
        Progress: counts.progress,
        Overdue: counts.overdue,
      });
    };
  }, []);

  const startT = startOfToday();
  const endT = endOfToday();

  const todayEventRows = (events || [])
    .filter((e) => e?.startDateTime && e?.endDateTime)
    .filter((e) => {
      const s = parseISO(e.startDateTime);
      const en = parseISO(e.endDateTime);
      return s <= endT && en >= startT;
    })
    .map((e) => ({
      ts: parseISO(e.startDateTime).getTime(),
      time: format(parseISO(e.startDateTime), "h:mm a"),
      title: e.title || e.summary || "Event",
      tag: "Event",
      color: "indigo",
      location: e.location || "—",
    }));

  const todayReminderRows = (reminders || [])
    .filter((r) => r?.datetime && isToday(parseISO(r.datetime)))
    .map((r) => ({
      ts: parseISO(r.datetime).getTime(),
      time: format(parseISO(r.datetime), "h:mm a"),
      title: r.text || "Reminder",
      tag: "Reminder",
      color: "amber",
      location: "—",
    }));

  const todaysRows = useMemo(
    () => [...todayEventRows, ...todayReminderRows].sort((a, b) => a.ts - b.ts),
    [events, reminders]
  );

  const todaysListRef = useRef(null);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-indigo-50 via-white to-white pb-24 overflow-y-auto px-2 md:px-5">
      {/* animated bg blobs */}
      <div className="pointer-events-none absolute -z-10 inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[32rem] h-[32rem] rounded-full bg-purple-300/30 blur-3xl animate-pulse" />
        <div className="absolute top-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-cyan-300/30 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
      </div>

      {/* header */}
      <div className="py-5 md:pl-0 pl-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex flex-col md:items-start space-x-4 md:space-x-0  ">
            <div className="flex ">
              <motion.div
                className={`p-2 rounded-2xl w-16 h-16 bg-white/70 border border-white/50 shadow-xl grid place-items-center ${glass}`}
                whileHover={{ rotate: 2, scale: 1.02 }}
              >
                <img
                  src="/SALOGO-black.png"
                  alt="ASA Logo"
                  className="object-contain"
                />
              </motion.div>
              <div className="inline-block ml-2 mt-1 md:mt-3">
                <h1 className="text-xl font-semibold text-gray-800 tracking-normal leading-tight w-48  md:w-80">
                  Anunay Sharda & Associates
                </h1>
                <p className="text-[#018f95] md:text-sm text-[13px] font-light tracking-widest hidden md:block">
                  Strategic Business Solutions
                </p>
              </div>
            </div>
            <p className="text-[#018f95] md:text-sm text-[13px] font-light tracking-widest md:hidden ml-1">
              Strategic Business Solutions
            </p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <div className="">
            <div className="text-gray-700">
              {getTimeBasedGreeting()},{" "}
              <span className="text-[#018f95] font-medium">{name}</span>
            </div>
            <div className="text-gray-500 text-sm italic">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="bg-transparent">
        <div className="w-full ">
          <button
            className="md:hidden flex items-center justify-between w-full bg-indigo-600 text-white px-6 py-3 rounded-md shadow"
            onClick={() => setShowStats(!showStats)}
            type="button"
          >
            <span className="text-sm">Show Statistics</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition ${showStats ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div className="hidden md:grid md:grid-cols-4 gap-4 mt-0">
            <StatCard
              pillLabel="Total Task"
              variant="blue"
              label="All Tasks"
              value={stats.TotalTask}
              icon={<ClipboardList />}
            />
            <StatCard
              pillLabel="Completed"
              variant="green"
              label="Done"
              value={stats.Completed}
              icon={<CheckCircle />}
            />
            <StatCard
              pillLabel="Progress"
              variant="gray"
              label="In progress"
              value={stats.Progress}
              icon={<Clock />}
            />
            <StatCard
              pillLabel="Overdue"
              variant="red"
              label="Past Due"
              value={stats.Overdue}
              icon={<AlertCircle />}
            />
          </div>

          <AnimatePresence>
            {showStats && (
              <motion.div
                className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 md:hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <StatCard
                  pillLabel="Total Task"
                  variant="blue"
                  label="All Tasks"
                  value={stats.TotalTask}
                  icon={<ClipboardList />}
                />
                <StatCard
                  pillLabel="Completed"
                  variant="green"
                  label="Done"
                  value={stats.Completed}
                  icon={<CheckCircle />}
                />
                <StatCard
                  pillLabel="Progress"
                  variant="gray"
                  label="In progress"
                  value={stats.Progress}
                  icon={<Clock />}
                />
                <StatCard
                  pillLabel="Overdue"
                  variant="red"
                  label="Past Due"
                  value={stats.Overdue}
                  icon={<AlertCircle />}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main */}
      <div className="md:mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
        <div className="sticky top-0 max-h-[90vh] space-y-4">
          <TodaysList
            ref={todaysListRef}
            rows={todaysRows}
            events={events}
            setEvents={setEvents}
            userId={userId}
          />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            <TaskOverview />
          </motion.div>
        </div>

        <div className="lg:border-l lg:border-white/50 lg:pl-6 hidden md:block max-h-[90vh] overflow-y-auto">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
          >
            <StickyNotesDashboard />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Stat Card: glow strictly BEHIND the card ---------- */
const StatCard = ({ pillLabel, variant = "gray", label, value, icon }) => {
  const pill =
    {
      blue: "bg-indigo-100 text-indigo-700 border border-indigo-200",
      green: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      gray: "bg-amber-200 text-amber-700 border border-amber-300",
      red: "bg-rose-100 text-rose-700 border border-rose-200",
    }[variant] || "bg-gray-100 text-gray-700 border border-gray-200";

  // gradient colors for the BACK glow
  const glowGradient =
    {
      blue: "from-indigo-500/45 via-indigo-400/35 to-cyan-300/30",
      green: "from-emerald-500/45 via-emerald-400/35 to-lime-300/30",
      gray: "from-amber-500/45 via-amber-400/35 to-orange-300/30",
      red: "from-rose-500/45 via-rose-400/35 to-red-300/30",
    }[variant] || "from-indigo-400/40 via-indigo-300/30 to-cyan-300/25";

  // tinted drop shadow on the card itself (subtle)
  const hoverShadow =
    {
      blue: "hover:shadow-[0_22px_30px_rgba(79,70,229,0.28)]",
      green: "hover:shadow-[0_22px_30px_rgba(16,185,129,0.28)]",
      gray: "hover:shadow-[0_22px_30px_rgba(245,158,11,0.28)]",
      red: "hover:shadow-[0_22px_30px_rgba(244,63,94,0.28)]",
    }[variant] || "hover:shadow-[0_22px_30px_rgba(99,102,241,0.24)]";

  // count-up
  const numRef = useRef(null);
  const isInView = useInView(numRef, { once: true, margin: "-20% 0px" });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const target = Number(value || 0);
    const duration = 700;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, isInView]);

  return (
    <div className="relative group">
      {/* BEHIND layer: stays strictly behind the card */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-2 rounded-3xl -z-10 opacity-0 group-hover:opacity-100 transition duration-300 blur-2xl bg-gradient-to-br ${glowGradient}`}
        // keep behind & outside the card; no overlay on content
        style={{ filter: "saturate(115%)" }}
      />
      <motion.div
        className={`relative rounded-2xl ${glass} px-6 py-4 transition ${hoverShadow} overflow-visible`}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
      >
        <div className="relative flex items-center justify-between">
          <span className={`text-[11px] px-2 py-1 rounded-full ${pill}`}>
            {pillLabel}
          </span>
          <motion.div
            className="grid place-items-center"
            initial={{ rotate: -6, scale: 0.95 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 12 }}
          >
            {icon}
          </motion.div>
        </div>

        <p
          ref={numRef}
          className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900"
        >
          {display}
        </p>
        <p className="mt-1 text-xs text-gray-600">{label}</p>
      </motion.div>
    </div>
  );
};

<<<<<<< HEAD
export default Dashboard;
=======
export default Dashboard;
>>>>>>> 37de8b36c2864a74f920419a70aae2f8292902fd
