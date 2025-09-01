import { useEffect } from "react";

const NotificationInitializer = () => {
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission()
          .then((permission) => {
            console.log("Notification permission:", permission);
          })
          .catch((err) => console.error("Permission request failed", err));
      }
    }
  }, []);

  return null;
};

export default NotificationInitializer;