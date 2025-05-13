// utils/showDesktopNotification.js
const showDesktopNotification = (title, message, icon = "/icon.png") => {
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: message,
        icon,
      });

      notification.onclick = () => {
        window.focus();
      };
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, {
            body: message,
            icon,
          });
        }
      });
    } else {
      console.warn("Desktop notification not allowed or denied.");
    }
  } else {
    console.warn("This browser does not support desktop notification.");
  }
};

export default showDesktopNotification;
