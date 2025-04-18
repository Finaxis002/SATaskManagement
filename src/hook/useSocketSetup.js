
import { useEffect } from "react";
import socket from "../socket";
import { useDispatch } from "react-redux";
import { addNotification } from "../redux/notificationSlice"; // Importing redux action
import { v4 as uuidv4 } from 'uuid'; 

const useSocketSetup = (, setInboxCount) => {
  const dispatch = useDispatch();
  

  useEffect(() => {

    const email = localStorage.getItem("userId");


    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    if (email) {
      socket.emit("register", email);
    }

    socket.on("new-task", (task) => {
      const newNotification = {
        id: uuidv4(),
        message: `New Task Assigned: ${task.name} (Due: ${new Date(task.due).toLocaleDateString()})`,
      };

      // Dispatch to Redux to add the notification
      dispatch(addNotification(newNotification));
     
      // Optionally show toast or alert
      alert(`📬 New Task Assigned: ${task.name}`);

      // Update notification count (you can dispatch the count as well if necessary)
      // setNotificationCount((prev) => prev + 1);
    });

    // New message (real-time unread increment)
    socket.on("receiveMessage", (msg) => {
      const isForUser =
        role === "user" && (msg.recipient === name || msg.recipient === "all");

      const isForAdmin =
        role === "admin" && msg.sender.toLowerCase() !== "admin";

      if ((isForUser || isForAdmin) && setInboxCount) {
        setInboxCount((prev) => prev + 1);
      }
    });

    // Reset unread when someone reads messages
    socket.on("inboxRead", ({ name: reader, role: readerRole }) => {
      const myName = localStorage.getItem("name");
      const myRole = localStorage.getItem("role");

      const iAmReader = myName === reader;
      const isAdmin = myRole === "admin";

      if (
        (readerRole === "admin" && isAdmin && iAmReader) ||
        reader === myName
      ) {
        if (setInboxCount) setInboxCount(0);
      }
    });

    // New message (real-time unread increment)
    socket.on("receiveMessage", (msg) => {
      const isForUser =
        role === "user" && (msg.recipient === name || msg.recipient === "all");

      const isForAdmin =
        role === "admin" && msg.sender.toLowerCase() !== "admin";

      if ((isForUser || isForAdmin) && setInboxCount) {
        setInboxCount((prev) => prev + 1);
      }
    });

    // Reset unread when someone reads messages
    socket.on("inboxRead", ({ name: reader, role: readerRole }) => {
      const myName = localStorage.getItem("name");
      const myRole = localStorage.getItem("role");

      const iAmReader = myName === reader;
      const isAdmin = myRole === "admin";

      if (
        (readerRole === "admin" && isAdmin && iAmReader) ||
        reader === myName
      ) {
        if (setInboxCount) setInboxCount(0);
      }
    });

    return () => {
      socket.off("new-task");
      socket.off("receiveMessage");
      socket.off("inboxRead");
    };
  }, [setNotificationCount, setInboxCount]);
  
};



export default useSocketSetup;
