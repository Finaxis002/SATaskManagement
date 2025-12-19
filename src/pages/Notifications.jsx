import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// ===== Lazy load icons - sirf jab zarurat ho tab load ho =====
const FaClock = lazy(() => import("react-icons/fa").then(m => ({ default: m.FaClock })));
const MdUpdate = lazy(() => import("react-icons/md").then(m => ({ default: m.MdUpdate })));
const BsFillCircleFill = lazy(() => import("react-icons/bs").then(m => ({ default: m.BsFillCircleFill })));

// ===== API Setup =====
const api = axios.create({
  baseURL: "https://taskbe.sharda.co.in",
  withCredentials: true,
});

const token = localStorage.getItem("tokenLocal") || localStorage.getItem("authToken");
if (token) {
  api.defaults.headers.Authorization = `Bearer ${token}`;
}

// ===== Socket singleton =====
let socketInstance = null;
const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io("https://taskbe.sharda.co.in", {
      withCredentials: true,
      transports: ["websocket"], // Fast connection
    });
  }
  return socketInstance;
};

// ===== User context - ek baar compute karo =====
const userContextCache = (() => {
  const userStr = localStorage.getItem("user");
  let userObj = {};
  try {
    userObj = userStr ? JSON.parse(userStr) : {};
  } catch {}

  const token = localStorage.getItem("tokenLocal") || localStorage.getItem("authToken");
  let tokenPayload = {};
  try {
    if (token) tokenPayload = JSON.parse(atob(token.split(".")[1]));
  } catch {}

  const email = userObj.email || tokenPayload.email || localStorage.getItem("email");
  const mongoId = userObj._id || localStorage.getItem("userId");
  const shortId = tokenPayload.userId;

  return {
    role: localStorage.getItem("role") || userObj.role || tokenPayload.role,
    email,
    mongoId,
    shortId,
    allKeys: new Set([email, mongoId, shortId].filter(Boolean)),
  };
})();

// ===== Date formatter - reuse karo =====
const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

