import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaveRequestList = () => {
  const [leaves, setLeaves] = useState([]);
  const userId = localStorage.getItem("userId");

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

  

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition max-h-[calc(100vh-200px)] overflow-y-auto ">

      <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Your Leave Requests</h2>
      <div className="border-b border-gray-300 mb-4"></div> 
      {leaves.map((leave, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-200 rounded-md p-4 mb-3 flex justify-between items-center shadow-sm hover:shadow-md transition"

        >
          <div>
            <div className="font-semibold text-gray-800">{leave.leaveType}</div>
            <div className="text-sm text-gray-600">
              {new Date(leave.fromDate).toLocaleDateString()} →{" "}
              {new Date(leave.toDate).toLocaleDateString()}
            </div>
            {/* SHOW TIME IF PRESENT */}
            {(leave.fromTime || leave.toTime) && (
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-medium">Timing: </span>
                {leave.fromTime ? leave.fromTime : "--:--"}{" "}
                <span className="mx-1">→</span>
                {leave.toTime ? leave.toTime : "--:--"}
              </div>
            )}
          </div>
          <span
            className={`text-sm font-semibold px-2 py-1 rounded-md text-white ${
              leave.status === "Pending"
                        ? "bg-yellow-500"
                        : leave.status === "Approved"
                        ? "bg-green-500"
                        : "bg-red-500"
            }`}
          >
            {leave.status}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LeaveRequestList;