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
  FaImage,
  FaTimes,
} from "react-icons/fa";
import { MdOutlineMoreHoriz } from "react-icons/md";

const DeveloperSupport = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

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

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      pending: data.filter((r) => r.status === "Pending").length,
      inProgress: data.filter((r) => r.status === "In Progress").length,
      completed: data.filter((r) => r.status === "Completed").length,
    });
  };

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

    const badge = badges[reason] || badges["other"];
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
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <FaRegEnvelopeOpen className="text-gray-400 text-lg" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
              <p className="text-xs font-medium text-amber-600 uppercase">
                Pending
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {stats.pending}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase">
                In Progress
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stats.inProgress}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase">
                Completed
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or issue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3 max-h-[600px] overflow-y-auto">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
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
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                      {req.issue}
                    </p>

                    {req.images && req.images.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                          <FaImage /> Attachments:
                        </p>
                        <div className="flex gap-2">
                          {req.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img.data}
                              alt="attachment"
                              className="w-16 h-16 object-cover rounded-md border border-gray-300 cursor-pointer hover:opacity-80 transition"
                              onClick={() => setSelectedImage(img.data)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <select
                      value={req.status}
                      onChange={(e) => updateStatus(req._id, e.target.value)}
                      className={`text-xs font-medium px-3 py-1.5 border rounded-lg cursor-pointer ${
                        statusStyles[req.status]
                      }`}
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
              <p className="text-gray-500">No requests found</p>
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Issue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Attachments
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
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
                        <td className="px-4 py-4 whitespace-nowrap font-semibold text-gray-900 align-top">
                          {req.fullName}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <FaEnvelope className="text-blue-500 text-xs" />
                              <span className="truncate max-w-[150px]">
                                {req.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaPhone className="text-emerald-500 text-xs" />{" "}
                              {req.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap align-top">
                          {getReasonBadge(req.reason, req.otherReason)}
                        </td>

                        {/* ✅ ISSUE COLUMN: Full Text Always Visible */}
                        <td className="px-4 py-4 align-top">
                          <div className="max-w-md text-sm text-gray-700 whitespace-pre-wrap break-words">
                            {req.issue}
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          {req.images && req.images.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {req.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img.data}
                                  alt="proof"
                                  className="h-10 w-10 rounded-lg border border-gray-200 object-cover cursor-pointer hover:scale-105 transition"
                                  onClick={() => setSelectedImage(img.data)}
                                  title={img.name || "Attachment"}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">
                              None
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap align-top">
                          <select
                            value={req.status}
                            onChange={(e) =>
                              updateStatus(req._id, e.target.value)
                            }
                            className={`text-xs font-medium px-3 py-1.5 border rounded-lg cursor-pointer ${
                              statusStyles[req.status]
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                          {new Date(req.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-12 text-center text-gray-500"
                      >
                        No requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 md:-right-10 text-white hover:text-gray-300 transition"
            >
              <FaTimes size={30} />
            </button>
            <img
              src={selectedImage}
              alt="Full Preview"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperSupport;
