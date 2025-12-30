import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  memo,
  useCallback,
  lazy,
  Suspense,
  startTransition,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import useSocketSetup from "../hook/useSocketSetup";
import useStickyNotes from "../hook/useStickyNotes";
import {
  ArrowRight,
  Loader2,
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
} from "date-fns";

// ✅ Import Support Component
import Support from "./Support";

// Lazy load heavy components
const StickyNotesDashboard = lazy(() => import("../Components/notes/StickyNotesDashboard"));
const TaskOverview = lazy(() => import("../Components/TaskOverview"));
const ProductivityInsights = lazy(() => import("./ProductivityInsights"));

/* ------------------ Constants ------------------ */
const K = {
  TOKEN: "authToken",
  USER: "user",
  USER_ID: "userId",
  GOOGLE_EMAIL: "googleEmail",
};

const GLASS_STYLE = "md:backdrop-blur-xl bg-white/80 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.06)]";
const END_TODAY = endOfToday();
const START_TODAY = startOfToday();

const TAG_COLORS = {
  indigo: "bg-gradient-to-r from-indigo-500 to-blue-500 text-white",
  emerald: "bg-gradient-to-r from-emerald-500 to-green-500 text-white",
  amber: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  rose: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
  gray: "bg-gradient-to-r from-gray-500 to-slate-500 text-white",
};

const STAT_VARIANTS = {
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

const DEFAULT_EVENT_TEMPLATE = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  guests: [""],
  snoozeBefore: "30",
};

const SNOOZE_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60];

/* ------------------ Utility Functions ------------------ */
const lsGet = (k) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

const lsSet = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

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
  if (!serverList.length) return cachedList;
  
  const byId = new Map();
  cachedList.forEach((it) => {
    const id = it?._id || it?.tempId;
    if (id) byId.set(id, it);
  });
  
  serverList.forEach((it) => {
    const id = it?._id || it?.tempId;
    if (id) byId.set(id, { ...(byId.get(id) || {}), ...it, optimistic: false });
  });
  
  return Array.from(byId.values());
};

const getTimeBasedGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
};

const openGoogleConnect = () => {
  const raw = lsGet(K.USER);
  const u = raw ? JSON.parse(raw) : null;
  const uid = u?.userId || lsGet(K.USER_ID);
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

/* ------------------ Loading Fallback ------------------ */
const ComponentLoader = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="h-8 w-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
  </div>
));

/* ------------------ Portal ------------------ */
let portalRoot = null;
const getPortalRoot = () => {
  if (!portalRoot) {
    portalRoot = document.createElement("div");
    portalRoot.setAttribute("id", "portal-root");
  }
  return portalRoot;
};

const ModalPortal = memo(({ children }) => {
  const elRef = useRef(getPortalRoot());

  useEffect(() => {
    const el = elRef.current;
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
});

/* ------------------ Draggable Support Button ------------------ */
const DraggableSupportButton = ({ onClick }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const buttonRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPosition({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80,
      });
    }
  }, []);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setHasMoved(false);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    
    let newX = e.clientX - dragStartPos.current.x;
    let newY = e.clientY - dragStartPos.current.y;

    const maxX = window.innerWidth - 70;
    const maxY = window.innerHeight - 70;
    
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX > maxX) newX = maxX;
    if (newY > maxY) newY = maxY;

    setPosition({ x: newX, y: newY });
    setHasMoved(true);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (!hasMoved) {
      onClick();
    }
  };

  return (
    <div
      ref={buttonRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: "none",
      }}
      className="fixed top-0 left-0 z-[9999] cursor-grab active:cursor-grabbing transition-transform duration-75"
    >
      <button
        type="button"
        className="relative h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 ring-4 ring-white/40 group overflow-hidden"
        title="Contact Support (Drag me!)"
      >
        {/* Animated background pulse */}
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
        
        {/* Icon */}
        <svg 
          className="relative z-10 w-8 h-8 transition-transform duration-300 group-hover:rotate-12" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
        
        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg animate-bounce">
          !
        </div>
      </button>
    </div>
  );
};

