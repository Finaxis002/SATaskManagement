import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateTaskStatus, fetchTasks } from "../../redux/taskSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faPen } from "@fortawesome/free-solid-svg-icons";

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
  const [openFilter, setOpenFilter] = useState(null); // 🆕 which filter is open
  const [remarks, setRemarks] = useState({}); // Track remarks for each task
  const [editingRemark, setEditingRemark] = useState(null); // Track which task is being edited for remarks

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

  const ReadMoreLess = ({ text, limit = 40 }) => {
    const [expanded, setExpanded] = useState(false);

    if (!text) return null;

    const toggle = () => setExpanded((prev) => !prev);

    const isLong = text.length > limit;
    const displayedText =
      expanded || !isLong ? text : text.slice(0, limit) + "...";

    return (
      <div>
        <span>{displayedText}</span>
        {isLong && (
          <button
            onClick={toggle}
            className="text-blue-600 text-xs ml-1 underline focus:outline-none"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
      </div>
    );
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Tooltip logic for full remark
  const handleShowFullRemark = (taskId) => {
    alert(remarks[taskId]); // This can be replaced with a tooltip implementation
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

  return (
    <div className="overflow-x-auto h-[78vh] w-[180vh]">
      <table className="min-w-[1300px] w-full table-auto border-collapse text-sm text-gray-800">
        <thead className="bg-gradient-to-r from-indigo-400 to-indigo-700 text-white text-sm ">
          <tr className="text-left">
            <th className="py-4 px-6 min-w-[180px] font-semibold">Task Name</th>

            <th className="py-4 px-6 min-w-[250px] font-semibold">
              Task Description
            </th>
            <th className="py-4 px-6 min-w-[250px] font-semibold">Remarks</th>

            <th className="py-4 px-6 min-w-[160px] font-semibold relative">
              <div className="flex items-center justify-center gap-2">
                <span>
                  Department
                  {filters.department && ` (${filters.department})`}{" "}
                  {/* Show selected */}
                </span>
                <FontAwesomeIcon
                  icon={faFilter}
                  className="cursor-pointer"
                  onClick={() => {
                    setOpenFilter(
                      openFilter === "department" ? null : "department"
                    );
                  }}
                />
              </div>

              {/* Custom dropdown for Department */}
              {openFilter === "department" && (
                <div className="absolute top-full mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-2xl z-30 overflow-hidden animate-fadeIn max-h-72 overflow-y-auto">
                  {/* All Option at Top */}
                  <div
                    className={`px-4 py-2 text-sm font-semibold ${
                      filters.department === ""
                        ? "bg-indigo-100 text-indigo-800"
                        : "text-gray-700"
                    } hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer transition-all duration-200`}
                    onClick={() => {
                      handleFilterChange("department", "");
                      setOpenFilter(null);
                    }}
                  >
                    All
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Dynamic Department Names */}
                  {Array.from(new Set(tasks.map((t) => t.taskCategory))).filter(
                    Boolean
                  ).length > 0 ? (
                    Array.from(new Set(tasks.map((t) => t.taskCategory)))
                      .filter(Boolean)
                      .map((dept) => (
                        <div
                          key={dept}
                          className={`px-4 py-2 text-sm ${
                            filters.department === dept
                              ? "bg-indigo-100 text-indigo-800 font-medium"
                              : "text-gray-700"
                          } hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer transition-all duration-200`}
                          onClick={() => {
                            handleFilterChange("department", dept);
                            setOpenFilter(null);
                          }}
                        >
                          {dept}
                        </div>
                      ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-gray-400">
                      No Departments Available
                    </div>
                  )}
                </div>
              )}
            </th>

            <th className="py-4 px-6 min-w-[140px] font-semibold relative">
              <div className="flex items-center justify-center gap-2">
                <span>
                  Code
                  {filters.code && ` (${filters.code})`}{" "}
                  {/* Show selected code */}
                </span>
                <FontAwesomeIcon
                  icon={faFilter}
                  className="cursor-pointer"
                  onClick={() => {
                    setOpenFilter(openFilter === "code" ? null : "code");
                  }}
                />
              </div>

              {/* Custom dropdown for Code */}
              {openFilter === "code" && (
                <div className="absolute top-full mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-2xl z-30 overflow-hidden animate-fadeIn max-h-72 overflow-y-auto">
                  {/* All Option at Top */}
                  <div
                    className={`px-4 py-2 text-sm font-semibold ${
                      filters.code === ""
                        ? "bg-indigo-100 text-indigo-800"
                        : "text-gray-700"
                    } hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer transition-all duration-200`}
                    onClick={() => {
                      handleFilterChange("code", "");
                      setOpenFilter(null);
                    }}
                  >
                    All
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Dynamic Code Names */}
                  {Array.from(new Set(tasks.map((t) => t.code))).length > 0 ? (
                    Array.from(new Set(tasks.map((t) => t.code))).map(
                      (code) => (
                        <div
                          key={code}
                          className={`px-4 py-2 text-sm ${
                            filters.code === code
                              ? "bg-indigo-100 text-indigo-800 font-medium"
                              : "text-gray-700"
                          } hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer transition-all duration-200`}
                          onClick={() => {
                            handleFilterChange("code", code);
                            setOpenFilter(null);
                          }}
                        >
                          {code}
                        </div>
                      )
                    )
                  ) : (
                    <div className="px-4 py-4 text-sm text-gray-400">
                      No Codes Available
                    </div>
                  )}
                </div>
              )}
            </th>

            <th className="py-4 px-6 min-w-[250px] font-semibold relative">
              <div className="flex items-center justify-center gap-2">
                <span>
                  Assignee
                  {filters.assignee && ` (${filters.assignee})`}{" "}
                  {/* Show selected Assignee */}
                </span>
                <FontAwesomeIcon
                  icon={faFilter}
                  className="cursor-pointer"
                  onClick={() => {
                    setOpenFilter(
                      openFilter === "assignee" ? null : "assignee"
                    );
                  }}
                />
              </div>

              {/* Custom dropdown for Assignee */}
              {openFilter === "assignee" && (
                <div className="absolute top-full mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-2xl z-30 overflow-hidden animate-fadeIn max-h-72 overflow-y-auto">
                  {/* All Option at Top */}
                  <div
                    className={`px-4 py-2 text-sm font-semibold ${
                      filters.assignee === ""
                        ? "bg-indigo-100 text-indigo-800"
                        : "text-gray-700"
                    } hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer transition-all duration-200`}
                    onClick={() => {
                      handleFilterChange("assignee", "");
                      setOpenFilter(null);
                    }}
                  >
                    All
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Dynamic Assignee Names */}
                  {Array.from(
                    new Set(
                      tasks.flatMap(
                        (t) => t.assignees?.map((a) => a.name) || []
                      )
                    )
                  ).length > 0 ? (
                    Array.from(
                      new Set(
                        tasks.flatMap(
                          (t) => t.assignees?.map((a) => a.name) || []
                        )
                      )
                    ).map((name) => (
                      <div
                        key={name}
                        className={`px-4 py-2 text-sm ${
                          filters.assignee === name
                            ? "bg-indigo-100 text-indigo-800 font-medium"
                            : "text-gray-700"
                        } hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer transition-all duration-200`}
                        onClick={() => {
                          handleFilterChange("assignee", name);
                          setOpenFilter(null);
                        }}
                      >
                        {name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-gray-400">
                      No Assignees Available
                    </div>
                  )}
                </div>
              )}
            </th>

            <th className="py-4 px-6 min-w-[180px] font-semibold relative">
              <div className="flex items-center justify-center gap-2">
                <span>
                  Assigned By
                  {filters.assignedBy && ` (${filters.assignedBy})`}{" "}
                  {/* Show selected */}
                </span>
                <FontAwesomeIcon
                  icon={faFilter}
                  className="cursor-pointer"
                  onClick={() => {
                    setOpenFilter(
                      openFilter === "assignedBy" ? null : "assignedBy"
                    );
                  }}
                />
              </div>

              {/* Custom dropdown for Assigned By */}
              {openFilter === "assignedBy" && (
                <div className="absolute top-full mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-2xl z-30 overflow-hidden animate-fadeIn max-h-72 overflow-y-auto">
                  {/* All Option at Top */}
                  <div
                    className={`px-4 py-2 text-sm font-semibold ${
                      filters.assignedBy === ""
                        ? "bg-indigo-100 text-indigo-800"
                        : "text-gray-700"
                    } hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer transition-all duration-200`}
                    onClick={() => {
                      handleFilterChange("assignedBy", "");
                      setOpenFilter(null);
                    }}
                  >
                    All
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Dynamic Assigned By Names */}
                  {Array.from(
                    new Set(tasks.map((t) => t.assignedBy?.name))
                  ).filter(Boolean).length > 0 ? (
                    Array.from(new Set(tasks.map((t) => t.assignedBy?.name)))
                      .filter(Boolean)
                      .map((name) => (
                        <div
                          key={name}
                          className={`px-4 py-2 text-sm ${
                            filters.assignedBy === name
                              ? "bg-indigo-100 text-indigo-800 font-medium"
                              : "text-gray-700"
                          } hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer transition-all duration-200`}
                          onClick={() => {
                            handleFilterChange("assignedBy", name);
                            setOpenFilter(null);
                          }}
                        >
                          {name}
                        </div>
                      ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-gray-400">
                      No Assigned By Available
                    </div>
                  )}
                </div>
              )}
            </th>

            <th className="py-4 px-6 min-w-[180px] font-semibold">
              Assigned Date
            </th>

            <th
              className="py-4 px-6 min-w-[160px] font-semibold cursor-pointer"
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

            <th className="py-4 px-6 min-w-[120px] font-semibold relative">
              <div className="flex items-center justify-center gap-2">
                <span>
                  Priority
                  {filters.priority && ` (${filters.priority})`}
                </span>
                <FontAwesomeIcon
                  icon={faFilter}
                  className="cursor-pointer"
                  onClick={() => {
                    setOpenFilter(
                      openFilter === "priority" ? null : "priority"
                    );
                  }}
                />
              </div>

              {/* Custom dropdown for Priority */}
              {openFilter === "priority" && (
                <div className="absolute w-40 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-2xl z-30 overflow-hidden animate-fadeIn max-h-60 overflow-y-auto">
                  {["All", "Low", "Medium", "High"].map((option) => (
                    <div
                      key={option}
                      className={`px-4 py-2 text-sm ${
                        filters.priority === (option === "All" ? "" : option)
                          ? "bg-indigo-100 text-indigo-800 font-medium"
                          : "text-gray-700"
                      } hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer transition-all duration-200`}
                      onClick={() => {
                        handleFilterChange(
                          "priority",
                          option === "All" ? "" : option
                        );
                        setOpenFilter(null);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </th>

            <th className="py-4 px-6 min-w-[200px] font-semibold relative">
              <div className="flex items-center justify-center gap-2">
                <span>
                  Status
                  {filters.status && ` (${filters.status})`}
                </span>
                <FontAwesomeIcon
                  icon={faFilter}
                  className="cursor-pointer"
                  onClick={() => {
                    setOpenFilter(openFilter === "status" ? null : "status");
                  }}
                />
              </div>

              {/* Custom dropdown for Status */}
              {openFilter === "status" && (
                <div className="absolute w-40 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-2xl z-30 overflow-hidden animate-fadeIn max-h-60 overflow-y-auto">
                  {["All", "To Do", "In Progress", "Completed", "Overdue"].map(
                    (option) => (
                      <div
                        key={option}
                        className={`px-4 py-2 text-sm ${
                          filters.status === (option === "All" ? "" : option)
                            ? "bg-indigo-100 text-indigo-800 font-medium"
                            : "text-gray-700"
                        } hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer transition-all duration-200`}
                        onClick={() => {
                          handleFilterChange(
                            "status",
                            option === "All" ? "" : option
                          );
                          setOpenFilter(null);
                        }}
                      >
                        {option}
                      </div>
                    )
                  )}
                </div>
              )}
            </th>

            <th className="py-4 px-6 min-w-[100px] font-semibold">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="text-sm text-gray-700">
          {filteredTasks.map((task) => (
            <tr
              key={task._id}
              className="hover:bg-indigo-50 transition duration-300 ease-in-out cursor-pointer border-b border-gray-200"
            >
              <td className="py-4 px-6 font-medium">{task.taskName}</td>
              <td className="py-4 px-6">
                <ReadMoreLess text={task.workDesc} limit={40} />
              </td>

              <td
                className={`py-2 px-6 text-justify bg-gree  ${
                  editingRemark === task._id ? "bg-yellow-50" : ""
                }`} // Highlight when editing
              >
                {editingRemark === task._id ? (
                  // Editable textarea for the remark
                  <div className="flex items-center gap-2 ">
                    <textarea
                      value={remarks[task._id] || ""}
                      onChange={(e) =>
                        setRemarks((prev) => ({
                          ...prev,
                          [task._id]: e.target.value,
                        }))
                      }
                      rows="2"
                      placeholder="Add a remark"
                      className="px-2 py-1 w-40 text-sm border rounded-md text-justify"
                    />
                    <button
                      onClick={() => handleRemarkSave(task._id)}
                      className="bg-green-500 text-white py-1 px-2 rounded-md"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  // Display the remark and pencil icon for editing
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {remarks[task._id] || "No remark"}
                    </span>
                    <FontAwesomeIcon
                      icon={faPen} // Pencil icon
                      className="cursor-pointer text-blue-500 hover:text-blue-700"
                      onClick={() => setEditingRemark(task._id)} // Set task ID as editing state
                    />
                  </div>
                )}
              </td>

              {/* Task Category */}
              <td className="py-4 px-6 font-semibold  text-indigo-600">
                {task.taskCategory || "—"}
              </td>

              {/* Task Code */}
              <td className="py-4 px-6 text-gray-600">
                {task.code || "—"}
              </td>

              {/* Assignees */}
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

              {/* Assigned By */}
              <td className="py-4 px-6 font-medium">
                {task.assignedBy?.name || "—"}
              </td>

              {/* Assigned Date */}
              <td className="py-4 px-6">
                {formatAssignedDate(task.assignedDate)}
              </td>

              {/* Due Date */}
              <td className="py-4 px-6">
                {new Date(task.dueDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>

              {/* Priority */}
              <td className="py-4 px-6">
                <span
                  className={`py-1 px-3 rounded-full text-xs font-semibold ${
                    task.priority === "Low"
                      ? "bg-green-200 text-green-600"
                      : task.priority === "Medium"
                      ? "bg-yellow-200 text-yellow-600"
                      : task.priority === "High"
                      ? "bg-red-200 text-red-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {task.priority}
                </span>
              </td>

              {/* Status */}
              <td className="py-4 px-6 relative">
                {editingStatus === task._id ? (
                  <div className="flex z-1 flex-col w-[20vh] justify-between bg-white absolute shadow-lg rounded-lg">
                    {["To Do", "In Progress", "Completed", "Overdue"].map(
                      (statusOption) => (
                        <span
                          key={statusOption}
                          className={`py-2 px-4 rounded-md text-xs font-semibold cursor-pointer mb-1 ${
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
                            handleStatusChange(task._id, statusOption); // Update status when clicked
                            setEditingStatus(null); // Close dropdown after selection
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
                    onClick={() => setEditingStatus(task._id)} // Start editing when clicked
                  >
                    {task.status}
                  </span>
                )}
              </td>

              {/* Edit Button */}
              <td className="py-4 px-6">
                <button
                  onClick={() => onEdit(task)}
                  className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-md focus:outline-none transition duration-300"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
