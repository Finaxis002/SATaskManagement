
import React from "react";
import EmployeeNotifications from "../Components/notification/EmployeeNotification";
import AdminNotification from "../Components/notification/AdminNotification";
import NotificationBell from "../Components/notification/NotificationBell";
const Notifications = () => {
 
  return (
    <div className="text-white p-4">
      <EmployeeNotifications />
      <AdminNotification />
      <NotificationBell />
    </div>
  );
};

export default Notifications;
