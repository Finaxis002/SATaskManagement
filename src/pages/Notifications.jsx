import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// ===== Configuration Constants =====
const API_BASE_URL = "https://taskbe.sharda.co.in";
const NOTIFICATION_LIMIT = 20;
const DEBOUNCE_DELAY = 300;
const SCROLL_THROTTLE = 150;

// ===== Singleton API Instance =====
const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("tokenLocal") || localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== Singleton Socket Instance =====
const socketInstance = io(API_BASE_URL, {
  withCredentials: true,
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 3,
});

// ===== Cached User Context =====
let cachedUserContext = null;

const getUserContext = () => {
  if (cachedUserContext) return cachedUserContext;

  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("tokenLocal") || localStorage.getItem("authToken");
  
  let userObj = {};
  let tokenPayload = {};

  try {
    if (userStr) userObj = JSON.parse(userStr);
    if (token) {
      const parts = token.split(".");
      if (parts[1]) tokenPayload = JSON.parse(atob(parts[1]));
    }
  } catch (e) {
    console.error("Parse error:", e);
  }

  const email = userObj.email || tokenPayload.email || localStorage.getItem("email");
  const mongoId = userObj._id || localStorage.getItem("userId");
  const shortId = tokenPayload.userId;

  cachedUserContext = {
    role: localStorage.getItem("role") || userObj.role || tokenPayload.role,
    email,
    mongoId,
    shortId,
    allKeys: new Set([email, mongoId, shortId].filter(Boolean)),
  };

  return cachedUserContext;
};

// ===== Pure Helper Functions =====
const parseUpdater = (updatedBy) => {
  if (!updatedBy) return null;
  if (updatedBy === "System") return { type: "system" };
  try {
    const updater = typeof updatedBy === "string" ? JSON.parse(updatedBy) : updatedBy;
    return updater?.name ? { type: "user", name: updater.name } : null;
  } catch {
    return null;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}, ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// ===== Lightweight SVG Icons =====
const UnreadIndicator = React.memo(() => (
  <svg className="w-3 h-3 text-green-600" viewBox="0 0 24 24" fill="currentColor" aria-label="Unread">
    <circle cx="12" cy="12" r="10" />
  </svg>
));

const ClockIcon = React.memo(() => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
));

const UpdateIcon = React.memo(() => (
  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
  </svg>
));

const SearchIcon = React.memo(() => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
  </svg>
));

// ===== Optimized NotificationItem with Layout Optimizations =====
const NotificationItem = React.memo(({ notification, onMarkAsRead, isSelected, onToggleSelect }) => {
  const { _id, read, message, priority, status, updatedBy, createdAt, details } = notification;

  const updaterInfo = useMemo(() => parseUpdater(updatedBy), [updatedBy]);
  const formattedDate = useMemo(() => formatDate(createdAt), [createdAt]);
  const detailsEntries = useMemo(() => {
    if (!details || typeof details !== "object") return null;
    const entries = Object.entries(details);
    return entries.length > 0 ? entries : null;
  }, [details]);

  const handleCheck = useCallback(() => onToggleSelect(_id), [_id, onToggleSelect]);
  const handleMarkRead = useCallback(() => onMarkAsRead(_id), [_id, onMarkAsRead]);

  // Compute styles once
  const borderClass = read ? "border-gray-200" : "border-blue-400";
  const priorityClass = priority === "high"
    ? "bg-red-100 text-red-800"
    : priority === "medium"
    ? "bg-yellow-100 text-yellow-800"
    : "bg-gray-100 text-gray-700";
  const buttonClass = read
    ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
    : "bg-green-600 text-white border-green-600 hover:bg-green-700";

  return (
    <div className={`bg-white rounded-xl shadow-lg border transition-shadow hover:shadow-xl p-4 flex gap-4 items-start ${borderClass}`}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleCheck}
        className="h-5 w-5 mt-1 accent-blue-600 flex-shrink-0"
        aria-label="Select notification"
      />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {!read && <UnreadIndicator />}
          <p className="text-base font-semibold text-gray-800 break-words flex-1">{message}</p>
          {priority && (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize whitespace-nowrap ${priorityClass}`}>
              Status: {status}
            </span>
          )}
        </div>

        {updaterInfo && (
          <p className="text-sm text-gray-500 italic flex items-center gap-1 mb-2">
            <UpdateIcon />
            {updaterInfo.type === "system" ? "Updated by System" : `Updated by ${updaterInfo.name}`}
          </p>
        )}

        {detailsEntries && (
          <div className="text-sm text-gray-700 flex flex-wrap gap-2 mb-2">
            {detailsEntries.map(([key, value]) => (
              <span
                key={key}
                className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-1 rounded-full whitespace-nowrap"
              >
                <span className="font-medium capitalize">{key}:</span> {String(value)}
              </span>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 flex items-center gap-1">
          <ClockIcon />
          <time dateTime={createdAt}>{formattedDate}</time>
        </div>
      </div>

      <button
        onClick={handleMarkRead}
        disabled={read}
        className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors border flex-shrink-0 ${buttonClass}`}
        aria-label={read ? "Already read" : "Mark as read"}
      >
        {read ? "Read" : "Mark Read"}
      </button>
    </div>
  );
}, (prev, next) => (
  prev.notification._id === next.notification._id &&
  prev.notification.read === next.notification.read &&
  prev.isSelected === next.isSelected &&
  prev.notification.updatedBy === next.notification.updatedBy
));

