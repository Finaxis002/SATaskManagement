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
import { AnimatePresence, useInView, motion } from "framer-motion";
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
      try {
        document.body.removeChild(el);
      } catch {}
    };
  }, []);
  return createPortal(children, elRef.current);
}

/* ------------------ Enhanced Styles ------------------ */
// Mobile par backdrop-blur hata diya (md+ pe enable)
const glass =
  "md:backdrop-blur-xl bg-white/80 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.06)]";

const endT = endOfToday();
const startT = startOfToday();

/* ---------- Enhanced Quick Actions Floating Panel ---------- */
const QuickActionsPanel = ({ onCreateEvent, stats }) => {
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
      label: "Sticky Notes ",
      action: () => console.log("Create note"),
      color: "from-emerald-500 to-green-600",
      shortcut: "Alt + N",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick Actions Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 space-y-3"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                onClick={action.action}
                className={`group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${action.color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px]`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3 flex-1">
                  {action.icon}
                  <span className="font-semibold text-sm">{action.label}</span>
                </div>
                <span className="text-xs opacity-75 font-mono">
                  {action.shortcut}
                </span>
                <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${glass}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <Plus className="h-6 w-6" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Notification Badge */}
        {/* {stats && stats.Overdue > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-xs font-bold text-white">{stats.Overdue}</span>
          </motion.div>
        )} */}
      </motion.button>
    </div>
  );
};

/* ---------- Enhanced Progress Ring Component ---------- */
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
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className={colorClasses[color]}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-600">of {maxValue}</span>
      </div>
    </div>
  );
};

/* ---------- Enhanced Productivity Insights Panel ---------- */
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
      trend:
        completionRate >= 75 ? "up" : completionRate >= 50 ? "stable" : "down",
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
      trend: progress <= 3 ? "good" : "high",
      color: progress <= 3 ? "text-blue-600" : "text-amber-600",
    },
    {
      title: "Overdue Items",
      value: overdue,
      trend: overdue === 0 ? "excellent" : "needs-attention",
      color: overdue === 0 ? "text-green-600" : "text-red-600",
    },
  ];

  return (
    <motion.div
      className={`${glass} rounded-3xl p-6 shadow-xl border-0 ring-1 ring-white/20`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
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
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            className="text-center p-4 rounded-xl bg-white/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <div className={`text-2xl font-bold ${insight.color} mb-1`}>
              {insight.value}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {insight.title}
            </div>
          </motion.div>
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
    </motion.div>
  );
};

/* ---------- Compact Weather Widget (safe for iOS) ---------- */
const CompactWeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=23.2599&longitude=77.4126&current_weather=true`
        );
        const cw =
          (response && response.data && response.data.current_weather) || {};
        const weatherData = {
          location: "Bhopal, MP",
          temperature: cw.temperature,
          condition: cw.weathercode,
          windSpeed: cw.windspeed,
        };
        if (alive) {
          setWeather(weatherData);
          setLoading(false);
        }
      } catch (err) {
        if (alive) {
          setError("Failed to fetch weather data.");
          setLoading(false);
        }
      }
    };
    fetchWeather();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <motion.div
        className={`${glass} rounded-2xl p-4 shadow-lg border-0 ring-1 ring-white/20`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className={`${glass} rounded-2xl p-4 shadow-lg border-0 ring-1 ring-white/20`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center text-red-600">{error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`${glass} rounded-2xl pt-3 pl-4 pr-4 shadow-lg border-0 ring-1 ring-white/20 w-55 hidden md:block`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8 }}
    >
      <div className="flex items-center justify-between ">
        <div className="flex gap-2">
          <h3 className="text-sm font-bold text-gray-900">Weather</h3>
          <p className="text-xs text-gray-600 pt-0.5">
            {weather ? weather.location : ""}
          </p>
        </div>
        <div className=" p-2 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500">
          <svg
            className="h-4 w-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="mt-[-8px]">
          <div className="text-xl font-bold text-gray-900 mb-1">
            {weather ? weather.temperature : "--"}°C
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ---------- Enhanced Upcoming Events Preview ---------- */
const UpcomingEvents = ({ events }) => {
  const [isOpen, setIsOpen] = useState(false);

  const safeEvents = Array.isArray(events) ? events : [];
  const upcomingEvents = safeEvents
    .filter(
      (e) => e && e.startDateTime && parseISO(e.startDateTime) > new Date()
    )
    .slice(0, 3)
    .map((e) => ({
      title: e.title || e.summary,
      time: format(parseISO(e.startDateTime), "MMM d, h:mm a"),
      timeUntil: formatDistanceToNow(parseISO(e.startDateTime)),
    }));

  const toggleEventsVisibility = () => setIsOpen((prev) => !prev);

  return (
    <motion.div
      className={`${glass} rounded-3xl p-6 shadow-xl hidden md:block  border-0 ring-1 ring-white/20 overflow-hidden transition-all duration-500`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Upcoming</h3>
            <p className="text-sm text-gray-600">Next events</p>
          </div>
        </div>

        <button
          onClick={toggleEventsVisibility}
          className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition-all duration-300"
          type="button"
        >
          {isOpen ? "Hide" : "Show"} Events
        </button>
      </div>

      <div className="space-y-3">
        {isOpen && upcomingEvents.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No upcoming events
          </div>
        ) : (
          isOpen &&
          upcomingEvents.map((event, index) => (
            <motion.div
              key={`${event.title}-${index}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/70 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate">
                  {event.title}
                </div>
                <div className="text-xs text-gray-600">
                  {event.time} • in {event.timeUntil}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

