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
  const [calendarAbove, setCalendarAbove] = useState(false);
  const [leaveDuration, setLeaveDuration] = useState("Full Day");
  const [leaveType, setLeaveType] = useState("Sick Leave");
  const [comments, setComments] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calendarRef = useRef(null);
  const inputRef = useRef(null);

  const MIN_COMMENT_WORDS = 10;

  // 🔥 IMPROVED: Better API URL handling
  const API_URL = import.meta.env.VITE_API_URL || "https://taskbe.sharda.co.in";

  // 🔥 Log API URL on component mount (for debugging)
  useEffect(() => {
    console.log("🔍 LeaveRequestForm initialized");
    console.log("🔍 Using API URL:", API_URL);
    console.log("🔍 Environment:", import.meta.env.MODE);
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showCalendar && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setCalendarAbove(spaceBelow < 350);
    }
  }, [showCalendar]);

  const handleSubmit = async () => {
    // 🔥 Prevent double submission
    if (isSubmitting) {
      console.log("⚠️ Already submitting, please wait...");
      return;
    }

    const userId = localStorage.getItem("userId");

    // Validation: User ID
    if (!userId) {
      showToast("❌ User ID not found. Please login again.", "error");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minCasualLeaveDate = new Date(today);
    minCasualLeaveDate.setDate(today.getDate() + 2);

    // Validation: Casual Leave advance notice
    if (leaveDuration === "Full Day" && leaveType === "Casual Leave") {
      const selectedStartDate = new Date(range[0].startDate);
      selectedStartDate.setHours(0, 0, 0, 0);
      if (selectedStartDate < minCasualLeaveDate) {
        const formattedMinDate = formatDate(minCasualLeaveDate);
        showToast(
          `❌ Casual Leave requires at least 2 days advance notice. Please select a date from ${formattedMinDate} onwards.\n\n💡 For immediate leave, you can apply for Emergency Leave instead!`,
          "error"
        );
        return;
      }
    }

    // Validation: Comment word count
    const wordCount = comments
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    if (wordCount < MIN_COMMENT_WORDS) {
      showToast(
        `❌ You must provide a detailed comment of at least ${MIN_COMMENT_WORDS} words. Your current comment has only ${wordCount} words.`,
        "error"
      );
      return;
    }

    // Validation: Half day timing
    if (leaveDuration === "Half Day" && (!fromTime || !toTime)) {
      showToast(
        "❌ Please select both start and end time for Half Day leave.",
        "error"
      );
      return;
    }

    const payload = {
      userId,
      userName,
      fromDate: range[0].startDate,
      toDate: range[0].endDate,
      leaveDuration,
      leaveType: leaveDuration === "Full Day" ? leaveType : "Half Day Leave",
      comments,
      fromTime: leaveDuration === "Half Day" ? fromTime : "",
      toTime: leaveDuration === "Half Day" ? toTime : "",
    };

    setIsSubmitting(true);

    try {
      console.log("\n📤 Submitting leave request...");
      console.log("🔍 API URL:", `${API_URL}/api/leave`);
      console.log("🔍 Payload:", payload);
      
      const response = await axios.post(`${API_URL}/api/leave`, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000, // 30 second timeout
      });
      
      console.log("✅ Leave submitted successfully!");
      console.log("📨 Response:", response.data);
      
      // Trigger storage event for real-time updates
      localStorage.setItem("showLeaveAlert", "true");
      const event = new Event("storage");
      window.dispatchEvent(event);
      
      showToast("✅ Leave submitted successfully! Admin will be notified via email. 🎉", "success");
      
      // Reset form
      setComments("");
      setFromTime("");
      setToTime("");
      setRange([
        {
          startDate: new Date(),
          endDate: new Date(),
          key: "selection",
        },
      ]);
      
    } catch (error) {
      console.error("\n❌ Error submitting leave:");
      console.error("Error:", error);
      console.error("API URL used:", `${API_URL}/api/leave`);
      
      // 🔥 Better error messages
      let errorMessage = "❌ Error submitting leave request. Please try again.";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "❌ Request timed out. Please check your internet connection and try again.";
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = "❌ Network error. Please check your internet connection.";
      } else if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || `❌ Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response
        errorMessage = "❌ No response from server. Please check if server is running.";
      }
      
      showToast(errorMessage, "error");
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition overflow-y-auto min-h-[77vh] flex flex-col justify-between">
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
          <div
            className={`max-w-md w-full mx-4 animate-scale-in ${
              toast.type === "success"
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : "bg-gradient-to-r from-white to-white"
            } text-black px-8 py-6 rounded-2xl shadow-2xl`}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="rounded-full p-4 bg-white bg-opacity-30">
                {toast.type === "success" ? (
                  <svg
                    className="w-16 h-16 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-16 h-16 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                )}
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">
                  {toast.type === "success" ? "Success!" : "Oops!"}
                </h3>
                <p className="font-medium text-base leading-relaxed whitespace-pre-line">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToast({ show: false, message: "", type: "" })}
                className="mt-2 bg-white text-gray-800 hover:bg-gray-100 font-bold px-8 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-900 text-center">
        Request Leave
      </h2>
      <div className="border-b border-gray-300 mb-4"></div>

      <label className="block text-xs sm:text-sm mb-1 text-gray-700 font-medium">
        Leave Duration
      </label>
      <select
        value={leaveDuration}
        onChange={(e) => {
          setLeaveDuration(e.target.value);
          if (e.target.value === "Full Day") {
            setLeaveType("Sick Leave");
            setFromTime("");
            setToTime("");
          }
        }}
        className="w-full bg-gray-100 rounded-md p-2 border border-gray-300 text-sm text-black hover:border-blue-400 transition mb-3"
        disabled={isSubmitting}
      >
        <option>Full Day</option>
        <option>Half Day</option>
      </select>

      {leaveDuration === "Full Day" && (
        <>
          <label className="block text-xs sm:text-sm mb-1 text-gray-700 font-medium">
            Leave Type
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full bg-gray-100 rounded-md p-2 border border-gray-300 text-sm text-black hover:border-blue-400 transition mb-3"
            disabled={isSubmitting}
          >
            <option>Sick Leave</option>
            <option>Casual Leave</option>
            <option>Emergency Leave</option>
          </select>
        </>
      )}

      <label className="block text-xs sm:text-sm mb-1 text-gray-700 font-medium">
        Leave Date{leaveDuration === "Full Day" ? "s" : ""}
      </label>
      <input
        ref={inputRef}
        type="text"
        readOnly
        onClick={() => !isSubmitting && setShowCalendar(!showCalendar)}
        value={
          leaveDuration === "Full Day"
            ? `${formatDate(range[0].startDate)} - ${formatDate(
                range[0].endDate
              )}`
            : formatDate(range[0].startDate)
        }
        className="w-full bg-gray-100 rounded-md p-2 mb-2 text-sm text-gray-900 cursor-pointer border border-gray-300 hover:border-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      />

      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div
            ref={calendarRef}
            className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 max-w-[95vw] sm:max-w-lg animate-scale-in"
          >
            <DateRange
              editableDateInputs={true}
              onChange={(item) => {
                if (leaveDuration === "Half Day") {
                  setRange([
                    {
                      startDate: item.selection.startDate,
                      endDate: item.selection.startDate,
                      key: "selection",
                    },
                  ]);
                } else {
                  setRange([item.selection]);
                }
              }}
              moveRangeOnFirstSelection={false}
              ranges={range}
              className="rounded-md text-sm"
            />

            <div className="text-center mt-4">
              <button
                onClick={() => setShowCalendar(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-semibold transition-all duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {leaveDuration === "Half Day" && (
        <div className="mb-3">
          <label className="block text-xs sm:text-sm mb-2 font-medium text-gray-700">
            Leave Timing{" "}
            <span className="text-red-500 text-xs">(Required)</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md p-2 text-sm text-gray-900 hover:border-blue-400 focus:border-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            />
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md p-2 text-sm text-gray-900 hover:border-blue-400 focus:border-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

      <label className="block text-xs sm:text-sm mb-1 text-gray-700 font-medium">
        Comments{" "}
        <span className="text-red-500 text-xs">
          (min {MIN_COMMENT_WORDS} words)
        </span>
      </label>
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        className="w-full bg-gray-100 rounded-md p-2 mb-3 text-sm text-gray-900 border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none disabled:opacity-50"
        rows={3}
        placeholder="Provide any additional details..."
        disabled={isSubmitting}
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-md transition-all duration-200 text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <span>🚀</span>
            <span>Submit Request</span>
          </>
        )}
      </button>
    </div>
  );
};

// Animations
const style = document.createElement("style");
style.textContent = `
  @keyframes fade-in { from {opacity: 0;} to {opacity: 1;} }
  @keyframes scale-in { from {transform: scale(0.8); opacity: 0;} to {transform: scale(1); opacity: 1;} }
  .animate-fade-in { animation: fade-in 0.2s ease-out; }
  .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
`;
document.head.appendChild(style);

export default LeaveRequestForm;