import React, { useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const TaskNotificationManager = () => {
  const shownNotificationIds = useRef(new Set());
  const notificationSound = useRef(null);
  const lastCheckTime = useRef(new Date());

  // Sound initialize
  useEffect(() => {
    notificationSound.current = new Audio("/notification.mp3");
  }, []);

  const playSound = () => {
    if (notificationSound.current) {
      notificationSound.current.play().catch(() => {});
    }
  };

  const checkNewNotifications = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("⚠️ No auth token found");
        return;
      }

      // ✅ CORRECT: Using /api/notifications
      const response = await axios.get(
        'https://taskbe.sharda.co.in/api/notifications',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("📥 Notification Response:", response.data);

      // ✅ Handle the response structure: { data: [...], pagination: {...} }
      let notifications = [];
      if (response.data && Array.isArray(response.data.data)) {
        notifications = response.data.data;
      } else if (Array.isArray(response.data)) {
        notifications = response.data;
      }

      // ✅ Filter for UNREAD notifications that we haven't shown yet
      const newNotifications = notifications.filter(notif => 
        !notif.isRead && 
        !shownNotificationIds.current.has(notif._id) &&
        new Date(notif.createdAt) > lastCheckTime.current
      );

      console.log(`🔍 Found ${newNotifications.length} new notifications`);

      if (newNotifications.length > 0) {
        newNotifications.forEach(notif => {
          // Mark as shown
          shownNotificationIds.current.add(notif._id);
          
          playSound();

          toast.info(
            <div 
              onClick={() => {
                // Navigate to the action URL if available
                const url = notif.action || notif.actionUrl || '/team-status';
                window.location.href = url;
              }} 
              className="cursor-pointer"
            >
              <strong className="block text-blue-700">
                {getIcon(notif.type)} {notif.title}
              </strong>
              <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(notif.createdAt).toLocaleTimeString()}
              </p>
            </div>,
            {
              position: "bottom-right",
              autoClose: 8000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        });

        // Update last check time
        lastCheckTime.current = new Date();
      }

    } catch (error) {
      console.error("❌ Notification Fetch Error:", error.response || error);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'task_assigned': return '📋';
      case 'task_updated': return '✏️';
      case 'task_completed': return '✅';
      case 'task_deleted': return '🗑️';
      case 'remark_added': return '💬';
      case 'deadline_reminder': return '⏰';
      default: return '🔔';
    }
  };

  useEffect(() => {
    console.log("🚀 TaskNotificationManager initialized");
    
    // Initial check after 2 seconds
    const initialTimeout = setTimeout(() => {
      console.log("🔍 Running initial notification check...");
      checkNewNotifications();
    }, 2000);

    // Poll every 10 seconds
    const intervalId = setInterval(() => {
      checkNewNotifications();
    }, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <ToastContainer 
      limit={5}
      newestOnTop={true}
      rtl={false}
      pauseOnFocusLoss
      theme="light"
    />
  );
};

export default TaskNotificationManager;