import { useEffect } from "react";
import socket from "../socket";
import { useDispatch } from "react-redux";
import { addNotification } from "../redux/notificationSlice";

const useSocketSetup = (setNotificationCount) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const email = localStorage.getItem("userId");
    if (email) {
      socket.emit("register", email); // Only call register once
    }

    // Additional info for the task
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    // Listen for 'new-task' event
    socket.on("new-task", (task) => {
      const newNotification = {
        id: Date.now(),
        message: `New Task Assigned: ${task.name} (Due: ${new Date(task.due).toLocaleDateString()})`,
      };

      // Dispatch to Redux to add the notification
      dispatch(addNotification(newNotification));

      // Update notification count
      setNotificationCount((prev) => prev + 1);
    });

    // Cleanup on unmount
    return () => {
      socket.off("new-task");
    };
  }, [setNotificationCount, dispatch]);

};

export default useSocketSetup;
