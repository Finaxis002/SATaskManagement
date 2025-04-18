// src/components/AdminNotification.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../../redux/notificationSlice';
import socket from '../../socket';

const AdminNotification = () => {
  const dispatch = useDispatch();
  const userEmail = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (role === 'admin') {
      console.log('AdminNotification component mounted - registering socket listener');
      
      const handleTaskCompleted = (data) => {
        console.log('Received task-completed event:', data);
        const notification = {
          id: Date.now(),
          message: `${data.userName} completed "${data.taskName}" on ${data.date}`,
          isRead: false,
          type: 'task-completion'
        };
        dispatch(addNotification(notification));
      };

      socket.on('task-completed', handleTaskCompleted);

      // Register admin socket with backend
      socket.emit('register-admin', userEmail);

      return () => {
        socket.off('task-completed', handleTaskCompleted);
      };
    }
  }, [dispatch, role, userEmail]);

  return null;
};

export default AdminNotification;