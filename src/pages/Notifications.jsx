import React from "react";
import EmployeeNotifications from "../Components/notification/EmployeeNotification";
import AdminNotification from "../Components/notification/AdminNotification";
import NotificationBell from "../Components/notification/NotificationBell";

const Notifications = () => {
  const role = localStorage.getItem("role");
  return (
    <div className="text-white p-4">
      {/* <EmployeeNotifications />
      <AdminNotification /> */}
      {/* {role === "admin" && <AdminNotification />} */}
      {role === "admin" ? (
        <AdminNotification /> 
      ) : (
        <EmployeeNotifications /> 
      )}
     
    </div>
  );
};

export default Notifications;
