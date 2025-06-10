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
      <div className="flex gap-2 mb-4">
        <div>
          <label className="block text-sm">
            From Time <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="time"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="block text-sm">
            To Time <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="time"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            className="form-input"
          />
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
