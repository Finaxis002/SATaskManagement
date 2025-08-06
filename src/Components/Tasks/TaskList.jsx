import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTaskStatus, setHideCompletedTrue } from "../../redux/taskSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchDepartments } from "../../redux/departmentSlice";
import StatusDropdownPortal from "../StatusDropdownPortal";
import { faPen, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FaTrashAlt, FaExclamationCircle } from "react-icons/fa";
import { fetchUsers } from "../../redux/userSlice";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import FilterSection from "./FilterSection";

const socket = io("https://taskbe.sharda.co.in");
const TaskList = ({
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
    dueBefore: "",
  });
  const [dueDateSortOrder, setDueDateSortOrder] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [editingWorkDesc, setEditingWorkDesc] = useState(null);
  const [workDescs, setWorkDescs] = useState({});
  const [openRemarkPopup, setOpenRemarkPopup] = useState(null);
  const [openWorkDescPopup, setOpenWorkDescPopup] = useState(null);
  const [workDescMode, setWorkDescMode] = useState("view");
  const [remarkMode, setRemarkMode] = useState("view");
  const [departments, setDepartments] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [departmentsForAdmin, setDepartmentsForAdmin] = useState([]);
  const [departmentsLoaded, setDepartmentsLoaded] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(true);

  // Get user role and email from localStorage
  const role = localStorage.getItem("role");
  const userEmail = JSON.parse(localStorage.getItem("user"))?.email;
  const users = useSelector((state) => state.users.list); // Assuming `list` stores users in Redux

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
    setLoading(false);
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ remark: remarkText, updatedBy }),
        }
      );

      if (response.ok) {
        const updatedTask = await response.json();

        // ✅ Update tasks
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );

        // ✅ Update remarks
        setRemarks((prev) => ({
          ...prev,
          [taskId]: updatedTask.remark ?? "",
        }));

        setOpenRemarkPopup(null); // close popup

        // ✅ Optional: force full refetch to be 100% up-to-date
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
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
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
      // Exclude hidden tasks and obsolete hidden tasks
      if (task.isHidden) return false;
      if (task.isObsoleteHidden) return false; // <-- ADD THIS LINE

      // ...your existing filtering logic below
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

  const permanentlyStopRepetition = async (task) => {
    try {
      const updatedBy = {
        name: localStorage.getItem("name"),
        email: localStorage.getItem("userId"),
      };

      await fetch(`https://taskbe.sharda.co.in/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isRepetitive: false,
          nextRepetitionDate: null,
          updatedBy,
        }),
      });

      await deleteTaskRequest(task._id);
      console.log("🔁 Repetition stopped and task deleted");
    } catch (error) {
      console.error("❌ Error stopping repetition", error);
      alert("Failed to stop future repetitions.");
    }
  };

  const deleteTaskRequest = async (taskId) => {
    try {
      // Optimistically update the UI
      setTasks((prevTasks) => prevTasks.filter((t) => t._id !== taskId));

      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      // Refresh the task list
      fetchTasksFromAPI();

      console.log("✅ Task deleted:", taskId);
    } catch (err) {
      console.error("❌ Error deleting task:", err);
      alert("Failed to delete task. Please try again.");
      fetchTasksFromAPI(); // fallback to restore
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
        customClass: {
          popup: "sweet-modal",
          confirmButton: "sweet-confirm-btn",
          cancelButton: "sweet-cancel-btn",
        },
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
        setEditingStatus(null); // 👈 Close dropdown on outside click
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

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


  const renderTaskRow = (task, index) => (
    <tr
      key={task._id}
      id={`task-${task._id}`}
      //     className={`hover:bg-indigo-50 transition duration-300 ease-in-out cursor-pointer border-b border-gray-200
      //   ${
      //     new Date(task.dueDate) < new Date() &&
      //     task.status !== "Completed" &&
      //     task.status !== "Obsolete"
      //       ? "bg-orange-100 hover:bg-orange-200"
      //       : ""
      //   }
      // `}
      className={`transition duration-300 ease-in-out cursor-pointer border-b border-gray-200 
  ${
    index % 2 === 0
      ? "bg-white hover:bg-gray-50"
      : "bg-gray-100 hover:bg-gray-200"
  }`}
      style={{ maxHeight: "200px", overflowY: "auto" }}
    >
      {/* 1. S. No */}
      <td className="py-3 px-4 font-medium">{index + 1}</td>

      {/* 2. Task Name (with pencil icon for edit) */}
      <td className="py-3 px-6 relative flex items-center gap-2">
        <span className="text-xs">
          {task.taskName}
          {new Date(task.dueDate) < new Date() &&
            task.status !== "Completed" &&
            task.status !== "Obsolete" && (
              <FaExclamationCircle
                className="text-red-500"
                title="Overdue Task"
              />
            )}
        </span>
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
        <span
          className={`bg-blue-100 text-blue-700 border border-blue-300 rounded-md px-2 py-0.5 shadow-sm text-[11px] ${
            task.status === "Completed"
              ? "bg-green-200 text-green-600"
              : task.status === "In Progress"
              ? "bg-yellow-200 text-yellow-600"
              : task.status === "To Do"
              ? "bg-blue-200 text-blue-600"
              : task.status === "Obsolete"
              ? "bg-purple-200 text-purple-600"
              : "bg-red-200 text-red-600"
          }`}
          onClick={(e) => {
            const rect = e.target.getBoundingClientRect();
            setDropdownPosition({
              top: rect.top + window.scrollY + 30, // Adjust +30 for dropdown spacing
              left: rect.left + window.scrollX,
            });
            setEditingStatus(task._id);
          }}
        >
          {task.status}
        </span>

        {editingStatus === task._id && (
          <StatusDropdownPortal>
            <div
              ref={dropdownRef}
              className="absolute bg-white shadow-lg rounded-md w-40 border"
              style={{
                position: "absolute",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                zIndex: 9999,
              }}
            >
              {["To Do", "In Progress", "Completed", "Obsolete"].map(
                (statusOption) => (
                  <div
                    key={statusOption}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                      statusOption === "Completed"
                        ? "text-green-600"
                        : statusOption === "In Progress"
                        ? "text-yellow-600"
                        : statusOption === "To Do"
                        ? "text-blue-600"
                        : "text-purple-600"
                    }`}
                    onClick={() => {
                      handleStatusChange(task._id, statusOption);
                      setEditingStatus(null);
                    }}
                  >
                    {statusOption}
                  </div>
                )
              )}
            </div>
          </StatusDropdownPortal>
        )}
      </td>

      {/* 7. Remark */}
      <td className="py-2 px-6 relative">
        <div className="flex items-center gap-2">
          <span className="text-xs">
            {(remarks[task._id] ?? "No remark").length > 20
              ? `${(remarks[task._id] ?? "No remark").slice(0, 20)}...`
              : remarks[task._id] ?? "No remark"}
          </span>

          {(remarks[task._id] || "").length > 20 && (
            <button
              className="text-blue-500 hover:text-blue-700 text-xs"
              onClick={() => {
                setOpenRemarkPopup(task._id);
                setRemarkMode("view");
              }}
            >
              Read more
            </button>
          )}

          <FontAwesomeIcon
            icon={faPen}
            className="cursor-pointer text-blue-500 hover:text-blue-700"
            onClick={() => {
              setOpenRemarkPopup(task._id);
              setRemarkMode("edit");
            }}
          />
        </div>

        {/* Popup box for Remark */}
        {openRemarkPopup === task._id && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-xs">
                {remarkMode === "edit" ? "Edit Remark" : "Full Remark"}
              </span>
              <button
                className="text-red-500 font-bold text-2xl"
                onClick={() => setOpenRemarkPopup(null)}
              >
                ×
              </button>
            </div>

            {remarkMode === "edit" ? (
              <>
                <textarea
                  value={remarks[task._id] ?? ""} // ✅ Use ?? instead of || to preserve empty string
                  onChange={(e) =>
                    setRemarks((prev) => ({
                      ...prev,
                      [task._id]: e.target.value,
                    }))
                  }
                  rows="4"
                  placeholder="Edit Remark"
                  className="w-full px-2 py-1 text-xs border rounded-md"
                />

                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => {
                      handleRemarkSave(task._id);
                      setOpenRemarkPopup(null);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded-md"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-700 text-xs whitespace-pre-wrap">
                {remarks[task._id] || "No remark"}
              </div>
            )}
          </div>
        )}
      </td>

      {/* 8. Team (Assignees) */}
      <td className="py-3 px-6 flex flex-wrap gap-2">
        {task.assignees?.map((assignee) => (
          <div
            key={assignee.email}
            className="text-xs bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full shadow-md hover:shadow-lg transition duration-200 ease-in-out"
          >
            {assignee.name}
          </div>
        ))}
      </td>

      {/* 9. Assigned By */}
      <td className="py-3 px-6 font-medium">{task.assignedBy?.name || "—"}</td>
      <td className="py-3 px-4 text-center">
        <button
          onClick={() => handleCopyTask(task)}
          className="text-blue-500 hover:text-blue-700 cursor-pointer"
          title="Copy Task"
        >
          <FontAwesomeIcon icon={faCopy} />
        </button>
      </td>
      {role === "admin" && (
        <>
          <td className="py-3 px-6 text-center">
            <FaTrashAlt
              size={15}
              className="text-red-500 hover:text-red-700 cursor-pointer"
              onClick={() => handleDeleteTask(task)}
            />
          </td>
        </>
      )}
    </tr>
  );

  const verticalScrollRef = useRef(null);
  const horizontalScrollRef = useRef(null);

  // Sync horizontal scroll of table with sticky scrollbar and vice versa
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
    <div className="relative" style={{ position: "relative" }}>
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
        // className="overflow-auto"
        // style={{
        //   maxHeight: "calc(75vh - 120px)",
        //   overflowX: "auto",
        //   position: "relative",
        // }}
        className="overflow-x-auto overflow-y-auto max-h-[57vh]"
        
        onScroll={() => syncScroll("vertical")}
      >
        <table className="w-full table-auto border-collapse text-sm text-gray-800">
          <thead className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 text-gray-700 text-xs uppercase tracking-wide sticky top-0 z-20 shadow-sm border-b border-gray-200">
            <tr>
              <th className="py-1 px-4 min-w-[70px] font-bold text-[13px]">
                S. No
              </th>
              <th className="py-1 px-6 min-w-[180px] font-bold text-[13px]">
                Task Name
              </th>
              <th className="py-1 px-6 min-w-[250px] font-bold text-[13px]">
                Work Description{" "}
                <span className="text-indigo-400 font-extrabold">+</span> Code
              </th>
              <th className="py-1 px-6 min-w-[150px] font-bold text-[13px]">
                Date of Work
              </th>
              <th
                className={`py-1 px-6 font-bold text-[13px] cursor-pointer transition duration-100 hover:text-indigo-700 select-none`}
                onClick={() =>
                  setDueDateSortOrder((prev) =>
                    prev === "asc" ? "desc" : "asc"
                  )
                }
              >
                <span className="flex items-center gap-1">
                  Due Date
                  {dueDateSortOrder === "asc" ? (
                    <span className="text-[12px]">▲</span>
                  ) : dueDateSortOrder === "desc" ? (
                    <span className="text-[12px]">▼</span>
                  ) : (
                    ""
                  )}
                </span>
              </th>
              <th className="py-1 px-6 min-w-[140px] font-bold text-center text-[13px]">
                Status
              </th>
              <th className="py-1 px-6 min-w-[160px] font-bold text-[13px]">
                Remarks
              </th>
              <th className="py-1 px-6 min-w-[180px] font-bold text-[13px]">
                Team
              </th>
              <th className="py-1 px-6 min-w-[130px] font-bold text-[13px]">
                Assigned By
              </th>
              <th className="py-1 px-4 min-w-[80px] font-bold text-center text-[13px]">
                Copy
              </th>
              {role === "admin" && (
                <th className="py-1 px-6 min-w-[80px] font-bold text-center text-[13px]">
                  Delete
                </th>
              )}
            </tr>
          </thead>

          <tbody className="text-xs text-gray-700">
            {/* High Priority Section */}
            {loading ? (
              <tr>
                <td colSpan="13" className="py-10 text-center">
                  <svg
                    className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  <span className="text-indigo-600 font-medium">
                    Loading tasks...
                  </span>
                </td>
              </tr>
            ) : highPriorityTasks.length === 0 &&
              mediumPriorityTasks.length === 0 &&
              lowPriorityTasks.length === 0 ? (
              <tr className="even:bg-gray-50 odd:bg-white">
                <td colSpan="13" className="text-center py-6 text-gray-500">
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
  );
};

export default TaskList;
