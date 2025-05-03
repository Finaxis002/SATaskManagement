import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateTaskStatus, fetchTasks } from "../../redux/taskSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FaTrashAlt, FaPen } from "react-icons/fa";

import { io } from "socket.io-client";
const socket = io("https://sataskmanagementbackend.onrender.com"); // Or your backend URL

const TaskList = ({ onEdit, refreshTrigger }) => {
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
  const [dueDateSortOrder, setDueDateSortOrder] = useState(null); // 'asc' or 'desc'
  const [remarks, setRemarks] = useState({}); // Track remarks for each task
  const [editingRemark, setEditingRemark] = useState(null); // Track which task is being edited for remarks
  const [editingWorkDesc, setEditingWorkDesc] = useState(null);
  const [workDescs, setWorkDescs] = useState({});
  const [openRemarkPopup, setOpenRemarkPopup] = useState(null);
  const [openWorkDescPopup, setOpenWorkDescPopup] = useState(null);
  const [workDescMode, setWorkDescMode] = useState("view"); // "edit" or "view"
  const [remarkMode, setRemarkMode] = useState("view"); // "edit" or "view"

  // Get user role and email from localStorage
  const role = localStorage.getItem("role");
  const userEmail = localStorage.getItem("userId");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateTaskStatus());
  }, [dispatch]);

  const fetchTasksFromAPI = async () => {
    try {
      const response = await fetch(
        "https://sataskmanagementbackend.onrender.com/api/tasks"
      );
      const data = await response.json();

      if (role !== "admin") {
        const filtered = data.filter((task) =>
          task.assignees.some((a) => a.email === userEmail)
        );
        setTasks(filtered);
      } else {
        setTasks(data);
      }

      // Map over the tasks to extract remarks and store them
      const taskRemarks = {};
      data.forEach((task) => {
        taskRemarks[task._id] = task.remark || ""; // Ensure it's not undefined
      });
      setRemarks(taskRemarks); // Store the remarks in the state
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  useEffect(() => {
    socket.on("task-updated", (data) => {
      console.log("🟡 task-updated received on frontend!", data); // <-- Add this
      fetchTasksFromAPI();
    });

    return () => socket.off("task-updated");
  }, []);

  useEffect(() => {
    socket.on("new-task-created", (data) => {
      console.log("🟢 Received new task event!", data);
      fetchTasksFromAPI();
    });

    socket.on("task-updated", () => {
      console.log("🟡 Task updated event!");
      fetchTasksFromAPI();
    });

    socket.on("task-deleted", () => {
      console.log("🔴 Task deleted event!");
      fetchTasksFromAPI();
    });

    return () => {
      socket.off("new-task-created");
      socket.off("task-updated");
      socket.off("task-deleted");
    };
  }, []);

  // Fetch tasks based on the user's role
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
        `https://sataskmanagementbackend.onrender.com/api/tasks/${taskId}`,
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
    let remarkText = remarks[taskId] || "";

    // Update remark in the backend
    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };

    try {
      const response = await fetch(
        `https://sataskmanagementbackend.onrender.com/api/tasks/${taskId}`,
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
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
        setEditingRemark(null); // Exit editing mode after saving
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

  const handleWorkDescSave = async (taskId) => {
    const workDescText = workDescs[taskId] || "";

    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };

    try {
      const response = await fetch(
        `https://sataskmanagementbackend.onrender.com/api/tasks/${taskId}`,
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

  const filteredTasks = tasks
    .filter((task) => {
      return (
        (filters.department === "" ||
          task.taskCategory === filters.department) &&
        (filters.code === "" || task.code === filters.code) &&
        (filters.assignee === "" ||
          task.assignees?.some((a) => a.name === filters.assignee)) &&
        (filters.assignedBy === "" ||
          task.assignedBy?.name === filters.assignedBy) &&
        (filters.priority === "" || task.priority === filters.priority) &&
        (filters.status === "" || task.status === filters.status)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA - dateB; // 🚀 ascending order: nearest due date first
    });

  const highPriorityTasks = filteredTasks.filter(
    (task) => task.priority === "High"
  );
  const mediumPriorityTasks = filteredTasks.filter(
    (task) => task.priority === "Medium"
  );
  const lowPriorityTasks = filteredTasks.filter(
    (task) => task.priority === "Low"
  );

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `https://sataskmanagementbackend.onrender.com/api/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== taskId)
        );
      } else {
        throw new Error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    }
  };

  const renderTaskRow = (task, index) => (
    <tr
      key={task._id}
      className="hover:bg-indigo-50 transition duration-300 ease-in-out cursor-pointer border-b border-gray-200"
    >
      {/* 1. S. No */}
      <td className="py-4 px-4 font-medium">{index + 1}</td>

      {/* 2. Task Name (with pencil icon for edit) */}
      <td className="py-4 px-6 relative flex items-center gap-2">
        <span className="text-sm">{task.taskName}</span>
        <FontAwesomeIcon
          icon={faPen}
          className="cursor-pointer text-blue-500 hover:text-blue-700"
          onClick={() => onEdit(task)}
        />
      </td>

      {/* 3. Work Description + Code */}
      <td className="py-4 px-6 relative">
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {(task.workDesc || "No description").length > 60
              ? `${task.workDesc.slice(0, 60)}...`
              : task.workDesc || "No description"}
            {task.code ? (
              <span className="ml-2 text-blue-700 font-medium">
                ({task.code})
              </span>
            ) : null}
          </span>

          {(task.workDesc || "").length > 60 && (
            <button
              className="text-blue-500 hover:text-blue-700 text-xs"
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
            className="cursor-pointer text-blue-500 hover:text-blue-700"
            onClick={() => {
              setOpenWorkDescPopup(task._id);
              setWorkDescMode("edit");
            }}
          />
        </div>

        {/* Popup box for read/edit work description */}
        {openWorkDescPopup === task._id && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-sm">
                {workDescMode === "edit"
                  ? "Edit Work Description"
                  : "Work Description"}
              </span>
              <button
                className="text-red-500 font-bold"
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
                  rows="4"
                  placeholder="Edit Work Description"
                  className="w-full px-2 py-1 text-sm border rounded-md text-justify"
                />

                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => {
                      handleWorkDescSave(task._id);
                      setOpenWorkDescPopup(null);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded-md"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-700 text-sm whitespace-pre-wrap">
                {task.workDesc || "No description available"}
              </div>
            )}

            <div className="text-xs text-gray-500 mt-2">
              Code: {task.code || "—"}
            </div>
          </div>
        )}
      </td>

      {/* 4. Date of Work */}
      <td className="py-4 px-6">{formatAssignedDate(task.assignedDate)}</td>

      {/* 5. Due Date */}
      <td className="py-4 px-6">
        {new Date(task.dueDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </td>

      {/* 6. Status (with click to change dropdown) */}
      <td className="py-4 px-6 text-center relative">
        {editingStatus === task._id ? (
          <div className="flex flex-col w-[20vh] justify-between bg-white absolute shadow-lg rounded-lg z-50">
            {["To Do", "In Progress", "Completed", "Overdue"].map(
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
                : "bg-red-200 text-red-600"
            }`}
            onClick={() => setEditingStatus(task._id)}
          >
            {task.status}
          </span>
        )}
      </td>

      {/* 7. Remark */}
      <td className="py-2 px-6 relative">
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {(remarks[task._id] || "No remark").length > 20
              ? `${(remarks[task._id] || "No remark").slice(0, 20)}...`
              : remarks[task._id] || "No remark"}
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
              <span className="font-semibold text-sm">
                {remarkMode === "edit" ? "Edit Remark" : "Full Remark"}
              </span>
              <button
                className="text-red-500 font-bold"
                onClick={() => setOpenRemarkPopup(null)}
              >
                ×
              </button>
            </div>

            {remarkMode === "edit" ? (
              <>
                <textarea
                  value={remarks[task._id] || ""}
                  onChange={(e) =>
                    setRemarks((prev) => ({
                      ...prev,
                      [task._id]: e.target.value,
                    }))
                  }
                  rows="4"
                  placeholder="Edit Remark"
                  className="w-full px-2 py-1 text-sm border rounded-md text-justify"
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
              <div className="text-gray-700 text-sm whitespace-pre-wrap">
                {remarks[task._id] || "No remark"}
              </div>
            )}
          </div>
        )}
      </td>

      {/* 8. Team (Assignees) */}
      <td className="py-4 px-6 flex flex-wrap gap-2">
        {task.assignees?.map((assignee) => (
          <div
            key={assignee.email}
            className="text-sm bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full shadow-md hover:shadow-lg transition duration-200 ease-in-out"
          >
            {assignee.name}
          </div>
        ))}
      </td>

      {/* 9. Assigned By */}
      <td className="py-4 px-6 font-medium">{task.assignedBy?.name || "—"}</td>

      {role === "admin" && (
        <td className="py-4 px-6 text-center">
          <FaTrashAlt
            size={15}
            className="text-red-500 hover:text-red-700 cursor-pointer"
            onClick={() => handleDeleteTask(task._id)}
          />
        </td>
      )}
    </tr>
  );

  return (
    <div className="overflow-x-auto h-[78vh] w-[180vh]">
      <div className="flex items-center justify-start mb-6 space-x-6">
        {/* Department Filter (already exists) */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="departmentFilter"
            className="text-sm font-medium text-gray-700"
          >
            Filter by Department:
          </label>
          <select
            id="departmentFilter"
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="appearance-none w-56 pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-md shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Departments</option>
            {Array.from(new Set(tasks.map((t) => t.taskCategory)))
              .filter(Boolean)
              .map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
          </select>
        </div>

        {/* ✅ Status Filter */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="statusFilter"
            className="text-sm font-medium text-gray-700"
          >
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="appearance-none w-56 pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-md shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            {Array.from(new Set(tasks.map((t) => t.status)))
              .filter(Boolean)
              .map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
          </select>
        </div>
      </div>

      <table className="min-w-[1300px] w-full table-auto border-collapse text-sm text-gray-800">
        <thead className="bg-gradient-to-r from-indigo-400 to-indigo-700 text-white text-sm">
          <tr className="text-left">
            <th className="py-4 px-4 min-w-[70px] font-semibold">S. No</th>
            <th className="py-4 px-6 min-w-[180px] font-semibold">Task Name</th>
            <th className="py-4 px-6  min-w-[250px] font-semibold">
              Work Description + Code
            </th>
            <th className="py-4 px-6 min-w-[180px] font-semibold">
              Date of Work
            </th>
            <th
              className="py-4 px-6 min-w-[180px] font-semibold cursor-pointer"
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
            <th className="py-4 px-6 min-w-[160px] font-semibold text-center">
              Status
            </th>
            <th className="py-4 px-6 min-w-[160px] font-semibold">Remarks</th>
            <th className="py-4 px-6 min-w-[250px] font-semibold">Team</th>
            <th className="py-4 px-6 min-w-[130px] font-semibold">
              Assigned By
            </th>
            {role === "admin" && (
              <th className="py-4 px-6 min-w-[80px] font-semibold text-center">
                Delete
              </th>
            )}
          </tr>
        </thead>

        <tbody className="text-sm text-gray-700">
          {/* High Priority Section */}
          {highPriorityTasks.length > 0 && (
            <>
              <tr className="bg-red-100 text-red-800 font-bold text-sm">
                <td colSpan="13" className="py-2 px-6">
                  High Priority Tasks
                </td>
              </tr>
              {highPriorityTasks.map((task, idx) => renderTaskRow(task, idx))}
            </>
          )}

          {/* Medium Priority Section */}
          {mediumPriorityTasks.length > 0 && (
            <>
              <tr className="bg-yellow-100 text-yellow-800 font-bold text-sm">
                <td colSpan="13" className="py-2 px-6">
                  Medium Priority Tasks
                </td>
              </tr>
              {mediumPriorityTasks.map((task, idx) => renderTaskRow(task, idx))}
            </>
          )}

          {/* Low Priority Section */}
          {lowPriorityTasks.length > 0 && (
            <>
              <tr className="bg-green-100 text-green-800 font-bold text-sm">
                <td colSpan="13" className="py-2 px-6">
                  Low Priority Tasks
                </td>
              </tr>
              {lowPriorityTasks.map((task, idx) => renderTaskRow(task, idx))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
