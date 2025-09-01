import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FaRegBell, FaCheckCircle, FaClock } from "react-icons/fa";
import { MdUpdate } from "react-icons/md";
import { BsFillCircleFill } from "react-icons/bs";

// ===== Add this once under imports =====
const api = axios.create({
  baseURL: "https://taskbe.sharda.co.in",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("tokenLocal") || localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const socket = io("https://taskbe.sharda.co.in", {
  withCredentials: true,
});

// const NotificationItem = React.memo(
//   ({
//     notification,
//     onMarkAsRead,
//     selectedNotifications,
//     toggleSelectNotification,
//   }) => {
//     const isUnread = !notification.read;

//     return (
//       <div
//         className={`group p-5 rounded-xl border transition-all shadow-sm hover:shadow-md flex justify-between gap-6 ${
//           isUnread
//             ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300"
//             : "bg-white border-gray-200"
//         }`}
//       >
//         {/* Left: Message & Meta */}
//         <div className="flex gap-4 flex-1 items-start">
//           {/* Checkbox */}
//           <input
//             type="checkbox"
//             checked={selectedNotifications.includes(notification._id)}
//             onChange={() => toggleSelectNotification(notification._id)}
//             className="mt-1 h-4 w-4 accent-blue-600"
//           />

//           {/* Notification Content */}
//           <div className="space-y-2 w-full">
//             {/* Top Row: Dot + Message + Priority */}
//             <div className="flex flex-wrap items-center gap-2">
//               {isUnread && (
//                 <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
//               )}

//               <p className="text-sm font-semibold text-gray-800 break-words">
//                 {notification.message}
//               </p>

//               {notification.priority && (
//                 <span
//                   className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
//                     notification.priority === "high"
//                       ? "bg-red-100 text-red-700"
//                       : notification.priority === "medium"
//                       ? "bg-yellow-100 text-yellow-800"
//                       : "bg-gray-100 text-gray-700"
//                   }`}
//                 >
//                   {notification.priority}
//                 </span>
//               )}
//             </div>

//             {/* Updated By Info */}
//             {notification.updatedBy &&
//               (() => {
//                 try {
//                   if (notification.updatedBy === "System") {
//                     return (
//                       <p className="text-xs text-gray-500 italic">
//                         Updated by System
//                       </p>
//                     );
//                   }

//                   const updater =
//                     typeof notification.updatedBy === "string"
//                       ? JSON.parse(notification.updatedBy)
//                       : notification.updatedBy;

//                   return updater?.name ? (
//                     <p className="text-xs text-gray-500 italic">
//                       Updated by {updater.name}
//                     </p>
//                   ) : null;
//                 } catch (err) {
//                   return null;
//                 }
//               })()}

//             {/* Details */}
//             {notification.details &&
//               Object.keys(notification.details).length > 0 && (
//                 <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
//                   {Object.entries(notification.details).map(([key, value]) => (
//                     <li key={key}>
//                       <span className="font-medium">{key}:</span> {value}
//                     </li>
//                   ))}
//                 </ul>
//               )}

//             {/* Timestamp */}
//             <p className="text-xs text-gray-400">
//               {new Date(notification.createdAt).toLocaleString("en-IN", {
//                 timeZone: "Asia/Kolkata",
//                 day: "2-digit",
//                 month: "2-digit",
//                 year: "numeric",
//                 hour: "2-digit",
//                 minute: "2-digit",
//                 hour12: true,
//               })}
//             </p>
//           </div>
//         </div>

//         {/* Right: Action Button */}
//         <div className="flex-shrink-0 self-start mt-1">
//           <button
//             onClick={() => onMarkAsRead(notification._id)}
//             disabled={notification.read}
//             className={`text-sm px-4 py-1.5 rounded-md font-medium transition-all border shadow-sm ${
//               notification.read
//                 ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
//                 : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
//             }`}
//           >
//             {notification.read ? "Read" : "Mark as Read"}
//           </button>
//         </div>
//       </div>
//     );
//   }
// );

const NotificationItem = React.memo(
  ({
    notification,
    onMarkAsRead,
    selectedNotifications,
    toggleSelectNotification,
  }) => {
    const isUnread = !notification.read;

    return (
      <div
        className={`relative group p-5 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all flex gap-6 ${
          isUnread
            ? "border-blue-500 bg-blue-50/50"
            : "border-gray-300 bg-white"
        }`}
      >
        {/* Left: Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={selectedNotifications.includes(notification._id)}
            onChange={() => toggleSelectNotification(notification._id)}
            className="h-4 w-4  accent-blue-600"
          />
        </div>

        {/* Middle Content */}
        <div className="flex-1 space-y-2">
          {/* Top Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {isUnread && (
              <BsFillCircleFill className="text-blue-500 text-xs animate-pulse" />
            )}

            <p className="text-base font-semibold text-gray-800 break-words">
              {notification.message}
            </p>

            {notification.priority && (
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                  notification.priority === "high"
                    ? "bg-red-100 text-red-700"
                    : notification.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {notification.priority}
              </span>
            )}
          </div>

          {/* Updated By */}
          {notification.updatedBy &&
            (() => {
              try {
                if (notification.updatedBy === "System") {
                  return (
                    <p className="text-xs text-gray-500 italic flex items-center gap-1">
                      <MdUpdate className="text-gray-400" />
                      Updated by System
                    </p>
                  );
                }

                const updater =
                  typeof notification.updatedBy === "string"
                    ? JSON.parse(notification.updatedBy)
                    : notification.updatedBy;

                return updater?.name ? (
                  <p className="text-xs text-gray-500 italic flex items-center gap-1">
                    <MdUpdate className="text-gray-500" />
                    Updated by {updater.name}
                  </p>
                ) : null;
              } catch {
                return null;
              }
            })()}

          {/* Details */}
          {notification.details &&
            Object.keys(notification.details).length > 0 && (
              <ul className="text-sm text-gray-700 inline-flex gap-2 flex-wrap">
                {Object.entries(notification.details).map(([key, value]) => (
                  <li
                    key={key}
                    className="bg-blue-100 text-gray-700 border border-blue-300 p-2 rounded-2xl max-w-max"
                  >
                    <span className="font-medium capitalize">{key}:</span>{" "}
                    {String(value)}
                  </li>
                ))}
              </ul>
            )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 flex items-center gap-1 pt-1">
            <FaClock className="text-gray-500" />
            {new Date(notification.createdAt).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </div>

        {/* Right Button */}
        <div className="self-start">
          <button
            onClick={() => onMarkAsRead(notification._id)}
            disabled={notification.read}
            className={`text-sm px-4 py-1.5 rounded-md font-medium border transition-all ${
              notification.read
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-green-600 text-white border-green-600 hover:bg-green-700"
            }`}
          >
            {notification.read ? "Read" : "Mark as Read"}
          </button>
        </div>
      </div>
    );
  }
);

  const getUserContext = () => {
    const userStr = localStorage.getItem("user");
    let userObj = {};
    try {
      userObj = JSON.parse(userStr || "{}");
    } catch {}

    const token =
      localStorage.getItem("tokenLocal") || localStorage.getItem("authToken");
    let tokenPayload = {};
    try {
      tokenPayload = JSON.parse(atob((token || "").split(".")[1] || "{}"));
    } catch {}

    const email =
      userObj.email || tokenPayload.email || localStorage.getItem("email");
    const mongoId = userObj._id || localStorage.getItem("userId");
    const shortId = tokenPayload.userId; // "113"

    return {
      role: localStorage.getItem("role") || userObj.role || tokenPayload.role,
      email,
      mongoId,
      shortId,
      allKeys: new Set([email, mongoId, shortId].filter(Boolean)),
    };
  };

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const {
    role: userRole,
    email,
    mongoId,
    shortId,
    allKeys,
  } = useMemo(getUserContext, []);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [viewMode, setViewMode] = useState("detailed");
  const [groupBy, setGroupBy] = useState("none");
  const [filters, setFilters] = useState({
    readStatus: "all",
    timeRange: "all",
    notificationType: "all",
    priority: "all",
  });

  const limit = 20;



  const handleMarkAsRead = useCallback(
    async (id) => {
      try {
        await api.patch(`/api/notifications/${id}`, { read: true });

        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === id ? { ...notif, read: true } : notif
          )
        );

        setNotificationCount((prev) => Math.max(prev - 1, 0));
        setSelectedNotifications((prev) => prev.filter((item) => item !== id));

        socket.emit("notificationCountUpdated", {
          email:
            userRole === "admin" ? "admin" : localStorage.getItem("userId"),
        });
      } catch (error) {
        console.error("Error marking notification as read", error);
      }
    },
    [userRole]
  );

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      let response;

      if (userRole === "admin") {
        response = await api.get(
          `/api/notifications?page=${page}&limit=${limit}`
        );
      } else {
        // For users: GET by EMAIL (most common on your backend)
        if (!email) {
          console.error("No email found for current user");
          setLoading(false);
          return;
        }
        response = await api.get(
          `/api/notifications/${encodeURIComponent(
            email
          )}?page=${page}&limit=${limit}`
        );
      }

      const newNotifications = response.data;

      // Server returns mixed data; filter client-side but DON'T over-restrict
      const filteredNotifications = newNotifications.filter((n) => {
        if (userRole === "admin") {
          return n.type === "admin";
        }

        if (userRole === "user") {
          // Accept match by any known recipient field
          const recipientKey =
            n.recipientEmail || n.recipientId || n.recipient || n.userId;

          const matchesRecipient = recipientKey
            ? allKeys.has(String(recipientKey))
            : false;

          // Allow if action is not set OR is one of these
          const actionAllowed =
            !n.action || ["task-created", "task-updated"].includes(n.action);

          return n.type === "user" && matchesRecipient && actionAllowed;
        }

        return false;
      });

      setNotifications((prev) =>
        page === 1 ? filteredNotifications : [...prev, ...filteredNotifications]
      );

      setNotificationCount((prev) =>
        page === 1
          ? filteredNotifications.filter((n) => !n.read).length
          : prev + filteredNotifications.filter((n) => !n.read).length
      );

      setHasMore(newNotifications.length === limit);
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  }, [userRole, page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const normalizeDateString = useCallback((dateString) => {
    return dateString
      .split("/")
      .map((part, idx) => (idx < 2 ? String(parseInt(part, 10)) : part))
      .join("/");
  }, []);

  const filteredNotifications = useMemo(() => {
    let result = notifications.filter((notification) => {
      // Search filter
      const query = searchQuery.toLowerCase();
      const message = notification.message?.toLowerCase() || "";
      const updaterName = (() => {
        try {
          const updater = JSON.parse(notification.updatedBy);
          return updater?.name?.toLowerCase() || "";
        } catch {
          return "";
        }
      })();
      const detailsText = notification.details
        ? Object.values(notification.details).join(" ").toLowerCase()
        : "";
      const normalizedCreatedAt = normalizeDateString(
        new Date(notification.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      ).toLowerCase();
      const normalizedQuery = normalizeDateString(searchQuery.toLowerCase());

      const searchMatch =
        searchQuery === "" ||
        message.includes(query) ||
        updaterName.includes(query) ||
        detailsText.includes(query) ||
        normalizedCreatedAt.includes(normalizedQuery);

      // Filter conditions
      const readStatusMatch =
        filters.readStatus === "all" ||
        (filters.readStatus === "read" && notification.read) ||
        (filters.readStatus === "unread" && !notification.read);

      const now = new Date();
      const notifDate = new Date(notification.createdAt);
      const timeRangeMatch =
        filters.timeRange === "all" ||
        (filters.timeRange === "today" &&
          notifDate.toDateString() === now.toDateString()) ||
        (filters.timeRange === "week" &&
          notifDate >= new Date(now.setDate(now.getDate() - 7))) ||
        (filters.timeRange === "month" &&
          notifDate >= new Date(now.setMonth(now.getMonth() - 1)));

      const typeMatch =
        filters.notificationType === "all" ||
        notification.action === filters.notificationType;

      const priorityMatch =
        filters.priority === "all" ||
        notification.priority === filters.priority;

      return (
        searchMatch &&
        readStatusMatch &&
        timeRangeMatch &&
        typeMatch &&
        priorityMatch
      );
    });

    // Grouping logic
    if (groupBy !== "none") {
      return result.reduce((groups, notif) => {
        let key;
        if (groupBy === "date") {
          key = new Date(notif.createdAt).toLocaleDateString("en-GB");
        } else if (groupBy === "type") {
          key = notif.action || "other";
        }

        if (!groups[key]) groups[key] = [];
        groups[key].push(notif);
        return groups;
      }, {});
    }

    return { "All Notifications": result };
  }, [notifications, searchQuery, filters, groupBy, normalizeDateString]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      if (unreadNotifications.length === 0) return;

      await Promise.all(
        unreadNotifications.map((notif) =>
          api.patch(`/api/notifications/${notif._id}`, { read: true })
        )
      );

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setNotificationCount(0);
      setSelectedNotifications([]);

      socket.emit("notificationCountUpdated", {
        email: userRole === "admin" ? "admin" : localStorage.getItem("userId"),
      });
    } catch (error) {
      console.error("Error marking all notifications as read", error);
    }
  }, [notifications, userRole]);

  const handleBulkMarkAsRead = useCallback(async () => {
    try {
      await Promise.all(
        selectedNotifications.map((id) =>
          axios.patch(`https://taskbe.sharda.co.in/api/notifications/${id}`, {
            read: true,
          })
        )
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          selectedNotifications.includes(notif._id)
            ? { ...notif, read: true }
            : notif
        )
      );

      setNotificationCount((prev) =>
        Math.max(prev - selectedNotifications.length, 0)
      );
      setSelectedNotifications([]);

      socket.emit("notificationCountUpdated", {
        email: userRole === "admin" ? "admin" : localStorage.getItem("userId"),
      });
    } catch (error) {
      console.error("Error in bulk mark as read", error);
    }
  }, [selectedNotifications, userRole]);

  const toggleSelectNotification = useCallback((id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
      if (
        scrollHeight - scrollTop <= clientHeight * 1.2 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    },
    [loading, hasMore]
  );

  return (
    <div
      className="p-4 mx-auto h-[90vh] overflow-y-auto"
      onScroll={handleScroll}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          🔔 Notifications{" "}
          {notificationCount > 0 && `(${notificationCount} unread)`}
        </h2>

        <div className="relative w-full sm:w-100">
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 shadow-sm focus:border-blue-100 focus:ring-1 focus:ring-blue-300 focus:outline-none text-sm transition-all duration-300"
          />
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              ></path>
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllAsRead}
            disabled={notifications.every((n) => n.read)}
            className="text-sm font-medium px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Group By Section */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">Group by:</span>
          {["none", "date", "type"].map((type) => (
            <button
              key={type}
              onClick={() => setGroupBy(type)}
              className={`text-sm px-3 py-1 rounded-full border ${
                groupBy === type
                  ? "bg-blue-100 text-blue-600 border-blue-300"
                  : "bg-gray-100 text-gray-700 border-gray-200"
              } hover:bg-blue-50 transition`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.readStatus}
            onChange={(e) =>
              setFilters({ ...filters, readStatus: e.target.value })
            }
            className="text-sm px-3 py-1 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>

          <select
            value={filters.timeRange}
            onChange={(e) =>
              setFilters({ ...filters, timeRange: e.target.value })
            }
            className="text-sm px-3 py-1 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>

          <select
            value={filters.notificationType}
            onChange={(e) =>
              setFilters({ ...filters, notificationType: e.target.value })
            }
            className="text-sm px-3 py-1 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="task-created">Task Created</option>
            <option value="task-updated">Task Updated</option>
          </select>
        </div>
      </div>

      {selectedNotifications.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {selectedNotifications.length} selected
          </span>
          <button
            onClick={handleBulkMarkAsRead}
            className="text-sm font-medium px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all"
          >
            Mark Selected as Read
          </button>
          <button
            onClick={() => setSelectedNotifications([])}
            className="text-sm font-medium px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all"
          >
            Clear Selection
          </button>
        </div>
      )}

      {loading && page === 1 ? (
        <div className="text-center text-sm text-gray-400">
          Loading notifications...
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(filteredNotifications).length === 0 ? (
            <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
              🎉 No notifications match your filters
            </div>
          ) : (
            Object.entries(filteredNotifications)
              .sort(([a], [b]) => {
                if (groupBy === "none") return 0; // don't try to parse "All Notifications" as a date
                const toDate = (str) => {
                  const [d, m, y] = (str || "").split("/").map(Number);
                  return new Date(y, m - 1, d).getTime() || 0;
                };
                return toDate(b) - toDate(a);
              })

              .map(([group, groupNotifications]) => (
                <div key={group}>
                  {groupBy !== "none" && (
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 sticky top-0 bg-white py-2 z-10">
                      {group}
                    </h3>
                  )}
                  <div className="space-y-4">
                    {groupNotifications
                      .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      )
                      .map((notification) => (
                        <NotificationItem
                          key={notification._id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          selectedNotifications={selectedNotifications}
                          toggleSelectNotification={toggleSelectNotification}
                          viewMode={viewMode}
                        />
                      ))}
                  </div>
                </div>
              ))
          )}
          {loading && page > 1 && (
            <div className="text-center text-sm text-gray-400 py-4">
              Loading more notifications...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
