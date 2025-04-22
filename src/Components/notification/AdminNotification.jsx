
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



import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../../redux/notificationSlice";

const AdminNotification = () => {
  
  const dispatch = useDispatch();
  
  const notifications = useSelector((state) => state.notifications.allNotifications);
  console.log("Notifications in Redux store:", notifications);

  useEffect(() => {
    dispatch(fetchNotifications()); // Fetch notifications when the component mounts
  }, [dispatch]);

  // Filter notifications to show only those for admins
  const adminNotifications = notifications.filter(
    (notification) => notification.type === "admin" // Show only admin type notifications
  );
  console.log("Admin Notifications:", adminNotifications); 
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
