import React, { useEffect, useState } from "react";

const LeaveSummary = () => {
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [approvedDays, setApprovedDays] = useState(0);
  const [remainingLeaves, setRemainingLeaves] = useState(0);
  const [leaveByType, setLeaveByType] = useState({
    sick: 0,
    casual: 0,
    emergency: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const TOTAL_ANNUAL_LEAVES = 12; // Total leaves per year

  const getUserId = () => {
    try {
      return typeof window !== "undefined" && window.localStorage
        ? window.localStorage.getItem("userId")
        : null;
    } catch {
      return null;
    }
  };

  const userId = getUserId();

  const fetchLeaveSummary = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/leave?userId=${userId}`
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      // Status-wise count
      const approved = data.filter((leave) => leave.status === "Approved");
      const pending = data.filter((leave) => leave.status === "Pending");
      const rejected = data.filter((leave) => leave.status === "Rejected");

      setApprovedCount(approved.length);
      setPendingCount(pending.length);
      setRejectedCount(rejected.length);

      // Total approved days
      const totalDays = approved.reduce((acc, leave) => {
        const from = new Date(leave.fromDate);
        const to = new Date(leave.toDate);
        const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
        return acc + days;
      }, 0);

      setApprovedDays(totalDays);
      setRemainingLeaves(TOTAL_ANNUAL_LEAVES - totalDays);

      const typeCount = {
        sick: approved.filter((l) => {
          return l.leaveType && l.leaveType.toLowerCase().includes("sick");
        }).length,
        casual: approved.filter(
          (l) => l.leaveType && l.leaveType.toLowerCase().includes("casual")
        ).length,
        emergency: approved.filter(
          (l) => l.leaveType && l.leaveType.toLowerCase().includes("emergency")
        ).length,
      };

      setLeaveByType(typeCount);

      // Update timestamp
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load summary", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchLeaveSummary();
  }, [userId]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchLeaveSummary();
  };

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLeaveProgress = () => {
    const percentage = (approvedDays / TOTAL_ANNUAL_LEAVES) * 100;
    return Math.min(percentage, 100);
  };

  const getProgressColor = () => {
    const percentage = getLeaveProgress();
    if (percentage >= 80) return "bg-red-500";
    if (percentage >= 60) return "bg-orange-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (!userId) return null;

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-800">
          📊 Leave Summary
        </h2>
        <button
          onClick={handleRefresh}
          className="text-indigo-600 hover:text-indigo-800 transition-colors p-1.5 rounded-lg hover:bg-indigo-50"
          title="Refresh"
        >
          {/* <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg> */}
        </button>
      </div>

      <div className="border-b border-gray-300 mb-3"></div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-green-700 font-medium mb-0.5">
                Approved Days
              </div>
              <div className="text-xl font-bold text-green-800">
                {approvedDays}
              </div>
            </div>
            <div className="text-green-500 text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-700 font-medium mb-0.5">
                Approved Requests
              </div>
              <div className="text-xl font-bold text-blue-800">
                {approvedCount}
              </div>
            </div>
            <div className="text-blue-500 text-2xl">📝</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-yellow-700 font-medium mb-0.5">
                Pending
              </div>
              <div className="text-xl font-bold text-yellow-800">
                {pendingCount}
              </div>
            </div>
            <div className="text-yellow-500 text-2xl">⏳</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-red-700 font-medium mb-0.5">
                Rejected
              </div>
              <div className="text-xl font-bold text-red-800">
                {rejectedCount}
              </div>
            </div>
            <div className="text-red-500 text-2xl">❌</div>
          </div>
        </div>
      </div>

      {/* Leave Type Breakdown */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">
          📋 Approved by Type
        </h3>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              Sick Leave
            </span>
            <span className="text-xs font-semibold text-gray-800">
              {leaveByType.sick}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              Casual Leave
            </span>
            <span className="text-xs font-semibold text-gray-800">
              {leaveByType.casual}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
              Emergency Leave
            </span>
            <span className="text-xs font-semibold text-gray-800">
              {leaveByType.emergency}
            </span>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
            Last updated: {formatTime(lastUpdated)}
          </span>
        </div>
      )}
    </div>
  );
};

export default LeaveSummary;