// ===== Optimized Notification Item =====
const NotificationItem = React.memo(({ notification, onMarkAsRead, isSelected, onToggle }) => {
  const isUnread = !notification.read;

  // Parse updater sirf ek baar
  const updaterName = useMemo(() => {
    if (!notification.updatedBy) return null;
    if (notification.updatedBy === "System") return "System";
    try {
      const updater = typeof notification.updatedBy === "string" 
        ? JSON.parse(notification.updatedBy) 
        : notification.updatedBy;
      return updater?.name || null;
    } catch {
      return null;
    }
  }, [notification.updatedBy]);

  // Format date once
  const formattedDate = useMemo(() => 
    dateFormatter.format(new Date(notification.createdAt)),
    [notification.createdAt]
  );

  return (
    <div className={`bg-white rounded-lg shadow border p-4 flex gap-3 ${isUnread ? "border-blue-400" : "border-gray-200"}`}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(notification._id)}
        className="h-5 w-5 accent-blue-600 mt-1"
      />

      <div className="flex-1 space-y-2">
        <div className="flex items-start gap-2">
          {isUnread && (
            <Suspense fallback={<span className="w-3 h-3 bg-green-600 rounded-full" />}>
              <BsFillCircleFill className="text-green-600 text-sm mt-1" />
            </Suspense>
          )}
          <p className="font-semibold text-gray-800">{notification.message}</p>
        </div>

        {updaterName && (
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Suspense fallback={<span>↻</span>}>
              <MdUpdate className="text-gray-400" />
            </Suspense>
            Updated by {updaterName}
          </p>
        )}

        {notification.details && Object.keys(notification.details).length > 0 && (
          <div className="flex gap-2 flex-wrap text-xs">
            {Object.entries(notification.details).map(([key, value]) => (
              <span key={key} className="bg-blue-50 text-blue-800 px-2 py-1 rounded">
                <b>{key}:</b> {String(value)}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Suspense fallback={<span>🕐</span>}>
            <FaClock />
          </Suspense>
          {formattedDate}
        </p>
      </div>

      {/* ===== UPDATED BUTTON: Fixed Width & Height ===== */}
      <button
        onClick={() => onMarkAsRead(notification._id)}
        disabled={notification.read}
        className={`text-sm w-28 h-10 flex items-center justify-center rounded font-medium transition-colors shrink-0 ${
          notification.read
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            : "bg-green-600 text-white hover:bg-green-700 shadow-sm"
        }`}
      >
        {notification.read ? "✓ Read" : "Mark Read"}
      </button>
    </div>
  );
}, (prev, next) => (
  prev.notification._id === next.notification._id &&
  prev.notification.read === next.notification.read &&
  prev.isSelected === next.isSelected
));

// ===== Main Component =====
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [groupBy, setGroupBy] = useState("none");
  const [filters, setFilters] = useState({
    readStatus: "all",
    timeRange: "all",
    notificationType: "all",
  });

  const limit = 20;
  const socket = useRef(getSocket()).current;
  const { role: userRole, email, allKeys } = userContextCache;

  // ===== Debounced search =====
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ===== Fetch notifications =====
  const fetchNotifications = useCallback(async () => {
    if (loading && page > 1) return; // Prevent multiple calls
    setLoading(true);
    
    try {
      const endpoint = userRole === "admin"
        ? `/api/notifications?page=${page}&limit=${limit}`
        : `/api/notifications/${encodeURIComponent(email)}?page=${page}&limit=${limit}`;

      const { data } = await api.get(endpoint);

      // Fast filter
      const filtered = data.filter(n => {
        if (userRole === "admin") return n.type === "admin";
        const recipientKey = n.recipientEmail || n.recipientId || n.recipient || n.userId;
        const matches = recipientKey && allKeys.has(String(recipientKey));
        const allowed = !n.action || ["task-created", "task-updated"].includes(n.action);
        return n.type === "user" && matches && allowed;
      });

      setNotifications(prev => page === 1 ? filtered : [...prev, ...filtered]);
      setNotificationCount(prev => {
        const unread = filtered.filter(n => !n.read).length;
        return page === 1 ? unread : prev + unread;
      });
      setHasMore(data.length === limit);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userRole, page, email, allKeys, loading]);

  useEffect(() => {
    fetchNotifications();
  }, [page]); // Only on page change

  // ===== Optimized filtering =====
  const filteredNotifications = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    
    let result = notifications;

    // Apply filters
    if (filters.readStatus !== "all") {
      result = result.filter(n => 
        filters.readStatus === "read" ? n.read : !n.read
      );
    }

    if (filters.timeRange !== "all") {
      const now = Date.now();
      const day = 86400000;
      result = result.filter(n => {
        const time = new Date(n.createdAt).getTime();
        if (filters.timeRange === "today") return now - time < day;
        if (filters.timeRange === "week") return now - time < day * 7;
        if (filters.timeRange === "month") return now - time < day * 30;
        return true;
      });
    }

    if (filters.notificationType !== "all") {
      result = result.filter(n => n.action === filters.notificationType);
    }

    // Search filter
    if (query) {
      result = result.filter(n => {
        const text = `${n.message} ${JSON.stringify(n.details || {})}`.toLowerCase();
        return text.includes(query);
      });
    }

    // Grouping
    if (groupBy === "none") {
      return { "All": result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) };
    }

    return result.reduce((acc, n) => {
      const key = groupBy === "date" 
        ? new Date(n.createdAt).toLocaleDateString("en-GB")
        : n.action || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(n);
      return acc;
    }, {});
  }, [notifications, debouncedSearch, filters, groupBy]);

  // ===== Mark as read =====
  const handleMarkAsRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setNotificationCount(prev => Math.max(prev - 1, 0));
    setSelectedNotifications(prev => prev.filter(i => i !== id));

    try {
      await api.patch(`/api/notifications/${id}`, { read: true });
      socket.emit("notificationCountUpdated", {
        email: userRole === "admin" ? "admin" : localStorage.getItem("userId"),
      });
    } catch (err) {
      console.error("Mark read error:", err);
    }
  }, [userRole, socket]);

  // ===== Bulk mark as read =====
  const handleBulkMarkAsRead = useCallback(async () => {
    const ids = selectedNotifications;
    if (!ids.length) return;

    setNotifications(prev => prev.map(n => ids.includes(n._id) ? { ...n, read: true } : n));
    setNotificationCount(prev => Math.max(prev - ids.length, 0));
    setSelectedNotifications([]);

    try {
      await Promise.all(ids.map(id => api.patch(`/api/notifications/${id}`, { read: true })));
      socket.emit("notificationCountUpdated", {
        email: userRole === "admin" ? "admin" : localStorage.getItem("userId"),
      });
    } catch (err) {
      console.error("Bulk mark error:", err);
    }
  }, [selectedNotifications, userRole, socket]);

  // ===== Mark all as read =====
  const handleMarkAllAsRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.read);
    if (!unread.length) return;

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setNotificationCount(0);

    try {
      await Promise.all(unread.map(n => api.patch(`/api/notifications/${n._id}`, { read: true })));
      socket.emit("notificationCountUpdated", {
        email: userRole === "admin" ? "admin" : localStorage.getItem("userId"),
      });
    } catch (err) {
      console.error("Mark all error:", err);
    }
  }, [notifications, userRole, socket]);

  // ===== Toggle selection =====
  const toggleSelect = useCallback((id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  // ===== Scroll handler =====
  const scrollTimeout = useRef(null);
  const handleScroll = useCallback((e) => {
    if (scrollTimeout.current) return;
    scrollTimeout.current = setTimeout(() => {
      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
        setPage(p => p + 1);
      }
      scrollTimeout.current = null;
    }, 150);
  }, [loading, hasMore]);

  return (
    <div className="p-4 h-[90vh] overflow-y-auto" onScroll={handleScroll}>
      {/* Header */}
      <div className="flex flex-wrap gap-3 mb-4">
        <h2 className="text-2xl font-bold">
          🔔 Notifications {notificationCount > 0 && `(${notificationCount})`}
        </h2>
        
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <button
          onClick={handleMarkAllAsRead}
          disabled={!notifications.some(n => !n.read)}
          className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50"
        >
          Mark All Read
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex flex-wrap gap-2">
        <span className="text-sm font-medium">Group:</span>
        {["none", "date", "type"].map(t => (
          <button
            key={t}
            onClick={() => setGroupBy(t)}
            className={`text-sm px-3 py-1 rounded-full ${
              groupBy === t ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
          >
            {t}
          </button>
        ))}

        <select
          value={filters.readStatus}
          onChange={(e) => setFilters(f => ({ ...f, readStatus: e.target.value }))}
          className="text-sm px-2 py-1 rounded border"
        >
          <option value="all">All</option>
          <option value="read">Read</option>
          <option value="unread">Unread</option>
        </select>

        <select
          value={filters.timeRange}
          onChange={(e) => setFilters(f => ({ ...f, timeRange: e.target.value }))}
          className="text-sm px-2 py-1 rounded border"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>

        <select
          value={filters.notificationType}
          onChange={(e) => setFilters(f => ({ ...f, notificationType: e.target.value }))}
          className="text-sm px-2 py-1 rounded border"
        >
          <option value="all">All Types</option>
          <option value="task-created">Created</option>
          <option value="task-updated">Updated</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selectedNotifications.length > 0 && (
        <div className="mb-3 flex gap-2 items-center">
          <span className="text-sm">{selectedNotifications.length} selected</span>
          <button
            onClick={handleBulkMarkAsRead}
            className="text-sm px-3 py-1 bg-green-600 text-white rounded-full hover:bg-green-700"
          >
            Mark Selected Read
          </button>
          <button
            onClick={() => setSelectedNotifications([])}
            className="text-sm px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
      )}

      {/* Notifications List */}
      {loading && page === 1 ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(filteredNotifications).length === 0 ? (
            <div className="text-center py-8 text-gray-500">No notifications</div>
          ) : (
            Object.entries(filteredNotifications).map(([group, items]) => (
              <div key={group}>
                {groupBy !== "none" && (
                  <h3 className="text-sm font-bold mb-2 sticky top-0 bg-white py-1">
                    {group}
                  </h3>
                )}
                <div className="space-y-3">
                  {items.map(notif => (
                    <NotificationItem
                      key={notif._id}
                      notification={notif}
                      onMarkAsRead={handleMarkAsRead}
                      isSelected={selectedNotifications.includes(notif._id)}
                      onToggle={toggleSelect}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
          {loading && page > 1 && (
            <div className="text-center py-4 text-sm text-gray-400">Loading more...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;