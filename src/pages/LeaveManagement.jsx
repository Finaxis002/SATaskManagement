import React, { useState, useEffect } from "react";
import socket from "../socket";
import LeaveDashboardCards from "../Components/leave/adminPanel/LeaveDashboardCards";
import ManageRequests from "../Components/leave/adminPanel/ManageRequests";
import LeaveOverview from "../Components/leave/adminPanel/LeaveOverview";

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leaveAlert, setLeaveAlert] = useState('false')

  const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  
if (Notification.permission !== "granted") {
  Notification.requestPermission().then((perm) => {
    console.log("🔔 Notification permission notification permission:", perm);
  });
}

useEffect(() => {
    const email = localStorage.getItem("userId");
    const name = localStorage.getItem("name");

    if (email && name) {
      socket.emit("register", email, name);
    }

   const handleNewLeave = (data) => {
    console.log("New leave request received:", data);
    const role = localStorage.getItem("role");

    if (role === "admin") {
      if (Notification.permission === "granted") {
        new Notification("📩 New Leave Request", {
          body: `${data.userId} applied for ${data.leaveType} leave\n${formatDate(data.fromDate)} → ${formatDate(data.toDate)}`,
        });
      }

      // Only show the alert if this is a new leave request
      const lastLeaveTimestamp = localStorage.getItem("lastLeaveTimestamp");
      const currentTimestamp = new Date().getTime().toString();

      if (lastLeaveTimestamp !== currentTimestamp) {
        setLeaveAlert(true);
        localStorage.setItem("showLeaveAlert", "true");
        localStorage.setItem("lastLeaveTimestamp", currentTimestamp);
      }

      // Dispatch event to update other parts of the app (sidebar)
      const event = new StorageEvent("storage", {
        key: "showLeaveAlert",
        newValue: "true",
      });
      window.dispatchEvent(event);
    }
  };


    socket.on("new-leave", handleNewLeave);

    return () => {
      socket.off("new-leave", handleNewLeave);
    };
  }, []);

useEffect(() => {
    const updateLeaveAlert = () => {
      const leaveAlertFlag = localStorage.getItem("showLeaveAlert");
      setLeaveAlert(leaveAlertFlag === "true");
    };

    // Initial load to update the leave alert state
    updateLeaveAlert();

    // Handle changes in localStorage (e.g., when alert is reset)
    const handleStorageChange = (e) => {
      if (e.key === "showLeaveAlert") {
        setLeaveAlert(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("leaveAlertUpdate", updateLeaveAlert);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("leaveAlertUpdate", updateLeaveAlert);
    };
  }, []);

   const resetLeaveAlert = () => {
    localStorage.setItem("showLeaveAlert", "false");
    setLeaveAlert(false);
  };

 useEffect(() => {
    if (activeTab === "requests") {
      resetLeaveAlert(); // Reset the leave alert when switching to the "Manage Requests" tab
      // Emit custom event if localStorage isn't enough
      const event = new CustomEvent("leaveAlertUpdate");
      window.dispatchEvent(event);
    }
  }, [activeTab]);

  return (
    <div className="p-6 text-white min-h-screen bg-gray-900">
      <h1 className="text-3xl font-bold mb-4">Leave Management (Admin)</h1>
{/* Leave Alert Notification */}
      {leaveAlert && (
        <div className="bg-yellow-600 text-white p-3 rounded mb-4">
          You have a new leave request!
        </div>
      )}
      {/* TAB NAVIGATION */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 rounded ${
            activeTab === "dashboard" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 rounded ${
            activeTab === "requests" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Manage Requests
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded ${
            activeTab === "overview" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Leave Overview
        </button>
      </div>

      {/* SECTION DISPLAY */}
      {activeTab === "dashboard" && <LeaveDashboardCards />}
      {activeTab === "requests" && <ManageRequests />}
      {activeTab === "overview" && <LeaveOverview />}
    </div>
  );
};

export default LeaveManagement;
