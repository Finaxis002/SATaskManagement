import React, { useEffect, useState } from "react";
import {
  FaRegEnvelopeOpen,
  FaBug,
  FaLightbulb,
  FaComments,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import { MdOutlineMoreHoriz } from "react-icons/md";

const DeveloperSupport = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  // Fetch support requests
  useEffect(() => {
    fetch("https://taskbe.sharda.co.in/api/support")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRequests(data.requests);
          setFilteredRequests(data.requests);
          calculateStats(data.requests);
        }
      })
      .catch((err) => console.error("Error fetching support requests:", err));
  }, []);

  // Calculate statistics
  const calculateStats = (data) => {
    setStats({
      total: data.length,
      pending: data.filter((r) => r.status === "Pending").length,
      inProgress: data.filter((r) => r.status === "In Progress").length,
      completed: data.filter((r) => r.status === "Completed").length,
    });
  };

  // Filter and search
  useEffect(() => {
    let filtered = requests;

    if (filterStatus !== "All") {
      filtered = filtered.filter((req) => req.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.issue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [searchTerm, filterStatus, requests]);

  // Update status
  const updateStatus = (id, newStatus) => {
    fetch(`https://taskbe.sharda.co.in/api/support/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const updatedRequests = requests.map((req) =>
            req._id === id ? { ...req, status: newStatus } : req
          );
          setRequests(updatedRequests);
          calculateStats(updatedRequests);
        }
      })
      .catch((err) => console.error("Error updating status:", err));
  };

  // Render reason badges
  const getReasonBadge = (reason, otherReason) => {
    const badges = {
      error: {
        icon: <FaBug className="text-xs" />,
        label: "Error",
        color: "bg-red-50 text-red-700 border border-red-200",
      },
      feature: {
        icon: <FaLightbulb className="text-xs" />,
        label: "Feature",
        color: "bg-blue-50 text-blue-700 border border-blue-200",
      },
      suggestion: {
        icon: <FaComments className="text-xs" />,
        label: "Suggestion",
        color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      },
      other: {
        icon: <MdOutlineMoreHoriz className="text-xs" />,
        label: otherReason || "Other",
        color: "bg-gray-50 text-gray-700 border border-gray-200",
      },
    };

    const badge = badges[reason];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md ${badge.color}`}
      >
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const statusStyles = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FaRegEnvelopeOpen className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Support Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Manage and track support requests
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <FaRegEnvelopeOpen className="text-gray-600 text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                  Pending
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {stats.inProgress}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                  Completed
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {stats.completed}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or issue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 max-h-[600px] overflow-y-auto">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-base mb-1">
                        {req.fullName}
                      </h3>
                      {getReasonBadge(req.reason, req.otherReason)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaEnvelope className="text-blue-500 text-xs flex-shrink-0" />
                      <span className="truncate">{req.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaPhone className="text-emerald-500 text-xs flex-shrink-0" />
                      <span>{req.phone}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-3 border-l-3 border-blue-500">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {req.issue}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <select
                      value={req.status}
                      onChange={(e) => updateStatus(req._id, e.target.value)}
                      className={`text-xs font-medium px-3 py-1.5 border rounded-lg cursor-pointer ${statusStyles[req.status]}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <FaCalendarAlt className="text-gray-400" />
                      {new Date(req.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 text-center rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaRegEnvelopeOpen className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-500 font-medium">No requests found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                      <tr
                        key={req._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">
                            {req.fullName}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaEnvelope className="text-blue-500 text-xs" />
                              <span className="truncate max-w-[200px]">
                                {req.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaPhone className="text-emerald-500 text-xs" />
                              <span>{req.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getReasonBadge(req.reason, req.otherReason)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="max-w-xs text-sm text-gray-700 line-clamp-2">
                            {req.issue}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <select
                            value={req.status}
                            onChange={(e) =>
                              updateStatus(req._id, e.target.value)
                            }
                            className={`text-xs font-medium px-3 py-1.5 border rounded-lg cursor-pointer ${statusStyles[req.status]}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <FaCalendarAlt className="text-gray-400 text-xs" />
                            {new Date(req.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FaRegEnvelopeOpen className="text-gray-400 text-2xl" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No requests found
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your filters
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSupport;