import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { markAsRead, markAllAsRead } from "../../redux/notificationSlice";

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { allNotifications, unreadCount } = useSelector((state) => state.notifications);
  const role = localStorage.getItem('role');
  const [isOpen, setIsOpen] = useState(false);

  if (role !== 'admin') return null;

  // Filter admin-specific notifications
  const adminNotifications = allNotifications.filter(notification => 
    notification.message.includes('completed "')
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Notification Bell */}
      <div 
        className="relative bg-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-gray-700" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Notification Panel */}
      {isOpen && (
        <div className="mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
            <h3 className="font-semibold">Task Completions</h3>
            <button 
              onClick={() => dispatch(markAllAsRead())}
              className="text-xs hover:underline"
            >
              Mark all as read
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {adminNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No completed tasks yet
              </div>
            ) : (
              <ul>
                {adminNotifications.map((notification) => (
                  <li 
                    key={notification.id}
                    className={`p-4 border-b ${!notification.isRead ? 'bg-blue-50' : 'bg-white'}`}
                    onClick={() => dispatch(markAsRead(notification.id))}
                  >
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.date).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;