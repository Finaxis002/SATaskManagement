import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssignees, fetchTasks, updateTask } from "../../redux/taskSlice"; // Adjust the import path
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import TaskCodeSelector from "./TaskCodeSelector";
import DepartmentSelector from "./DepartmentSelector";

import { io } from "socket.io-client";
import { showAlert } from "../../utils/alert"; // Import the showAlert function
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
  const [isRepetitive, setIsRepetitive] = useState(false);
  const [showRepeatPopup, setShowRepeatPopup] = useState(false);
  const [repeatType, setRepeatType] = useState("Daily");
  const [customRepeat, setCustomRepeat] = useState({
    day: "",
    month: "",
  });

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

      // 🔥 ADD THIS BLOCK to initialize repetition-related values
      setIsRepetitive(initialData.isRepetitive || false);
      setRepeatType(initialData.repeatType || "Monthly");
      setCustomRepeat({
        day: initialData.repeatDay ? initialData.repeatDay.toString() : "",
        month: initialData.repeatMonth
          ? initialData.repeatMonth.toString()
          : "",
      });
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

  const handleSubmit = async () => {
    if (!taskName || !dueDate || assignees.length === 0) {
      return alert("Please fill all required fields.");
    }

    const taskPayload = {
      taskName,
      workDesc,
      assignees: assignees.map((a) => ({ name: a.name, email: a.email })),
      assignedDate: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      priority,
      status,
      taskCategory: taskCategory === "__new" ? newTaskCategory : taskCategory,
      clientName,
      department: Array.isArray(department) ? department : [department],
      code: taskCode?.value || "",
      assignedBy: {
        name: localStorage.getItem("name"),
        email: localStorage.getItem("userId"),
      },
      isRepetitive,
    };
    
    // ✅ Add this 👇 to ensure updatedBy goes when it's an update
    if (initialData) {
      taskPayload.updatedBy = {
        name: localStorage.getItem("name"),
        email: localStorage.getItem("userId"),
      };
    }
    

    if (isRepetitive) {
      taskPayload.repeatType = repeatType;

      if (!["Daily", "Every 5 Minutes"].includes(repeatType)) {
        taskPayload.repeatDay = Number(customRepeat.day);
      }

      if (repeatType === "Annually") {
        taskPayload.repeatMonth = Number(customRepeat.month);
      }

      taskPayload.nextRepetitionDate = new Date(dueDate).toISOString();
    }

    try {
      setIsSubmitting(true);

      const url = initialData
        ? `https://sataskmanagementbackend.onrender.com/api/tasks/${initialData._id}`
        : "https://sataskmanagementbackend.onrender.com/api/tasks";

      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(taskPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create task");
      }

      showAlert(
        initialData
          ? "Task updated successfully!"
          : "Task created successfully!"
      );
      console.log("✅ Task saved successfully:", result);

      if (!initialData) {
        socket.emit("new-task-created", { taskId: result._id });
      }


      onSave(result);
      onClose();
    } catch (error) {
      console.error("❌ Submission error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
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

          <div className="flex items-center gap-3 mt-4">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isRepetitive}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsRepetitive(checked);

                    // Log the new state to check if it's correctly updated
                    console.log("Updated isRepetitive state:", checked);

                    if (checked) {
                      setRepeatType("Monthly");
                      setCustomRepeat({ day: new Date().getDate().toString() }); // Default to today's day
                      setShowRepeatPopup(true);
                    } else {
                      setShowRepeatPopup(false);
                      setCustomRepeat({ day: "", month: "" });
                    }
                  }}
                  className="sr-only peer"
                />

                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:bg-indigo-600 transition-all duration-300"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform peer-checked:translate-x-full transition-all duration-300"></div>
              </div>
              <span className="ml-3 text-sm text-gray-800">
                {isRepetitive
                  ? "This is a repetitive task"
                  : "Is this a repetitive task?"}
              </span>
            </label>
          </div>

          {showRepeatPopup && (
            <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg shadow p-6 w-[350px] relative">
                <h3 className="text-lg font-bold mb-4 text-center text-indigo-800">
                  Repetition Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Repeat Type:
                    </label>
                    <select
                      value={repeatType}
                      onChange={(e) => setRepeatType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Every 6 Months">Every 6 Months</option>
                      <option value="Annually">Annually</option>
                    </select>
                  </div>

                  {repeatType !== "Daily" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Day of month (1-31):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={customRepeat.day}
                        onChange={(e) =>
                          setCustomRepeat({
                            ...customRepeat,
                            day: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  )}

                  {repeatType === "Annually" && (
                    <div>
                     


                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Month:
                      </label>
                      <select
                        value={customRepeat.month}
                        onChange={(e) =>
                          setCustomRepeat({
                            ...customRepeat,
                            month: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Month</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString("default", {
                              month: "long",
                            })}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="text-gray-600 hover:text-red-600"
                    onClick={() => {
                      setIsRepetitive(false);
                      setShowRepeatPopup(false);
                      setCustomRepeat({ day: "", month: "" });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    onClick={() => {
                      // Validate before closing
                      if (
                        !["Daily", "Every 5 Minutes"].includes(repeatType) &&
                        !customRepeat.day
                      ) {
                        alert("Please select a day");
                        return;
                      }

                      if (repeatType === "Annually" && !customRepeat.month) {
                        alert("Please select a month");
                        return;
                      }
                      setShowRepeatPopup(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
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