NotificationItem.displayName = "NotificationItem";

// ===== Main Component =====
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [groupBy, setGroupBy] = useState("none");
  const [filters, setFilters] = useState({
    readStatus: "all",
    timeRange: "all",
    notificationType: "all",
  });

  const userContext = useMemo(() => getUserContext(), []);
  const { role: userRole, email, allKeys } = userContext;
  
  const scrollTimeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const rafRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, DEBOUNCE_DELAY);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await apiInstance.patch(`/api/notifications/${id}`, { read: true });

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setNotificationCount((prev) => Math.max(prev - 1, 0));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      socketInstance.emit("notificationCountUpdated", {
        email: userRole === "admin" ? "admin" : localStorage.getItem("userId"),
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }, [userRole]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    
    try {
      const endpoint = userRole === "admin"
        ? `/api/notifications?page=${page}&limit=${NOTIFICATION_LIMIT}`
        : `/api/notifications/${encodeURIComponent(email)}?page=${page}&limit=${NOTIFICATION_LIMIT}`;

      const response = await apiInstance.get(endpoint);
      const newNotifs = response.data;

      const filtered = newNotifs.filter((n) => {
        if (userRole === "admin") return n.type === "admin";
        if (userRole === "user") {
          const recipientKey = n.recipientEmail || n.recipientId || n.recipient || n.userId;
          const matchesRecipient = recipientKey ? allKeys.has(String(recipientKey)) : false;
          const actionAllowed = !n.action || ["task-created", "task-updated"].includes(n.action);
          return n.type === "user" && matchesRecipient && actionAllowed;
        }
        return false;
      });

      setNotifications((prev) => (page === 1 ? filtered : [...prev, ...filtered]));
      setNotificationCount((prev) =>
        page === 1
          ? filtered.filter((n) => !n.read).length
          : prev + filtered.filter((n) => !n.read).length
      );
      setHasMore(newNotifs.length === NOTIFICATION_LIMIT);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [userRole, page, email, allKeys]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Optimized filtering - single pass
  const filteredNotifications = useMemo(() => {
    if (!notifications.length) return { "All Notifications": [] };

    const now = Date.now();
    const dayInMs = 86400000;
    const searchLower = debouncedSearch.toLowerCase();
    
    // Calculate time cutoffs once
    const timeCutoff = filters.timeRange === "today" 
      ? Math.floor(now / dayInMs) * dayInMs
      : filters.timeRange === "week"
      ? now - 7 * dayInMs
      : filters.timeRange === "month"
      ? now - 30 * dayInMs
      : 0;

    // Single-pass filter
    const result = notifications.filter((n) => {
      // Search
      if (searchLower) {
        const hasMatch = n.message?.toLowerCase().includes(searchLower) ||
          (n.updatedBy !== "System" && parseUpdater(n.updatedBy)?.name?.toLowerCase().includes(searchLower)) ||
          (n.details && Object.values(n.details).join(" ").toLowerCase().includes(searchLower));
        if (!hasMatch) return false;
      }

      // Read status
      if (filters.readStatus === "read" && !n.read) return false;
      if (filters.readStatus === "unread" && n.read) return false;

      // Time range
      if (timeCutoff > 0) {
        const timestamp = new Date(n.createdAt).getTime();
        if (filters.timeRange === "today") {
          if (timestamp < timeCutoff || timestamp >= timeCutoff + dayInMs) return false;
        } else if (timestamp < timeCutoff) {
          return false;
        }
      }

      // Type
      if (filters.notificationType !== "all" && n.action !== filters.notificationType) {
        return false;
      }

      return true;
    });

    // Grouping
    if (groupBy === "none") {
      return { "All Notifications": result };
    }

    const groups = {};
    result.forEach((n) => {
      const key = groupBy === "date"
        ? new Date(n.createdAt).toLocaleDateString("en-GB")
        : n.action || "other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    return groups;
  }, [notifications, debouncedSearch, filters, groupBy]);

  const handleMarkAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map((n) => apiInstance.patch(`/api/notifications/${n._id}`, { read: true })));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setNotificationCount(0);
      setSelectedIds(new Set());
      socketInstance.emit("notificationCountUpdated", {
        email: userRole === "admin" ? "admin" : localStorage.getItem("userId"),
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, [notifications, userRole]);

  const handleBulkMarkAsRead = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      await Promise.all(ids.map((id) => apiInstance.patch(`/api/notifications/${id}`, { read: true })));
      setNotifications((prev) =>
        prev.map((n) => (selectedIds.has(n._id) ? { ...n, read: true } : n))
      );
      setNotificationCount((prev) => Math.max(prev - ids.length, 0));
      setSelectedIds(new Set());
      socketInstance.emit("notificationCountUpdated", {
        email: userRole === "admin" ? "admin" : localStorage.getItem("userId"),
      });
    } catch (error) {
      console.error("Error bulk marking as read:", error);
    }
  }, [selectedIds, userRole]);

  const toggleSelectNotification = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Optimized scroll with RAF
  const handleScroll = useCallback((e) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    rafRef.current = requestAnimationFrame(() => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight * 1.2 && !loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      }, SCROLL_THROTTLE);
    });
  }, [loading, hasMore]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handleSearchChange = useCallback((e) => setSearchQuery(e.target.value), []);
  const handleGroupChange = useCallback((type) => setGroupBy(type), []);
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);
  const handleClearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const selectedCount = selectedIds.size;
  const allRead = useMemo(() => notifications.every((n) => n.read), [notifications]);

  return (
    <div className="p-4 max-w-7xl mx-auto h-[90vh] overflow-y-auto" onScroll={handleScroll}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          🔔 Notifications {notificationCount > 0 && `(${notificationCount} unread)`}
        </h2>

        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none text-sm"
            aria-label="Search notifications"
          />
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          disabled={allRead}
          className="text-sm font-medium px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mark All Read
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">Group by:</span>
          {["none", "date", "type"].map((type) => (
            <button
              key={type}
              onClick={() => handleGroupChange(type)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                groupBy === type
                  ? "bg-blue-100 text-blue-600 border-blue-300"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.readStatus}
            onChange={(e) => handleFilterChange("readStatus", e.target.value)}
            className="text-sm px-3 py-1 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>

          <select
            value={filters.timeRange}
            onChange={(e) => handleFilterChange("timeRange", e.target.value)}
            className="text-sm px-3 py-1 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>

          <select
            value={filters.notificationType}
            onChange={(e) => handleFilterChange("notificationType", e.target.value)}
            className="text-sm px-3 py-1 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="task-created">Task Created</option>
            <option value="task-updated">Task Updated</option>
          </select>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">{selectedCount} selected</span>
          <button
            onClick={handleBulkMarkAsRead}
            className="text-sm font-medium px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
          >
            Mark Selected Read
          </button>
          <button
            onClick={handleClearSelection}
            className="text-sm font-medium px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {loading && page === 1 ? (
        <div className="text-center text-sm text-gray-400 py-8">Loading notifications...</div>
      ) : (
        <div className="space-y-3 mb-5">
          {Object.keys(filteredNotifications).length === 0 ? (
            <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
              🎉 No notifications match your filters
            </div>
          ) : (
            Object.entries(filteredNotifications).map(([group, groupNotifs]) => (
              <div key={group}>
                {groupBy !== "none" && (
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 sticky top-0 bg-white py-2 z-10">
                    {group}
                  </h3>
                )}
                <div className="space-y-3">
                  {groupNotifs
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        isSelected={selectedIds.has(notification._id)}
                        onToggleSelect={toggleSelectNotification}
                      />
                    ))}
                </div>
              </div>
            ))
          )}
          {loading && page > 1 && (
            <div className="text-center text-sm text-gray-400 py-4">Loading more...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;