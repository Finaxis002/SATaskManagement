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












import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../../redux/notificationSlice";
import socket from "../../socket";

const AdminNotification = () => {
  const dispatch = useDispatch();
  const role = localStorage.getItem('role');
  const userEmail = localStorage.getItem('userId');

  useEffect(() => {
    if (role !== 'admin') return;

    console.log('Initializing admin notifications for:', userEmail);

    // Verify socket connection
    console.log('Socket connected:', socket.connected);
    
    // Register admin with socket
    const registerAdmin = () => {
      socket.emit('register', userEmail, (response) => {
        console.log('Admin registration response:', response);
      });
    };

    registerAdmin();

    // Handle task completed notifications
    const handleTaskCompleted = (data) => {
      console.log('Admin received task-completed event:', data);
      dispatch(addNotification({
        id: Date.now(),
        message: `${data.userName} completed "${data.taskName}"`,
        date: new Date().toISOString(),
        isRead: false
      }));
    };

    // Add reconnect logic
    const onConnect = () => {
      console.log('Socket reconnected, reregistering admin');
      registerAdmin();
    };

    socket.on('connect', onConnect);
    socket.on('task-completed', handleTaskCompleted);

    return () => {
      socket.off('connect', onConnect);
      socket.off('task-completed', handleTaskCompleted);
      console.log('Cleaned up admin notification listeners');
    };
  }, [dispatch, role, userEmail]);

  return null; // This component only handles logic, UI is separate
};

export default AdminNotification;