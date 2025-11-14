import React, { useState, useEffect } from "react";
import { Bell, XCircle } from "lucide-react"; // icons
import socket from "../socket";
import LeaveDashboardCards from "../Components/leave/adminPanel/LeaveDashboardCards";
import ManageRequests from "../Components/leave/adminPanel/ManageRequests";
import LeaveOverview from "../Components/leave/adminPanel/LeaveOverview";

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leaveAlert, setLeaveAlert] = useState(false);

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
      const role = localStorage.getItem("role");

      if (role === "admin") {
        if (Notification.permission === "granted") {
          new Notification("📩 New Leave Request", {
            body: `${data.userId} applied for ${
              data.leaveType
            } leave\n${formatDate(data.fromDate)} → ${formatDate(data.toDate)}`,
          });
        }

        const lastLeaveTimestamp = localStorage.getItem("lastLeaveTimestamp");
        const currentTimestamp = new Date().getTime().toString();

        if (lastLeaveTimestamp !== currentTimestamp) {
          setLeaveAlert(true);
          localStorage.setItem("showLeaveAlert", "true");
          localStorage.setItem("lastLeaveTimestamp", currentTimestamp);
        }

        const event = new StorageEvent("storage", {
          key: "showLeaveAlert",
          newValue: "true",
        });
        window.dispatchEvent(event);
      }
    };

    socket.on("new-leave", handleNewLeave);
    return () => socket.off("new-leave", handleNewLeave);
  }, []);

  useEffect(() => {
    const updateLeaveAlert = () => {
      const leaveAlertFlag = localStorage.getItem("showLeaveAlert");
      setLeaveAlert(leaveAlertFlag === "true");
    };

    updateLeaveAlert();

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
      resetLeaveAlert();
      const event = new CustomEvent("leaveAlertUpdate");
      window.dispatchEvent(event);
    }
  }, [activeTab]);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-[85vh] overflow-y-auto">

  {/* Header */}
  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
    Leave Management (Admin)
  </h1>

  {/* Leave Alert Notification */}
  {leaveAlert && (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-yellow-100 text-yellow-800 px-4 py-3 rounded-lg mb-4 sm:mb-6 shadow">
      <div className="flex items-center gap-2 mb-2 sm:mb-0">
        <Bell className="w-5 h-5" />
        <span className="text-sm sm:text-base">You have a new leave request!</span>
      </div>
      <button onClick={resetLeaveAlert} className="self-end sm:self-auto">
        <XCircle className="w-5 h-5 text-yellow-600 hover:text-yellow-800" />
      </button>
    </div>
  )}

  {/* Tabs */}
  <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-6 overflow-x-auto">
    {[ 
      { key: "dashboard", label: "Dashboard" },
      { key: "requests", label: "Manage Requests" },
      { key: "overview", label: "Leave Overview" },
    ].map((tab) => (
      <button
        key={tab.key}
        onClick={() => setActiveTab(tab.key)}
        className={`flex-shrink-0 px-2.5 sm:px-5 py-2 ml-0.5 rounded-lg font-medium transition-all text-sm sm:text-base ${
          activeTab === tab.key
            ? "bg-blue-600 text-white shadow"
            : "bg-white text-gray-700 border hover:bg-gray-100"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>

  {/* Content Section */}
  <div className="bg-white rounded-xl shadow p-4 sm:p-6">
    {activeTab === "dashboard" && <LeaveDashboardCards />}
    {activeTab === "requests" && <ManageRequests />}
    {activeTab === "overview" && <LeaveOverview />}
  </div>
</div>

  );
};

export default LeaveManagement;
