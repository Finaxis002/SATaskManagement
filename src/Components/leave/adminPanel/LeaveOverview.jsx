import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaveOverview = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [months, setMonths] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedUser, setSelectedUser] = useState("All Users");

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const { data } = await axios.get("https://taskbe.sharda.co.in/api/leave");
        setLeaves(data);

        // Unique months from leaves
        const monthSet = new Set(
          data.map((l) =>
            new Date(l.fromDate).toLocaleString("default", { month: "long" })
          )
        );
        setMonths(["All Months", ...Array.from(monthSet)]);

        // Unique users
        const userSet = new Set(data.map((l) => l.userId));
        setUsers(["All Users", ...Array.from(userSet)]);

        setFilteredLeaves(data);
      } catch (error) {
        console.error("Failed to fetch leaves", error);
      }
    };

    fetchLeaves();
  }, []);

  useEffect(() => {
    let filtered = [...leaves];

    if (selectedUser !== "All Users") {
      filtered = filtered.filter((l) => l.userId === selectedUser);
    }

    if (selectedMonth !== "All Months") {
      filtered = filtered.filter(
        (l) =>
          new Date(l.fromDate).toLocaleString("default", { month: "long" }) ===
          selectedMonth
      );
    }

    setFilteredLeaves(filtered);
  }, [selectedUser, selectedMonth, leaves]);

  return (
    <div className="bg-gray-800 p-6 rounded-xl max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
      <h2 className="text-2xl font-bold mb-4">Leave Overview</h2>

      {/* Filters */}
      <div className="flex gap-6 mb-6">
        <div>
          <label className="block text-sm mb-1">Filter by Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded w-52"
          >
            {months.map((m, i) => (
              <option key={i} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Filter by User</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded w-52"
          >
            {users.map((u, i) => (
              <option key={i} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-white text-sm">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-4 py-2">User ID</th>
              <th className="px-4 py-2">Start Date</th>
              <th className="px-4 py-2">End Date</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map((leave) => (
              <tr key={leave._id} className="border-t border-gray-700">
                <td className="px-4 py-2">{leave.userId}</td>
                <td className="px-4 py-2">
                  {new Date(leave.fromDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
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
              </tr>
            ))}

            {filteredLeaves.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-gray-400" colSpan={5}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveOverview;
