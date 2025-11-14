import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

const LeaveRequestList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchLeaves = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://taskbe.sharda.co.in/api/leave?userId=${userId}`
        );
        console.log("Fetched leaves:", response.data);
        setLeaves(response.data);
      } catch (error) {
        console.error("Failed to fetch leaves", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [userId]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition max-h-[calc(100vh-180px)] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Your Leave Requests</h2>
      <div className="border-b border-gray-300 mb-4"></div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FaSpinner className="animate-spin text-indigo-600 text-4xl mb-3" />
          <p className="text-gray-600">Loading leave requests...</p>
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">📋 No leave requests found.</p>
          <p className="text-sm mt-2">You haven't submitted any leave requests yet.</p>
        </div>
      ) : (
        leaves.map((leave, idx) => (
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
        ))
      )}
    </div>
  );
};

export default LeaveRequestList;