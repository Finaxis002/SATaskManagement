import React, { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import axios from "axios";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

// Toast Component
const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-16 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform ${type === 'success'
        ? 'bg-green-500 text-white'
        : 'bg-red-500 text-white'
      } ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[-100px] opacity-0'}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">
          {type === 'success' ? '✅' : '❌'}
        </span>
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 font-bold text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
};

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

  // Toast states
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const calendarRef = useRef(null);

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

  const showToast = (message, type = 'success') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem("userId");

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

      // Show success toast instead of alert
      showToast("Leave request submitted successfully! 🎉", "success");
      setComments("");
    } catch (error) {
      // Show error toast
      showToast("Error submitting leave request. Please try again.", "error");
    }
  };

  return (
    <>
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition overflow-y-auto ">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 text-center ">Request Leave</h2>

        <div className="border-b border-gray-300 mb-4"></div>
        <label className="block text-sm mb-1 text-gray-700">Leave Dates</label>
        <input
          type="text"
          readOnly
          onClick={() => setShowCalendar(!showCalendar)}
          value={`${formatDate(range[0].startDate)} - ${formatDate(
            range[0].endDate
          )}`}
          className="w-full bg-gray-100 rounded-md p-2 mb-4 text-gray-900 cursor-pointer border border-gray-300"
        />

        {showCalendar && (
          <div ref={calendarRef} className="absolute z-50 mt-[-1rem] mb-4 bg-white rounded-lg shadow-lg p-2">
            <DateRange
              editableDateInputs={true}
              onChange={(item) => setRange([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={range}
              className="rounded-md"
            />
          </div>
        )}

        <label className="block text-sm mb-1 text-gray-700">Leave Type</label>
        <select
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          className="w-full bg-gray-100 rounded-md p-2 mb-4 border border-gray-300 text-black"
        >
          <option>Sick Leave</option>
          <option>Casual Leave</option>
          <option>Earned Leave</option>
          <option>Half Day Leave</option>
        </select>

        {/* leave timing for half day leave */}
        <div className="mb-4">
          <label className="block text-sm mb-1 font-medium text-gray-700">
            Leave Timing{" "}
            <span className="text-gray-500">(Optional, for Half Day)</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-300 shadow-sm">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                From Time
              </label>
              <TimePicker
                onChange={setFromTime}
                value={fromTime}
                clearIcon={null}
                clockIcon={
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                className="w-full [&_input]:bg-gray-100 [&_input]:border border-gray-300 [&_input]:text-gray-900 [&_input]:rounded-md [&_input]:py-2 [&_input]:px-10 [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-blue-500 [&_button]:text-gray-600"
                format="HH:mm"
                disableClock={false}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                To Time
              </label>
              <TimePicker
                onChange={setToTime}
                value={toTime}
                clearIcon={null}
                clockIcon={
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                className="w-full [&>div]:w-full"
                format="HH:mm"
                disableClock={false}
              />
            </div>
          </div>
        </div>

        <label className="block text-sm mb-1 text-gray-700">Comments (Optional)</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full bg-gray-100 rounded-md p-2 mb-4 text-gray-900 border border-gray-300"
          placeholder="Provide any additional details..."
          rows={3}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors duration-300 ease-in-out"
        >
          🚀 Submit Request
        </button>
      </div>
    </>
  );
};

export default LeaveRequestForm;
