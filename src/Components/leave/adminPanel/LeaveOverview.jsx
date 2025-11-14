import React, { useEffect, useState } from "react";
import axios from "axios";
// Replaced react-icons/fa with lucide-react (standard alternative) to resolve compilation error
import {
  Calendar,
  Tag,
  MessageCircle,
  Clock,
  User,
} from "lucide-react";

// Reusable Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10 min-h-[200px]">
    <div
      className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
    ></div>
    <span className="ml-3 text-lg text-gray-500">Fetching leave data...</span>
  </div>
);

const LeaveOverview = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [months, setMonths] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedUser, setSelectedUser] = useState("All Users");
  // 1. Add global loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const { data } = await axios.get("https://taskbe.sharda.co.in/api/leave");
        setLeaves(data);

        // Extract and set unique months and users
        const monthSet = new Set(
          data.map((l) =>
            new Date(l.fromDate).toLocaleString("default", { month: "long" })
          )
        );
        setMonths(["All Months", ...Array.from(monthSet)]);

        // Assuming userId is the identifier for users
        const userSet = new Set(data.map((l) => l.userName || l.userId));
        setUsers(["All Users", ...Array.from(userSet)]);

        setFilteredLeaves(data);
      } catch (error) {
        console.error("Failed to fetch leaves", error);
      } finally {
        // 2. Set loading to false once the fetch is complete
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  useEffect(() => {
    // This effect runs whenever filters or the main data change
    let filtered = [...leaves];

    if (selectedUser !== "All Users") {
      filtered = filtered.filter((l) => (l.userName || l.userId) === selectedUser);
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
    <div className="sm:p-6 rounded-xl">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">
        Leave Overview
      </h2>

      {/* 3. Conditional Rendering based on loading state */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Filters */}
          <div className="flex md:flex-row flex-col sm:flex-row gap-3 md:gap-4 mb-6">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Filter by Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-65"
              >
                {months.map((m, i) => (
                  <option className="text-sm" key={i} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Filter by User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="border rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                {users.map((u, i) => (
                  <option className="text-sm" key={i} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table View (Desktop) */}
          <div className="hidden sm:block overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-gray-700 text-sm">
              <thead className="bg-gray-100 text-gray-600 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">User Name</th>
                  <th className="px-4 py-3 text-left">Start Date</th>
                  <th className="px-4 py-3 text-left">End Date</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr
                    key={leave._id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">{leave.userName || leave.userId}</td>
                    <td className="px-4 py-2">
                      {new Date(leave.fromDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(leave.toDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-2">
                      {leave.leaveType}
                      {(leave.fromTime || leave.toTime) && (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Timing: </span>
                          {leave.fromTime || "--:--"} → {leave.toTime || "--:--"}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          leave.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : leave.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLeaves.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-4 text-center text-gray-400 italic"
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition duration-200"
                >
                  {/* User & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="text-blue-500 w-4 h-4" /> {/* Updated Icon */}
                      <p className="text-sm font-semibold text-gray-800">
                        {leave.userName || leave.userId}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        leave.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : leave.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-600">
                    {/* Dates */}
                    <p className="flex items-center gap-2 col-span-2">
                      <Calendar className="text-indigo-400 w-4 h-4" /> {/* Updated Icon */}
                      <span className="font-medium">Period:</span>{" "}
                      {new Date(leave.fromDate).toLocaleDateString("en-GB")} →{" "}
                      {new Date(leave.toDate).toLocaleDateString("en-GB")}
                    </p>

                    {/* Type */}
                    <p className="flex items-center gap-2">
                      <Tag className="text-purple-400 w-4 h-4" /> {/* Updated Icon */}
                      <span className="font-medium">Type:</span> {leave.leaveType}
                    </p>

                    {/* Timing */}
                    {(leave.fromTime || leave.toTime) && (
                      <p className="flex items-center gap-2 text-gray-500">
                        <Clock className="text-orange-400 w-4 h-4" /> {/* Updated Icon */}
                        <span className="font-medium">Time:</span> {leave.fromTime || "--:--"} → {leave.toTime || "--:--"}
                      </p>
                    )}

                    {/* Comments */}
                    <p className="flex items-center gap-2 text-gray-500 col-span-2 mt-1">
                      <MessageCircle className="text-green-400 w-4 h-4" /> {/* Updated Icon */}
                      <span className="font-medium">Comments:</span>
                      {leave.comments || "No comments"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 italic py-3">
                No records found
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LeaveOverview;