import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaClock } from "react-icons/fa";
import { BsFillCircleFill } from "react-icons/bs";

const WorkBoardNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      
      const response = await axios.get('https://taskbe.sharda.co.in/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📥 Work Board Notifications:", response.data);

      if (response.data && Array.isArray(response.data.data)) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.pagination?.unreadCount || 0);
      }

    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Work Notifications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {notifications.map(n => (
            <div key={n._id} className="p-4 border mb-2">
              <h3>{n.title}</h3>
              <p>{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkBoardNotifications;