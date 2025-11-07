import React, { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import axios from "axios";

const LeaveRequestForm = () => {
  const userName = localStorage.getItem("name");
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [leaveType, setLeaveType] = useState("Sick Leave");
  const [comments, setComments] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  
  const calendarRef = useRef(null);

  // Show toast notification
  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Format dates
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async () => {
    const userId = localStorage.getItem("userId");
    const today = new Date();
    // Calculate the required minimum start date (48 hours from now)
    const minCasualLeaveDate = new Date();
    minCasualLeaveDate.setDate(today.getDate() + 2); // 2 days in advance

    // --- 1. Casual Leave 48-Hour Validation ---
    if (leaveType === "Casual Leave") {
      const selectedStartDate = new Date(range[0].startDate);
      // Ensure the selected date is strictly after the minimum required date
      if (selectedStartDate < minCasualLeaveDate) {
        showToast(
          "Casual Leave must be requested at least 48 hours (2 days) in advance of the start date.",
          "error"
        );
        return; // Stop the submission
      }
    }

    // --- 2. Comments Word Count Validation (Minimum 30 words for all leave types) ---
    // Remove extra spaces and split by space to count words
    const wordCount = comments.trim().split(/\s+/).filter(word => word.length > 0).length;

    if (wordCount < 30) {
        showToast(
            `You must provide a detailed comment of at least 30 words for ${leaveType}. Your current comment has only ${wordCount} words.`,
            "error"
        );
        return; // Stop the submission
    }
    // --- End Validations ---

    try {
      const payload = {
        userId, // Include user ID
        userName,
        fromDate: range[0].startDate,
        toDate: range[0].endDate,
        leaveType,
        comments,
        fromTime,
        toTime,
      };

      await axios.post(
        "https://taskbe.sharda.co.in/api/leave",
        payload
      );

      // Set alert in localStorage for new leave request
      localStorage.setItem("showLeaveAlert", "true");

      // Trigger 'storage' event to update sidebar alert in real-time
      const event = new Event("storage");
      window.dispatchEvent(event);
      showToast("Leave submitted successfully! 🎉", "success");
      setComments("");
    } catch (error) {
      showToast("Error submitting leave request. Please try again.", "error");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition overflow-y-auto">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 right-4 z-50 max-w-sm w-full animate-slide-in ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3`}>
          <div className="flex-shrink-0">
            {toast.type === "success" ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast({ show: false, message: "", type: "" })}
            className="flex-shrink-0 hover:bg-white hover:bg-opacity-20 rounded p-1 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900 text-center">Request Leave</h2>

      <div className="border-b border-gray-300 mb-3 sm:mb-4"></div> 
      
      <label className="block text-xs sm:text-sm mb-1 text-gray-700 font-medium">Leave Dates</label>
      <input
        type="text"
        readOnly
        onClick={() => setShowCalendar(!showCalendar)}
        value={`${formatDate(range[0].startDate)} - ${formatDate(
          range[0].endDate
        )}`}
        className="w-full bg-gray-100 rounded-md p-2 sm:p-3 mb-3 sm:mb-4 text-sm sm:text-base text-gray-900 cursor-pointer border border-gray-300 hover:border-blue-400 transition"
      />

      {showCalendar && (
        <div ref={calendarRef} className="fixed sm:absolute left-1/2 transform -translate-x-1/2 z-50 mt-[-1rem] mb-4 bg-white rounded-lg shadow-2xl p-2 max-w-[95vw] sm:max-w-none">
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={range}
            className="rounded-md text-sm"
          />
        </div>
      )}

      <label className="block text-xs sm:text-sm mb-1 text-gray-700 font-medium">Leave Type</label>
      <select
        value={leaveType}
        onChange={(e) => setLeaveType(e.target.value)}
        className="w-full bg-gray-100 rounded-md p-2 sm:p-3 mb-3 sm:mb-4 border border-gray-300 text-sm sm:text-base text-black hover:border-blue-400 transition"
      >
        <option>Sick Leave</option>
        <option>Casual Leave</option>
        <option>Earned Leave</option>
        <option>Half Day Leave</option>
      </select>

      {/* leave timing for half day leave */}
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm mb-2 font-medium text-gray-700">
          Leave Timing{" "}
          <span className="text-gray-500 text-xs">(Optional, for Half Day)</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* From Time */}
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1 sm:hidden">Start Time</label>
            <div className="relative flex items-center">
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 sm:p-2.5 text-sm sm:text-base text-gray-900 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                placeholder="Start Time"
              />
            </div>
          </div>

          {/* To Text (Desktop only) */}
          <div className="hidden sm:flex items-center justify-center text-gray-600 font-medium">
            to
          </div>

          {/* To Time */}
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1 sm:hidden">End Time</label>
            <div className="relative flex items-center">
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 sm:p-2.5 text-sm sm:text-base text-gray-900 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                placeholder="End Time"
              />
            </div>
          </div>
        </div>
      </div>

      <label className="block text-xs sm:text-sm mb-1 text-gray-700 font-medium">
        Comments <span className="text-red-500 text-xs">(Required - Minimum 30 words)</span>
      </label>
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        className="w-full bg-gray-100 rounded-md p-2 sm:p-3 mb-3 sm:mb-4 text-sm sm:text-base text-gray-900 border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
        placeholder="Provide any additional details..."
        rows={3}
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 rounded-md transition-all duration-200 text-sm sm:text-base shadow-md hover:shadow-lg"
      >
        🚀 Submit Request
      </button>
    </div>
  );
};

export default LeaveRequestForm;

// Add CSS for animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
`;
document.head.appendChild(style);