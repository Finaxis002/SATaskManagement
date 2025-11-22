import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTaskStatus } from "../../redux/taskSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchDepartments } from "../../redux/departmentSlice";
import StatusDropdownPortal from "../StatusDropdownPortal";
import { faPen, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FaTrashAlt, FaExclamationCircle, FaSpinner, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { fetchUsers } from "../../redux/userSlice";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import FilterSection from "./FilterSection";
import MessagePopup from "./MessagePopup";
import axios from "../../utils/secureAxios";

const socket = io("https://taskbe.sharda.co.in");
const DESKTOP_ITEMS_TO_LOAD = 20; // For Infinite Scroll (Desktop)
const MOBILE_ITEMS_PER_PAGE = 10; // For Pagination (Mobile)

const TaskList = ({
  onEdit,
  refreshTrigger,
  setTaskListExternally,
  tasksOverride,
  hideCompleted,
}) => {
  // Original Task State (full list from API, before filters/pagination)
  const [allFetchedTasks, setAllFetchedTasks] = useState([]);
  
  // --- PAGINATION / SCROLL STATE ---
  const [tasks, setTasks] = useState([]); // Filtered/Sorted master list
  
  // Desktop Infinite Scroll State
  const [desktopDisplayedCount, setDesktopDisplayedCount] = useState(DESKTOP_ITEMS_TO_LOAD);
  const scrollContainerRef = useRef(null); 
  
  // Mobile Pagination State
  const [mobileCurrentPage, setMobileCurrentPage] = useState(1);
  // -----------------------------

  const [editingStatus, setEditingStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState({});
  const [filters, setFilters] = useState({
    priority: "",
    assignee: "",
    assignedBy: "",
    status: "",
    code: "",
    department: "",
    dueBefore: "",
  });
  const [dueDateSortOrder, setDueDateSortOrder] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [workDescs, setWorkDescs] = useState({});
  const [openRemarkPopup, setOpenRemarkPopup] = useState(null);
  const [openWorkDescPopup, setOpenWorkDescPopup] = useState(null);
  const [workDescMode, setWorkDescMode] = useState("view");
  const [remarkMode, setRemarkMode] = useState("view");
  const [departments, setDepartments] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [departmentsLoaded, setDepartmentsLoaded] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(true);
  const [openMessagePopup, setOpenMessagePopup] = useState(null);
  const [taskForMessage, setTaskForMessage] = useState(null);
  const [openTaskPopup, setOpenTaskPopup] = useState(null);
  const isInitialLoadRef = useRef(true);


  const role = localStorage.getItem("role");
  const userEmail = JSON.parse(localStorage.getItem("user"))?.email;

  const users = useSelector((state) => state.users.list);
  const departmentData = useSelector((state) => state.departments.list);
  const [showTeamPopup, setShowTeamPopup] = useState(null);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  
  // --- INITIAL SETUP AND DATA FETCH ---

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDepartments());
    dispatch(updateTaskStatus());
  }, [dispatch]);

  useEffect(() => {
    setDepartments(departmentData || []);
  }, [departmentData]);

  useEffect(() => {
    if (role === "admin" && users?.length) {
      setDepartmentsLoaded(true);
    }
  }, [users, role]);

  useEffect(() => {
    if (users?.length) {
      const names = users.map((u) => u.name);
      setUniqueUsers([...new Set(names)]);
    }
  }, [users]);

  const fetchTasksFromAPI = async () => {
    if (isInitialLoadRef.current) setLoading(true); 
    try {
      const response = await fetch("https://taskbe.sharda.co.in/api/tasks");
      const data = await response.json();

      const visibleTasks = data.filter((task) => !task.isHidden);
      let filtered = [];

      if (role !== "admin") {
        filtered = visibleTasks.filter(
          (task) =>
            task.assignees?.some((a) => a.email === userEmail) ||
            task.assignedBy?.email === userEmail
        );
        setAllFetchedTasks(filtered); // Store the full list
        if (setTaskListExternally) setTaskListExternally(filtered);
      } else {
        setAllFetchedTasks(visibleTasks); // Store the full list
        if (setTaskListExternally) setTaskListExternally(visibleTasks);
      }

      const taskRemarks = {};
      (role !== "admin" ? filtered : visibleTasks).forEach((task) => {
        taskRemarks[task._id] = task.remark || "";
      });
      setRemarks(taskRemarks);
      
      // Reset displayed count for both views
      setDesktopDisplayedCount(DESKTOP_ITEMS_TO_LOAD);
      setMobileCurrentPage(1);

    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
    if (isInitialLoadRef.current) setLoading(false);
    isInitialLoadRef.current = false;
  };

  useEffect(() => {
    if (role !== "admin" || departmentsLoaded) {
      fetchTasksFromAPI();
    }
  }, [role, userEmail, refreshTrigger, departmentsLoaded]);

  // WebSocket for real-time updates
  useEffect(() => {
    const handleTaskEvent = () => fetchTasksFromAPI();
    socket.on("new-task-created", handleTaskEvent);
    socket.on("task-updated", handleTaskEvent);
    socket.on("task-deleted", handleTaskEvent);
    return () => {
      socket.off("new-task-created", handleTaskEvent);
      socket.off("task-updated", handleTaskEvent);
      socket.off("task-deleted", handleTaskEvent);
    };
  }, []);

  // --- DESKTOP INFINITE SCROLL HANDLER ---
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      if (
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 100
      ) {
        if (tasks.length > desktopDisplayedCount) {
          setDesktopDisplayedCount(
            (prevCount) => Math.min(prevCount + DESKTOP_ITEMS_TO_LOAD, tasks.length)
          );
        }
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [tasks.length, desktopDisplayedCount]);

  const handleLoadAll = () => {
    setDesktopDisplayedCount(tasks.length);
  };

  // --- MOBILE PAGINATION HANDLERS ---
  const handleNextPage = () => {
    const totalPages = Math.ceil(tasks.length / MOBILE_ITEMS_PER_PAGE);
    setMobileCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setMobileCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  
  // -----------------------------
  
  const handleMessageSend = async (payload) => {
    try {
      const response = await axios.post(
        "https://taskbe.sharda.co.in/api/message-history",
        payload
      );

      if (response.status === 201) {
        Swal.fire("Message sent successfully!");
      } else {
        throw new Error("Message sending failed");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      Swal.fire("Error", "Failed to send message", "error");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setLoadingStatus((prev) => ({ ...prev, [taskId]: true }));
    setAllFetchedTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );
    setRemarks((prevRemarks) => ({
        ...prevRemarks,
        [taskId]: newStatus === "Completed" ? (prevRemarks[taskId] || "") + " [Completed]" : prevRemarks[taskId],
    }));

    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };

    try {
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, updatedBy }),
        }
      );

      if (response.ok) {
        const updatedTask = await response.json();
        setAllFetchedTasks((prevTasks) =>
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
      fetchTasksFromAPI();
    }
    setLoadingStatus((prev) => ({ ...prev, [taskId]: false }));
    setEditingStatus(null);
  };

  const handleRemarkSave = async (taskId) => {
    const remarkText = remarks[taskId] ?? "";
    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };

    try {
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remark: remarkText, updatedBy }),
        }
      );

      if (response.ok) {
        const updatedTask = await response.json();
        setAllFetchedTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
        setRemarks((prev) => ({ ...prev, [taskId]: updatedTask.remark ?? "" }));
        setOpenRemarkPopup(null);
      } else {
        throw new Error("Failed to update remark");
      }
    } catch (error) {
      console.error("Error updating remark:", error);
      alert("Error updating remark. Please try again.");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Reset display count and page when filters change
    setDesktopDisplayedCount(DESKTOP_ITEMS_TO_LOAD);
    setMobileCurrentPage(1);
  };

  const uniqueAssignedBy = [
    ...new Set(allFetchedTasks.map((t) => t.assignedBy?.name).filter(Boolean)),
  ];
  const uniqueStatuses = [
    ...new Set(allFetchedTasks.map((t) => t.status).filter(Boolean)),
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workDesc: workDescText, updatedBy }),
        }
      );

      if (response.ok) {
        const updatedTask = await response.json();
        setAllFetchedTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
        setOpenWorkDescPopup(null);
      } else {
        throw new Error("Failed to update work description");
      }
    } catch (error) {
      console.error("Error updating work description:", error);
      alert("Error updating work description. Please try again.");
    }
  };

  const globalSearchTerm = (
    localStorage.getItem("task_global_search") || ""
  ).toLowerCase();
  const matchesGlobalSearch = (task) => {
    if (!globalSearchTerm) return true;
    const haystack = [
      task.taskName,
      task.workDesc,
      task.code,
      task.assignedBy?.name,
      ...(task.assignees?.map((a) => a.name) || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(globalSearchTerm);
  };

  // --- Filtering and Sorting Logic (Update 'tasks' state) ---
  useEffect(() => {
    const filteredAndSorted = (tasksOverride || allFetchedTasks)
    .filter((task) => {
      if (task.isHidden) return false;
      if (task.isObsoleteHidden) return false;
      if (!matchesGlobalSearch(task)) return false;

      const matchesFilter =
        (filters.department === "" ||
          task.department.includes(filters.department)) &&
        (filters.code === "" || task.code === filters.code) &&
        (filters.assignee === "" ||
          task.assignees?.some((a) => a.name === filters.assignee)) &&
        (filters.assignedBy === "" ||
          task.assignedBy?.name === filters.assignedBy) &&
        (filters.priority === "" || task.priority === filters.priority) &&
        (filters.status === "" || task.status === filters.status);

      const shouldHide = hideCompleted && task.status === "Completed";
      const dueDate = new Date(task.dueDate);
      const selectedDate = filters.dueBefore
        ? new Date(filters.dueBefore)
        : null;
      const matchesDueBefore = selectedDate ? dueDate <= selectedDate : true;

      return matchesFilter && !shouldHide && matchesDueBefore;
    })
    .sort((a, b) => {
      if (dueDateSortOrder === "asc") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (dueDateSortOrder === "desc") {
        return new Date(b.dueDate) - new Date(a.dueDate);
      }
      // Default sort by due date ascending
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    setTasks(filteredAndSorted);

  }, [tasksOverride, allFetchedTasks, filters, hideCompleted, globalSearchTerm, dueDateSortOrder]);


  // --- Task Data for Rendering ---
  
  // 1. Desktop (Infinite Scroll)
  const desktopTasksToRender = tasks.slice(0, desktopDisplayedCount);
  const desktopHigh = desktopTasksToRender.filter((t) => t.priority === "High");
  const desktopMedium = desktopTasksToRender.filter((t) => t.priority === "Medium");
  const desktopLow = desktopTasksToRender.filter((t) => t.priority === "Low");

  // 2. Mobile (Pagination)
  const mobileIndexOfLast = mobileCurrentPage * MOBILE_ITEMS_PER_PAGE;
  const mobileIndexOfFirst = mobileIndexOfLast - MOBILE_ITEMS_PER_PAGE;
  const mobileTasksToRender = tasks.slice(mobileIndexOfFirst, mobileIndexOfLast);
  const mobileTotalPages = Math.ceil(tasks.length / MOBILE_ITEMS_PER_PAGE);

  const mobileHigh = mobileTasksToRender.filter((t) => t.priority === "High");
  const mobileMedium = mobileTasksToRender.filter((t) => t.priority === "Medium");
  const mobileLow = mobileTasksToRender.filter((t) => t.priority === "Low");
  
  const totalTasksAfterFilter = tasks.length;
  // ----------------------------------


  const permanentlyStopRepetition = async (task) => {
    try {
      const updatedBy = {
        name: localStorage.getItem("name"),
        email: localStorage.getItem("userId"),
      };

      await fetch(`https://taskbe.sharda.co.in/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isRepetitive: false,
          nextRepetitionDate: null,
          updatedBy,
        }),
      });

      await deleteTaskRequest(task._id);
    } catch (error) {
      console.error("Error stopping repetition", error);
      alert("Failed to stop future repetitions.");
    }
  };

  const deleteTaskRequest = async (taskId) => {
    try {
      setAllFetchedTasks((prevTasks) => prevTasks.filter((t) => t._id !== taskId));
      
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete task");
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task. Please try again.");
      fetchTasksFromAPI(); 
    }
  };

  const handleDeleteTask = async (task) => {
    if (!task || !task._id) {
      Swal.fire({
        icon: "error",
        title: "Invalid Task",
        text: "The selected task is not valid or is missing required data.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    if (!task.isRepetitive) {
      const confirmDelete = await Swal.fire({
        title: "<strong>Delete Task?</strong>",
        html: `<i>Task: <b>${task.taskName}</b> will be permanently removed.</i>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e3342f",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, keep it",
        backdrop: `rgba(0,0,0,0.5)`,
      });
      if (!confirmDelete.isConfirmed) return;
      return deleteTaskRequest(task._id);
    }

    const result = await Swal.fire({
      title: "Repetitive Task Options",
      html: `
        <p>This task repeats regularly. What action do you want to take?</p>
        <ul style="text-align: left; font-size: 14px;">
          <li><b>Delete Only This:</b> Deletes this instance only.</li>
          <li><b>Stop Repeating & Delete:</b> Ends the repetition and deletes it.</li>
        </ul>
      `,
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Delete Only This",
      denyButtonText: "Stop & Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      denyButtonColor: "#e3342f",
      cancelButtonColor: "#6c757d",
    });

    if (result.isConfirmed) {
      await deleteTaskRequest(task._id);
    } else if (result.isDenied) {
      await permanentlyStopRepetition(task);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setEditingStatus(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const statusColors = {
    "To Do": { bg: "#EFF6FF", text: "#1E40AF", border: "#3B82F6", glow: "rgba(59, 130, 246, 0.3)" },
    "In Progress": { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B", glow: "rgba(245, 158, 11, 0.3)" },
    Completed: { bg: "#D1FAE5", text: "#065F46", border: "#10B981", glow: "rgba(16, 185, 129, 0.3)" },
    Obsolete: { bg: "#F3E8FF", text: "#6B21A8", border: "#A855F7", glow: "rgba(168, 85, 247, 0.3)" },
  };

  const priorityColors = {
    High: { bg: "#FEE2E2", text: "#991B1B", border: "#DC2626", glow: "rgba(220, 38, 38, 0.3)" },
    Medium: { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B", glow: "rgba(245, 158, 11, 0.3)" },
    Low: { bg: "#DBEAFE", text: "#1E40AF", border: "#3B82F6", glow: "rgba(59, 130, 246, 0.3)" },
  };

  // ... (handleCopyTask remains unchanged)

  // Mobile Card Component
  const renderTaskCard = (task, index) => (
    <div
      key={task._id}
      id={`task-${task._id}`}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 overflow-hidden mb-4"
    >
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-medium">#{index + 1}</span>
              <span
                className="text-xs px-2 py-1 rounded font-semibold"
                style={{
                  backgroundColor: priorityColors[task.priority]?.bg,
                  color: priorityColors[task.priority]?.text,
                }}
              >
                {task.priority}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-1">
              {task.taskName}
            </h3>
            {task.code && (
              <span className="inline-block text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {task.code}
              </span>
            )}
          </div>
          
          <div className="flex gap-1 ml-2">
            <button
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
              onClick={() => handleCopyTask(task)}
              title="Copy"
            >
              <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
            </button>
            {role === "admin" && (
              <button
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                onClick={() => handleDeleteTask(task)}
                title="Delete"
              >
                <FaTrashAlt size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer border"
          style={{
            backgroundColor: statusColors[task.status]?.bg,
            color: statusColors[task.status]?.text,
            borderColor: statusColors[task.status]?.border,
          }}
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.target.getBoundingClientRect();
            setDropdownPosition({
              top: rect.top + window.scrollY + 40,
              left: rect.left + window.scrollX,
            });
            setEditingStatus(task._id);
          }}
        >
          {task.status === "Completed" && <span>✓</span>}
          {task.status === "In Progress" && <span className="animate-pulse">⏱</span>}
          {task.status === "To Do" && <span>📝</span>}
          {task.status === "Obsolete" && <span>⊗</span>}
          <span>{task.status}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <span className="text-xs font-semibold text-gray-600 uppercase block mb-1">
            Description
          </span>
          <p className="text-sm text-gray-700 line-clamp-3">
            {task.workDesc || "No description"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs font-semibold text-gray-600 block mb-1">Work Date</span>
            <div className="text-sm text-gray-900 font-medium">
              {new Date(task.assignedDate).toLocaleDateString("en-GB")}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-600 block mb-1">Due Date</span>
            <div className="text-sm text-gray-900 font-medium">
              {new Date(task.dueDate).toLocaleDateString("en-GB")}
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-600 uppercase block mb-2">Team</span>
          <div className="flex flex-wrap gap-1.5">
            {task.assignees?.slice(0, 3).map((assignee) => (
              <span key={assignee.email} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
                {assignee.name}
              </span>
            ))}
            {task.assignees?.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-medium">
                +{task.assignees.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-semibold">Assigned by:</span>
          <span className="font-medium text-gray-900">{task.assignedBy?.name || "—"}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => setOpenTaskPopup(task._id)}
            className="flex-1 py-2 rounded bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            title="Edit"
          >
            <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setTaskForMessage(task);
              setOpenMessagePopup(true);
            }}
            className="p-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            title="Message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
              <path d="m21.854 2.147-10.94 10.939" />
            </svg>
          </button>
        </div>
      </div>

      {/* Task Details Popup */}
      {openTaskPopup === task._id && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setOpenTaskPopup(null)}
            >
              ×
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {task.taskName}
              </h2>
              {task.code && (
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                  {task.code}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-900 text-sm">
                    Description
                  </span>
                  <button
                    onClick={() => {
                      setOpenWorkDescPopup(task._id);
                      setWorkDescMode("edit");
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {task.workDesc || "No description"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-900 text-sm">
                    Remark
                  </span>
                  <button
                    onClick={() => {
                      setOpenRemarkPopup(task._id);
                      setRemarkMode("edit");
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {remarks[task._id] || "No remark"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <span className="font-semibold text-gray-900 block mb-3 text-sm">
                  Team Members
                </span>
                <div className="flex flex-wrap gap-2">
                  {task.assignees?.map((assignee) => (
                    <span
                      key={assignee.email}
                      className="px-3 py-1.5 bg-white text-gray-700 rounded text-sm font-medium border border-gray-200"
                    >
                      {assignee.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => onEdit(task)}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm transition-colors"
                >
                  Edit Task
                </button>
                <button
                  onClick={() => handleStatusChange(task._id, "Completed")}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold text-sm transition-colors"
                >
                  Mark Complete
                </button>
                {role === "admin" && (
                  <button
                    onClick={() => handleDeleteTask(task)}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold text-sm transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Desktop Row Component
  const renderTaskRow = (task, index) => (
    <tr
      key={task._id}
      id={`task-${task._id}`}
      className="group border-b border-gray-200 transition-all hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
    >
      <td className="py-3 px-2 text-sm text-gray-700 font-semibold">
        {index + 1}
      </td>

      <td className="py-3 px-2">
        <div className="flex flex-col gap-1">
          <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
            {task.taskName.length > 30
              ? task.taskName.slice(0, 30) + "..."
              : task.taskName}
            {new Date(task.dueDate) < new Date() &&
              task.status !== "Completed" &&
              task.status !== "Obsolete" && (
                <FaExclamationCircle
                  className="text-red-600 animate-pulse"
                  size={12}
                />
              )}
          </div>
          {task.code && (
            <span className="text-xs text-indigo-700 font-semibold">
              📋 {task.code}
            </span>
          )}
        </div>
      </td>

      <td className="py-3 px-2">
        <p className="text-xs text-gray-600 line-clamp-2">
          {task.workDesc
            ? task.workDesc.length > 50
              ? task.workDesc.slice(0, 50) + "..."
              : task.workDesc
            : "No description"}
        </p>
      </td>

      <td className="py-3 px-2 text-xs text-gray-700">
        {new Date(task.assignedDate).toLocaleDateString("en-GB")}
      </td>

      <td className="py-3 px-2 text-xs text-gray-700 font-semibold">
        {new Date(task.dueDate).toLocaleDateString("en-GB")}
      </td>

      <td className="py-3 px-2">
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold cursor-pointer border"
          style={{
            backgroundColor: statusColors[task.status]?.bg,
            color: statusColors[task.status]?.text,
            borderColor: statusColors[task.status]?.border,
          }}
          onClick={(e) => {
            const rect = e.target.getBoundingClientRect();
            setDropdownPosition({
              top: rect.top + window.scrollY + 30,
              left: rect.left + window.scrollX,
            });
            setEditingStatus(task._id);
          }}
        >
          {task.status === "Completed" && <span className="text-xs">✓</span>}
          {task.status === "In Progress" && (
            <span className="text-xs animate-pulse">⏱</span>
          )}
          <span className="whitespace-nowrap">{task.status}</span>
        </span>
      </td>

      <td className="py-3 px-2">
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border"
          style={{
            backgroundColor: priorityColors[task.priority]?.bg,
            color: priorityColors[task.priority]?.text,
            borderColor: priorityColors[task.priority]?.border,
          }}
        >
          {task.priority === "High" && "🔴"}
          {task.priority === "Medium" && "🟡"}
          {task.priority === "Low" && "🟢"}
          <span className="whitespace-nowrap">{task.priority}</span>
        </span>
      </td>

      <td className="py-3 px-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600 line-clamp-1">
            {(remarks[task._id] || "No remark").slice(0, 20)}
            {(remarks[task._id] || "").length > 20 && "..."}
          </span>
          <button
            onClick={() => {
              setOpenRemarkPopup(task._id);
              setRemarkMode("edit");
            }}
            className="text-indigo-600 hover:text-indigo-800"
          >
            <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
          </button>
        </div>
      </td>

      <td className="py-3 px-2">
        <div className="flex flex-wrap gap-1">
          {task.assignees?.slice(0, 2).map((assignee) => (
            <span
              key={assignee.email}
              className="text-xs py-0.5 px-2 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200"
            >
              {assignee.name.split(" ")[0]}
            </span>
          ))}
          {task.assignees?.length > 2 && (
            <span
              onClick={() => setShowTeamPopup(task._id)}
              className="text-xs py-0.5 px-2 rounded-full bg-gray-100 text-gray-600 font-semibold cursor-pointer hover:bg-gray-200 transition-all"
            >
              +{task.assignees.length - 2}
            </span>
          )}
        </div>

        {showTeamPopup === task._id && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTeamPopup(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border-2"
              style={{ borderColor: "#4332d2" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex justify-between items-center mb-4 pb-3 border-b-2"
                style={{ borderColor: "#e0dcf9" }}
              >
                <h3 className="text-xl font-bold" style={{ color: "#4332d2" }}>
                  👥 Team Members
                </h3>
                <button
                  onClick={() => setShowTeamPopup(null)}
                  className="text-gray-400 hover:text-gray-700 text-2xl font-light"
                >
                  ×
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {task.assignees?.map((assignee, idx) => (
                  <div
                    key={assignee.email}
                    className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-all"
                    style={{
                      // Added to ensure unique user emails can be used as keys if needed
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: "#4332d2" }}
                    >
                      {assignee.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">
                        {assignee.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {assignee.email}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                <span className="text-sm text-gray-600 font-semibold">
                  Total: {task.assignees?.length} members
                </span>
              </div>
            </div>
          </div>
        )}
      </td>

      <td className="py-3 px-2 text-xs text-gray-700 font-semibold">
        {task.assignedBy?.name || "—"}
      </td>

      <td className="py-3 px-2">
        <div className="flex gap-1">
          <button
            onClick={() => {
              setTaskForMessage(task);
              setOpenMessagePopup(true);
            }}
            className="p-1.5 hover:bg-blue-50 rounded-lg transition-all text-blue-600"
            title="Message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
              <path d="m21.854 2.147-10.94 10.939" />
            </svg>
          </button>
          <button
            onClick={() => handleCopyTask(task)}
            className="p-1.5 hover:bg-indigo-50 rounded-lg transition-all text-indigo-600"
            title="Copy"
          >
            <FontAwesomeIcon icon={faCopy} className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 hover:bg-blue-50 rounded-lg transition-all text-blue-600"
            title="Edit"
          >
            <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
          </button>
          {role === "admin" && (
            <button
              onClick={() => handleDeleteTask(task)}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-all text-red-600"
              title="Delete"
            >
              <FaTrashAlt size={12} />
            </button>
          )}
        </div>
      </td>

      {editingStatus === task._id && (
        <StatusDropdownPortal>
          <div
            ref={dropdownRef}
            className="absolute rounded-xl shadow-2xl border-2 border-gray-300 w-44 mt-1 z-50 bg-white overflow-hidden"
            style={{
              position: "absolute",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
          >
            {["To Do", "In Progress", "Completed", "Obsolete"].map(
              (statusOption) => (
                <div
                  key={statusOption}
                  className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all font-bold border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                  style={{ color: statusColors[statusOption]?.text }}
                  onClick={() => handleStatusChange(task._id, statusOption)}
                >
                  {statusOption === "Completed" && <span>✓</span>}
                  {statusOption === "In Progress" && <span>⏱</span>}
                  {statusOption === "To Do" && <span>📝</span>}
                  {statusOption === "Obsolete" && <span>⊗</span>}
                  {statusOption}
                </div>
              )
            )}
          </div>
        </StatusDropdownPortal>
      )}
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <FilterSection
          filters={filters}
          handleFilterChange={handleFilterChange}
          departments={departments}
          uniqueUsers={uniqueUsers}
          uniqueAssignedBy={uniqueAssignedBy}
          uniqueStatuses={uniqueStatuses}
          role={role}
        />

        {/* Desktop Table (Infinite Scroll) */}
        <div className="hidden lg:block bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden mt-6">
          <div
            ref={scrollContainerRef} // Assign ref to scrollable container
            className="overflow-y-auto max-h-[70vh]"
            style={{ height: "70vh" }} // Explicit height for scroll calculation
          >
            <table className="w-full table-fixed">
              {/* Table Column Definitions... (remains unchanged) */}
              <colgroup>
                <col style={{ width: "3%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead className="sticky top-0 z-20 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 border-b-2 border-indigo-200">
                <tr>
                  <th className="py-3 px-2 text-left text-xs font-black text-gray-800">#</th>
                  <th className="py-3 px-2 text-left text-xs font-black text-gray-800">TASK</th>
                  <th className="py-3 px-2 text-left text-xs font-black text-gray-800">DESCRIPTION</th>
                  <th className="py-3 px-2 text-left text-xs font-black text-gray-800">WORK DATE</th>
                  <th
                    className="py-3 px-2 text-left text-xs font-black text-gray-800 cursor-pointer hover:text-indigo-600"
                    onClick={() =>
                      setDueDateSortOrder(
                        dueDateSortOrder === "asc" ? "desc" : "asc"
                      )
                    }
                  >
                    DUE DATE {dueDateSortOrder === "asc" ? "↑" : "↓"}
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-black text-gray-800">STATUS</th>
                  <th className="py-3 px-2 text-left text-xs font-black text-gray-800">PRIORITY</th>
                  <th className="py-3 px-2 text-left text-xs font-black text-gray-800">REMARKS</th>
                  <th className="py-3 px-2 text-left text-xs font-black text-gray-800">TEAM</th>
                  <th className="py-3 px-2 text-left text-xs font-black text-gray-800">ASSIGNED BY</th>
                  <th className="py-3 px-2 text-center text-xs font-black text-gray-800">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="py-20 text-center"><FaSpinner className="animate-spin h-10 w-10 mx-auto mb-3 text-indigo-600" /><p className="text-gray-600 font-bold">Loading tasks...</p></td></tr>
                ) : desktopTasksToRender.length === 0 && totalTasksAfterFilter === 0 ? (
                  <tr><td colSpan={11} className="text-center py-20"><div className="text-6xl mb-4">📋</div><p className="text-gray-500 font-black text-xl">No tasks assigned yet</p></td></tr>
                ) : desktopTasksToRender.length === 0 && totalTasksAfterFilter > 0 ? (
                  <tr><td colSpan={11} className="text-center py-20"><div className="text-6xl mb-4">🔍</div><p className="text-gray-500 font-black text-xl">No tasks match your current filters.</p></td></tr>
                ) : (
                  <>
                    {desktopHigh.length > 0 && (<><tr><td colSpan={11} className="bg-gradient-to-r from-red-100 to-orange-100 text-red-900 font-black text-sm py-3 px-3 border-y-2 border-red-300">🔴 High Priority ({tasks.filter(t => t.priority === "High").length} total)</td></tr>{desktopHigh.map((task) => renderTaskRow(task, tasks.indexOf(task)))}</>)}
                    {desktopMedium.length > 0 && (<><tr><td colSpan={11} className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-900 font-black text-sm py-3 px-3 border-y-2 border-yellow-300">🟡 Medium Priority ({tasks.filter(t => t.priority === "Medium").length} total)</td></tr>{desktopMedium.map((task) => renderTaskRow(task, tasks.indexOf(task)))}</>)}
                    {desktopLow.length > 0 && (<><tr><td colSpan={11} className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 font-black text-sm py-3 px-3 border-y-2 border-green-300">🟢 Low Priority ({tasks.filter(t => t.priority === "Low").length} total)</td></tr>{desktopLow.map((task) => renderTaskRow(task, tasks.indexOf(task)))}</>)}
                  </>
                )}
                
                {/* Desktop Infinite Scroll Indicator */}
                {desktopTasksToRender.length < totalTasksAfterFilter && (
                    <tr><td colSpan={11} className="text-center py-4"><FaSpinner className="animate-spin h-6 w-6 mx-auto text-indigo-600" /><p className="text-gray-500 text-xs mt-1">Loading more tasks...</p></td></tr>
                )}
                {desktopTasksToRender.length > 0 && desktopTasksToRender.length < totalTasksAfterFilter && totalTasksAfterFilter > DESKTOP_ITEMS_TO_LOAD * 3 && (
                    <tr><td colSpan={11} className="text-center py-4"><button onClick={handleLoadAll} className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors">Load All ({totalTasksAfterFilter - desktopTasksToRender.length} remaining)</button></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View (Pagination) */}
        <div className="lg:hidden mt-6 space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
              <FaSpinner className="animate-spin h-8 w-8 mx-auto mb-3 text-blue-600" />
              <p className="text-gray-600 font-semibold">Loading tasks...</p>
            </div>
          ) : mobileTasksToRender.length === 0 && totalTasksAfterFilter === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-gray-500 font-semibold text-lg">No tasks assigned yet</p>
            </div>
          ) : mobileTasksToRender.length === 0 && totalTasksAfterFilter > 0 ? (
             <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-gray-500 font-semibold text-lg">No tasks match your current filters on this page.</p>
            </div>
          ) : (
            <>
              {/* High Priority Mobile */}
              {mobileHigh.length > 0 && (<><div className="bg-red-50 text-red-900 font-semibold text-sm py-2.5 px-4 rounded-lg border border-red-200">High Priority ({tasks.filter(t => t.priority === "High").length} total)</div>{mobileHigh.map((task) => renderTaskCard(task, tasks.indexOf(task)))}</>)}
              {/* Medium Priority Mobile */}
              {mobileMedium.length > 0 && (<><div className="bg-yellow-50 text-yellow-900 font-semibold text-sm py-2.5 px-4 rounded-lg border border-yellow-200">Medium Priority ({tasks.filter(t => t.priority === "Medium").length} total)</div>{mobileMedium.map((task) => renderTaskCard(task, tasks.indexOf(task)))}</>)}
              {/* Low Priority Mobile */}
              {mobileLow.length > 0 && (<><div className="bg-green-50 text-green-900 font-semibold text-sm py-2.5 px-4 rounded-lg border border-green-200">Low Priority ({tasks.filter(t => t.priority === "Low").length} total)</div>{mobileLow.map((task) => renderTaskCard(task, tasks.indexOf(task)))}</>)}

              {/* Mobile Pagination Controls */}
              {mobileTotalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200  mb-6">
                      <button
                          onClick={handlePreviousPage}
                          disabled={mobileCurrentPage === 1}
                          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                              mobileCurrentPage === 1
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                          }`}
                      >
                          <FaChevronLeft size={10} /> Previous
                      </button>

                      <span className="text-sm font-semibold text-gray-700">
                          Page {mobileCurrentPage} of {mobileTotalPages}
                      </span>

                      <button
                          onClick={handleNextPage}
                          disabled={mobileCurrentPage === mobileTotalPages}
                          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                              mobileCurrentPage === mobileTotalPages
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                          }`}
                      >
                          Next <FaChevronRight size={10} />
                      </button>
                  </div>
              )}
            </>
          )}
        </div>

        {/* Popups (WorkDesc & Remark Popups) */}
        {openWorkDescPopup && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h4 className="font-bold text-xl text-gray-900">
                  {workDescMode === "edit" ? "Edit Description" : "Description"}
                </h4>
                <button
                  className="text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={() => setOpenWorkDescPopup(null)}
                >
                  ×
                </button>
              </div>

              {workDescMode === "edit" ? (
                <>
                  <textarea
                    value={
                      workDescs[openWorkDescPopup] ||
                      allFetchedTasks.find((t) => t._id === openWorkDescPopup)?.workDesc ||
                      ""
                    }
                    onChange={(e) =>
                      setWorkDescs((prev) => ({
                        ...prev,
                        [openWorkDescPopup]: e.target.value,
                      }))
                    }
                    rows={8}
                    placeholder="Enter work description..."
                    className="w-full px-4 py-3 text-base rounded-lg resize-y border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <div className="flex justify-end mt-4 gap-3">
                    <button
                      onClick={() => setOpenWorkDescPopup(null)}
                      className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleWorkDescSave(openWorkDescPopup);
                        setOpenWorkDescPopup(null);
                      }}
                      className="px-5 py-2 text-sm rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-gray-700 text-base whitespace-pre-wrap max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
                  {workDescs[openWorkDescPopup] || allFetchedTasks.find((t) => t._id === openWorkDescPopup)?.workDesc || "No description"}
                </div>
              )}
            </div>
          </div>
        )}

        {openRemarkPopup && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h4 className="font-bold text-xl text-gray-900">
                  {remarkMode === "edit" ? "Edit Remark" : "Remark"}
                </h4>
                <button
                  className="text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={() => setOpenRemarkPopup(null)}
                >
                  ×
                </button>
              </div>

              {remarkMode === "edit" ? (
                <>
                  <textarea
                    value={remarks[openRemarkPopup] || allFetchedTasks.find((t) => t._id === openRemarkPopup)?.remark || ""}
                    onChange={(e) =>
                      setRemarks((prev) => ({
                        ...prev,
                        [openRemarkPopup]: e.target.value,
                      }))
                    }
                    rows={8}
                    placeholder="Enter remark..."
                    className="w-full px-4 py-3 text-base rounded-lg resize-y border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <div className="flex justify-end mt-4 gap-3">
                    <button
                      onClick={() => setOpenRemarkPopup(null)}
                      className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleRemarkSave(openRemarkPopup);
                        setOpenRemarkPopup(null);
                      }}
                      className="px-5 py-2 text-sm rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-gray-700 text-base whitespace-pre-wrap max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
                  {remarks[openRemarkPopup] || "No remark"}
                </div>
              )}
            </div>
          </div>
        )}

        {openMessagePopup && taskForMessage && (
          <MessagePopup
            isOpen={openMessagePopup}
            onClose={() => setOpenMessagePopup(false)}
            task={taskForMessage}
            sendMessage={handleMessageSend}
          />
        )}
      </div>
    </div>
  );
};

export default TaskList;