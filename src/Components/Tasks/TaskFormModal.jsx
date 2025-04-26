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
  const [tasks, setTasks] = useState("");
  const [taskCategory, setTaskCategory] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("");
  const [clientName, setClientName] = useState("");
  const [code, setCode] = useState("");
  const [newCode, setNewCode] = useState("");

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
      );
      setPriority(initialData.priority || "Medium");
      setStatus(initialData.status || "To Do");
      setAssignees(initialData.assignees || []);
      setClientName(initialData.clientName || "");
      setTaskCategory(initialData.taskCategory || "");
      setCode(initialData.code || "");
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
      taskCategory: taskCategory === "__new" ? newTaskCategory : taskCategory,
      clientName,
      code: code === "__new" ? newCode : code,
      assignedBy: {
        name: localStorage.getItem("name"),
        email: localStorage.getItem("userId"),
      }
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
        onSave(updatedTask); // Pass the updated task to the parent to update the tasks state
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
        onSave(updatedTask); // Pass the new task to the parent to update the tasks state
      }

      // Check if the response is not OK
      if (!response.ok) {
        console.error(
          "Failed to save task, server responded with:",
          response.statusText
        );
        throw new Error("Failed to save task");
      }

      alert(
        initialData
          ? "Task updated successfully!"
          : "Task created successfully!"
      );

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
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
  <h3 className="text-lg font-semibold mb-4 text-center">
    {initialData ? "Update Task" : "Create Task"}
  </h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
    {/* Task Name */}
    <input
      type="text"
      placeholder="Task name"
      value={taskName}
      onChange={(e) => setTaskName(e.target.value)}
      className="p-2 border border-gray-300 rounded-md"
    />

    {/* Work Description */}
    <input
      type="text"
      placeholder="Work Description"
      value={workDesc}
      onChange={(e) => setWorkDesc(e.target.value)}
      className="p-2 border border-gray-300 rounded-md"
    />

    {/* Task Category */}
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1 block">Task Category:</label>
      <select
        value={taskCategory}
        onChange={(e) => setTaskCategory(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
      >
        <option value="">Select category</option>
        <option value="marketing">Marketing</option>
        <option value="operations">Operations</option>
        <option value="sales">Sales</option>
        <option value="__new">+ Add new</option>
      </select>
      {taskCategory === "__new" && (
        <input
          type="text"
          placeholder="Enter new category"
          className="mt-2 p-2 border border-gray-300 rounded-md"
          onChange={(e) => setNewTaskCategory(e.target.value)}
        />
      )}
    </div>

    {/* Client Name */}
    <input
      type="text"
      placeholder="Client Name"
      value={clientName}
      onChange={(e) => setClientName(e.target.value)}
      className="p-2 border border-gray-300 rounded-md"
    />

    {/* Task Code */}
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1 block">Task Code:</label>
      <select
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
      >
        <option value="">Select code</option>
        <option value="report">Report</option>
        <option value="registration">Registartion</option>
        <option value="__new">+ Add new</option>
      </select>
      {code === "__new" && (
        <input
          type="text"
          placeholder="Enter new code"
          className="mt-2 p-2 border border-gray-300 rounded-md"
          onChange={(e) => setNewCode(e.target.value)}
        />
      )}
    </div>

   

    {/* Due Date */}
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1 block">Due Date:</label>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
      />
    </div>

    {/* Priority */}
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1 block">Priority:</label>
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
    </div>

    {/* Status */}
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1 block">Status:</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
      >
        <option>To Do</option>
        <option>In Progress</option>
        <option>Completed</option>
        <option>Overdue</option>
      </select>
    </div>

    {/* Overdue Note */}
    {status === "Overdue" && (
      <textarea
        placeholder="Enter reason for overdue"
        onChange={(e) => setOverdueNote(e.target.value)}
        className="col-span-2 p-2 border border-gray-300 rounded-md"
      />
    )}
  </div>

  {/* Assignees (Below the grid) */}
  <div className="mt-6">
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
          const employee = employees.find((emp) => emp.email === option.value);
          return { name: employee.name, email: employee.email };
        });
        setAssignees(selectedAssignees);
      }}
      className="w-full"
      classNamePrefix="react-select"
    />
  </div>

  {/* Action Buttons */}
  <div className="flex justify-start gap-4 mt-6">
    <button
      onClick={onClose}
      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
    >
      Cancel
    </button>
    <button
      onClick={handleSubmit}
      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
    >
      {initialData ? "Update" : "Add"}
    </button>
  </div>
</div>

    </div>
  );
};

export default TaskFormModal;
