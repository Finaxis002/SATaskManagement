import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaTag,
  FaCommentDots,
  FaClock,
  FaUser,
} from "react-icons/fa";

// Loading Spinner Component (reusable)
const LoadingSpinner = ({ size = "w-6 h-6" }) => (
  <div className="flex justify-center items-center py-10">
    <div
      className={`${size} border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}
    ></div>
    <span className="ml-3 text-lg text-gray-500">Loading requests...</span>
  </div>
);

const ManageRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loadingRow, setLoadingRow] = useState(null);
  // 1. Add global loading state
  const [loading, setLoading] = useState(true); // Start as true

  const fetchLeaves = async () => {
    // Set loading true before fetching (it's already true on mount)
    // setLoading(true);
    try {
      const { data } = await axios.get("https://taskbe.sharda.co.in/api/leave");
      setLeaves(data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      // Handle error gracefully (e.g., show an error message)
    } finally {
      // 2. Set loading false after fetching is complete
      setLoading(false);
    }
  };

  const handleStatus = async (id, newStatus) => {
    setLoadingRow(id);
    try {
      await axios.put(`https://taskbe.sharda.co.in/api/leave/${id}`, {
        status: newStatus,
      });
      // Await fetchLeaves to get the updated list
      await fetchLeaves();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoadingRow(null);
    }
  };

  useEffect(() => {
    // 3. Initial data fetch
    fetchLeaves();
  }, []);

  // Filter + Search
  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      leave.userName?.toLowerCase().includes(search.toLowerCase()) ||
      leave.leaveType?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" ? true : leave.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="mt-6 mb-6">
      {/* ----------------------------------- DESKTOP VIEW ----------------------------------- */}
      <div className="hidden md:block bg-white rounded-xl p-4 shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Manage Leave Requests
        </h2>

        {/* Search + Filter */}
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            placeholder="🔍 Search by user name or leave type..."
            className="w-2/3 border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-11"
          >
            <option value="All">Filter by Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto ">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden table-fixed">
            <thead className="bg-gray-100 text-gray-700 text-sm sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left w-[15%]">User Name</th>
                <th className="px-20 py-2 text-left w-[20%]">Dates</th>
                <th className="px-8 py-2 text-left w-[15%]">Type</th>
                <th className="px-4 py-2 text-left w-[10%]">Status</th>
                <th className="px-4 py-2 text-left w-[25%]">Comments</th>
                <th className="px-4 py-2 text-left w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {/* 4. Display loading indicator for desktop view */}
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    <LoadingSpinner size="w-5 h-5" />
                  </td>
                </tr>
              ) : filteredLeaves.length > 0 ? (
                filteredLeaves.map((leave) => (
                  <tr
                    key={leave._id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">
                      {leave.userName || leave.userId}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(leave.fromDate).toLocaleDateString("en-GB")} -{" "}
                      {new Date(leave.toDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-2">
                      {leave.leaveType}
                      {(leave.fromTime || leave.toTime) && (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Timing: </span>
                          {leave.fromTime || "--:--"} →{" "}
                          {leave.toTime || "--:--"}
                        </div>
                      )}
                    </td>
                    <td className="py-2">
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
                    <td className="px-4 py-2">{leave.comments || "N/A"}</td>
                    <td className="px-4 py-2 flex gap-2">
                      {loadingRow === leave._id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-gray-500">
                            Updating...
                          </span>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStatus(leave._id, "Approved")}
                            className="text-white px-3 py-1 rounded-md text-sm hover:opacity-90 transition-all"
                            style={{ backgroundColor: "#4332d2" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatus(leave._id, "Rejected")}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-gray-500 py-6 italic"
                  >
                    No leave requests found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------------------------- MOBILE VIEW ----------------------------------- */}
      <div className="block md:hidden rounded-xl">
        <h2 className="text-lg font-bold mb-4 text-gray-800 text-center">
          📋 Manage Leave Requests
        </h2>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search requests..."
          className="w-full border rounded-full px-4 py-2 mb-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Sticky + Scrollable Filter Tabs */}
        <div className="sticky top-0 z-20 bg-gradient-to-b from-blue-50 to-white py-2 mb-4">
          <div className="flex space-x-2 overflow-x-auto px-1 scrollbar-hide">
            {["All", "Approved", "Pending", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 ${
                  filter === status
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {/* 5. Display loading indicator for mobile view */}
          {loading ? (
            <LoadingSpinner />
          ) : filteredLeaves.length > 0 ? (
            filteredLeaves.map((leave) => (
              <div
                key={leave._id}
                className="bg-white border border-gray-300 rounded-2xl p-4 shadow hover:shadow-lg"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-blue-500" />
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                      {leave.userName || leave.userId}
                    </h3>
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

                {/* Details */}
                <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-400" />
                    {new Date(leave.fromDate).toLocaleDateString(
                      "en-GB"
                    )} → {new Date(leave.toDate).toLocaleDateString("en-GB")}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaTag className="text-purple-400" /> {leave.leaveType}
                  </p>
                  {(leave.fromTime || leave.toTime) && (
                    <p className="flex items-center gap-2 text-gray-500 text-xs">
                      <FaClock className="text-orange-400" />{" "}
                      {leave.fromTime || "--:--"} → {leave.toTime || "--:--"}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-gray-500">
                    <FaCommentDots className="text-green-400" />{" "}
                    {leave.comments || "No comments"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-row sm:flex-row gap-2 mt-4">
                  {loadingRow === leave._id ? (
                    <div className="flex items-center gap-2 w-full justify-center">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-gray-500">Updating...</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStatus(leave._id, "Approved")}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg shadow text-sm font-medium"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleStatus(leave._id, "Rejected")}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg shadow text-sm font-medium"
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 italic">
              No leave requests found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageRequests;
