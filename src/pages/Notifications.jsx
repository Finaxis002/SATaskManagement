import React, { useState, useEffect } from "react";
import axios from "axios";

import { io } from "socket.io-client";
// Assume socket.io client setup
const socket = io("https://sataskmanagementbackend.onrender.com", {
  withCredentials: true,
});

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const userRole = localStorage.getItem("role"); // Get user role (admin or user)
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(
        `https://sataskmanagementbackend.onrender.com/api/notifications/${id}`,
        {
          read: true,
        }
      );

      console.log("🧹 Marked notification as read:", id);

      // ✅ Update that specific notification in local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );

      // ✅ Update unread count
      setNotificationCount((prevCount) => Math.max(prevCount - 1, 0));

      // ✅ Emit updated count via socket
      socket.emit("notificationCountUpdated", {
        email: userRole === "admin" ? "admin" : localStorage.getItem("userId"),
      });
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let response;

      if (userRole === "admin") {
        response = await axios.get(
          "https://sataskmanagementbackend.onrender.com/api/notifications"
        );
      } else {
        const emailToFetch = localStorage.getItem("userId");
        if (!emailToFetch) {
          console.error("No userId found in localStorage.");
          return setLoading(false);
        }

        console.log("User email to fetch:", emailToFetch);
        response = await axios.get(
          `https://sataskmanagementbackend.onrender.com/api/notifications/${emailToFetch}`
        );
      }

      const allNotifications = response.data;
      console.log("Fetched notifications:", allNotifications);

      const filteredNotifications = allNotifications.filter((notification) => {
        const currentEmail = localStorage.getItem("userId");

        if (userRole === "admin") {
          return (
            notification.type === "admin" &&
            (notification.action === "task-created" ||
             notification.action === "task-updated")
          );
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

      console.log("Filtered notifications:", filteredNotifications);
      setNotifications(filteredNotifications);
      setNotificationCount(filteredNotifications.filter((n) => !n.read).length); // 🆕 Update notification counter correctly
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userRole]);

  const normalizeDateString = (dateString) => {
    // Example: "25/04/2025" ➔ "25/4/2025"
    return dateString
      .split("/")
      .map((part, idx) => (idx < 2 ? String(parseInt(part, 10)) : part)) // Day and Month remove leading zeros
      .join("/");
  };

  return (
    <div className="p-4 mx-auto h-[90vh] overflow-y-auto">
      <div className="flex gap-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          🔔 Notifications
        </h2>
        <div className="relative w-full sm:w-72 mb-4">
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
      </div>

      {loading ? (
        <div className="text-center text-sm text-gray-400">
          Loading notifications...
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
              🎉 You're all caught up! No notifications.
            </div>
          ) : (
            <div className="space-y-4">
              {[...notifications]
                .filter((notification) => {
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
                    ? Object.values(notification.details)
                        .join(" ") // Combine all details into a single string
                        .toLowerCase()
                    : "";
                  const normalizedCreatedAt = normalizeDateString(
                    new Date(notification.createdAt).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "2-digit", year: "numeric" }
                    )
                  ).toLowerCase();

                  const normalizedQuery = normalizeDateString(
                    searchQuery.toLowerCase()
                  );

                  return (
                    message.includes(query) ||
                    updaterName.includes(query) ||
                    detailsText.includes(query) ||
                    normalizedCreatedAt.includes(normalizedQuery)
                  );
                })

                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((notification) => (
                  <div
                    key={notification._id}
                    className={`group transition-shadow duration-300 hover:shadow-md border rounded-xl p-5 flex justify-between items-start gap-4 ${
                      notification.read
                        ? "bg-white border-gray-200"
                        : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300"
                    }`}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                        )}
                        <p className="text-sm font-medium text-gray-800">
                          {notification.message}
                        </p>
                      </div>

                      {notification.updatedBy &&
                        (() => {
                          try {
                            const updater = JSON.parse(notification.updatedBy);
                            return updater?.name ? (
                              <p className="text-xs text-gray-500 italic">
                                Updated by {updater.name}
                              </p>
                            ) : null;
                          } catch (err) {
                            return null;
                          }
                        })()}

                      {notification.details &&
                        Object.keys(notification.details).length > 0 && (
                          <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                            {Object.entries(notification.details).map(
                              ([key, value]) => (
                                <li key={key}>{value}</li>
                              )
                            )}
                          </ul>
                        )}

                      <p className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </p>
                    </div>

                    <div
                      className={`group transition-shadow duration-300 hover:shadow-md border rounded-xl flex justify-between items-start gap-4 cursor-pointer ${
                        notification.read
                          ? "bg-white border-gray-200"
                          : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300"
                      }`}
                    >
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        disabled={notification.read}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all border ${
                          notification.read
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                        }`}
                      >
                        {notification.read ? "Read" : "Mark as Read"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
