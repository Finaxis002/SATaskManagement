
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