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
          `https://taskbe.sharda.co.in/api/leave?userId=${userId}`
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
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Your Leave Summary</h2>
      <div className="border-b border-gray-300 mb-4"></div> 
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition">
          <div className="text-sm text-gray-600">Total Approved Days</div>
          <div className="text-2xl font-bold text-gray-800">{approvedDays}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition">
          <div className="text-sm text-gray-600">Approved Requests</div>
          <div className="text-2xl font-bold text-gray-800">{approvedCount}</div>
        </div>
      </div>
    </div>
  );
};

export default LeaveSummary;
