import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://sataskmanagementbackend.onrender.com", {
  withCredentials: true,
});

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
        className={`group p-5 rounded-xl border transition-all shadow-sm hover:shadow-md flex justify-between gap-4 ${
          isUnread
            ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex gap-4 flex-1">
          <input
            type="checkbox"
            checked={selectedNotifications.includes(notification._id)}
            onChange={() => toggleSelectNotification(notification._id)}
            className="mt-1 h-4 w-4 accent-blue-600"
          />

          <div className="space-y-2 w-full">
            <div className="flex flex-wrap items-center gap-2">
              {isUnread && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              )}

              <p className="text-sm font-semibold text-gray-800">
                {notification.message}
              </p>

              {notification.priority && (
                <span
                  className={`px-2 py-0.5 text-sm font-medium rounded-full capitalize ${
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

            {notification.updatedBy &&
              (() => {
                try {
                  if (notification.updatedBy === "System") {
                    return (
                      <p className="text-sm text-gray-500 italic">
                        Updated by System
                      </p>
                    );
                  }

                  const updater =
                    typeof notification.updatedBy === "string"
                      ? JSON.parse(notification.updatedBy)
                      : notification.updatedBy;

                  return updater?.name ? (
                    <p className="text-sm text-gray-500 italic">
                      Updated by {updater.name}
                    </p>
                  ) : null;
                } catch (err) {
                  return null;
                }
              })()}

            {notification.details &&
              Object.keys(notification.details).length > 0 && (
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {Object.entries(notification.details).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium">{key}:</span> {value}
                    </li>
                  ))}
                </ul>
              )}

            <p className="text-sm text-gray-400 pt-1">
              {new Date(notification.createdAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={() => onMarkAsRead(notification._id)}
            disabled={notification.read}
            className={`text-sm px-4 py-1.5 rounded-md font-medium transition-all border ${
              notification.read
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
            }`}
          >
            {notification.read ? "Read" : "Mark as Read"}
          </button>
        </div>
      </div>
    );
  }
);

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const userRole = localStorage.getItem("role");
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
        await axios.patch(
          `https://sataskmanagementbackend.onrender.com/api/notifications/${id}`,
          { read: true }
        );

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
        response = await axios.get(
          `https://sataskmanagementbackend.onrender.com/api/notifications?page=${page}&limit=${limit}`
        );
      } else {
        const emailToFetch = localStorage.getItem("userId");
        if (!emailToFetch) {
          console.error("No userId found in localStorage.");
          return setLoading(false);
        }

        response = await axios.get(
          `https://sataskmanagementbackend.onrender.com/api/notifications/${emailToFetch}?page=${page}&limit=${limit}`
        );
      }

      const newNotifications = response.data;

      const filteredNotifications = newNotifications.filter((notification) => {
        const currentEmail = localStorage.getItem("userId");

        if (userRole === "admin") {
          return notification.type === "admin";
        }

        if (userRole === "user") {
          const updatedBy = notification.updatedBy
            ? JSON.parse(notification.updatedBy)
            : null;

          return (
            notification.type === "user" &&
            notification.recipientEmail === currentEmail &&
            (notification.action === "task-created" ||
              notification.action === "task-updated") &&
            updatedBy?.email !== currentEmail
          );
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
          axios.patch(
            `https://sataskmanagementbackend.onrender.com/api/notifications/${notif._id}`,
            { read: true }
          )
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
          axios.patch(
            `https://sataskmanagementbackend.onrender.com/api/notifications/${id}`,
            { read: true }
          )
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
            className="text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              .sort(([dateA], [dateB]) => {
                // Convert DD/MM/YYYY to Date object
                const toDate = (str) => {
                  const [day, month, year] = str.split("/").map(Number);
                  return new Date(year, month - 1, day);
                };
                return toDate(dateB) - toDate(dateA); // Descending order
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
