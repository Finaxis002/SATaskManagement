

import { useEffect } from "react";
import socket from "../socket";
import { useDispatch } from "react-redux";
import { addNotification } from "../redux/notificationSlice"; // Importing redux action

const useSocketSetup = (setNotificationCount) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const email = localStorage.getItem("userId");
    if (email) {
      socket.emit("register", email);
    }

    socket.on("new-task", (task) => {
      const newNotification = {
        id: Date.now(),
        message: `New Task Assigned: ${task.name} (Due: ${new Date(task.due).toLocaleDateString()})`,
      };

      // Dispatch to Redux to add the notification
      dispatch(addNotification(newNotification));

      // Optionally show toast or alert
      // alert(`📬 New Task Assigned: ${task.name}`);

      // Update notification count (you can dispatch the count as well if necessary)
      setNotificationCount((prev) => prev + 1);
    });

    return () => {
      socket.off("new-task");
    };
  }, [dispatch]);

  return null; // No UI to return from this hook, it's only handling socket events
};

export default useSocketSetup;
