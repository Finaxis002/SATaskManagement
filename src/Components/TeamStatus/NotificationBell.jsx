import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const token = localStorage.getItem('authToken');

  // ✅ Updated API Name
  const API_URL = "https://taskbe.sharda.co.in/api/worknotify";

  const fetchNotify = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.data.success){
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchNotify();
    const interval = setInterval(fetchNotify, 10000); // 10 sec polling
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    await axios.patch(`${API_URL}/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    fetchNotify(); // List refresh
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2">
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl border rounded z-50">
          <div className="p-2 border-b font-bold">Notifications</div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((n) => ( 
              <div 
                key={n._id} 
                onClick={() => markRead(n._id)}
                className={`p-2 border-b cursor-pointer ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}
              >
                <p className="text-sm">{n.message}</p>
                <span className="text-xs text-gray-500">
                  {new Date(n.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;