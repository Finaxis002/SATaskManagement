import React from "react";
import EmployeeNotifications from "../Components/notification/EmployeeNotification";
import AdminNotification from "../Components/notification/AdminNotification";

const Notifications = () => {
 
  return (
    <div className="text-white p-4">
      <EmployeeNotifications />
      <AdminNotification />
    </div>
  );
};

export default Notifications;

