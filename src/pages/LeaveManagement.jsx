import React, { useState, useEffect } from "react";
import socket from "../socket";
import LeaveDashboardCards from "../Components/leave/adminPanel/LeaveDashboardCards";
import ManageRequests from "../Components/leave/adminPanel/ManageRequests";
import LeaveOverview from "../Components/leave/adminPanel/LeaveOverview";

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  
if (Notification.permission !== "granted") {
  Notification.requestPermission().then((perm) => {
    console.log("🔔 Notification permission:", perm);
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
      
      // Use both localStorage and state to ensure reliability
      localStorage.setItem("showLeaveAlert", "true");
      // Force state update by using a timestamp
      const event = new StorageEvent("storage", {
        key: "showLeaveAlert",
        newValue: "true"
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
  if (activeTab === "requests") {
    localStorage.setItem("showLeaveAlert", "false");
    setLeaveAlert(false);
    // Emit custom event if localStorage isn't enough
    const event = new CustomEvent("leaveAlertUpdate");
    window.dispatchEvent(event);
  }
}, [activeTab]);

useEffect(() => {
  if (!socket) return;

  const handleNewLeave = (data) => {
    console.log('New leave request received:', data);
    // Update your UI state here
    setNewLeaveRequests(prev => [...prev, data]);
    // Show notification
    if (Notification.permission === 'granted') {
      new Notification('New Leave Request', {
        body: `${data.userId} requested ${data.leaveType} leave`
      });
    }
  };

  socket.on('new-leave', handleNewLeave);

  return () => {
    socket.off('new-leave', handleNewLeave);
  };
}, [socket]);


  return (
    <div className="p-6 text-white min-h-screen bg-gray-900">
      <h1 className="text-3xl font-bold mb-4">Leave Management (Admin)</h1>

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
