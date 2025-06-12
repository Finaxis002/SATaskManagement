import React, { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import axios from "axios";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";


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
        "https://sataskmanagementbackend.onrender.com/api/leave",
        payload
      );

      // Set alert in localStorage for new leave request
      localStorage.setItem("showLeaveAlert", "true");

      // Trigger 'storage' event to update sidebar alert in real-time
      const event = new Event("storage");
      window.dispatchEvent(event);
      alert("Leave submitted successfully!");
      setComments("");
    } catch (error) {
      alert("Error submitting leave request.");
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-md relative">
      <h2 className="text-2xl font-semibold mb-4">Request Leave</h2>

      <label className="block text-sm mb-1">Leave Dates</label>
      <input
        type="text"
        readOnly
        onClick={() => setShowCalendar(!showCalendar)}
        value={`${formatDate(range[0].startDate)} - ${formatDate(
          range[0].endDate
        )}`}
        className="w-full bg-gray-700 rounded-md p-2 mb-4 text-white cursor-pointer"
      />

      {showCalendar && (
        <div ref={calendarRef} className="absolute z-50 mt-[-1rem] mb-4">
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={range}
            className="rounded-md"
          />
        </div>
      )}

      <label className="block text-sm mb-1">Leave Type</label>
      <select
        value={leaveType}
        onChange={(e) => setLeaveType(e.target.value)}
        className="w-full bg-gray-700 rounded-md p-2 mb-4 text-white"
      >
        <option>Sick Leave</option>
        <option>Casual Leave</option>
        <option>Earned Leave</option>
        <option>Half Day Leave</option>
      </select>
      {/* leave timing for half day leave */}
      <div className="mb-4">
        <label className="block text-sm mb-1 font-medium text-gray-300">
          Leave Timing{" "}
          <span className="text-gray-400">(Optional, for Half Day)</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-700/60 rounded-lg border border-gray-600 shadow-sm">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-300 mb-1">
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
              className="w-full [&_input]:bg-gray-800 [&_input]:border-none [&_input]:text-white [&_input]:rounded-md [&_input]:py-2 [&_input]:px-10 [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-blue-500 [&_button]:text-gray-400"
              format="HH:mm"
              disableClock={false}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-300 mb-1">
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

      <label className="block text-sm mb-1">Comments (Optional)</label>
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        className="w-full bg-gray-700 rounded-md p-2 mb-4 text-white"
        placeholder="Provide any additional details..."
        rows={3}
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md"
      >
        🚀 Submit Request
      </button>
    </div>
  );
};

export default LeaveRequestForm;
