import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssignees, fetchTasks, updateTask } from "../../redux/taskSlice"; // Adjust the import path
import Select from "react-select";

import { io } from "socket.io-client";
// Assume socket.io client setup
const socket = io("https://sataskmanagementbackend.onrender.com", {
  withCredentials: true,
});

const TaskFormModal = ({ onClose, onSave, initialData }) => {
  const dispatch = useDispatch();

  // State for task fields
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("To Do");
  const [assignees, setAssignees] = useState([]);
  const [workDesc, setWorkDesc] = useState("");
  const [tasks , setTasks] = useState("");

  // Fetch assignees (employees) from the backend
  const employees = useSelector((state) => state.tasks.assignees);

  useEffect(() => {
    dispatch(fetchAssignees());
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setTaskName(initialData.taskName || "");
      setWorkDesc(initialData.workDesc || "");
      setDueDate(
        initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split("T")[0]
          : ""
      ); // Ensure proper date format (YYYY-MM-DD)
      setPriority(initialData.priority || "Medium");
      setStatus(initialData.status || "To Do");
      setAssignees(initialData.assignees || []);
    }
  }, [initialData]);

  // Handling form submit
  const handleSubmit = async () => {
    // Validate form fields
    if (!taskName || !dueDate || assignees.length === 0) {
      return alert("Please fill all fields.");
    }
  
    // Prepare payload
    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };
  
    const taskPayload = {
      taskName,
      workDesc,
      assignees,
      assignedDate: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      priority,
      status,
      overdueNote: status === "Overdue" ? overdueNote : "",
      updatedBy,
    };
  
    try {
      let response;
      let updatedTask;
  
      if (initialData) {
        // If there's a task to update, make a PUT request
        response = await fetch(
          `https://sataskmanagementbackend.onrender.com/api/tasks/${initialData._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskPayload),
          }
        );
        updatedTask = await response.json(); // Get the updated task
  
        // Emit a socket event to inform that the task was updated and unread count may need updating

        // Dispatch updateTask action to update Redux state immediately
        dispatch(updateTask(updatedTask));
  
        // Update local state directly for immediate UI update in parent component
        onSave(updatedTask);  // Pass the updated task to the parent to update the tasks state
      } else {
        // If no task to update, make a POST request
        response = await fetch("https://sataskmanagementbackend.onrender.com/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskPayload),
        });
        updatedTask = await response.json(); // Get the newly created task
  
        // Emit a socket event to inform that a new task was created and unread count may need updating
        socket.emit("new-task-created", { taskId: updatedTask._id });
  
        // Dispatch updateTask action to update Redux state immediately
        dispatch(updateTask(updatedTask));
  
        // Update local state directly for immediate UI update in parent component
        onSave(updatedTask);  // Pass the new task to the parent to update the tasks state
      }
  
      // Check if the response is not OK
      if (!response.ok) {
        console.error("Failed to save task, server responded with:", response.statusText);
        throw new Error("Failed to save task");
      }
  
      alert(initialData ? "Task updated successfully!" : "Task created successfully!");
  
      // Close the form and reset the form fields
      onClose(); // Close the modal after successful submission
  
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Error saving task");
    }
  };
  
  

  // Format options for react-select
  const assigneeOptions = employees.map((emp) => ({
    label: `${emp.name} (${emp.email})`,
    value: emp.email,
  }));

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2 text-center">
          {initialData ? "Update Task" : "Create Task"}
        </h3>

        {/* Task Name */}
        <input
          type="text"
          placeholder="Task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Work Description */}
        <input
          type="text"
          placeholder="Work Description"
          value={workDesc}
          onChange={(e) => setWorkDesc(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Assignees (Multiple Selection using react-select) */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">Assign to:</label>
          <Select
            isMulti
            name="assignees"
            options={assigneeOptions}
            value={assignees.map((assignee) => ({
              label: `${assignee.name} (${assignee.email})`,
              value: assignee.email,
            }))}
            onChange={(selectedOptions) => {
              const selectedAssignees = selectedOptions.map((option) => {
                const employee = employees.find(
                  (emp) => emp.email === option.value
                );
                return { name: employee.name, email: employee.email };
              });
              setAssignees(selectedAssignees);
            }}
            className="w-full mb-4"
            classNamePrefix="react-select"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Due Date */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">
              Due Date:
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">
              Priority:
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700">
              Status:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Overdue</option>
            </select>
          </div>

          {/* Overdue Note */}
          {status === "Overdue" && (
            <div className="flex flex-col col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Overdue Reason:
              </label>
              <textarea
                placeholder="Enter reason for overdue"
                onChange={(e) => setOverdueNote(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
          )}

          {/* Action Buttons */}
        </div>
        <div className="flex justify-start gap-4 mt-2">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
          >
            {initialData ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;
