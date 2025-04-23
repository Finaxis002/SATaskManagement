import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
// Assume socket.io client setup
const socket = io("https://sataskmanagementbackend.onrender.com", {
  withCredentials: true,
});



const TaskList = ({ onEdit ,refreshTrigger }) => {
  const [tasks, setTasks] = useState([]);
  const [editingStatus, setEditingStatus] = useState(null); // Track the task being edited
  const [newStatus, setNewStatus] = useState(""); // Store new status value



  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("https://sataskmanagementbackend.onrender.com/api/tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [refreshTrigger]); // Refetch tasks when refreshTrigger changes


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
  

  return (
    <div className="h-full bg-white rounded-lg shadow-md divide-y">
      <table className="w-full h-full table-auto shadow-lg rounded-lg  border-collapse relative">
        <thead className="bg-gradient-to-r from-blue-200 to-indigo-300 text-black text-sm">
          <tr className="text-left">
            <th className="py-4 px-6 text-sm font-semibold">Task Name</th>
            <th className="py-4 px-6 text-sm font-semibold">
              Task Description
            </th>
            <th className="py-4 px-6 text-sm font-semibold">Assignee</th>
            <th className="py-4 px-6 text-sm font-semibold">Assigned Date</th>
            <th className="py-4 px-6 text-sm font-semibold">Due Date</th>
            <th className="py-4 px-6 text-sm font-semibold">Priority</th>
            <th className="py-4 px-6 text-sm font-semibold">Status</th>
            <th className="py-4 px-6 text-sm font-semibold">Action</th>
          </tr>
        </thead>

        <tbody className="text-sm text-gray-700">
          {tasks.map((task) => (
            <tr
              key={task._id}
              className="hover:bg-gray-100 transition duration-300 ease-in-out cursor-pointer border-b border-gray-200"
            >
              <td className="py-4 px-6">{task.taskName}</td>
              <td className="py-4 px-6">{task.workDesc}</td>
              <td className="py-4 px-6 flex flex-wrap gap-2 w-45">
                {task.assignees?.map((assignee) => (
                  <div
                    key={assignee.email}
                    className="text-sm bg-gray-200 text-gray-800 py-1 px-3 rounded-full shadow-md hover:shadow-lg transition duration-200 ease-in-out"
                  >
                    {assignee.name}
                  </div>
                ))}
              </td>

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

              <td className="py-4 px-6 w-35">
                {editingStatus === task._id ? (
                  // If status is being edited, show all options as inline clickable spans
                  <div className="flex z-1 flex-col w-[15vh] justify-between absolute bg-white">
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
