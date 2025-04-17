
import { useEffect } from "react";
import socket from "../socket";
import { useDispatch } from "react-redux";
import { addNotification } from "../redux/notificationSlice";

const useSocketSetup = (setNotificationCount) => {
  const dispatch = useDispatch();

  useEffect(() => {

    const email = localStorage.getItem("userId");
    if (email) socket.emit("register", email);


    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    if (email) {
      socket.emit("register", email);
    }


    socket.on("new-task", (task) => {
      dispatch(addNotification({
        id: Date.now(),

        message: `New Task Assigned: ${task.name} (Due: ${new Date(
          task.due
        ).toLocaleDateString()})`,
      };

      // Dispatch to Redux to add the notification
      dispatch(addNotification(newNotification));

      // Optionally show toast or alert
      // alert(`📬 New Task Assigned: ${task.name}`);


      setNotificationCount((prev) => prev + 1);
    });

    return () => {
      socket.off("new-task");
    };
  }, [setNotificationCount]);
};

export default useSocketSetup;
