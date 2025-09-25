import React, { useEffect, useState } from "react";
import {
  FaRegEnvelopeOpen,
  FaBug,
  FaLightbulb,
  FaComments,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdOutlineMoreHoriz } from "react-icons/md";
import { motion } from "framer-motion";

const DeveloperSupport = () => {
  const [requests, setRequests] = useState([]);

  // Fetch support requests
  useEffect(() => {
    fetch("https://taskbe.sharda.co.in/api/support")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRequests(data.requests);
      })
      .catch((err) => console.error("Error fetching support requests:", err));
  }, []);

  // Update status in backend & frontend
  const updateStatus = (id, newStatus) => {
    fetch(`https://taskbe.sharda.co.in/api/support/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRequests((prev) =>
            prev.map((req) =>
              req._id === id ? { ...req, status: newStatus } : req
            )
          );
        } else {
          console.error("Failed to update status:", data.message);
        }
      })
      .catch((err) => console.error("Error updating status:", err));
  };

  // Render reason badges
  const getReasonBadge = (reason, otherReason) => {
    switch (reason) {
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-red-600 bg-red-100 rounded-full">
            <FaBug className="text-red-500" /> Error
          </span>
        );
      case "feature":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
            <FaLightbulb className="text-blue-500" /> Feature
          </span>
        );
      case "suggestion":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
            <FaComments className="text-green-500" /> Suggestion
          </span>
        );
      case "other":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
            <MdOutlineMoreHoriz className="text-gray-500" /> {otherReason}
          </span>
        );
      default:
        return null;
    }
  };

  // Map for option colors
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Completed: "bg-green-100 text-green-800",
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FaRegEnvelopeOpen className="text-blue-600 text-xl" />
        <h2 className="text-lg font-bold text-gray-800">Support Requests</h2>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden max-h-[755px] overflow-y-auto pr-2">
        {requests.length > 0 ? (
          requests.map((req, index) => (
            <motion.div
              key={req._id}
              className="p-4 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Header: Name & Reason */}
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-gray-800 text-lg truncate">
                  {req.fullName}
                </p>
                {getReasonBadge(req.reason, req.otherReason)}
              </div>

              {/* Contact Info */}
              <div className="flex flex-col gap-1 mb-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-blue-400" />
                  <span className="truncate">{req.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPhone className="text-green-400" />
                  <span className="truncate">{req.phone}</span>
                </div>
              </div>

              {/* Issue */}
              <p className="mt-1 text-gray-700 text-sm leading-relaxed border-l-4 border-blue-200 pl-2 py-1">
                {req.issue}
              </p>

              {/* Status Dropdown */}
              <div className="mt-2">
                <select
                  value={req.status}
                  onChange={(e) => updateStatus(req._id, e.target.value)}
                  className={`text-sm px-2 py-1 border rounded-md ${statusColors[req.status]}`}
                >
                  <option
                    value="Pending"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    Pending
                  </option>
                  <option
                    value="In Progress"
                    className="bg-blue-100 text-blue-800"
                  >
                    In Progress
                  </option>
                  <option
                    value="Completed"
                    className="bg-green-100 text-green-800"
                  >
                    Completed
                  </option>
                </select>
              </div>

              {/* Date */}
              <p className="mt-3 text-xs text-gray-400 text-right italic flex items-center justify-end gap-1">
                <FaCalendarAlt className="text-gray-400" />
                {new Date(req.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </motion.div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow-md border border-gray-200">
            No support requests found.
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="max-h-[630px] overflow-y-auto border rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-700 text-sm sticky top-0 z-10">
              <tr>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Phone</th>
                <th className="py-2 px-4 text-left">Reason</th>
                <th className="py-2 px-4 text-left">Issue</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((req, index) => (
                  <motion.tr
                    key={req._id}
                    className="border-b hover:bg-gray-50 transition"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="py-2 px-4 font-semibold text-gray-800">
                      {req.fullName}
                    </td>
                    <td className="py-2 px-4 text-gray-600">{req.email}</td>
                    <td className="py-2 px-4 text-gray-600">{req.phone}</td>
                    <td className="py-2 px-4">
                      {getReasonBadge(req.reason, req.otherReason)}
                    </td>
                    <td className="py-2 px-4 text-gray-700">{req.issue}</td>
                    <td className="py-2 px-4">
                      <select
                        value={req.status}
                        onChange={(e) => updateStatus(req._id, e.target.value)}
                        className={`text-sm px-2 py-1 border border-gray-300 rounded-md ${statusColors[req.status]}`}
                      >
                        <option
                          value="Pending"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          Pending
                        </option>
                        <option
                          value="In Progress"
                          className="bg-blue-100 text-blue-800"
                        >
                          In Progress
                        </option>
                        <option
                          value="Completed"
                          className="bg-green-100 text-green-800"
                        >
                          Completed
                        </option>
                      </select>
                    </td>
                    <td className="py-2 px-4 text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500">
                    No support requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSupport;
