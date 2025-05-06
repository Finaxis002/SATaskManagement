import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssignees, fetchTasks, updateTask } from "../../redux/taskSlice"; // Adjust the import path
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import TaskCodeSelector from "./TaskCodeSelector";
import DepartmentSelector from "./DepartmentSelector";

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
  const [department, setDepartment] = useState([]);
  const [taskCode, setTaskCode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientOptions, setClientOptions] = useState([]);
  const [overdueNote, setOverdueNote] = useState("");
  const [repeatType, setRepeatType] = useState("Does not repeat");

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
      setTaskCode(
        initialData.code
          ? { label: initialData.code, value: initialData.code }
          : null
      );
      setDepartment(initialData.department || []);
    }
  }, [initialData]);

  // Replace your current fetchClients useEffect with this:
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(
          "https://sataskmanagementbackend.onrender.com/api/clients"
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Clients data:", data); // Debug log

        // Ensure the data is in the expected format
        const formattedClients = Array.isArray(data)
          ? data.map((client) => ({
              label: client.name || client, // Handle both object and string responses
              value: client.name || client,
            }))
          : [];

        setClientOptions(formattedClients);
      } catch (err) {
        console.error("Failed to fetch clients", err);
        // Add error state to show to user if needed
      }
    };

    fetchClients();
  }, []);

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
      department,
      // code: code === "__new" ? newCode : code,
      code: taskCode ? taskCode.value : "",
      assignedBy: {
        name: localStorage.getItem("name"),
        email: localStorage.getItem("userId"),
      },
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
        response = await fetch(
          "https://sataskmanagementbackend.onrender.com/api/tasks",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskPayload),
          }
        );
        updatedTask = await response.json(); // Get the newly created task

        // Emit a socket event to inform that a new task was created and unread count may need updating
        socket.emit("new-task-created", { taskId: updatedTask._id });

        // Dispatch updateTask action to update Redux state immediately
        dispatch(updateTask(updatedTask));

        // Update local state directly for immediate UI update in parent component
        onSave(updatedTask); // Pass the new task to the parent to update the tasks state
      }

      // Check if the response is not OK
      //     if (!response.ok) {
      //       // console.error(
      //       //   "Failed to save task, server responded with:",
      //       //   response.statusText
      //       // );
      //       const text = await response.text();
      // console.error("❌ Failed to save task - status:", response.status);
      // console.error("❌ Response body:", text);
      // throw new Error("Failed to save task");

      //     }
      if (!response.ok) {
        console.error("❌ Task save failed", {
          status: response.status,
          response: responseData,
        });
        throw new Error(responseData.message || "Failed to save task");
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
      // alert("Error saving task");
    }
  };

  // Filter employees according to selected taskCategory
  const filteredEmployees = taskCategory
    ? employees.filter(
        (emp) => emp.department?.toLowerCase() === taskCategory.toLowerCase()
      )
    : employees;

  // Format for react-select
  const assigneeOptions = filteredEmployees.map((emp) => ({
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

          {/* Department Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Task Department:
            </label>
            <DepartmentSelector
              selectedDepartments={department}
              setSelectedDepartments={setDepartment}
            />
          </div>

          {/* Client Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Client Name:
            </label>
            <CreatableSelect
              isClearable
              isSearchable
              options={clientOptions}
              onChange={(selectedOption) => {
                if (!selectedOption) {
                  setClientName("");
                } else {
                  setClientName(selectedOption.value);
                }
              }}
              value={
                clientName
                  ? clientOptions.find((opt) => opt.value === clientName) || {
                      label: clientName,
                      value: clientName,
                    }
                  : null
              }
              placeholder="Select or create client..."
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Task Code:
            </label>
            <TaskCodeSelector
              selectedCode={taskCode}
              setSelectedCode={setTaskCode}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Due Date:
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Repeat Type */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Repeat:
            </label>
            <select
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option>Does not repeat</option>
              <option>Daily</option>
              <option>Weekly on selected day</option>
              <option>Monthly on date</option>
              <option>Annually</option>
              <option>Every weekday (Mon–Fri)</option>
              <option>Custom</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Priority:
            </label>
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
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Status:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Overdue</option>
              <option>Abbstulate</option>
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
                const employee = employees.find(
                  (emp) => emp.email === option.value
                );
                return { name: employee.name, email: employee.email };
              });
              setAssignees(selectedAssignees);
            }}
            className="w-full"
            classNamePrefix="react-select"
            styles={{
              control: (provided) => ({
                ...provided,
                height: "20px", // Adjust the height of the control (input box)
              }),
              menu: (provided) => ({
                ...provided,
                maxHeight: "200px", // Maximum height for the dropdown menu
                overflowY: "auto", // Enable vertical scrolling
              }),
              menuList: (provided) => ({
                ...provided,
                maxHeight: "100px", // Apply max height to the list of options
                overflowY: "auto", // Enable scrolling within the dropdown
              }),
            }}
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
          {/* <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {initialData ? "Update" : "Add"}
          </button> */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Processing..." : initialData ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;
