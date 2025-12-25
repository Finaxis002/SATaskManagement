import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaveSummary = () => {
  const [stats, setStats] = useState({
    approvedCount: 0,
    usedLeaves: 0,
    remainingLeaves: 0,
    totalLeaves: 12, 
  });
  
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const response = await axios.get(
          `https://taskbe.sharda.co.in/api/leave?userId=${userId}`
        );
        
        const approvedLeaves = response.data.filter(
          (leave) => leave.status === "Approved"
        );

        let totalUsedDays = 0;

        approvedLeaves.forEach((leave) => {
          // Check for Half Day
          const isHalfDay = 
            leave.leaveDuration === "Half Day" || 
            leave.leaveType === "Half Day Leave";

          if (isHalfDay) {
            totalUsedDays += 0.5;
          } else {
            // Full Day Calculation
            const from = new Date(leave.fromDate);
            const to = new Date(leave.toDate);
            // Time difference in milliseconds
            const diffTime = Math.abs(to - from);
            // Convert to days (add 1 because start date counts)
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            totalUsedDays += days;
          }
        });

        setStats((prev) => ({
          ...prev,
          approvedCount: approvedLeaves.length,
          usedLeaves: totalUsedDays,
          remainingLeaves: prev.totalLeaves - totalUsedDays,
        }));

      } catch (error) {
        console.error("Failed to load summary", error);
      }
    };

    if (userId) {
      fetchLeaveData();
    }
  }, [userId]);

  // Percentage for Progress Bar
  const usagePercentage = Math.min(
    (stats.usedLeaves / stats.totalLeaves) * 100, 
    100
  );

  // Color logic for Progress Bar
  const getProgressColor = () => {
    if (usagePercentage > 90) return "bg-red-500";
    if (usagePercentage > 75) return "bg-orange-500";
    if (usagePercentage > 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
      <h2 className="text-2xl font-semibold mb-2 text-gray-800 text-center">
        Leave Balance
      </h2>
      <p className="text-center text-gray-500 text-sm mb-4">
        Financial Year 2024-25
      </p>
      
      <div className="border-b border-gray-300 mb-6"></div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6">
        
        {/* Total Allowed */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Allocated
          </div>
          <div className="text-3xl font-bold text-gray-800 mt-1">
            {stats.totalLeaves}
          </div>
        </div>

        {/* Used Leaves */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Used
          </div>
          <div className="text-3xl font-bold text-blue-700 mt-1">
            {stats.usedLeaves}
          </div>
          <div className="text-xs text-blue-400 mt-1">
            ({stats.approvedCount} Requests)
          </div>
        </div>

        {/* Remaining (The Main Counter) */}
        <div className={`border rounded-lg p-4 ${stats.remainingLeaves < 3 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wider ${stats.remainingLeaves < 3 ? 'text-red-600' : 'text-green-600'}`}>
            Remaining
          </div>
          <div className={`text-3xl font-bold mt-1 ${stats.remainingLeaves < 3 ? 'text-red-700' : 'text-green-700'}`}>
            {stats.remainingLeaves}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block text-gray-600">
              Yearly Quota Usage
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-gray-600">
              {stats.usedLeaves} / {stats.totalLeaves} Days
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${usagePercentage}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${getProgressColor()}`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LeaveSummary;