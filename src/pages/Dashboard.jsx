// src/pages/Dashboard.jsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import useSocketSetup from "../hook/useSocketSetup";
import useStickyNotes from "../hook/useStickyNotes";
import StickyNotesDashboard from "../Components/notes/StickyNotesDashboard";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  FaCalendarAlt,
  FaClock,
  FaTimes,
  FaPlus,
  FaAlignLeft,
} from "react-icons/fa";
import {
  isToday,
  parseISO,
  format,
  startOfToday,
  endOfToday,
  formatDistanceToNow,
} from "date-fns";
import TaskOverview from "../Components/TaskOverview";
import axios from "axios";

/* ------------------ cache & helpers ------------------ */
const K = {
  TOKEN: "authToken",
  USER: "user",
  USER_ID: "userId",
  GOOGLE_EMAIL: "googleEmail",
};

function lsGet(k) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function lsSet(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch {}
}
const evKey = (uid) => `events_cache__${uid || "anon"}`;
const rmKey = (uid) => `reminders_cache__${uid || "anon"}`;

const loadCache = (key) => {
  try {
    const raw = lsGet(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const saveCache = (key, list) => {
  try {
    lsSet(key, JSON.stringify(list || []));
  } catch {}
};
const mergeById = (serverList = [], cachedList = []) => {
  const out = [];
  const byId = new Map();
  for (const it of cachedList) {
    const id = it && (it._id || it.tempId);
    if (id) byId.set(id, it);
  }
  for (const it of serverList) {
    const id = it && (it._id || it.tempId);
    if (id) byId.set(id, { ...(byId.get(id) || {}), ...it, optimistic: false });
  }
  if ((serverList || []).length === 0) return cachedList;
  byId.forEach((v) => out.push(v));
  return out;
};

function getTimeBasedGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

const openGoogleConnect = () => {
  const raw = lsGet(K.USER);
  const u = raw ? JSON.parse(raw) : null;
  const uid = (u && u.userId) || lsGet(K.USER_ID);
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
  const token = lsGet(K.TOKEN);
  const email = lsGet(K.GOOGLE_EMAIL);
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

/* ------------------ Portal ------------------ */
function ModalPortal({ children }) {
  const elRef = useRef(null);
  if (!elRef.current) elRef.current = document.createElement("div");

  useEffect(() => {
    const el = elRef.current;
    el.setAttribute("id", "portal-root");
    document.body.appendChild(el);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      try {
        document.body.removeChild(el);
      } catch {}
    };
  }, []);

  return createPortal(children, elRef.current);
}

/* ------------------ Shared Styles ------------------ */
const glass =
  "md:backdrop-blur-xl bg-white/80 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.06)]";
const endT = endOfToday();
const startT = startOfToday();

/* ------------------ Quick Actions Panel ------------------ */
const QuickActionsPanel = ({ onCreateEvent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const quickActions = [
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "New Event",
      action: onCreateEvent,
      color: "from-purple-500 to-blue-600",
      shortcut: "Alt + A",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Set Reminder",
      action: () => console.log("Create reminder"),
      color: "from-amber-500 to-orange-600",
      shortcut: "Alt + R",
    },
    {
      icon: <Plus className="h-5 w-5" />,
      label: "Sticky Notes",
      action: () => console.log("Create note"),
      color: "from-emerald-500 to-green-600",
      shortcut: "Alt + N",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${action.color} text-white rounded-xl shadow-lg min-w-[160px]`}
            >
              <div className="flex items-center gap-3 flex-1">
                {action.icon}
                <span className="font-semibold text-sm">{action.label}</span>
              </div>
              <span className="text-xs opacity-75 font-mono">
                {action.shortcut}
              </span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg flex items-center justify-center ${glass}`}
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};

/* ------------------ Progress Ring ------------------ */
const ProgressRing = ({
  value,
  maxValue,
  size = 120,
  strokeWidth = 8,
  color = "purple",
}) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    purple: "stroke-purple-500",
    blue: "stroke-blue-500",
    green: "stroke-emerald-500",
    orange: "stroke-amber-500",
    red: "stroke-rose-500",
  };

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className={colorClasses[color]}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-600">of {maxValue}</span>
      </div>
    </div>
  );
};

/* ------------------ Productivity Insights ------------------ */
const ProductivityInsights = ({ stats }) => {
  const total = stats ? stats.TotalTask : 0;
  const completed = stats ? stats.Completed : 0;
  const progress = stats ? stats.Progress : 0;
  const overdue = stats ? stats.Overdue : 0;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  const insights = [
    {
      title: "Completion Rate",
      value: `${Math.round(completionRate)}%`,
      color:
        completionRate >= 75
          ? "text-green-600"
          : completionRate >= 50
          ? "text-amber-600"
          : "text-red-600",
    },
    {
      title: "Active Tasks",
      value: progress,
      color: progress <= 3 ? "text-blue-600" : "text-amber-600",
    },
    {
      title: "Overdue Items",
      value: overdue,
      color: overdue === 0 ? "text-green-600" : "text-red-600",
    },
  ];

  return (
    <div
      className={`${glass} rounded-3xl p-6 shadow-xl border-0 ring-1 ring-white/20`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Productivity Insights
          </h3>
          <p className="text-sm text-gray-600">Your performance overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {insights.map((insight) => (
          <div key={insight.title} className="text-center p-4 rounded-xl bg-white/50">
            <div className={`text-2xl font-bold ${insight.color} mb-1`}>
              {insight.value}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {insight.title}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <ProgressRing
          value={completed}
          maxValue={total}
          size={100}
          strokeWidth={6}
          color="green"
        />
      </div>
    </div>
  );
};


/* ------------------ TodaysList ------------------ */
const TodaysList = forwardRef(function TodaysList(
  { rows = [], setEvents, userId },
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

  const navigate = useNavigate();
  const handleArrowClick = () => navigate("/reminders");

  const [showEventPopup, setShowEventPopup] = useState(false);
  const [newEvent, setNewEvent] = useState({ ...DEFAULT_EVENT });
  const [editingEventId, setEditingEventId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  const toggleDescription = (rowIndex) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(rowIndex)) newExpanded.delete(rowIndex);
    else newExpanded.add(rowIndex);
    setExpandedDescriptions(newExpanded);
  };

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
    const token = params.get("token");
    const uid = params.get("user_id");
    if (email) lsSet(K.GOOGLE_EMAIL, email);
    if (token) lsSet(K.TOKEN, token);
    if (uid) lsSet(K.USER_ID, uid);
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

      const token = lsGet(K.TOKEN);
      const userEmail = lsGet(K.GOOGLE_EMAIL) || "";

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
      const tempId = `tmp_${Date.now()}`;

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
          const next = [...(Array.isArray(prev) ? prev : []), optimisticItem];
          saveCache(evKey(userId), next);
          return next;
        });
      } else {
        setEvents((prev) => {
          const p = Array.isArray(prev) ? prev : [];
          const next = p.map((e) =>
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
        alert(`Failed to save event (${res.status}). Kept locally.`);
        return;
      }

      const data = await res.json().catch(() => ({}));
      const saved = (data && (data.event || data)) || {};

      setEvents((prev) => {
        const p = Array.isArray(prev) ? prev : [];
        const next = p.map((e) =>
          e.tempId === tempId || e._id === editingEventId
            ? { ...e, ...saved, optimistic: false }
            : e
        );
        saveCache(evKey(userId), next);
        return next;
      });
    } catch (err) {
      if (err?.message !== "Google not linked")
        alert("Network error — Event stored locally.");
    } finally {
      setSaving(false);
      setShowEventPopup(false);
      setEditingEventId(null);
      setNewEvent({ ...DEFAULT_EVENT });
    }
  };

  const tagCls = (c) =>
    ({
      indigo: "bg-gradient-to-r from-indigo-500 to-blue-500 text-white",
      emerald: "bg-gradient-to-r from-emerald-500 to-green-500 text-white",
      amber: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
      rose: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
      gray: "bg-gradient-to-r from-gray-500 to-slate-500 text-white",
    }[c] || "bg-gradient-to-r from-gray-500 to-slate-500 text-white");

  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div
      className={`mb-4 rounded-3xl ${glass} overflow-hidden flex flex-col relative shadow-2xl border-0 ring-1 ring-white/30`}
    >
      {/* Header */}
      <div className="top-0 z-20 px-3 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-[#E6E6FA] via-[#D4D9F2] to-[#B3D9FF] relative overflow-hidden rounded-b-2xl">
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <FaCalendarAlt className="text-white text-sm" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-black truncate">
                Today's Events
              </h3>
              <p className="text-xs sm:text-sm text-black/80 truncate">
                Your schedule for today
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingEventId(null);
              setNewEvent({ ...DEFAULT_EVENT });
              setShowEventPopup(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 sm:py-2.5 text-sm rounded-xl shadow-lg font-semibold"
            type="button"
            title="Shortcut: Alt + A"
          >
            <FaPlus className="text-base sm:text-xs" />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </div>
      </div>

      {/* Desktop List */}
      <div className="min-h-0 max-h-[40vh] overflow-y-auto hidden md:block bg-gradient-to-b from-white to-slate-50">
        {safeRows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-slate-500 font-medium text-lg">
              No events scheduled
            </p>
            <p className="text-slate-400 text-sm mt-1">Your day is free!</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {safeRows.map((row, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>
                <div className="p-5 pl-7">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
                        <FaCalendarAlt className="text-white text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-slate-800 truncate">
                          {row.title}
                        </h4>
                        <div className="flex gap-3 text-slate-600 text-sm">
                          <span>{row.date}</span>
                          {row.tag === "Event" && (
                            <span>
                              {row.startTime} - {row.endTime}
                            </span>
                          )}
                          {row.tag === "Reminder" && (
                            <span>{row.time || "No time set"}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {row.tag && (
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${tagCls(
                            row.color
                          )}`}
                        >
                          {row.tag}
                        </span>
                      )}
                      <button
                        onClick={handleArrowClick}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200"
                        type="button"
                      >
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                  </div>

                  {row.description && (
                    <div className="flex items-start gap-3 mt-3 pt-3 border-t border-slate-100">
                      <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md">
                        <FaAlignLeft className="text-white text-xs" />
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed flex-1">
                        {row.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">
            {safeRows.length} event{safeRows.length !== 1 ? "s" : ""} scheduled
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-500">Live</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showEventPopup && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md sm:max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
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
                {editingEventId ? "Update Event" : "Create Event"}
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

              <div className="flex flex-col sm:flex-row sm:gap-4 mb-4 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt />
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                    className="border border-gray-300 rounded p-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FaClock />
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        startTime: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded p-2"
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
                    className="border border-gray-300 rounded p-2"
                  />
                </div>
              </div>

              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Snooze Before
              </label>
              <select
                value={newEvent.snoozeBefore}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, snoozeBefore: e.target.value })
                }
                className="w-full border border-gray-300 rounded p-2 mb-4"
              >
                {[5, 10, 15, 20, 25, 30, 45, 60].map((m) => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </select>

              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Guests
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

              <button
                onClick={saveEvent}
                disabled={saving}
                className={`w-full mt-4 ${
                  saving
                    ? "bg-purple-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                } text-white py-2 rounded-md`}
                type="button"
              >
                {saving
                  ? "Saving..."
                  : editingEventId
                  ? "Save Changes"
                  : "Create Event"}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
});


/* ------------------ Main Dashboard ------------------ */
const Dashboard = () => {
  useSocketSetup();
  useStickyNotes(3);
  const { loading } = useSelector((s) => s.auth);

  const rawUser = lsGet(K.USER);
  const userObj = rawUser ? JSON.parse(rawUser) : null;
  const userId = (userObj && userObj.userId) || lsGet(K.USER_ID) || null;
  const name = (userObj && userObj.name) || "Guest";

  const [events, setEvents] = useState(() => loadCache(evKey(userId)));
  const [reminders, setReminders] = useState(() => loadCache(rmKey(userId)));
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({
    TotalTask: 0,
    Completed: 0,
    Progress: 0,
    Overdue: 0,
  });

  const location = useLocation();
  const navigate = useNavigate();

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

  const todayEventRows = (Array.isArray(events) ? events : [])
    .filter((e) => e && e.startDateTime && e.endDateTime)
    .filter((e) => {
      const s = parseISO(e.startDateTime);
      const en = parseISO(e.endDateTime);
      return s <= endT && en >= startT;
    })
    .map((e) => ({
      ts: parseISO(e.startDateTime).getTime(),
      startTime: format(parseISO(e.startDateTime), "h:mm a"),
      endTime: format(parseISO(e.endDateTime), "h:mm a"),
      title: e.title || e.summary || "Event",
      description: e.description || "No description available",
      date: format(parseISO(e.startDateTime), "MMM d, yyyy"),
      tag: "Event",
      color: "indigo",
      location: e.location || "—",
    }));

  const todayReminderRows = (Array.isArray(reminders) ? reminders : [])
    .filter((r) => r && r.datetime && isToday(parseISO(r.datetime)))
    .map((r) => ({
      ts: parseISO(r.datetime).getTime(),
      time: format(parseISO(r.datetime), "h:mm a"),
      title: r.text || "Reminder",
      tag: "Reminder",
      color: "amber",
      location: "—",
      date: format(parseISO(r.datetime), "MMM d, yyyy"),
    }));

  const todaysRows = useMemo(
    () => [...todayEventRows, ...todayReminderRows].sort((a, b) => a.ts - b.ts),
    [events, reminders]
  );

  const todaysListRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && String(e.key || "").toLowerCase() === "a") {
        e.preventDefault();
        if (
          todaysListRef.current &&
          typeof todaysListRef.current.openCreateEvent === "function"
        ) {
          todaysListRef.current.openCreateEvent();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("openEvent") === "1") {
      setTimeout(() => {
        if (
          todaysListRef.current &&
          typeof todaysListRef.current.openCreateEvent === "function"
        ) {
          todaysListRef.current.openCreateEvent();
        }
        navigate(location.pathname, { replace: true });
      }, 200);
    }
  }, [location, navigate]);

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
    saveCache(evKey(userId), Array.isArray(events) ? events : []);
  }, [events, userId]);
  useEffect(() => {
    saveCache(rmKey(userId), Array.isArray(reminders) ? reminders : []);
  }, [reminders, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Loading Dashboard
            </h3>
            <p className="text-gray-600">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      <div className="relative z-10 pb-24 overflow-y-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div className="flex items-center mt-3 gap-3">
            <div className={`relative p-4 rounded-2xl ${glass} shadow-xl`}>
              <img
                src="/SALOGO-black.png"
                alt="ASA Logo"
                className="relative h-8 w-10 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                Anunay Sharda & Associates
              </h1>
                
              <p className="text-[#018f95] text-sm font-semibold tracking-wider uppercase hidden md:block">
                Strategic Business Solutions
              </p>
            </div>
          </div>
          <p className="text-[#018f95] mt-[-6px] md:text-sm text-[13px] font-light tracking-widest md:hidden ml-1">
            Strategic Business Solutions
          </p>

          <div className="flex gap-2">
            <div
              className={`px-6 py-4 rounded-2xl ${glass} shadow-lg flex flex-col justify-center`}
            >
              <h2 className="text-lg font-bold text-gray-800">
                {getTimeBasedGreeting()},{" "}
                <span className="text-transparent text-xl bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  {name}
                </span>
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <button
            className="lg:hidden w-full mb-4 flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg"
            onClick={() => setShowStats(!showStats)}
            type="button"
          >
            <span className="font-semibold">View Statistics</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
          {showStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              <StatCard pillLabel="Total" variant="blue" label="All Tasks" value={stats.TotalTask} icon={<ClipboardList className="h-5 w-5" />} />
              <StatCard pillLabel="Done" variant="green" label="Completed" value={stats.Completed} icon={<CheckCircle className="h-5 w-5" />} />
              <StatCard pillLabel="Active" variant="orange" label="In Progress" value={stats.Progress} icon={<Clock className="h-5 w-5" />} />
              <StatCard pillLabel="Late" variant="red" label="Overdue" value={stats.Overdue} icon={<AlertCircle className="h-5 w-5" />} />
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="hidden lg:grid lg:grid-cols-4 gap-4">
              <StatCard pillLabel="Total" variant="blue" label="All Tasks" value={stats.TotalTask} icon={<ClipboardList className="h-4 w-4" />} />
              <StatCard pillLabel="Done" variant="green" label="Completed" value={stats.Completed} icon={<CheckCircle className="h-4 w-4" />} />
              <StatCard pillLabel="Active" variant="orange" label="In Progress" value={stats.Progress} icon={<Clock className="h-4 w-4" />} />
              <StatCard pillLabel="Late" variant="red" label="Overdue" value={stats.Overdue} icon={<AlertCircle className="h-4 w-4" />} />
            </div>

            <TodaysList ref={todaysListRef} rows={todaysRows} setEvents={setEvents} userId={userId} />
            <TaskOverview />
            <ProductivityInsights stats={stats} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="sticky top-8 space-y-4">
              <StickyNotesDashboard />
            </div>
          </div>
        </div>

        {/* Mobile Sticky Notes */}
        <div className="xl:hidden mt-8">
          <StickyNotesDashboard />
        </div>
      </div>

      <QuickActionsPanel
        onCreateEvent={() => {
          if (
            todaysListRef.current &&
            typeof todaysListRef.current.openCreateEvent === "function"
          ) {
            todaysListRef.current.openCreateEvent();
          }
        }}
        stats={stats}
      />
    </div>
  );
};

/* ------------------ Stat Card ------------------ */
const StatCard = ({ pillLabel, variant = "gray", label, value, icon }) => {
  const variants = {
    blue: {
      pill: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/60",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    green: {
      pill: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/60",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    },
    orange: {
      pill: "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/60",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
    red: {
      pill: "bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border border-rose-200/60",
      iconBg: "bg-gradient-to-br from-rose-500 to-red-600",
    },
  };

  const config = variants[variant] || variants.blue;

  return (
    <div className={`relative ${glass} rounded-2xl p-6 border-0 ring-1 ring-white/20 shadow`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${config.pill}`}>
          {pillLabel}
        </span>
        <div className={`p-2.5 rounded-lg ${config.iconBg} text-white shadow-md`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
        {value}
      </div>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
    </div>
  );
};

export default Dashboard;
