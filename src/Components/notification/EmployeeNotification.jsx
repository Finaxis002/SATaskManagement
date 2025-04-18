
import React, { useEffect, useState } from "react";
import socket from "../../socket";
import { useDispatch , useSelector} from "react-redux";
import { addNotification, clearNotifications, markAllAsRead } from "../../redux/notificationSlice";
import { v4 as uuidv4 } from 'uuid'; 

const EmployeeNotifications = ({setNotificationCount}) => {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  // const [notificationCount, setNotificationCount] = useState(0);
  // const notificationCount = useSelector((state) => {
  //   console.log(state); // Log the entire state to check if notifications is defined
  //   return state.notifications ? state.notifications.count : 0;
  // });
  const { allNotifications, unreadCount } = useSelector(
    (state) => state.notifications
  );
  useEffect(() => {
    if (unreadCount > 0) {
      dispatch(markAllAsRead());
    }
  }, [dispatch, unreadCount]);

  useEffect(() => {
    const email = localStorage.getItem("userId"); // Using userId instead of email for the socket registration

    if (email) {
      socket.emit("register", email); 
    }

    socket.on("new-task", (task) => {
      const newNotification = {
        // id: Date.now(),
        id: uuidv4(), 
        message: `New Task Assigned: ${task.name} (Due: ${new Date(task.due).toLocaleDateString()})`,
      };
      
        // Dispatch to Redux for global badge count
      dispatch(addNotification(newNotification));
      // Update local state for display
      // setNotifications((prev) => [...prev, newNotification]);
      setNotifications((prevNotifications) => {
        
        if (!prevNotifications.some((note) => note.message === newNotification.message)) {
          return [newNotification, ...prevNotifications ];
        }
        return prevNotifications; // Return existing state if duplicate found
      });

    });

    // Clean up the socket listener when component unmounts
    return () => {
      socket.off("new-task");
    };
  }, [dispatch]);

  // Clear Redux count when visiting this page
  useEffect(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  // Fetch notifications from the backend on component mount
  useEffect(() => {
    const email = localStorage.getItem("userId");

    if (email) {
      fetch(`http://localhost:5000/api/notifications/${email}`) // Backend route for fetching notifications
        .then((response) => response.json())
        .then((data) => {
          // setNotifications((prev) => [...prev, ...data]); // Merge with real-time notifications
          setNotifications((prev) => {
            const newNotifications = [...prev];

            // Avoid duplicate notifications from backend and real-time
            data.forEach((notification) => {
              if (!newNotifications.some((note) => note.message === notification.message)) {
                newNotifications.push(notification);
              }
            });
            newNotifications.forEach((notification) => dispatch(addNotification(notification)));

            return newNotifications;
          });
          
        })
        .catch((err) => console.error("Error fetching notifications:", err));
    }
  }, [dispatch]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">📢 Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((note) => (
            <li
              key={note.id}
              className="bg-blue-100 text-blue-800 p-2 rounded shadow-sm"
            >
              {note.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployeeNotifications;


