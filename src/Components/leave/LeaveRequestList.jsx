import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaveRequestList = () => {
  const [leaves, setLeaves] = useState([]);
  const userId = "demo-user-123"; // localStorage ki jagah demo userId

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await axios.get(
          `https://taskbe.sharda.co.in/api/leave?userId=${userId}`
        );
        console.log("Fetched leaves:", response.data);
        setLeaves(response.data);
      } catch (error) {
        console.error("Failed to fetch leaves", error);
      }
    };

    fetchLeaves();
  }, [userId]);

  // Check if leave request is within 48 hours
  const isWithin48Hours = (fromDate) => {
    const leaveDate = new Date(fromDate);
    const currentDate = new Date();
    const hoursDifference = (leaveDate - currentDate) / (1000 * 60 * 60);
    return hoursDifference < 48;
  };

  // Check if leave date has passed
  const isPastDate = (fromDate) => {
    const leaveDate = new Date(fromDate);
    const currentDate = new Date();
    return leaveDate < currentDate;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-md max-h-[calc(100vh-200px)] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4 text-white">Your Leave Requests</h2>
      {leaves.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No leave requests found
        </div>
      ) : (
        leaves.map((leave, idx) => {
          const isCasualLeave = leave.leaveType?.toLowerCase().includes("casual");
          const within48Hrs = isWithin48Hours(leave.fromDate);
          const isPast = isPastDate(leave.fromDate);
          const showWarning = isCasualLeave && within48Hrs && !isPast && leave.status === "Pending";

          return (
            <div
              key={idx}
              className={`bg-gray-700 rounded-md p-4 mb-3 ${
                showWarning ? "border-2 border-yellow-500" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-white">{leave.leaveType}</div>
                  <div className="text-sm text-gray-300 mt-1">
                    {new Date(leave.fromDate).toLocaleDateString()} →{" "}
                    {new Date(leave.toDate).toLocaleDateString()}
                  </div>
                  {/* SHOW TIME IF PRESENT */}
                  {(leave.fromTime || leave.toTime) && (
                    <div className="text-xs text-gray-400 mt-1">
                      <span className="font-medium">Timing: </span>
                      {leave.fromTime ? leave.fromTime : "--:--"}{" "}
                      <span className="mx-1">→</span>
                      {leave.toTime ? leave.toTime : "--:--"}
                    </div>
                  )}
                  
                  {/* 48 HOURS WARNING */}
                  {showWarning && (
                    <div className="mt-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded inline-block">
                      ⚠️ Casual leave should be applied 48 hours in advance
                    </div>
                  )}
                </div>
                
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-md ml-4 ${
                    leave.status === "Pending"
                      ? "bg-yellow-500 text-gray-900"
                      : leave.status === "Approved"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {leave.status}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default LeaveRequestList;