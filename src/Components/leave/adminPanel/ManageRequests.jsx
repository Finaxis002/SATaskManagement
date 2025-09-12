import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageRequests = () => {
  const [leaves, setLeaves] = useState([]);

  const fetchLeaves = async () => {
    const { data } = await axios.get("https://taskbe.sharda.co.in/api/leave");
    setLeaves(data);
  };

  const handleStatus = async (id, newStatus) => {
    await axios.put(`https://taskbe.sharda.co.in/api/leave/${id}`, { status: newStatus });
    fetchLeaves();
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-xl mt-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
      <h2 className="text-2xl font-semibold mb-4">Manage Leave Requests</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-white">
          <thead>
            <tr className="bg-gray-700 text-left">
              {/* <th className="px-4 py-2">User ID</th> */}
              <th className="px-4 py-2">User Name</th>
              <th className="px-4 py-2">Dates</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Comments</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id} className="border-t border-gray-700">
                {/* <td className="px-4 py-2">{leave.userId}</td> */}
                <td className="px-4 py-2">{leave.userName || leave.userId}</td>
                <td className="px-4 py-2">
                  {new Date(leave.fromDate).toLocaleDateString()} -{" "}
                  {new Date(leave.toDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{leave.leaveType}
                   {(leave.fromTime || leave.toTime) && (
              <div className="text-xs text-gray-400 mt-1">
                <span className="font-medium">Timing: </span>
                {leave.fromTime ? leave.fromTime : "--:--"}{" "}
                <span className="mx-1">→</span>
                {leave.toTime ? leave.toTime : "--:--"}
              </div>
            )}
                </td>

                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      leave.status === "Pending"
                        ? "bg-yellow-500"
                        : leave.status === "Approved"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {leave.status}
                  </span>
                </td>
                <td className="px-4 py-2">{leave.comments || "N/A"}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleStatus(leave._id, "Approved")}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatus(leave._id, "Rejected")}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageRequests;