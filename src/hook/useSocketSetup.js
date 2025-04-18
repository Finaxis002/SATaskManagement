
// import { useEffect } from "react";
// import socket from "../socket";
// import { useDispatch } from "react-redux";
// import { addNotification } from "../redux/notificationSlice"; // Importing redux action
// import { v4 as uuidv4 } from 'uuid'; 

// const useSocketSetup = () => {
//   const dispatch = useDispatch();
  

//   useEffect(() => {

//     const email = localStorage.getItem("userId");


    

//     if (email) {
//       socket.emit("register", email);
//     }

//     socket.on("new-task", (task) => {
//       const newNotification = {
//         id: uuidv4(),
//         message: `New Task Assigned: ${task.name} (Due: ${new Date(task.due).toLocaleDateString()})`,
//       };

//       // Dispatch to Redux to add the notification
//       dispatch(addNotification(newNotification));
     
//       // Optionally show toast or alert
//       alert(`📬 New Task Assigned: ${task.name}`);

//       // Update notification count (you can dispatch the count as well if necessary)
//       // setNotificationCount((prev) => prev + 1);
//     });

    

//     return () => {
//       socket.off("new-task");
//     };
//   }, [dispatch]);

//   return null; // No UI to return from this hook, it's only handling socket events
// };


// export default useSocketSetup;

// src/hook/useSocketSetup.js
import { useEffect } from "react";
import socket from "../socket";
import { useDispatch } from "react-redux";
import { addNotification } from "../redux/notificationSlice";
import { v4 as uuidv4 } from "uuid";

const useSocketSetup = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const email = localStorage.getItem("userId");
    if (email) {
      socket.emit("register", email);
    }

    const handleNewTask = (task) => {
      const newNotification = {
        id: uuidv4(),
        message: `New Task Assigned: ${task.name} (Due: ${new Date(
          task.due
        ).toLocaleDateString()})`,
      };
      dispatch(addNotification(newNotification));
    };

    socket.on("new-task", handleNewTask);

    return () => {
      socket.off("new-task", handleNewTask);
    };
  }, [dispatch]);

  return null;
};

export default useSocketSetup;