/* ------------------ Event Row ------------------ */
const EventRow = memo(({ row, handleArrowClick }) => {
  const tagClass = TAG_COLORS[row.color] || TAG_COLORS.gray;
  
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600" />
      <div className="p-5 pl-7">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
              <FaCalendarAlt className="text-white text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-bold text-slate-800 truncate">{row.title}</h4>
              <div className="flex gap-3 text-slate-600 text-sm">
                <span>{row.date}</span>
                {row.tag === "Event" && <span>{row.startTime} - {row.endTime}</span>}
                {row.tag === "Reminder" && <span>{row.time || "No time set"}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            {row.tag && (
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${tagClass}`}>
                {row.tag}
              </span>
            )}
            <button onClick={handleArrowClick} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200" type="button">
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
        {row.description && (
          <div className="flex items-start gap-3 mt-3 pt-3 border-t border-slate-100">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md">
              <FaAlignLeft className="text-white text-xs" />
            </div>
            <p className="text-slate-600 text-sm leading-relaxed flex-1">{row.description}</p>
          </div>
        )}
      </div>
    </div>
  );
});

/* ------------------ Event Modal Input Fields ------------------ */
const EventModalInputs = memo(({ newEvent, updateField }) => (
  <>
    <input
      type="text"
      placeholder="Event Title"
      value={newEvent.title}
      onChange={(e) => updateField('title', e.target.value)}
      className="w-full border border-gray-300 p-3 rounded-md mb-4 text-sm"
    />
    <textarea
      placeholder="Event Description"
      value={newEvent.description}
      onChange={(e) => updateField('description', e.target.value)}
      className="w-full border border-gray-300 p-3 rounded-md mb-4 text-sm"
    />
    <div className="flex flex-col sm:flex-row sm:gap-4 mb-4 gap-2 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <FaCalendarAlt />
        <input
          type="date"
          value={newEvent.date}
          onChange={(e) => updateField('date', e.target.value)}
          className="border border-gray-300 rounded p-2"
        />
      </div>
      <div className="flex items-center gap-2">
        <FaClock />
        <input
          type="time"
          value={newEvent.startTime}
          onChange={(e) => updateField('startTime', e.target.value)}
          className="border border-gray-300 rounded p-2"
        />
      </div>
      <div className="flex items-center gap-2">
        <span>to</span>
        <input
          type="time"
          value={newEvent.endTime}
          onChange={(e) => updateField('endTime', e.target.value)}
          className="border border-gray-300 rounded p-2"
        />
      </div>
    </div>
  </>
));

/* ------------------ Event Modal Guests ------------------ */
const EventModalGuests = memo(({ guests, updateGuest, removeGuest, addGuest }) => (
  <>
    <label className="text-sm font-medium text-gray-700 mb-2 block">Guests</label>
    {guests.map((guest, idx) => (
      <div key={idx} className="flex items-center gap-2 mb-2">
        <input
          type="email"
          placeholder="guest@example.com"
          value={guest}
          onChange={(e) => updateGuest(idx, e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
        />
        <button onClick={() => removeGuest(idx)} className="text-red-500" type="button">
          <FaTimes />
        </button>
      </div>
    ))}
    <button onClick={addGuest} className="text-sm text-blue-600 hover:underline" type="button">
      + Add Another Guest
    </button>
  </>
));

/* ------------------ Event Modal ------------------ */
const EventModal = memo(({ newEvent, setNewEvent, editingEventId, saving, saveEvent, closePopup }) => {
  const updateField = useCallback((field, value) => {
    setNewEvent(p => ({ ...p, [field]: value }));
  }, [setNewEvent]);

  const updateGuest = useCallback((idx, val) => {
    setNewEvent(p => {
      const updated = [...p.guests];
      updated[idx] = val;
      return { ...p, guests: updated };
    });
  }, [setNewEvent]);

  const removeGuest = useCallback((idx) => {
    setNewEvent(p => ({ ...p, guests: p.guests.filter((_, i) => i !== idx) }));
  }, [setNewEvent]);

  const addGuest = useCallback(() => {
    setNewEvent(p => ({ ...p, guests: [...p.guests, ""] }));
  }, [setNewEvent]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/40 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-md sm:max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
          <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500" onClick={closePopup} type="button">
            <FaTimes size={18} />
          </button>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {editingEventId ? "Update Event" : "Create Event"}
          </h3>
          
          <EventModalInputs newEvent={newEvent} updateField={updateField} />
          
          <label className="text-sm font-medium text-gray-700 mb-2 block">Snooze Before</label>
          <select
            value={newEvent.snoozeBefore}
            onChange={(e) => updateField('snoozeBefore', e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-4"
          >
            {SNOOZE_OPTIONS.map((m) => (
              <option key={m} value={m}>{m} minutes</option>
            ))}
          </select>
          
          <EventModalGuests 
            guests={newEvent.guests}
            updateGuest={updateGuest}
            removeGuest={removeGuest}
            addGuest={addGuest}
          />
          
          <button
            onClick={saveEvent}
            disabled={saving}
            className={`w-full mt-4 ${saving ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"} text-white py-2 rounded-md`}
            type="button"
          >
            {saving ? "Saving..." : editingEventId ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </div>
    </ModalPortal>
  );
});

/* ------------------ TodaysList ------------------ */
const TodaysList = memo(forwardRef(function TodaysList({ rows = [], setEvents, userId }, ref) {
  const navigate = useNavigate();
  const handleArrowClick = useCallback(() => navigate("/reminders"), [navigate]);

  const [showEventPopup, setShowEventPopup] = useState(false);
  const [newEvent, setNewEvent] = useState({ ...DEFAULT_EVENT_TEMPLATE });
  const [editingEventId, setEditingEventId] = useState(null);
  const [saving, setSaving] = useState(false);

  useImperativeHandle(ref, () => ({
    openCreateEvent: () => {
      setEditingEventId(null);
      setNewEvent({ ...DEFAULT_EVENT_TEMPLATE });
      setShowEventPopup(true);
    },
  }), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    const token = params.get("token");
    const uid = params.get("user_id");
    if (email) lsSet(K.GOOGLE_EMAIL, email);
    if (token) lsSet(K.TOKEN, token);
    if (uid) lsSet(K.USER_ID, uid);
  }, []);

  const saveEvent = useCallback(async () => {
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

      if (!userId) {
        alert("User ID missing. Please log out and log in again.");
        console.error("Save Event Failed: userId is missing/null.");
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
      if (!token) {
        alert("Auth token missing. Please connect Google Calendar again.");
        setSaving(false);
        return;
      }

      const userEmail = lsGet(K.GOOGLE_EMAIL) || "";

      const payload = {
        summary: newEvent.title.trim(),
        description: (newEvent.description || "").trim(),
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        userId,
        userEmail,
        guestEmails: (newEvent.guests || []).map((e) => e.trim()).filter(Boolean),
        snoozeBefore: Number.parseInt(newEvent.snoozeBefore, 10) || 30,
      };

      console.log("Sending Event Payload:", payload);

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
            e._id === editingEventId ? { ...e, ...payload, title: payload.summary, optimistic: true } : e
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
        const go = window.confirm("Google account not linked or token expired. Connect now?");
        if (go) openGoogleConnect();
        return;
      }

      if (!res.ok) {
        console.error("Server Error Response:", res.status, res.statusText);
        alert(`Failed to save event (Status: ${res.status}). Data kept locally.`);
      }

      const data = await res.json().catch(() => ({}));
      const saved = data?.event || data || {};

      setEvents((prev) => {
        const p = Array.isArray(prev) ? prev : [];
        const next = p.map((e) =>
          e.tempId === tempId || e._id === editingEventId ? { ...e, ...saved, optimistic: false } : e
        );
        saveCache(evKey(userId), next);
        return next;
      });
    } catch (err) {
      console.error("Save Event Network Error:", err);
      if (err?.message !== "Google not linked") alert("Network error — Event stored locally.");
    } finally {
      setSaving(false);
      setShowEventPopup(false);
      setEditingEventId(null);
      setNewEvent({ ...DEFAULT_EVENT_TEMPLATE });
    }
  }, [saving, newEvent, editingEventId, userId, setEvents]);

  const openCreatePopup = useCallback(() => {
    setEditingEventId(null);
    setNewEvent({ ...DEFAULT_EVENT_TEMPLATE });
    setShowEventPopup(true);
  }, []);

  const closePopup = useCallback(() => {
    setShowEventPopup(false);
    setEditingEventId(null);
    setNewEvent({ ...DEFAULT_EVENT_TEMPLATE });
  }, []);

  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className={`mb-4 rounded-3xl ${GLASS_STYLE} overflow-hidden flex flex-col relative shadow-2xl border-0 ring-1 ring-white/30`}>
      <div className="top-0 z-20 px-3 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-[#E6E6FA] via-[#D4D9F2] to-[#B3D9FF] relative overflow-hidden rounded-b-2xl">
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <FaCalendarAlt className="text-white text-sm" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-black truncate">Today's Events</h3>
              <p className="text-xs sm:text-sm text-black/80 truncate">Your schedule for today</p>
            </div>
          </div>
          <button
            onClick={openCreatePopup}
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
      <div className="min-h-0 max-h-[40vh] overflow-y-auto hidden md:block bg-gradient-to-b from-white to-slate-50">
        {safeRows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-slate-500 font-medium text-lg">No events scheduled</p>
            <p className="text-slate-400 text-sm mt-1">Your day is free!</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {safeRows.map((row, i) => (
              <EventRow key={i} row={row} handleArrowClick={handleArrowClick} />
            ))}
          </div>
        )}
      </div>
      <div className="px-6 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">
            {safeRows.length} event{safeRows.length !== 1 ? "s" : ""} scheduled
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">Live</span>
          </div>
        </div>
      </div>
      {showEventPopup && (
        <EventModal
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          editingEventId={editingEventId}
          saving={saving}
          saveEvent={saveEvent}
          closePopup={closePopup}
        />
      )}
    </div>
  );
}));

