// // src/components/AdminNotification.js
// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { addNotification } from '../../redux/notificationSlice';
// import socket from '../../socket';

// const AdminNotification = () => {
//     const dispatch = useDispatch();
//     const role = localStorage.getItem('role');
//     const userEmail = localStorage.getItem('userId');
  
//     useEffect(() => {
//       if (role === 'admin') {
//         console.log('Initializing admin notifications for:', userEmail);
  
//         // Verify socket connection
//         console.log('Socket connected:', socket.connected);
        
//         // Register with heartbeat
//         const registerAdmin = () => {
//           socket.emit('register', userEmail, (response) => {
//             console.log('Registration response:', response);
//           });
//         };
  
//         registerAdmin();
  
//         // Add reconnect logic
//         const onConnect = () => {
//           console.log('Socket reconnected, reregistering');
//           registerAdmin();
//         };
  
//         socket.on('connect', onConnect);
  
//         // Notification handler with debug logs
//         const handleTaskCompleted = (data) => {
//           console.log('Received task-completed event:', data);
//           dispatch(addNotification({
//             id: Date.now(),
//             message: `${data.userName} completed "${data.taskName}"`,
//             date: data.date,
//             isRead: false
//           }));
//         };
  
//         socket.on('task-completed', handleTaskCompleted);
  
//         return () => {
//           socket.off('connect', onConnect);
//           socket.off('task-completed', handleTaskCompleted);
//           console.log('Cleaned up admin notification listeners');
//         };
//       }
//     }, [dispatch, role, userEmail]);
  
//     return null;
//   };
  
  

// export default AdminNotification;












import React, { useEffect, useState } from "react";
import socket from "../../socket";
import { useDispatch, useSelector } from "react-redux";
import { 
  addNotification, 
  markAllAsRead,
  markAsRead
} from "../../redux/notificationSlice";
import { v4 as uuidv4 } from 'uuid';

const AdminNotification = () => {
  const dispatch = useDispatch();
  const { allNotifications, unreadCount } = useSelector((state) => state.notifications);
  const role = localStorage.getItem('role');
  const userEmail = localStorage.getItem('userId');
  const [isOpen, setIsOpen] = useState(false);

  // Mark all as read when component mounts if there are unread notifications
  useEffect(() => {
    if (unreadCount > 0 && role === 'admin') {
      dispatch(markAllAsRead());
    }
  }, [dispatch, role, unreadCount]);

  // Socket setup for real-time admin notifications
  useEffect(() => {
    if (role !== 'admin') return;

    const registerAdmin = () => {
      socket.emit("register", userEmail, (response) => {
        console.log('Admin socket registration:', response.status);
      });
    };

    registerAdmin();

    const handleTaskCompleted = (data) => {
      const newNotification = {
        id: uuidv4(),
        message: `${data.userName} completed task: "${data.taskName}"`,
        date: new Date().toISOString(),
        isRead: false
      };
      dispatch(addNotification(newNotification));
    };

    socket.on('task-completed', handleTaskCompleted);

    return () => {
      socket.off('task-completed', handleTaskCompleted);
    };
  }, [dispatch, role, userEmail]);

  if (role !== 'admin') return null;

  // Filter notifications to only show admin-relevant ones
  const adminNotifications = allNotifications.filter(notification => 
    notification.message.includes('completed task:')
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Notification Bell Icon */}
      <div 
        className="relative bg-white p-3 rounded-full shadow-md cursor-pointer hover:bg-gray-100"
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
        <div className="mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
            <h3 className="font-semibold">Admin Notifications</h3>
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
                No notifications yet
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
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
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

export default AdminNotification;