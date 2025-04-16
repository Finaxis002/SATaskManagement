
////////////////////////////////////////////////////////////////////////

// import React, { useEffect, useState } from "react";
// import socket from "../../socket";
// import { useDispatch } from "react-redux";
// import { addNotification, clearNotifications } from "../../redux/notificationSlice";

// const EmployeeNotifications = () => {
//   const dispatch = useDispatch();
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     const email = localStorage.getItem("userId");
//     if (email) {
//       socket.emit("register", email);
//     }

//     socket.on("new-task", (task) => {
//       const newNotification = {
//         id: Date.now(),
//         message: `New Task Assigned: ${task.name} (Due: ${new Date(task.due).toLocaleDateString()})`,
//       };

//       // Update local state for display
//       setNotifications((prev) => [...prev, newNotification]);

//       // Dispatch to Redux for global badge count
//       dispatch(addNotification(newNotification));
//     });

//     return () => {
//       socket.off("new-task");
//     };
//   }, [dispatch]);

//   // Clear Redux count when visiting this page
//   useEffect(() => {
//     dispatch(clearNotifications());
//   }, [dispatch]);

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold mb-3">📢 Notifications</h2>
//       {notifications.length === 0 ? (
//         <p className="text-gray-500">No notifications yet</p>
//       ) : (
//         <ul className="space-y-2">
//           {notifications.map((note) => (
//             <li
//               key={note.id}
//               className="bg-blue-100 text-blue-800 p-2 rounded shadow-sm"
//             >
//               {note.message}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default EmployeeNotifications;




///////////////////////////////////////////////////////////////
import React, { useEffect, useState } from "react";
import socket from "../../socket";
import { useDispatch } from "react-redux";
import { addNotification, clearNotifications } from "../../redux/notificationSlice";

const EmployeeNotifications = () => {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const email = localStorage.getItem("userId"); // Using userId instead of email for the socket registration

    if (email) {
      socket.emit("register", email);
    }

    socket.on("new-task", (task) => {
      const newNotification = {
        id: Date.now(),
        message: `New Task Assigned: ${task.name} (Due: ${new Date(task.due).toLocaleDateString()})`,
      };

      // Update local state for display
      setNotifications((prev) => [...prev, newNotification]);

      // Dispatch to Redux for global badge count
      dispatch(addNotification(newNotification));
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
          setNotifications((prev) => [...prev, ...data]); // Merge with real-time notifications
        })
        .catch((err) => console.error("Error fetching notifications:", err));
    }
  }, []);

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