/* ------------------ Stat Card ------------------ */
const StatCard = memo(({ pillLabel, variant = "gray", label, value, icon, loading }) => {
  const config = STAT_VARIANTS[variant] || STAT_VARIANTS.blue;

  return (
    <div className={`relative ${GLASS_STYLE} rounded-2xl p-6 border-0 ring-1 ring-white/20 shadow`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${config.pill}`}>
          {pillLabel}
        </span>
        <div className={`p-2.5 rounded-lg ${config.iconBg} text-white shadow-md`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
        {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : value}
      </div>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
    </div>
  );
});

/* ------------------ Main Dashboard ------------------ */
const Dashboard = () => {
  useSocketSetup();
  useStickyNotes(3);
  const { loading } = useSelector((s) => s.auth);

  const rawUser = lsGet(K.USER);
  const userObj = useMemo(() => rawUser ? JSON.parse(rawUser) : null, [rawUser]);
  const userId = userObj?.userId || lsGet(K.USER_ID) || null;
  const name = userObj?.name || "Guest";

  const [events, setEvents] = useState(() => loadCache(evKey(userId)));
  const [reminders, setReminders] = useState(() => loadCache(rmKey(userId)));
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({
    TotalTask: 0,
    Completed: 0,
    Progress: 0,
    Overdue: 0,
    loading: true,
  });

  // ✅ State for Support Modal
  const [showSupportModal, setShowSupportModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.updateDashboardStats = (counts) => {
      startTransition(() => {
        setStats({
          TotalTask: counts.total,
          Completed: counts.completed,
          Progress: counts.progress,
          Overdue: counts.overdue,
          loading: counts.loading,
        });
      });
    };
    return () => {
      delete window.updateDashboardStats;
    };
  }, []);

  const todayEventRows = useMemo(() => 
    (Array.isArray(events) ? events : [])
      .filter((e) => e?.startDateTime && e?.endDateTime)
      .filter((e) => {
        const s = parseISO(e.startDateTime);
        const en = parseISO(e.endDateTime);
        return s <= END_TODAY && en >= START_TODAY;
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
      }))
  , [events]);

  const todayReminderRows = useMemo(() =>
    (Array.isArray(reminders) ? reminders : [])
      .filter((r) => r?.datetime && isToday(parseISO(r.datetime)))
      .map((r) => ({
        ts: parseISO(r.datetime).getTime(),
        time: format(parseISO(r.datetime), "h:mm a"),
        title: r.text || "Reminder",
        tag: "Reminder",
        color: "amber",
        location: "—",
        date: format(parseISO(r.datetime), "MMM d, yyyy"),
      }))
  , [reminders]);

  const todaysRows = useMemo(
    () => [...todayEventRows, ...todayReminderRows].sort((a, b) => a.ts - b.ts),
    [todayEventRows, todayReminderRows]
  );

  const todaysListRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && String(e.key || "").toLowerCase() === "a") {
        e.preventDefault();
        todaysListRef.current?.openCreateEvent?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("openEvent") === "1") {
      const timer = setTimeout(() => {
        todaysListRef.current?.openCreateEvent?.();
        navigate(location.pathname, { replace: true });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    
    (async () => {
      try {
        const [evRes, remRes] = await Promise.all([
          fetch(`https://taskbe.sharda.co.in/api/events?userId=${userId}`),
          fetch(`https://taskbe.sharda.co.in/api/reminders?userId=${userId}`),
        ]);
        
        if (!isMounted) return;
        
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

        if (isMounted) {
          startTransition(() => {
            setEvents(mergedEv);
            setReminders(mergedRm);
          });
          saveCache(evKey(userId), mergedEv);
          saveCache(rmKey(userId), mergedRm);
        }
      } catch (e) {
        console.error("Failed to load rows:", e);
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveCache(evKey(userId), Array.isArray(events) ? events : []);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [events, userId]);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveCache(rmKey(userId), Array.isArray(reminders) ? reminders : []);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [reminders, userId]);

  const toggleStats = useCallback(() => setShowStats(p => !p), []);
  const handleCreateEvent = useCallback(() => {
    todaysListRef.current?.openCreateEvent?.();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Dashboard</h3>
            <p className="text-gray-600">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      <div className="relative z-10 pb-24 overflow-y-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div className="flex items-center mt-3 gap-3">
            <div className={`relative p-4 rounded-2xl ${GLASS_STYLE} shadow-xl`}>
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
            <div className={`px-6 py-4 rounded-2xl ${GLASS_STYLE} shadow-lg flex flex-col justify-center`}>
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

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-6">
            <TodaysList ref={todaysListRef} rows={todaysRows} setEvents={setEvents} userId={userId} />
            
            <Suspense fallback={<ComponentLoader />}>
              <TaskOverview />
            </Suspense>
            
            <Suspense fallback={<ComponentLoader />}>
              <ProductivityInsights stats={stats} />
            </Suspense>
          </div>

          <div className="space-y-6">
            <div className="sticky top-8 space-y-4">
              <Suspense fallback={<ComponentLoader />}>
                <StickyNotesDashboard />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Draggable Support Button with New Icon */}
      <DraggableSupportButton onClick={() => setShowSupportModal(true)} />

      {/* ✅ Support Sidebar with Slide Animation */}
      {showSupportModal && (
        <ModalPortal>
          <div 
            className="fixed inset-0 z-[9999] flex justify-end bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowSupportModal(false)}
          >
            <div 
              className="relative w-full max-w-md bg-gray-50 h-full shadow-2xl flex flex-col transform transition-transform duration-500 ease-out"
              style={{
                animation: 'slideInFromRight 0.5s ease-out forwards'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 flex items-center justify-between shrink-0 shadow-lg">
                <div>
                  <h2 className="text-white text-xl font-bold flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Support Center
                  </h2>
                  <p className="text-indigo-100 text-sm mt-1">We're here to help you!</p>
                </div>
                <button 
                  onClick={() => setShowSupportModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 hover:rotate-90"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-4">
                 <Support />
              </div>
              
            </div>
          </div>
          
          {/* CSS Animation */}
          <style>{`
            @keyframes slideInFromRight {
              from {
                transform: translateX(100%);
              }
              to {
                transform: translateX(0);
              }
            }
          `}</style>
        </ModalPortal>
      )}
    </div>
  );
};

export default Dashboard;