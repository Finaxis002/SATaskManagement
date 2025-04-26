import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateTaskStatus, fetchTasks } from "../../redux/taskSlice";

import { io } from "socket.io-client";
const socket = io("https://sataskmanagementbackend.onrender.com"); // Or your backend URL

const TaskList = ({ onEdit, refreshTrigger }) => {
  const [tasks, setTasks] = useState([]);
  const [editingStatus, setEditingStatus] = useState(null); // Track the task being edited
  const [newStatus, setNewStatus] = useState(""); // Store new status value

  // Get user role and email from localStorage
  const role = localStorage.getItem("role");
  const userEmail = localStorage.getItem("userId");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateTaskStatus());
  }, [dispatch]);

  const fetchTasksFromAPI = async () => {
    try {
      const response = await fetch("https://sataskmanagementbackend.onrender.com/api/tasks");
      const data = await response.json();

      if (role !== "admin") {
        const filtered = data.filter((task) =>
          task.assignees.some((a) => a.email === userEmail)
        );
        setTasks(filtered);
      } else {
        setTasks(data);
      }
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
    const date = new Date(assignedDate);
    return date.toLocaleString(); // Format the date as "MM/DD/YYYY, HH:MM:SS"
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

  return (
    <div className="overflow-x-auto h-[77vh] w-[180vh]">
      <table className="min-w-[1300px] w-full table-auto border-collapse text-sm text-gray-800">

       <thead className="bg-gradient-to-r from-blue-200 to-indigo-300 text-black text-sm">
      <tr className="text-left">
        <th className="py-4 px-6 min-w-[180px] font-semibold">Task Name</th>
        <th className="py-4 px-6 min-w-[250px] font-semibold">Task Description</th>
        <th className="py-4 px-6 min-w-[160px] font-semibold">Category</th>
        <th className="py-4 px-6 min-w-[140px] font-semibold">Code</th>
        <th className="py-4 px-6 min-w-[220px] font-semibold">Assignee</th>
        <th className="py-4 px-6 min-w-[180px] font-semibold">Assigned By</th>
        <th className="py-4 px-6 min-w-[180px] font-semibold">Assigned Date</th>
        <th className="py-4 px-6 min-w-[160px] font-semibold">Due Date</th>
        <th className="py-4 px-6 min-w-[120px] font-semibold text-center">Priority</th>
        <th className="py-4 px-6 min-w-[150px] font-semibold text-center">Status</th>
        <th className="py-4 px-6 min-w-[100px] font-semibold text-center">Action</th>
      </tr>
    </thead>

        <tbody className="text-sm text-gray-700">
          {tasks.map((task) => (
            <tr
              key={task._id}
              className="hover:bg-gray-100 transition duration-300 ease-in-out cursor-pointer border-b border-gray-200"
            >
              <td className="py-4 px-6">{task.taskName}</td>
              <td className="py-4 px-6">
                <ReadMoreLess text={task.workDesc} limit={40} />
              </td>

              {/* ✅ Task Category */}
              <td className="py-4 px-6">{task.taskCategory || "—"}</td>

              {/* ✅ Task Code */}
              <td className="py-4 px-6">{task.code || "—"}</td>

              <td className="py-4 px-6 flex flex-wrap gap-2 w-45">
                {task.assignees?.map((assignee) => (
                  <div
                    key={assignee.email}
                    className="text-sm bg-gray-200 text-purple-800 py-1 px-3 rounded-full shadow-md hover:shadow-lg transition duration-200 ease-in-out"
                  >
                    {assignee.name}
                  </div>
                ))}
              </td>

              {/* ✅ Assigned By */}
              <td className="py-4 px-6">{task.assignedBy?.name || "—"}</td>

              <td className="py-4 px-6">
                {formatAssignedDate(task.assignedDate)}
              </td>
              <td className="py-4 px-6">
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </td>
              <td className="py-4 px-6 ">
                <span
                  className={`py-1 px-3 rounded-full text-xs font-semibold ${
                    task.priority === "Low"
                      ? "bg-green-200 text-green-600"
                      : task.priority === "Medium"
                      ? "bg-yellow-200 text-yellow-600"
                      : task.priority === "High"
                      ? "bg-red-200 text-red-600"
                      : ""
                  }`}
                >
                  {task.priority}
                </span>
              </td>

              <td className="py-4 px-6 w-40 relative " >
                {editingStatus === task._id ? (
                  // If status is being edited, show all options as inline clickable spans
                  <div className="flex z-1 flex-col w-[20vh] justify-between bg-white absolute">
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
                  // Display status normally when not editing
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