/* ------------------ Enhanced TodaysList ------------------ */
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
  
  // Add state for tracking expanded descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  // Function to toggle description visibility
  const toggleDescription = (rowIndex) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(rowIndex)) {
      newExpanded.delete(rowIndex);
    } else {
      newExpanded.add(rowIndex);
    }
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
      if (!newEvent.title || !newEvent.title.trim()) {
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
        if (typeof setEvents === "function") {
          setEvents((prev) => {
            const p = Array.isArray(prev) ? prev : [];
            const next = [...p, optimisticItem];
            saveCache(evKey(userId), next);
            return next;
          });
        }
      } else {
        if (typeof setEvents === "function") {
          setEvents((prev) => {
            const p = Array.isArray(prev) ? prev : [];
            const next = p.map((e) =>
              e && e._id === editingEventId
                ? { ...e, ...payload, title: payload.summary, optimistic: true }
                : e
            );
            saveCache(evKey(userId), next);
            return next;
          });
        }
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
      const saved = (data && (data.event || data)) || {};

      if (typeof setEvents === "function") {
        setEvents((prev) => {
          const p = Array.isArray(prev) ? prev : [];
          let next;
          if (!isEdit) {
            next = p.map((e) =>
              e && e.tempId === tempId ? { ...saved, optimistic: false } : e
            );
          } else {
            next = p.map((e) =>
              e && e._id === editingEventId
                ? { ...e, ...saved, optimistic: false }
                : e
            );
          }
          saveCache(evKey(userId), next);
          return next;
        });
      }
    } catch (err) {
      if (!(err && err.message === "Google not linked")) {
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
    <motion.div
      className={`mb-4 rounded-3xl ${glass} overflow-hidden flex flex-col relative shadow-2xl border-0 ring-1 ring-white/30`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Header */}
      <div className="top-0 z-20 px-3 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-[#E6E6FA] via-[#D4D9F2] to-[#B3D9FF] relative overflow-hidden rounded-b-2xl">
        <div className="absolute inset-0 opacity-20 sm:opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 01-2 2v12a2 2 0 002 2z"
                />
              </svg>
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

          <motion.button
            onClick={() => {
              setEditingEventId(null);
              setNewEvent({ ...DEFAULT_EVENT });
              setShowEventPopup(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 sm:py-2.5 text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold active:scale-[0.98]"
            type="button"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02, y: -1 }}
            title="Shortcut: Alt + A"
            aria-label="Add Event"
          >
            <FaPlus className="text-base sm:text-xs" />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add Event</span>
          </motion.button>
        </div>
      </div>

      {/* Desktop List */}
      <div
        className="min-h-0 max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hidden md:block bg-gradient-to-b from-white to-slate-50"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {safeRows.length === 0 ? (
          <motion.div
            className="px-6 py-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 opacity-20">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-full h-full text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 01-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-slate-500 font-medium text-lg">
              No events scheduled
            </p>
            <p className="text-slate-400 text-sm mt-1">Your day is free!</p>
          </motion.div>
        ) : (
          <div className="p-4 space-y-3">
            <AnimatePresence initial={false}>
              {safeRows.map((row, i) => (
                <motion.div
                  key={`${row.startTime}-${i}`}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  whileHover={{ y: -2 }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>

                  <div className="p-5 pl-7">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
                          <FaCalendarAlt className="text-white text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                            {row.title}
                          </h4>
                          {/* Date and Time displayed side by side */}
                          <div className="flex gap-3 text-slate-600 text-sm">
                            <span>{row.date}</span> {/* Display the date */}
                            {row.tag === "Event" && (
                              <span>
                                {row.startTime} - {row.endTime}
                              </span> // Display event start and end time
                            )}
                            {row.tag === "Reminder" && (
                              <span>{row.time || "No time set"}</span> // Display reminder time or fallback
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
                        <motion.button
                          onClick={handleArrowClick}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors group/btn"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                        >
                          <ArrowRight className="h-4 w-4 text-slate-500 group-hover/btn:text-slate-700 transition-colors" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Description */}
                    {row.description && (
                      <div className="flex items-start gap-3 mt-3 pt-3 border-t border-slate-100">
                        <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md shadow-sm">
                          <FaAlignLeft className="text-white text-xs" />
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed flex-1">
                          {row.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Mobile view */}
      <div
        className="min-h-0 max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 md:hidden bg-gradient-to-b from-white to-slate-50"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {safeRows.length === 0 ? (
          <motion.div
            className="px-6 py-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 mx-auto mb-3 opacity-20">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-full h-full text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 01-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No events today</p>
            <p className="text-slate-400 text-sm">Enjoy your free time!</p>
          </motion.div>
        ) : (
          <div className="p-3 space-y-2">
            <AnimatePresence initial={false}>
              {safeRows.map((row, i) => (
                <motion.div
                  key={`${row.startTime}-${i}`}
                  className="group bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="p-1.5 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-md shadow-sm">
                          <FaCalendarAlt className="text-white text-xs" />
                        </div>
                        <h4 className="text-base font-bold text-slate-800 truncate">
                          {row.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 ml-2">
                        {row.tag && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${tagCls(
                              row.color
                            )}`}
                          >
                            {row.tag}
                          </span>
                        )}
                        
                        {/* Description toggle button - only show if description exists */}
                        {row.description && (
                          <motion.button
                            onClick={() => toggleDescription(i)}
                            className={`p-1.5 rounded-md transition-colors ${
                              expandedDescriptions.has(i) 
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
                                : 'bg-slate-100 hover:bg-slate-200'
                            }`}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                          >
                            <FaAlignLeft className={`text-xs ${
                              expandedDescriptions.has(i) ? 'text-white' : 'text-slate-500'
                            }`} />
                          </motion.button>
                        )}
                        
                        <motion.button
                          onClick={handleArrowClick}
                          className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
                          whileTap={{ scale: 0.95 }}
                          type="button"
                        >
                          <ArrowRight className="h-3 w-3 text-slate-500" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Date and Time displayed vertically for Mobile */}
                    <div className="flex flex-col gap-2 text-slate-600 text-sm">
                      <span className="font-semibold text-gray-800">
                        {row.date}
                      </span>{" "}
                      {/* Display the date */}
                      {row.tag === "Event" && (
                        <span className="text-sm">
                          {row.startTime} - {row.endTime}
                        </span> // Display event start and end time
                      )}
                      {row.tag === "Reminder" && (
                        <span className="text-sm">
                          {row.time || "No time set"}
                        </span> // Display reminder time or fallback
                      )}
                    </div>

                    {/* Collapsible Description */}
                    <AnimatePresence>
                      {row.description && expandedDescriptions.has(i) && (
                        <motion.div
                          className="mt-3"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="p-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded shadow-sm">
                              <FaAlignLeft className="text-white text-xs" />
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed flex-1">
                              {row.description}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
                <h3 className="text-xl font-semibold  text-gray-800 mb-4">
                  {editingEventId ? "Update Event" : "Create Event"}
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
                    Snooze Before:
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

                <div
                  className="mb-4 max-h-[20vh] overflow-y-auto"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
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

/* ---------- Enhanced Dashboard ---------- */
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
      date: format(parseISO(e.startDateTime), "MMM d, yyyy"), // Ensure date is formatted correctly
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
      date: format(parseISO(r.datetime), "MMM d, yyyy"), // Ensure date is displayed
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
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    const token = params.get("token");
    const uid = params.get("user_id");
    if (email) lsSet(K.GOOGLE_EMAIL, email);
    if (token) lsSet(K.TOKEN, token);
    if (uid) lsSet(K.USER_ID, uid);
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
    saveCache(evKey(userId), Array.isArray(events) ? events : []);
  }, [events, userId]);

  useEffect(() => {
    saveCache(rmKey(userId), Array.isArray(reminders) ? reminders : []);
  }, [reminders, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
            <div className="absolute inset-2 h-12 w-12 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin animation-delay-150" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Loading Dashboard
            </h3>
            <p className="text-gray-600">Preparing your workspace...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Effects — MOBILE DISABLED */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-300/30 to-blue-300/30 blur-3xl"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-300/30 to-teal-300/30 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-rose-300/20 to-pink-300/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [-20, 20, -20] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Content */}
      <div
        className="relative z-10 pb-24 overflow-y-auto px-4 sm:px-6 lg:px-8"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Header */}
        <motion.div
          className="py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mt-3 gap-3">
            <motion.div
              className={`relative  p-4 rounded-2xl ${glass} shadow-xl sm:-mt-1 -mt-10`}
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl" />
              <img
                src="/SALOGO-black.png"
                alt="ASA Logo"
                className="relative h-6 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain"
              />
            </motion.div>

            <div>
              <motion.h1
                className="text-xl lg:text-3xl sm:-mt-1 -mt-8 font-bold text-gray-900 tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Anunay Sharda & Associate
              </motion.h1>
              <motion.p
                className="text-[#018f95] text-sm font-semibold tracking-wider uppercase hidden md:block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Strategic Business Solutions
              </motion.p>
            </div>
          </div>
          <p className="text-[#018f95] mt-[-6px] md:text-sm text-[13px] font-light tracking-widest md:hidden ml-1">
            Strategic Business Solutions
          </p>

          <div className="flex gap-2 ">
            <CompactWeatherWidget />
            <motion.div
              className={`px-6 py-4 rounded-2xl ${glass} shadow-lg`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="text-left">
                <h2 className="text-lg font-bold mr-10 text-gray-800">
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
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile stats toggle */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.button
            className="lg:hidden w-full mb-4 flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg"
            onClick={() => setShowStats(!showStats)}
            type="button"
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-semibold">View Statistics</span>
            <motion.div
              animate={{ rotate: showStats ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showStats && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StatCard
                  pillLabel="Total"
                  variant="blue"
                  label="All Tasks"
                  value={stats.TotalTask}
                  icon={<ClipboardList className="h-5 w-5" />}
                />
                <StatCard
                  pillLabel="Done"
                  variant="green"
                  label="Completed"
                  value={stats.Completed}
                  icon={<CheckCircle className="h-5 w-5" />}
                />
                <StatCard
                  pillLabel="Active"
                  variant="orange"
                  label="In Progress"
                  value={stats.Progress}
                  icon={<Clock className="h-5 w-5" />}
                />
                <StatCard
                  pillLabel="Late"
                  variant="red"
                  label="Overdue"
                  value={stats.Overdue}
                  icon={<AlertCircle className="h-5 w-5" />}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
          {/* Left Column */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {/* Desktop stats row */}
            <motion.div
              className="hidden lg:grid lg:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <StatCard
                pillLabel="Total"
                variant="blue"
                label="All Tasks"
                value={stats.TotalTask}
                icon={<ClipboardList className="h-4 w-4" />}
                isCompact
              />
              <StatCard
                pillLabel="Done"
                variant="green"
                label="Completed"
                value={stats.Completed}
                icon={<CheckCircle className="h-4 w-4" />}
                isCompact
              />
              <StatCard
                pillLabel="Active"
                variant="orange"
                label="In Progress"
                value={stats.Progress}
                icon={<Clock className="h-4 w-4" />}
                isCompact
              />
              <StatCard
                pillLabel="Late"
                variant="red"
                label="Overdue"
                value={stats.Overdue}
                icon={<AlertCircle className="h-4 w-4" />}
                isCompact
              />
            </motion.div>

            <TodaysList
              ref={todaysListRef}
              rows={todaysRows}
              events={events}
              setEvents={setEvents}
              userId={userId}
            />

            <TaskOverview />
            <ProductivityInsights stats={stats} />
          </motion.div>

          {/* Right Column */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="sticky top-8 space-y-4">
              <UpcomingEvents events={events} />

              <div className="hidden xl:block md:block">
                <StickyNotesDashboard />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Sticky Notes */}
        <motion.div
          className="xl:hidden mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <StickyNotesDashboard />
        </motion.div>
      </div>

      {/* Quick Actions Panel */}
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

/* ---------- Enhanced Stat Card ---------- */
const StatCard = ({
  pillLabel,
  variant = "gray",
  label,
  value,
  icon,
  isCompact = false,
}) => {
  const variants = {
    blue: {
      pill: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/60",
      glow: "from-blue-500/20 via-indigo-500/15 to-cyan-500/10",
      shadow: "hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)]",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    green: {
      pill: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/60",
      glow: "from-emerald-500/20 via-green-500/15 to-teal-500/10",
      shadow: "hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)]",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    },
    orange: {
      pill: "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/60",
      glow: "from-amber-500/20 via-orange-500/15 to-yellow-500/10",
      shadow: "hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)]",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
    red: {
      pill: "bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border border-rose-200/60",
      glow: "from-rose-500/20 via-red-500/15 to-pink-500/10",
      shadow: "hover:shadow-[0_20px_40px_rgba(244,63,94,0.15)]",
      iconBg: "bg-gradient-to-br from-rose-500 to-red-600",
    },
  };

  const config = variants[variant] || variants.blue;

  const numRef = useRef(null);
  const isInView = useInView(numRef, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const target = Number(value || 0);
    const duration = 1000;
    const start = performance.now();
    let raf;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (t) => {
      const elapsed = (t - start) / duration;
      const progress = Math.min(1, elapsed);
      const eased = easeOutCubic(progress);
      setDisplay(Math.round(target * eased));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, isInView]);

  const cardPadding = isCompact ? "p-4" : "p-6";
  const textSize = isCompact ? "text-2xl" : "text-4xl";
  const iconSize = isCompact ? "p-2" : "p-2.5";
  const glowInset = isCompact ? "-inset-2" : "-inset-3";

  return (
    <motion.div
      className="group relative"
      whileHover={{ y: isCompact ? -4 : -6 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div
        className={`absolute ${glowInset} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl bg-gradient-to-br ${config.glow} -z-10`}
      />
      <div
        className={`relative ${glass} rounded-2xl ${cardPadding} transition-all duration-300 ${config.shadow} border-0 ring-1 ring-white/20`}
      >
        <div
          className={`flex items-center justify-between ${
            isCompact ? "mb-3" : "mb-4"
          }`}
        >
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold ${config.pill}`}
          >
            {pillLabel}
          </span>
          <motion.div
            className={`${iconSize} rounded-lg ${config.iconBg} text-white shadow-md`}
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {icon}
          </motion.div>
        </div>

        <motion.div
          ref={numRef}
          className={`${textSize} font-black text-gray-900 ${
            isCompact ? "mb-1" : "mb-2"
          } tracking-tight`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {display}
        </motion.div>

        <p
          className={`${
            isCompact ? "text-xs" : "text-sm"
          } font-semibold text-gray-600`}
        >
          {label}
        </p>
        <div
          className={`absolute bottom-0 right-0 ${
            isCompact ? "w-16 h-16" : "w-24 h-24"
          } bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl -z-10`}
        />
      </div>
    </motion.div>
  );
};

export default Dashboard;