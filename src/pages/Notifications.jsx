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
  

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        let response;

        if (userRole === "admin") {
          // Admin: Get all notifications
          response = await axios.get("https://sataskmanagementbackend.onrender.com/api/notifications");
        } else {
          // User: Get by user email
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

        const filteredNotifications = allNotifications.filter(
          (notification) => {
            if (userRole === "admin") {
              return notification.action === "task-updated";
            } else if (userRole === "user") {
              return (
                notification.action === "task-created" ||
                notification.action === "task-updated"
              );
            }
            return false;
          }
        );

        // console.log("Filtered notifications:", filteredNotifications);
        setNotifications(filteredNotifications);
      } catch (error) {
        console.error("Error fetching notifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userRole]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`https://sataskmanagementbackend.onrender.com/api/notifications/${id}`, {
        read: true,
      });
  
      console.log("🧹 Marked notification as read:", userid); // ✅ Move here
      console.log("🔻 Decreasing badge count");
  
      // Decrease badge count if it was unread before
      setNotifications((prevNotifs) =>
        prevNotifs.map((notif) =>
          notif._id.toString() === id.toString()
            ? { ...notif, read: true }
            : notif
        )
      );
  
      const justMarked = notifications.find((n) => n._id === id);
      if (justMarked && !justMarked.read) {
        setNotificationCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };


  
  return (
    <div className="p-4 mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        🔔 Notifications
      </h2>

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
            [...notifications]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((notification) => (
                <div
                  key={notification._id}
                  className={`group transition-shadow duration-300 hover:shadow-md border rounded-xl p-5 flex justify-between items-start gap-4 ${
                    notification.readBy?.includes(localStorage.getItem("userId"))
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
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div
                    key={notification._id}
                    onClick={() => {
                      if (!notification.read)
                        handleMarkAsRead(notification._id);
                    }}
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
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
