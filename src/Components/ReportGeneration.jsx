import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateTaskStatus, fetchTasks } from "../redux/taskSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchDepartments } from "../redux/departmentSlice";

import {
  faFilter,
  faPen,
  faTrash,
  faCalendar,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { FaTrashAlt, FaPen, FaCalendar } from "react-icons/fa";
import { fetchUsers } from "../redux/userSlice"; // Adjust path based on your folder structure
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { io } from "socket.io-client";
const socket = io("https://taskbe.sharda.co.in"); // Or your backend URL

const ReportGeneration = ({
  onEdit,
  refreshTrigger,
  setTaskListExternally,
  tasksOverride,
  hideCompleted,
}) => {
  const [tasks, setTasks] = useState([]);
  const [editingStatus, setEditingStatus] = useState(null); // Track the task being edited
  const [newStatus, setNewStatus] = useState(""); // Store new status value
  const [filters, setFilters] = useState({
    priority: "",
    assignee: "",
    assignedBy: "",
    status: "",
    code: "",
    department: "",
  });
  const [dueDateSortOrder, setDueDateSortOrder] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [editingWorkDesc, setEditingWorkDesc] = useState(null);
  const [workDescs, setWorkDescs] = useState({});
  const [openWorkDescPopup, setOpenWorkDescPopup] = useState(null);
  const [workDescMode, setWorkDescMode] = useState("view");
  const [departments, setDepartments] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [departmentsForAdmin, setDepartmentsForAdmin] = useState([]);
  const [departmentsLoaded, setDepartmentsLoaded] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Get user role and email from localStorage
  const role = localStorage.getItem("role");
  const userEmail = localStorage.getItem("userId");
  const users = useSelector((state) => state.users.list); // Assuming `list` stores users in Redux
  const reportRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const departmentData = useSelector((state) => state.departments.list);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    setDepartments(departmentData); // ✅ Set local state from Redux store
  }, [departmentData]);

  useEffect(() => {
    if (role === "admin" && users?.length) {
      const adminUser = users.find((u) => u.email === userEmail);
      const adminDepartments = adminUser?.department || [];
      setDepartmentsForAdmin(adminDepartments); // New state
      setDepartmentsLoaded(true); // ✅ Mark as loaded here
    }
  }, [users, role, userEmail]);

  useEffect(() => {
    dispatch(updateTaskStatus());
  }, [dispatch]);

  useEffect(() => {
    if (users?.length) {
      const names = users.map((u) => u.name);
      setUniqueUsers([...new Set(names)]);
    }
  }, [users]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchTasksFromAPI = async () => {
    try {
      const response = await fetch(
        "https://taskbe.sharda.co.in/api/tasks"
      );
      const data = await response.json();

      const hiddenTaskIds = JSON.parse(
        localStorage.getItem("hiddenCompletedTasks") || "[]"
      );

      const visibleTasks = data.filter(
        (task) => !hiddenTaskIds.includes(task._id)
      );

      let filtered = [];

      if (role !== "admin") {
        filtered = visibleTasks.filter(
          (task) =>
            task.assignees?.some((a) => a.email === userEmail) ||
            task.assignedBy?.email === userEmail
        );
        setTasks(filtered);
        if (setTaskListExternally) setTaskListExternally(filtered);
      } else {
        setTasks(visibleTasks);
        if (setTaskListExternally) setTaskListExternally(visibleTasks);
      }

      // Initialize remarks state with all task remarks
      const taskRemarks = {};
      const tasksToProcess = role !== "admin" ? filtered : visibleTasks;
      tasksToProcess.forEach((task) => {
        taskRemarks[task._id] = task.remark || "";
      });
      setRemarks(taskRemarks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  useEffect(() => {
    if (role !== "admin" || departmentsLoaded) {
      fetchTasksFromAPI();
    }
  }, [role, userEmail, refreshTrigger, departmentsLoaded]);

  useEffect(() => {
    socket.on("task-updated", (data) => {
      // console.log("🟡 task-updated received on frontend!", data); // <-- Add this
      fetchTasksFromAPI();
    });

    return () => socket.off("task-updated");
  }, []);

  // Fetch tasks based on the user's role
  useEffect(() => {
    const handleTaskEvent = () => {
      // Ensure we refresh only when departments are ready
      if (role === "admin" && !departmentsLoaded) {
        const interval = setInterval(() => {
          if (departmentsLoaded) {
            fetchTasksFromAPI();
            clearInterval(interval);
          }
        }, 300); // Check every 300ms
      } else {
        fetchTasksFromAPI();
      }
    };

    socket.on("new-task-created", handleTaskEvent);
    socket.on("task-updated", handleTaskEvent);
    socket.on("task-deleted", handleTaskEvent);

    return () => {
      socket.off("new-task-created", handleTaskEvent);
      socket.off("task-updated", handleTaskEvent);
      socket.off("task-deleted", handleTaskEvent);
    };
  }, [departmentsLoaded, role]);

  useEffect(() => {
    fetchTasksFromAPI();
  }, [role, userEmail, refreshTrigger]);

  const formatAssignedDate = (assignedDate) => {
    if (!assignedDate) return "";
    const date = new Date(assignedDate);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // ✅ 12-hour format with AM/PM
    });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistically update the UI
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );

    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };

    try {
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus, updatedBy }), // ✅ Send updatedBy
        }
      );

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
      } else {
        throw new Error("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Error updating task status. Please try again.");

      // Revert UI if update fails
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: task.status } : task
        )
      );
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const uniqueAssignedBy = [
    ...new Set(tasks.map((t) => t.assignedBy?.name).filter(Boolean)),
  ];

  const handleWorkDescSave = async (taskId) => {
    const workDescText = workDescs[taskId] || "";

    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };

    try {
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ workDesc: workDescText, updatedBy }),
        }
      );

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
        setEditingWorkDesc(null); // Exit editing mode
      } else {
        throw new Error("Failed to update work description");
      }
    } catch (error) {
      console.error("Error updating work description:", error);
      alert("Error updating work description. Please try again.");
    }
  };

  const filteredTasks = (tasksOverride || tasks)
    .filter((task) => {
      const assignedDate = new Date(task.assignedDate);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      // Add 1 full day to `toDate` to include the entire day
      if (to) to.setHours(23, 59, 59, 999);

      const matchesUser =
        filters.user &&
        (task.assignees?.some((a) => a.name === filters.user) ||
          task.assignedBy?.name === filters.user);

      const matchesDateRange =
        (!from || assignedDate >= from) && (!to || assignedDate <= to);

      const matchesOtherFilters =
        (filters.department === "" ||
          task.department.includes(filters.department)) &&
        (filters.code === "" || task.code === filters.code) &&
        (filters.priority === "" || task.priority === filters.priority) &&
        (filters.status === "" || task.status === filters.status);

      const shouldHide = hideCompleted && task.status === "Completed";

      return (
        matchesUser && matchesDateRange && matchesOtherFilters && !shouldHide
      );
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const highPriorityTasks = filteredTasks.filter(
    (task) => task.priority === "High"
  );
  const mediumPriorityTasks = filteredTasks.filter(
    (task) => task.priority === "Medium"
  );
  const lowPriorityTasks = filteredTasks.filter(
    (task) => task.priority === "Low"
  );

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setEditingStatus(null); // 👈 Close dropdown on outside click
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const renderTaskRow = (task, index) => (
   <tr
      key={task._id}
      id={`task-${task._id}`}
      className={`hover:bg-indigo-50 transition duration-300 ease-in-out cursor-pointer border-b border-gray-200 
    ${
      new Date(task.dueDate) < new Date() &&
      task.status !== "Completed" &&
      task.status !== "Obsolete"
        ? "bg-orange-100 hover:bg-orange-200" // 🔴 Overdue tasks
        : ""
    }
  `}
    >
      {/* 1. S. No */}
      <td className="py-3 px-4 font-medium">{index + 1}</td>

      {/* 2. Task Name (with pencil icon for edit) */}
      <td className="py-3 px-6 relative flex items-center gap-2">
        <span className="text-xs">{task.taskName}</span>
        <FontAwesomeIcon
          icon={faPen}
          className="cursor-pointer text-blue-500 hover:text-blue-700"
          onClick={() => onEdit(task)}
        />
      </td>

      {/* 3. Work Description + Code */}
      <td className="py-3 px-6 relative group">
        <div className="flex items-center gap-2 min-h-[24px]">
          <span className="text-xs text-gray-700">
            {(task.workDesc || "No description").length > 60
              ? `${task.workDesc.slice(0, 60)}...`
              : task.workDesc || "No description"}
            {task.code && (
              <span className="ml-2 text-blue-600 font-medium">
                ({task.code})
              </span>
            )}
          </span>

          {(task.workDesc || "").length > 60 && (
            <button
              className="text-blue-500 hover:text-blue-700 text-xs font-medium transition-colors"
              onClick={() => {
                setOpenWorkDescPopup(task._id);
                setWorkDescMode("view");
              }}
            >
              Read more
            </button>
          )}
          <FontAwesomeIcon
            icon={faPen}
            className="cursor-pointer text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity w-3 h-3"
            onClick={() => {
              setOpenWorkDescPopup(task._id);
              setWorkDescMode("edit");
            }}
          />
        </div>

        {/* Popup box for read/edit work description */}
        {openWorkDescPopup === task._id && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4 transition-all duration-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <span className="font-semibold text-sm text-gray-800">
                {workDescMode === "edit" ? "Edit Description" : "Description"}
              </span>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors text-lg"
                onClick={() => setOpenWorkDescPopup(null)}
              >
                ×
              </button>
            </div>

            {workDescMode === "edit" ? (
              <>
                <textarea
                  value={workDescs[task._id] || task.workDesc || ""}
                  onChange={(e) =>
                    setWorkDescs((prev) => ({
                      ...prev,
                      [task._id]: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Enter work description..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
                  autoFocus
                />

                <div className="flex justify-end mt-3 gap-2">
                  <button
                    onClick={() => setOpenWorkDescPopup(null)}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleWorkDescSave(task._id);
                      setOpenWorkDescPopup(null);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-700 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                {task.workDesc || "No description available"}
              </div>
            )}

            {task.code && (
              <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
                <span className="font-medium">Code:</span> {task.code}
              </div>
            )}
          </div>
        )}
      </td>

      {/* 4. Date of Work */}
      <td className="py-3 px-6">{formatAssignedDate(task.assignedDate)}</td>

      {/* 5. Due Date */}
      <td className="py-3 px-6">
        {new Date(task.dueDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </td>

      {/* 6. Status (with click to change dropdown) */}
      <td className="py-3 px-6 text-center relative">
        {editingStatus === task._id ? (
          <div
            ref={dropdownRef}
            className="flex flex-col w-[20vh] justify-between bg-white absolute shadow-lg rounded-lg z-50"
          >
            {["To Do", "In Progress", "Completed", "Overdue", "Abbstulate"].map(
              (statusOption) => (
                <span
                  key={statusOption}
                  className={`py-2 px-4 text-center rounded-md text-xs font-semibold cursor-pointer mb-1 ${
                    statusOption === "Completed"
                      ? "bg-green-200 text-green-600"
                      : statusOption === "In Progress"
                      ? "bg-yellow-200 text-yellow-600"
                      : statusOption === "To Do"
                      ? "bg-blue-200 text-blue-600"
                      : statusOption === "Abbstulate"
                      ? "bg-purple-200 text-purple-600"
                      : "bg-red-200 text-red-600"
                  }`}
                  onClick={() => {
                    setNewStatus(statusOption);
                    handleStatusChange(task._id, statusOption);
                    setEditingStatus(null);
                  }}
                >
                  {statusOption}
                </span>
              )
            )}
          </div>
        ) : (
          <span
            className={`py-1 px-3 rounded-full text-xs font-semibold ${
              task.status === "Completed"
                ? "bg-green-200 text-green-600"
                : task.status === "In Progress"
                ? "bg-yellow-200 text-yellow-600"
                : task.status === "To Do"
                ? "bg-blue-200 text-blue-600"
                : task.status === "Abbstulate"
                ? "bg-purple-200 text-purple-600"
                : "bg-red-200 text-red-600"
            }`}
            onClick={() => setEditingStatus(task._id)}
          >
            {task.status}
          </span>
        )}
      </td>
    </tr>
  );

  useEffect(() => {
    // console.log("Current department filter:", filters.department);
    // console.log(
    //   "Task departments:",
    //   tasks.map((t) => t.department || t.taskCategory)
    // );
  }, [filters.department, tasks]);

  const handleDownloadPDF = () => {
    if (!filters.user) {
      alert("Please select a user to generate the report.");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });

    const title = `${filters.user}'s Task Report`;
    const subtitle =
      fromDate && toDate
        ? `From ${new Date(fromDate).toLocaleDateString("en-GB")} to ${new Date(
            toDate
          ).toLocaleDateString("en-GB")}`
        : "";

    doc.setFont("helvetica", "bold"); // Font and style
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80); // Dark blue/gray
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 40, {
      align: "center",
    });

    if (subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100); // Gray
      doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, 60, {
        align: "center",
      });
    }

    const tableData = filteredTasks.map((task, index) => [
      index + 1,
      task.taskName,
      task.workDesc || "No description",
      task.code || "",
      formatAssignedDate(task.assignedDate),
      new Date(task.dueDate).toLocaleDateString("en-GB"),
      task.status,
      task.priority,
    ]);

    autoTable(doc, {
      head: [
        [
          "S. No",
          "Task Name",
          "Work Description",
          "Code",
          "Date of Work",
          "Due Date",
          "Status",
          "Priority",
        ],
      ],
      body: tableData,
      startY: 80,
      styles: {
        fontSize: 8,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [47, 62, 158],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    doc.save(`${filters.user.replace(/\s+/g, "_")}-Task-Report.pdf`);
  };

  const handleDownloadExcel = () => {
    if (!filters.user) {
      alert("Please select a user to generate the report.");
      return;
    }

    const exportData = filteredTasks.map((task, index) => ({
      "S. No": index + 1,
      "Task Name": task.taskName,
      "Work Description": task.workDesc || "No description",
      Code: task.code || "",
      "Date of Work": formatAssignedDate(task.assignedDate),
      "Due Date": new Date(task.dueDate).toLocaleDateString("en-GB"),
      Status: task.status,
      Priority: task.priority,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

    const fileName = `${filters.user.replace(/\s+/g, "_")}-Task-Report.xlsx`;
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, fileName);
  };

  return (
    <div className="overflow-x-auto h-[68vh] w-[180vh] relative">
      <div className="flex items-center justify-between mb-6 flex-wrap">
        {/* Left section: Filters */}
        <div className="flex items-center space-x-6 flex-wrap">
          {/* User Filter */}
          {role === "admin" && (
            <div className="flex items-center space-x-2">
              <label
                htmlFor="userFilter"
                className="text-xs font-medium text-gray-700"
              >
                Filter by User:
              </label>
              <select
                id="userFilter"
                value={filters.user}
                onChange={(e) => handleFilterChange("user", e.target.value)}
                className="appearance-none w-56 pl-4 pr-10 py-2 text-xs border border-gray-300 rounded-md shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a user</option>
                {[...new Set([...uniqueUsers, ...uniqueAssignedBy])].map(
                  (user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {/* From Date */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="p-2 border border-gray-300 text-xs rounded-md shadow-sm"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="p-2 border border-gray-300 text-xs rounded-md shadow-sm"
            />
          </div>
        </div>

        {/* Right section: Download button */}
        <div>
          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow"
          >
            📊 Download Excel
          </button>
          <button
            onClick={handleDownloadPDF}
            className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow"
          >
            📄 Download PDF
          </button>
        </div>
      </div>

      {!filters.user ? (
        <div className="text-center text-gray-500 mt-10">
          🔍 Please select a user to view tasks.
        </div>
      ) : (
        <>
          <div ref={reportRef} style={{ width: "100%", padding: "1rem" }}>
            <div className="overflow-x-auto  w-[180vh] relative">
              <h2 className="text-base sm:text-sm font-semibold">
                {filters.user ? (
                  <>
                    <span className="capitalize">
                      {filters.user}'s Task Report
                    </span>
                    {fromDate && toDate && (
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        (from{" "}
                        <span className="font-semibold text-gray-800">
                          {new Date(fromDate).toLocaleDateString("en-GB")}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-gray-800">
                          {new Date(toDate).toLocaleDateString("en-GB")}
                        </span>
                        )
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500">
                    Please select a user to view report
                  </span>
                )}
              </h2>
            </div>

            <div className="overflow-y-auto">
              <table className=" w-full table-auto border-collapse text-xs text-gray-800">
                <thead className="bg-gradient-to-r from-indigo-400 to-indigo-700 text-white text-xs sticky top-0 z-10">
                  <tr className="text-left">
                    <th className="py-3 px-4 min-w-[70px] font-semibold">
                      S. No
                    </th>
                    <th className="py-3 px-6 min-w-[180px] font-semibold">
                      Task Name
                    </th>
                    <th className="py-3 px-6  min-w-[250px] font-semibold">
                      Work Description + Code
                    </th>
                    <th className="py-3 px-6 min-w-[150px] font-semibold">
                      Date of Work
                    </th>
                    <th
                      className="py-3 px-6  font-semibold cursor-pointer"
                      onClick={() => {
                        setDueDateSortOrder((prev) =>
                          prev === "asc" ? "desc" : "asc"
                        );
                      }}
                    >
                      Due Date
                      {dueDateSortOrder === "asc"
                        ? " 🔼"
                        : dueDateSortOrder === "desc"
                        ? " 🔽"
                        : ""}
                    </th>
                    <th className="py-3 px-6 min-w-[140px] font-semibold text-center">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="text-xs text-gray-700">
                  {/* High Priority Section */}
                  {highPriorityTasks.length === 0 &&
                  mediumPriorityTasks.length === 0 &&
                  lowPriorityTasks.length === 0 ? (
                    <tr>
                      <td
                        colSpan="13"
                        className="text-center py-6 text-gray-500"
                      >
                        🚫 No tasks Assigned Yet.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {highPriorityTasks.length > 0 && (
                        <>
                          <tr className="bg-red-100 text-red-800 font-bold text-xs">
                            <td colSpan="13" className="py-2 px-6">
                              High Priority Tasks
                            </td>
                          </tr>
                          {highPriorityTasks.map((task, idx) =>
                            renderTaskRow(task, idx)
                          )}
                        </>
                      )}

                      {/* Medium Priority Section */}
                      {mediumPriorityTasks.length > 0 && (
                        <>
                          <tr className="bg-yellow-100 text-yellow-800 font-bold text-xs">
                            <td colSpan="13" className="py-2 px-6">
                              Medium Priority Tasks
                            </td>
                          </tr>
                          {mediumPriorityTasks.map((task, idx) =>
                            renderTaskRow(task, idx)
                          )}
                        </>
                      )}

                      {/* Low Priority Section */}
                      {lowPriorityTasks.length > 0 && (
                        <>
                          <tr className="bg-green-100 text-green-800 font-bold text-xs">
                            <td colSpan="13" className="py-2 px-6">
                              Low Priority Tasks
                            </td>
                          </tr>
                          {lowPriorityTasks.map((task, idx) =>
                            renderTaskRow(task, idx)
                          )}
                        </>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportGeneration;
