import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaveRequestList = () => {
  const [leaves, setLeaves] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/leave?userId=${userId}`
        );
        setLeaves(response.data);
      } catch (error) {
        console.error("Failed to fetch leaves", error);
      }
    };

    fetchLeaves();
  }, [userId]);

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Your Leave Requests</h2>
      {leaves.map((leave, idx) => (
        <div
          key={idx}
          className="bg-gray-700 rounded-md p-4 mb-3 flex justify-between items-center"
        >
          <div>
            <div className="font-semibold">{leave.leaveType}</div>
            <div className="text-sm text-gray-300">
              {new Date(leave.fromDate).toLocaleDateString()} →{" "}
              {new Date(leave.toDate).toLocaleDateString()}
            </div>
          </div>
          <span
            className={`text-sm font-semibold px-2 py-1 rounded-md ${
              leave.status === "Pending" ? "bg-yellow-500" : "bg-green-500"
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
