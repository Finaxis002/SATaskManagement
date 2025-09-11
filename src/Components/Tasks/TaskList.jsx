import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTaskStatus } from "../../redux/taskSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchDepartments } from "../../redux/departmentSlice";
import StatusDropdownPortal from "../StatusDropdownPortal";
import { faPen, faCopy, faTimes} from "@fortawesome/free-solid-svg-icons";
import { FaTrashAlt, FaExclamationCircle, FaSpinner } from "react-icons/fa";
import { fetchUsers } from "../../redux/userSlice";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import FilterSection from "./FilterSection";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faCopy, faTimes, faPen } from "@fortawesome/free-solid-svg-icons";

const socket = io("https://taskbe.sharda.co.in");

const TaskList = ({
  onEdit,
  refreshTrigger,
  setTaskListExternally,
  tasksOverride,
  hideCompleted,
}) => {
  const [tasks, setTasks] = useState([]);
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

  const role = localStorage.getItem("role");
  const userEmail = JSON.parse(localStorage.getItem("user"))?.email;

  const users = useSelector((state) => state.users.list);
  const departmentData = useSelector((state) => state.departments.list);

  const [openTaskPopup, setOpenTaskPopup] = useState(null);
  const [editMode, setEditMode] = useState({ desc: false, remark: false });

  const dispatch = useDispatch();

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
    setLoading(true);
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
        setTasks(filtered);
        if (setTaskListExternally) setTaskListExternally(filtered);
      } else {
        setTasks(visibleTasks);
        if (setTaskListExternally) setTaskListExternally(visibleTasks);
      }

      const taskRemarks = {};
      (role !== "admin" ? filtered : visibleTasks).forEach((task) => {
        taskRemarks[task._id] = task.remark || "";
      });
      setRemarks(taskRemarks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (role !== "admin" || departmentsLoaded) {
      fetchTasksFromAPI();
    }
  }, [role, userEmail, refreshTrigger, departmentsLoaded]);

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

  const formatAssignedDate = (assignedDate) => {
    if (!assignedDate) return "";
    const date = new Date(assignedDate);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setLoadingStatus((prev) => ({ ...prev, [taskId]: true }));
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, updatedBy }),
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
      fetchTasksFromAPI();
    }
    setLoadingStatus((prev) => ({ ...prev, [taskId]: false }));
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
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
        setRemarks((prev) => ({ ...prev, [taskId]: updatedTask.remark ?? "" }));
        setOpenRemarkPopup(null);
        fetchTasksFromAPI();
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
  };

  const uniqueAssignedBy = [
    ...new Set(tasks.map((t) => t.assignedBy?.name).filter(Boolean)),
  ];
  const uniqueStatuses = [
    ...new Set(tasks.map((t) => t.status).filter(Boolean)),
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
        setTasks((prevTasks) =>
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

  const filteredTasks = (tasksOverride || tasks)
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
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

  const highPriorityTasks = filteredTasks.filter((t) => t.priority === "High");
  const mediumPriorityTasks = filteredTasks.filter(
    (t) => t.priority === "Medium"
  );
  const lowPriorityTasks = filteredTasks.filter((t) => t.priority === "Low");

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
      setTasks((prevTasks) => prevTasks.filter((t) => t._id !== taskId));
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete task");
      fetchTasksFromAPI();
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

  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setEditingStatus(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Color theme variables for consistent theming
  const colors = {
    primary: "#2563EB", // Blue 600
    primaryLight: "#DBEAFE", // Blue 100
    secondary: "#10B981", // Emerald 500
    secondaryLight: "#D1FAE5", // Emerald 200
    danger: "#DC2626", // Red 600
    dangerLight: "#FEE2E2", // Red 200
    warning: "#F59E0B", // Amber 500
    warningLight: "#FEF3C7", // Amber 100
    info: "#3B82F6", // Blue 500
    infoLight: "#BFDBFE", // Blue 200
    textPrimary: "#1F2937", // Gray 800
    textSecondary: "#6B7280", // Gray 500
    background: "white", // Gray 50
    border: "#E5E7EB", // Gray 200
    surface: "#FFFFFF", // White
  };

    const handleCopyTask = async (originalTask) => {
    // Enhanced confirmation dialog with more details
    const { isConfirmed } = await Swal.fire({
      title: "Duplicate Task",
      html: `
      <div class="text-left">
        <p>Create a copy of: <strong>${originalTask.taskName}</strong></p>
        <p class="mt-2 text-sm text-gray-600">The new task will have "Status" reset to "To Do" and current date as "Assigned Date".</p>
      </div>
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Create Copy",
      cancelButtonText: "Cancel",
      focusConfirm: false,
      backdrop: `
      rgba(0,0,123,0.4)
      url("/images/nyan-cat.gif")
      left top
      no-repeat
    `,
    });

    if (!isConfirmed) return;

    try {
      // Create modified task copy with reset fields
      const newTask = {
        ...originalTask,
        _id: undefined, // Ensure new ID will be generated
        taskName: `${originalTask.taskName} (Copy)`,
        assignedDate: new Date().toISOString(),
        status: "To Do",
        remark: "",
        updatedBy: {
          name: localStorage.getItem("name"),
          email: localStorage.getItem("userId"),
        },
        history: [
          ...(originalTask.history || []),
          {
            action: "copied",
            by: {
              name: localStorage.getItem("name"),
              email: localStorage.getItem("userId"),
            },
            date: new Date().toISOString(),
          },
        ],
      };

      // Show loading with better UX
      const loadingSwal = Swal.fire({
        title: "Creating Task Copy",
        html: "Please wait while we duplicate the task...",
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
      });

      // API call to create the new task
      const response = await fetch("https://taskbe.sharda.co.in/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task copy");
      }

      const createdTask = await response.json();
      await loadingSwal.close();

      // Enhanced success notification
      await Swal.fire({
        icon: "success",
        title: "Copy Created!",
        html: `
        <div class="text-center">
          <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <p class="mb-2">New task created:</p>
          <p class="font-bold text-lg">${createdTask.taskName}</p>
          <p class="text-sm text-gray-500 mt-2">Status: ${createdTask.status}</p>
        </div>
      `,
        showConfirmButton: false,
        timer: 2000,
      });

      // Refresh task list and highlight the new task
      fetchTasksFromAPI();

      // Optional: Scroll to the new task in the list
      setTimeout(() => {
        const newTaskElement = document.getElementById(
          `task-${createdTask._id}`
        );
        if (newTaskElement) {
          newTaskElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          newTaskElement.classList.add("animate-pulse", "bg-green-50");
          setTimeout(() => {
            newTaskElement.classList.remove("animate-pulse", "bg-green-50");
          }, 3000);
        }
      }, 500);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Copy Failed",
        html: `
        <div class="text-left">
          <p>Failed to create task copy:</p>
          <p class="font-medium text-red-600 mt-2">${error.message}</p>
          <p class="text-sm text-gray-500 mt-2">Please try again or contact support.</p>
        </div>
      `,
        confirmButtonText: "Try Again",
        confirmButtonColor: "#3085d6",
        showCancelButton: true,
        cancelButtonText: "Cancel",
      });
    }
  };


const renderTaskCard = (task, index) => (
  <>
    {/* Task Card */}
    <div
      key={task._id}
      className="relative border border-gray-300 rounded-2xl p-5 mb-6 shadow-md hover:shadow-xl transition duration-300 bg-gray-100 cursor-pointer max-w-md mx-auto"
      onClick={(e) => {
        // prevent popup when clicking on action buttons
        // if (!e.target.closest("button")) {
        //   setOpenTaskPopup(task._id);
        // }
      }}
    >
      {/* Copy button */}
      <button
        className="absolute top-3 right-3 p-2 rounded-md border border-gray-300 text-gray-500 hover:text-gray-900 hover:bg-gray-100 shadow-sm"
        onClick={() => handleCopyTask?.(task)}
        title="Copy Task"
        aria-label={`Copy task ${task.taskName}`}
        type="button"
      >
        <FontAwesomeIcon icon={faCopy} className="h-5 w-5" />
      </button>

      {/* Task Name */}
      <h3 className="text-xl font-bold mb-3 text-gray-800">
        {task.taskName}
      </h3>

      

      {/* Dates */}
      <div className="flex justify-between text-md text-gray-600 mb-4">
        <div>
          <span className="font-semibold">Work Date:</span>{" "}
          {new Date(task.assignedDate).toLocaleDateString("en-GB")}
        </div>
        <div>
          <span className="font-semibold">Due Date:</span>{" "}
          {new Date(task.dueDate).toLocaleDateString("en-GB")}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-semibold text-gray-700">Status:</span>
        <span
          className="px-3 py-1 rounded-full text-sm font-semibold cursor-pointer shadow-sm"
          style={{
            backgroundColor:
              task.status === "Completed"
                ? "#d1fae5"
                : task.status === "In Progress"
                ? "#fef9c3"
                : task.status === "To Do"
                ? "#e0f2fe"
                : "#f3e8ff",
            color:
              task.status === "Completed"
                ? "#065f46"
                : task.status === "In Progress"
                ? "#92400e"
                : task.status === "To Do"
                ? "#0369a1"
                : "#6d28d9",
          }}
          onClick={(e) => {
            e.stopPropagation(); // prevent opening popup
            const rect = e.target.getBoundingClientRect();
            setDropdownPosition({
              top: rect.top + window.scrollY + 35,
              left: rect.left + window.scrollX,
            });
            setEditingStatus(task._id);
          }}
        >
          {task.status}
        </span>
      </div>

      {/* Assigned By */}
      <p className="text-md text-gray-600">
        <span className="font-semibold">Assigned by:</span>{" "}
        <span className="italic text-cyan-800">
          {task.assignedBy?.name || "—"}
        </span>
      </p>

      {/* 🔹 Clickable text instead of whole card */}
      <button
        onClick={() => setOpenTaskPopup(task._id)}
        className="text-indigo-600 text-md font-medium hover:underline focus:outline-none underline mt-1.5"
      >
        View Details
      </button>
    </div>

    
   

    {/* Popup for details */}
    {openTaskPopup === task._id && (
      <div className="fixed inset-0  bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4  ">
        <div className="bg-gray-100  rounded-2xl shadow-3xl w-full   p-6 relative overflow-y-auto max-h-[90vh] border border-gray-400 "
        style={{ width: "90%", maxWidth: "inherit" }} // ✅ popup same width as card
         >
          
          {/* Close button */}
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
            onClick={() => setOpenTaskPopup(null)}
          >
            ×
          </button>

          {/* <h2 className="text-2xl font-bold mb-5 text-gray-800">
            {task.taskName}
          </h2> */}

          {/* Full Description */}
          <div className="mb-4">
       <span className="block text-gray-900 font-semibold tracking-wide mb-2 select-none ">
         Work Description + Code:
       </span>
       <td
         className="relative group text-[15px]"
         style={{ color: colors.textSecondary, minWidth: "260px" }}
       >
         <div >
           <span className="text-[15px] text-gray-400 subpixel-antialiased break-words flex-1">
             {(task.workDesc || "No description").length > 90
               ? `${task.workDesc.slice(0, 90)}…`
               : task.workDesc || "No description"}
            {task.code && (
               <span
                 className="text-indigo-600 underline cursor-pointer ml-3 font-semibold hover:text-indigo-900"
                 title="View Project Report"
               >
                 (1 Project Report)
               </span>
             )}
           </span>
          {(task.workDesc || "").length > 90 && (
             <div className="relative inline-block">
               <span className="sr-only">more</span>
               <div
                 className="absolute z-50 hidden group-hover:block w-96 rounded-2xl p-5 text-xs shadow-lg whitespace-pre-wrap border border-gray-300 bg-white"
                style={{
                   color: colors.textSecondary,
                   top: "36px",
                   left: "-16px",
                   maxHeight: "12rem",
                   overflowY: "auto",
                   boxShadow:
                     "0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 6px rgba(0,0,0,0.08)",
                 }}
               >
                 {task.workDesc}
               </div>
             </div>
           )}
           <button
            className="opacity-90 group-hover:opacity-100 text-gray-700 hover:text-gray-900 focus:outline-none transition"
            onClick={() => {
              setOpenWorkDescPopup(task._id);
               setWorkDescMode("edit");
             }}
             title="Edit description"
             aria-label={`Edit description for task ${task.taskName}`}
             type="button"
           >
             <FontAwesomeIcon icon={faPen} className="h-5 w-5" />
           </button>
         </div>

         {openWorkDescPopup === task._id && (
           <div
             className="absolute top-full left-0 mt-3 w-65 rounded-2xl shadow-2xl border border-gray-300 z-50 p-6 bg-white select-text"
             role="dialog"
             aria-modal="true"
             aria-labelledby="workdesc-dialog-title"
             style={{
               backgroundColor: colors.surface,
               borderColor: colors.border,
             }}
           >
             <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
               <h4
                 id="workdesc-dialog-title"
                 className="font-semibold text-lg"
                 style={{ color: colors.textPrimary }}
               >
                {workDescMode === "edit" ? "Edit Description" : "Description"}
               </h4>
               <button
                 className="text-gray-500 hover:text-gray-700 text-2xl font-light leading-none focus:outline-none"
                 onClick={() => setOpenWorkDescPopup(null)}
                 aria-label="Close description popup"
                 type="button"
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
                   rows={5}
                   placeholder="Enter work description…"
                   className="w-full px-5 py-3 text-sm rounded-2xl resize-y border border-gray-300 focus:outline-none focus:ring-4 focus:ring-purple-400 transition-colors duration-300"
                   style={{
                     color: colors.textPrimary,
                     backgroundColor: colors.background,
                     boxShadow: "none",
                   }}
                   autoFocus
                 />
                 <div className="flex justify-end mt-5 gap-4">
                   <button
                     onClick={() => setOpenWorkDescPopup(null)}
                     className="px-5 py-2 text-sm rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                     type="button"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={() => {
                       handleWorkDescSave(task._id);
                       setOpenWorkDescPopup(null);
                     }}
                     className="px-6 py-2 text-sm rounded-2xl font-semibold text-white bg-purple-700 hover:bg-purple-800 transition"
                     type="button"
                  >
                     Save
                   </button>
                 </div>
               </>
            ) : (
               <div
                 className="text-gray-900 text-sm whitespace-pre-wrap max-h-44 overflow-y-auto"
                 style={{ color: colors.textSecondary }}
               >
                 {task.workDesc || "No description available"}
              </div>
             )}
           </div>
         )}
     </td>
     </div>


          {/* Remarks */}
      <div className="relative mb-4 flex flex-wrap items-center gap-1">
      <span
        className="font-bold  text-[16px] select-none italic"
        style={{ color: colors.textPrimary }}
      >
        Remark:
      </span>
      <span
        className={`text-sm text-gray-800 max-w-[65%] ${
          (remarks[task._id] ?? "").length > 40 ? "truncate" : ""
        } select-text`}
        style={{ color: colors.textSecondary }}
      >
        {remarks[task._id] ?? "No remark"}
      </span>
      {(remarks[task._id] || "").length > 40 && (
        <button
          className="ml-2 text-indigo-600 text-xs hover:underline focus:outline-none transition-colors duration-150"
          onClick={() => {
            setOpenRemarkPopup(task._id);
            setRemarkMode("view");
          }}
          aria-label={`Read full remark for task ${task.taskName}`}
          type="button"
        >
          Read more
        </button>
      )}
      <button
        className=" text-indigo-500 hover:text-indigo-800 focus:outline-none transition-colors duration-150"
        onClick={() => {
          setOpenRemarkPopup(task._id);
          setRemarkMode("edit");
        }}
        title="Edit remark"
        aria-label={`Edit remark for task ${task.taskName}`}
        type="button"
      >
        <FontAwesomeIcon icon={faPen} className="h-5 w-5" />
      </button>

      {/* Assign by */}
      {/* <p className="w-full mt-3">
        <span className="font-bold text-gray-700 subpixel-antialiased select-none">
          Assigned by:
        </span>{" "}
        <span className="text-cyan-800 italic font-semibold select-text">
          {task.assignedBy?.name || "—"}
        </span>
      </p> */}

      {openRemarkPopup === task._id && (
        <div
          className="absolute top-full left-0 h-70 w-70 rounded-2xl shadow-2xl border border-gray-300 z-50 p-6 bg-white select-text"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remark-dialog-title"
          style={{ backgroundColor: colors.surface }}
        >
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
            <h4
              id="remark-dialog-title"
              className="font-semibold text-base"
              style={{ color: colors.textPrimary }}
            >
              {remarkMode === "edit" ? "Edit Remark" : "Full Remark"}
            </h4>
            <button
              className="text-gray-500 hover:text-gray-700 text-2xl font-light leading-none focus:outline-none"
              onClick={() => setOpenRemarkPopup(null)}
              aria-label="Close remark popup"
              type="button"
            >
              ×
            </button>
          </div>

          {remarkMode === "edit" ? (
            <>
              <textarea
                value={remarks[task._id] ?? ""}
                onChange={(e) =>
                  setRemarks((prev) => ({
                    ...prev,
                    [task._id]: e.target.value,
                  }))
                }
                rows={5}
                placeholder="Edit Remark"
                className="w-full px-5 py-3 text-sm border rounded-2xl focus:ring-4 outline-none resize-y transition-colors duration-300"
                style={{
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  backgroundColor: colors.background,
                  boxShadow: "none",
                }}
                autoFocus
              />
              <div className="flex justify-end mt-3 gap-3">
                <button
                  onClick={() => setOpenRemarkPopup(null)}
                  className="px-5 py-2 text-sm rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleRemarkSave(task._id);
                  }}
                  className="px-4 py-1 text-sm rounded-2xl font-semibold text-white bg-indigo-700 hover:bg-indigo-800 transition"
                  type="button"
                >
                  Save
                </button>
              </div>
            </>
          ) : (
            <div
              className="text-gray-900 text-sm whitespace-pre-wrap max-h-44 overflow-y-auto border border-gray-100 rounded-xl p-4 select-text"
              style={{ color: colors.textSecondary }}
            >
              {remarks[task._id] || "No remark"}
            </div>
          )}
        </div>
      )}
    </div>

          {/* Team */}
          <div className="mb-3 flex gap-2">
            <h3 className="font-semibold text-gray-700 mt-1 mb-1">Team:</h3>
            <div className="flex flex-wrap gap-2">
              {task.assignees?.map((assignee) => (
                <span
                  key={assignee.email}
                  className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium"
                >
                  {assignee.name}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex pl-4 flex-wrap gap-3 mt-6">
            <button
              onClick={() => onEdit(task)}
              className="px-8 py-1 rounded-lg bg-blue-100 text-blue-700 border border-b-blue-700 hover:bg-blue-600 hover:text-white font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => handleStatusChange(task._id, "Completed")}
              className="px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-600 border border-green-700 hover:text-white font-medium"
            >
              Completed
            </button>
            {/* <button
              onClick={() => handleCopyTask?.(task)}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
            >
              Copy
            </button> */}
            {role === "admin" && (
              <button
                onClick={() => handleDeleteTask(task)}
                className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-600 hover:text-white font-medium"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    )}
  </>
);


  // Rendering task row for large screens (table)
 const renderTaskRow = (task, index) => (
  <tr
    key={task._id}
    id={`task-${task._id}`}
    className={`group border-b transition-colors duration-150 bg-white ${
      index % 2 === 0 ? colors.background : "#F3F4F6"
    } hover:bg-cyan-50`}
    style={{ borderColor: colors.border }}
  >
    <td
      className="py-3 px-4 text-[13px]"
      style={{ color: colors.textSecondary }}
    >
      {index + 1}
    </td>

    <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
      <div className="flex items-center gap-2 font-semibold">
        {task.taskName}
        {new Date(task.dueDate) < new Date() &&
          task.status !== "Completed" &&
          task.status !== "Obsolete" && (
            <FaExclamationCircle
              className="text-red-600"
              title="Overdue Task"
              size={14}
              aria-label="Overdue task"
            />
          )}
        <button
          onClick={() => onEdit(task)}
          title="Edit"
          aria-label={`Edit task ${task.taskName}`}
          className="opacity-70 hover:opacity-100 text-blue-700 hover:text-gray-700 focus:outline-none"
        >
          <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
        </button>
      </div>
    </td>

    <td
      className="py-3 px-4 relative group text-[13px]"
      style={{ color: colors.textSecondary, minWidth: "250px" }}
    >
      <div className="flex items-center gap-2 min-h-[22px]">
        <span>
          {(task.workDesc || "No description").length > 70
            ? `${task.workDesc.slice(0, 70)}…`
            : task.workDesc || "No description"}
          {task.code && (
            <span
              className="text-indigo-600 underline cursor-pointer ml-1"
              style={{ fontWeight: "600" }}
            >
              (1 Project Report)
            </span>
          )}
        </span>
        {(task.workDesc || "").length > 70 && (
          <div className="relative inline-block">
            <span className="sr-only">more</span>
            <div
              className="absolute z-50 hidden group-hover:block w-80 rounded-md p-3 text-xs whitespace-pre-wrap shadow-lg"
              style={{
                backgroundColor: colors.surface,
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                left: "-8px",
                top: "28px",
                boxShadow:
                  "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                maxHeight: "10rem",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {task.workDesc}
            </div>
          </div>
        )}
        <button
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 transition focus:outline-none"
          onClick={() => {
            setOpenWorkDescPopup(task._id);
            setWorkDescMode("edit");
          }}
          title="Edit description"
          aria-label={`Edit description for task ${task.taskName}`}
        >
          <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
        </button>
      </div>

      {openWorkDescPopup === task._id && (
        <div
          className="absolute top-full left-0 mt-1 w-80 rounded-md shadow-lg border z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="workdesc-dialog-title"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-100">
            <h4
              id="workdesc-dialog-title"
              className="font-semibold text-sm"
              style={{ color: colors.textPrimary }}
            >
              {workDescMode === "edit" ? "Edit Description" : "Description"}
            </h4>
            <button
              className="text-gray-400 hover:text-gray-600 text-lg leading-none focus:outline-none"
              onClick={() => setOpenWorkDescPopup(null)}
              aria-label="Close description popup"
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
                placeholder="Enter work description…"
                className="w-full px-3 py-2 text-sm rounded-md resize-y focus:outline-none focus:ring-2"
                style={{
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  backgroundColor: colors.background,
                  borderWidth: "1px",
                  boxShadow: "none",
                  transition: "border-color 0.3s ease",
                }}
                autoFocus
              />
              <div className="flex justify-end mt-3 gap-2">
                <button
                  onClick={() => setOpenWorkDescPopup(null)}
                  className="px-3 py-1 text-sm rounded-md"
                  style={{
                    color: colors.textSecondary,
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                  }}
                  tabIndex={0}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleWorkDescSave(task._id);
                    setOpenWorkDescPopup(null);
                  }}
                  className="px-3 py-1 text-sm rounded-md font-medium"
                  style={{
                    color: colors.surface,
                    backgroundColor: colors.primary,
                    border: `1px solid ${colors.primary}`,
                  }}
                  tabIndex={0}
                >
                  Save
                </button>
              </div>
            </>
          ) : (
            <div
              className="text-gray-700 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto"
              style={{ color: colors.textSecondary }}
            >
              {task.workDesc || "No description available"}
            </div>
          )}
        </div>
      )}
    </td>

    <td
      className="py-3 px-4 text-[13px]"
      style={{ color: colors.textSecondary }}
    >
      {formatAssignedDate(task.assignedDate)}
    </td>

    <td
      className="py-3 px-4 text-[13px]"
      style={{ color: colors.textSecondary }}
    >
      {new Date(task.dueDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}
    </td>

    <td className="py-3 px-4 text-center cursor-pointer select-none">
      <span
        className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-sm"
        style={{
          backgroundColor:
            task.status === "Completed"
              ? colors.secondaryLight
              : task.status === "In Progress"
              ? colors.warningLight
              : task.status === "To Do"
              ? colors.primaryLight
              : task.status === "Obsolete"
              ? "#E0E7FF"
              : colors.dangerLight,
          color:
            task.status === "Completed"
              ? colors.secondary
              : task.status === "In Progress"
              ? colors.warning
              : task.status === "To Do"
              ? colors.primary
              : task.status === "Obsolete"
              ? "#6366F1"
              : colors.danger,
          border: `1px solid ${
            task.status === "Completed"
              ? colors.secondary
              : task.status === "In Progress"
              ? colors.warning
              : task.status === "To Do"
              ? colors.primary
              : task.status === "Obsolete"
              ? "#6366F1"
              : colors.danger
          }`,
        }}
        onClick={(e) => {
          const rect = e.target.getBoundingClientRect();
          setDropdownPosition({
            top: rect.top + window.scrollY + 30,
            left: rect.left + window.scrollX,
          });
          setEditingStatus(task._id);
        }}
        role="button"
        tabIndex={0}
        aria-label={`Change status for task ${task.taskName}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            const rect = e.target.getBoundingClientRect();
            setDropdownPosition({
              top: rect.top + window.scrollY + 30,
              left: rect.left + window.scrollX,
            });
            setEditingStatus(task._id);
          }
        }}
      >
        {task.status}
      </span>

      {editingStatus === task._id && (
        <StatusDropdownPortal>
          <div
            ref={dropdownRef}
            className="absolute rounded-md shadow-lg border w-40 mt-1 z-50"
            style={{
              position: "absolute",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            {["To Do", "In Progress", "Completed", "Obsolete"].map(
              (statusOption) => (
                <div
                  key={statusOption}
                  className="px-4 py-2 text-sm cursor-pointer select-none hover:bg-gray-100"
                  style={{
                    color:
                      statusOption === "Completed"
                        ? colors.secondary
                        : statusOption === "In Progress"
                        ? colors.warning
                        : statusOption === "To Do"
                        ? colors.primary
                        : "#6366F1",
                  }}
                  onClick={() => {
                    handleStatusChange(task._id, statusOption);
                    setEditingStatus(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleStatusChange(task._id, statusOption);
                      setEditingStatus(null);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={task.status === statusOption}
                >
                  {statusOption}
                </div>
              )
            )}
          </div>
        </StatusDropdownPortal>
      )}
    </td>

      <td
        className="py-3 px-4 relative text-[13px]"
        style={{ color: colors.textSecondary }}
      >
        <div className="flex items-center gap-2">
          <span>
            {(remarks[task._id] ?? "No remark").length > 26
              ? `${(remarks[task._id] ?? "No remark").slice(0, 26)}…`
              : remarks[task._id] ?? "No remark"}
          </span>

          {(remarks[task._id] || "").length > 26 && (
            <button
              className="text-indigo-600 hover:text-indigo-800 text-xs focus:outline-none"
              onClick={() => {
                setOpenRemarkPopup(task._id);
                setRemarkMode("view");
              }}
              aria-label={`Read full remark for task ${task.taskName}`}
            >
              Read more
            </button>
          )}

          <button
            className="text-indigo-500 hover:text-indigo-800 focus:outline-none"
            onClick={() => {
              setOpenRemarkPopup(task._id);
              setRemarkMode("edit");
            }}
            title="Edit remark"
            aria-label={`Edit remark for task ${task.taskName}`}
          >
            <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
          </button>
        </div>

        {openRemarkPopup === task._id && (
          <div
            className="absolute top-full left-0 mt-2 w-72 rounded-md shadow-lg border z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remark-dialog-title"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h4
                id="remark-dialog-title"
                className="font-semibold text-xs"
                style={{ color: colors.textPrimary }}
              >
                {remarkMode === "edit" ? "Edit Remark" : "Full Remark"}
              </h4>
              <button
                className="text-gray-400 hover:text-gray-600 text-xl leading-none focus:outline-none"
                onClick={() => setOpenRemarkPopup(null)}
                aria-label="Close remark popup"
              >
                ×
              </button>
            </div>

            {remarkMode === "edit" ? (
              <>
                <textarea
                  value={remarks[task._id] ?? ""}
                  onChange={(e) =>
                    setRemarks((prev) => ({
                      ...prev,
                      [task._id]: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Edit Remark"
                  className="w-full px-2 py-1 text-sm rounded-md resize-y focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    backgroundColor: colors.background,
                    borderWidth: "1px",
                    boxShadow: "none",
                    transition: "border-color 0.3s ease",
                  }}
                  autoFocus
                />
                <div className="flex justify-end mt-3 gap-2">
                  <button
                    onClick={() => setOpenRemarkPopup(null)}
                    className="px-3 py-1 text-sm rounded-md"
                    style={{
                      color: colors.textSecondary,
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleRemarkSave(task._id);
                    }}
                    className="px-3 py-1 text-sm rounded-md font-medium"
                    style={{
                      color: colors.surface,
                      backgroundColor: colors.primary,
                      border: `1px solid ${colors.primary}`,
                    }}
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div
                className="text-sm whitespace-pre-wrap max-h-40 overflow-y-auto"
                style={{ color: colors.textSecondary }}
              >
                {remarks[task._id] || "No remark"}
              </div>
            )}
          </div>
        )}
      </td>

      <td
        className="py-3 px-4"
        style={{ color: colors.textSecondary, minWidth: "140px" }}
      >
        <div className="flex flex-wrap gap-2">
          {task.assignees?.map((assignee) => (
            <span
              key={assignee.email}
              className="text-xs py-1 px-2 rounded-full border select-none font-semibold"
              title={assignee.name}
              style={{
                backgroundColor: colors.primaryLight,
                color: colors.primary,
                borderColor: colors.primary,
              }}
            >
              {assignee.name}
            </span>
          ))}
        </div>
      </td>

      <td
        className="py-3 px-4"
        style={{ color: colors.textSecondary, minWidth: "150px" }}
      >
        {task.assignedBy?.name || "—"}
      </td>

      <td className="py-3 px-4 text-center">
        <button
          onClick={() => handleCopyTask(task)}
          className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
          title="Copy Task"
          aria-label={`Copy task ${task.taskName}`}
        >
          <FontAwesomeIcon icon={faCopy} className="h-5 w-5" />
        </button>
      </td>

      {role === "admin" && (
        <td className="py-3 px-4 text-center">
          <button
            onClick={() => handleDeleteTask(task)}
            className="text-red-600 hover:text-red-800 focus:outline-none"
            title="Delete Task"
            aria-label={`Delete task ${task.taskName}`}
          >
            <FaTrashAlt size={18} />
          </button>
        </td>
      )}
    </tr>
  );

  const verticalScrollRef = useRef(null);
  const horizontalScrollRef = useRef(null);
  const syncScroll = (source) => {
    if (
      source === "vertical" &&
      horizontalScrollRef.current &&
      verticalScrollRef.current
    ) {
      horizontalScrollRef.current.scrollLeft =
        verticalScrollRef.current.scrollLeft;
    } else if (
      source === "horizontal" &&
      horizontalScrollRef.current &&
      verticalScrollRef.current
    ) {
      verticalScrollRef.current.scrollLeft =
        horizontalScrollRef.current.scrollLeft;
    }
  };

  return (
    <div
      className="relative "
      style={{ backgroundColor: colors.background }}
    >
      <FilterSection
        filters={filters}
        handleFilterChange={handleFilterChange}
        departments={departments}
        uniqueUsers={uniqueUsers}
        uniqueAssignedBy={uniqueAssignedBy}
        uniqueStatuses={uniqueStatuses}
        role={role}
      />

      <div
        ref={verticalScrollRef}
        className="overflow-x-auto overflow-y-auto md:max-h-[60vh] max-h-[72vh] shadow-md mt-5"
        onScroll={() => syncScroll("vertical")}
        style={{ borderColor: colors.border }}
      >
        {/* Large screen table */}
        <table className="w-full table-auto border-collapse text-sm  shadow-gray-900  text-gray-800 hidden lg:table">
          <thead
            className="sticky top-0 z-20 bg-gray-100  border-b shadow-sm"
            style={{ borderColor: colors.border }}
          >
            <tr className="uppercase tracking-wide text-[11px] font-extrabold text-gray-900 select-none ">
              <th className="py-2.5 px-4 text-left min-w-[62px]">S. No</th>
              <th className="py-2.5 px-4 text-left min-w-[100px]">Task Name</th>
              <th className="py-2.5 px-4 text-left min-w-[240px]">
                Work Description <span className="font-bold">+ Code</span>
              </th>
              <th className="py-2.5 px-4 text-left min-w-[170px]">
                Date of Work
              </th>
              <th
                className="py-2.5 px-4 text-left min-w-[110px] cursor-pointer select-none"
                onClick={() =>
                  setDueDateSortOrder((prev) =>
                    prev === "asc" ? "desc" : "asc"
                  )
                }
                title="Sort by Due Date"
                aria-label={`Sort by Due Date ${
                  dueDateSortOrder === "asc"
                    ? "ascending"
                    : dueDateSortOrder === "desc"
                    ? "descending"
                    : "none"
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setDueDateSortOrder((prev) =>
                      prev === "asc" ? "desc" : "asc"
                    );
                  }
                }}
              >
                <span className="inline-flex items-center gap-1 select-none">
                  Due Date
                  {dueDateSortOrder === "asc" ? (
                    <span aria-hidden="true" className="text-[11px]">
                      ▲
                    </span>
                  ) : dueDateSortOrder === "desc" ? (
                    <span aria-hidden="true" className="text-[11px]">
                      ▼
                    </span>
                  ) : (
                    ""
                  )}
                </span>
              </th>
              <th className="py-2.5 px-4 text-center min-w-[120px]">Status</th>
              <th className="py-2.5 px-4 text-left min-w-[130px]">Remarks</th>
              <th className="py-2.5 px-4 text-left min-w-[130px]">Team</th>
              <th className="py-2.5 px-4 text-left min-w-[80px]">
                Assigned By
              </th>
              <th className="py-2.5 px-4 text-center min-w-[20px]">Copy</th>
              {role === "admin" && (
                <th className="py-2.5 px-4 text-center min-w-[20px]">Delete</th>
              )}
            </tr>
          </thead>

          <tbody className="text-[13px]">
            {loading ? (
              <tr>
                <td
                  colSpan={role === "admin" ? 11 : 10}
                  className="py-10 text-center text-gray-500"
                >
                  <FaSpinner className="animate-spin h-7 w-7 mx-auto mb-2" />
                  Loading tasks…
                </td>
              </tr>
            ) : highPriorityTasks.length === 0 &&
              mediumPriorityTasks.length === 0 &&
              lowPriorityTasks.length === 0 ? (
              <tr>
                <td
                  colSpan={role === "admin" ? 11 : 10}
                  className="text-center py-8 text-gray-500 select-none"
                >
                  🚫 No tasks Assigned Yet.
                </td>
              </tr>
            ) : (
              <>
                {highPriorityTasks.length > 0 && (
                  <>
                    <tr>
                      <td
                        colSpan={role === "admin" ? 11 : 10}
                        className="bg-red-50 text-red-900 font-semibold text-[12px] py-2 px-4 border-y select-none"
                        style={{ borderColor: colors.border }}
                      >
                        High Priority Tasks
                      </td>
                    </tr>
                    {highPriorityTasks.map((task, idx) =>
                      renderTaskRow(task, idx)
                    )}
                  </>
                )}

                {mediumPriorityTasks.length > 0 && (
                  <>
                    <tr>
                      <td
                        colSpan={role === "admin" ? 11 : 10}
                        className="bg-yellow-50 text-yellow-900 font-semibold text-[12px] py-2 px-4 border-y select-none"
                        style={{ borderColor: colors.border }}
                      >
                        Medium Priority Tasks
                      </td>
                    </tr>
                    {mediumPriorityTasks.map((task, idx) =>
                      renderTaskRow(task, idx)
                    )}
                  </>
                )}

                {lowPriorityTasks.length > 0 && (
                  <>
                    <tr>
                      <td
                        colSpan={role === "admin" ? 11 : 10}
                        className="bg-green-50 text-green-900 font-semibold text-[12px] py-2 px-4 border-y select-none"
                        style={{ borderColor: colors.border }}
                      >
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

        {/* Mobile view cards */}
        <div className="block lg:hidden px-2 py-3">
          {loading ? (
            <div className="text-center py-10 text-gray-500 select-none">
              <FaSpinner className="animate-spin h-7 w-7 mx-auto mb-2" />
              Loading tasks…
            </div>
          ) : highPriorityTasks.length === 0 &&
            mediumPriorityTasks.length === 0 &&
            lowPriorityTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 select-none">
              🚫 No tasks Assigned Yet.
            </div>
          ) : (
            <>
              {highPriorityTasks.length > 0 && (
                <>
                  <div
                    className="sticky top-0 z-10 font-semibold text-red-900  bg-red-50 text-xs mb-2 px-3 py-2 border-y select-none"
                    style={{
                      // backgroundColor: colors.dangerLight,
                      // color: colors.danger,
                      borderColor: colors.border,
                    }}
                  >
                    High Priority
                  </div>
                  {highPriorityTasks.map(renderTaskCard)}
                </>
              )}

              {mediumPriorityTasks.length > 0 && (
                <>
                  <div
                    className="sticky bg-yellow-50 text-yellow-900 top-0 z-10 font-semibold text-xs mb-2 px-3 py-2 border-y select-none"
                    style={{
                      // backgroundColor: colors.warningLight,
                      // color: colors.warning,
                      borderColor: colors.border,
                    }}
                  >
                    Medium Priority
                  </div>
                  {mediumPriorityTasks.map(renderTaskCard)}
                </>
              )}

              {lowPriorityTasks.length > 0 && (
                <>
                  <div
                    className="sticky bg-green-50 text-green-900 top-0 z-10 font-semibold text-xs mb-2 px-3 py-2 border-y select-none"
                    style={{
                      // backgroundColor: colors.secondaryLight,
                      // color: colors.secondary,
                      borderColor: colors.border,
                    }}
                  >
                    Low Priority
                  </div>
                  {lowPriorityTasks.map(renderTaskCard)}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;