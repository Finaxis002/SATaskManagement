import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaveSummary = () => {
  const [approvedCount, setApprovedCount] = useState(0);
  const [approvedDays, setApprovedDays] = useState(0);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchApprovedLeaves = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/leave?userId=${userId}`
        );
        const approved = response.data.filter(
          (leave) => leave.status === "Approved"
        );

        setApprovedCount(approved.length);

        const totalDays = approved.reduce((acc, leave) => {
          const from = new Date(leave.fromDate);
          const to = new Date(leave.toDate);
          const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
          return acc + days;
        }, 0);

        setApprovedDays(totalDays);
      } catch (error) {
        console.error("Failed to load summary", error);
      }
    };

    fetchApprovedLeaves();
  }, [userId]);

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Your Leave Summary</h2>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-gray-700 rounded-md p-4">
          <div className="text-sm text-gray-400">Total Approved Days</div>
          <div className="text-2xl font-bold">{approvedDays}</div>
        </div>
        <div className="bg-gray-700 rounded-md p-4">
          <div className="text-sm text-gray-400">Approved Requests</div>
          <div className="text-2xl font-bold">{approvedCount}</div>
        </div>
      </div>
    </div>
  );
};

export default LeaveSummary;
