
// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchNotifications } from "../../redux/notificationSlice"; // Ensure the fetchNotifications action is imported

// const AdminNotification = () => {
//   const dispatch = useDispatch();
//   const notifications = useSelector((state) => state.notifications.allNotifications); // Getting notifications from Redux store

//   useEffect(() => {
//     // Fetch admin notifications when the component mounts
//     dispatch(fetchNotifications());
//   }, [dispatch]);

//   useEffect(() => {
//     console.log("Notifications in AdminNotification component:", notifications); // Log notifications here to debug
//   }, [notifications]);
  
//   return (
//     <div className="notifications-container">
//       <h3>Admin Notifications</h3>
//       {notifications.length === 0 ? (
//         <p>No new notifications</p>
//       ) : (
//         <ul>
//           {notifications.map((notification) => (
//             <li key={notification._id}>
//               <p>{notification.message}</p>
//               <span>{new Date(notification.date).toLocaleString()}</span>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default AdminNotification;

 


// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchNotifications } from "../../redux/notificationSlice";

// const AdminNotification = () => {
//   const dispatch = useDispatch();
//   const notifications = useSelector((state) => state.notifications.allNotifications);

//   useEffect(() => {
//     // Fetch notifications when the component mounts
//     dispatch(fetchNotifications());
//   }, [dispatch]);

//   // Filter notifications to show only those for admins
//   const adminNotifications = notifications.filter(
//     (notification) => notification.type === "admin" // Show only admin type notifications
//   );

//   return (
//     <div className="notifications-container">
//       <h3>Admin Notifications</h3>
//       {adminNotifications.length === 0 ? (
//         <p>No new notifications</p>
//       ) : (
//         <ul>
//           {adminNotifications.map((notification) => (
//             <li key={notification._id}>
//               <p>{notification.message}</p>
//               <span>{new Date(notification.createdAt).toLocaleString()}</span>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default AdminNotification;



// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchNotifications } from "../../redux/notificationSlice";

// const AdminNotification = () => {
  
//   const dispatch = useDispatch();
  
//   const notifications = useSelector((state) => state.notifications.allNotifications);
//   console.log("Notifications in Redux store:", notifications);

//   useEffect(() => {
//     dispatch(fetchNotifications()); // Fetch notifications when the component mounts
//   }, [dispatch]);

//   // Filter notifications to show only those for admins
//   const adminNotifications = notifications.filter(
//     (notification) => notification.type === "admin" // Show only admin type notifications
//   );
//   console.log("Admin Notifications:", adminNotifications); 

  
//   return (
//     <div className="notifications-container">
//       <h3>Admin Notifications</h3>
//       {adminNotifications.length === 0 ? (
//         <p>No new notifications</p>
//       ) : (
//         <ul>
//           {adminNotifications.map((notification) => (
//             <li key={notification._id}>
//               <p>{notification.message}</p>
//               <span>{new Date(notification.createdAt).toLocaleString()}</span>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default AdminNotification;


import React, { useEffect, useState } from "react";

const AdminNotification = () => {
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch admin notifications directly from the API
    const fetchAdminNotifications = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notifications/admin");
        const data = await response.json();
        
        if (response.ok) {
          console.log("Fetched Admin Notifications:", data);
          setAdminNotifications(data); // Store the fetched notifications in state
        } else {
          setError("Error fetching notifications");
        }
      } catch (err) {
        console.error("Error fetching admin notifications:", err);
        setError("Error fetching notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminNotifications(); // Call the function to fetch data
  }, []);

  if (loading) {
    return <p>Loading notifications...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="notifications-container">
      <h3>Admin Notifications</h3>
      {adminNotifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul>
          {adminNotifications.map((notification) => (
            <li key={notification._id}>
              <p>{notification.message}</p>
              <span>{new Date(notification.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminNotification;
