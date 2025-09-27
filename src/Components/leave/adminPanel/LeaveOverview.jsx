import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaTag,
  FaCommentDots,
  FaClock,
  FaUser,
} from "react-icons/fa";
import { motion } from "framer-motion";

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
        const { data } = await axios.get(
          "https://taskbe.sharda.co.in/api/leave"
        );
        setLeaves(data);

        // Unique months
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
    <div className=" sm:p-6 rounded-xl">
      {/* Title */}
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">
        Leave Overview
      </h2>

      {/* Filters */}
      {/* Filters */}
      <div className="flex md:flex-row flex-col sm:flex-row gap-3 md:gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full md:w-auto"
        >
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Filter by Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-65"
          >
            {months.map((m, i) => (
              <option className="text-sm" key={i} value={m}>
                {m}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="w-full md:w-auto"
        >
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Filter by User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {users.map((u, i) => (
              <option className="text-sm" key={i} value={u}>
                {u}
              </option>
            ))}
          </select>
        </motion.div>
      </div>

      {/* Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full text-gray-700 text-sm">
          <thead className="bg-gray-200 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">User Name</th>
              <th className="px-4 py-2 text-left">Start Date</th>
              <th className="px-4 py-2 text-left">End Date</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map((leave, index) => (
              <motion.tr
                key={leave._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
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
              </motion.tr>
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
      <div className="block sm:hidden space-y-2">
        {filteredLeaves.length > 0 ? (
          filteredLeaves.map((leave, index) => (
            <motion.div
              key={leave._id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-xl p-2 hover:shadow-xl transition-transform"
            >
              {/* User & Status */}
              <div className="flex items-center justify-between mb-3 mt-2">
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-500" />
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

              {/* Dates row */}
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <p className="flex items-center gap-1">
                  <FaCalendarAlt className="text-blue-400" />
                  <span className="font-medium">Start:</span>{" "}
                  {new Date(leave.fromDate).toLocaleDateString("en-GB")}
                </p>
                <p className="flex items-center gap-1">
                  <FaCalendarAlt className="text-red-400" />
                  <span className="font-medium">End:</span>{" "}
                  {new Date(leave.toDate).toLocaleDateString("en-GB")}
                </p>
              </div>

              {/* Type & Timing */}
              <div className="flex justify-between items-center text-xs text-gray-700 mb-2">
                <p className="flex items-center gap-1">
                  <FaTag className="text-purple-400" />
                  <span className="font-medium">Type:</span> {leave.leaveType}
                </p>
                {(leave.fromTime || leave.toTime) && (
                  <p className="flex items-center gap-1 text-gray-500 text-[11px]">
                    <FaClock className="text-orange-400" />
                    {leave.fromTime || "--:--"} → {leave.toTime || "--:--"}
                  </p>
                )}
              </div>

              {/* Comments */}
              <p className="flex items-center gap-1 text-gray-600 text-xs">
                <FaCommentDots className="text-green-400" />
                {leave.comments || "No comments"}
              </p>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-400 italic py-3">
            No records found
          </p>
        )}
      </div>
    </div>
  );
};

export default LeaveOverview;