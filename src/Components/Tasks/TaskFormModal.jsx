import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssignees, fetchTasks, updateTask } from "../../redux/taskSlice";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import TaskCodeSelector from "./TaskCodeSelector";
import DepartmentSelector from "./DepartmentSelector";
import { io } from "socket.io-client";
import { showAlert } from "../../utils/alert";
import axios from 'axios';

const socket = io("https://taskbe.sharda.co.in", {
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
  const [isRepetitive, setIsRepetitive] = useState(false);
  const [showRepeatPopup, setShowRepeatPopup] = useState(false);
  const [repeatType, setRepeatType] = useState("Daily");
  const [customRepeat, setCustomRepeat] = useState({
    day: "",
    month: "",
  });
  const [assignedByUser, setAssignedByUser] = useState(null);
  

  const employees = useSelector((state) => state.tasks.assignees);
  // const adminUsers = employees.filter(emp => emp.role === "admin");
  // const adminOptions = adminUsers.map(emp => ({
  //   label: `${emp.name} (${emp.email})`,
  //   value: emp.email,
  // }));
  const adminOptions = employees.map((emp) => ({
    label: `${emp.name} (${emp.email})`,
    value: emp.email,
  }));

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
      setIsRepetitive(initialData.isRepetitive || false);
      setRepeatType(initialData.repeatType || "Monthly");
      setCustomRepeat({
        day: initialData.repeatDay ? initialData.repeatDay.toString() : "",
        month: initialData.repeatMonth
          ? initialData.repeatMonth.toString()
          : "",
      });
      setAssignedByUser({
        label: `${initialData.assignedBy.name} (${initialData.assignedBy.email})`,
        value: initialData.assignedBy.email,
      });
    }
  }, [initialData]);

  useEffect(() => {
    // const fetchClients = async () => {
    //   try {
    //     const token = localStorage.getItem("authToken");
    //     const res = await fetch(
    //       "https://taskbe.sharda.co.in/api/clients", {
    //     headers: {
    //       Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    //     },
    //   }
    //     );
    //     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    //     const data = await res.json();
    //     const formattedClients = Array.isArray(data)
    //       ? data.map((client) => ({
    //           label: client.name || client,
    //           value: client.name || client,
    //         }))
    //       : [];
    //     setClientOptions(formattedClients);
    //   } catch (err) {
    //     console.error("Failed to fetch clients", err);
    //   }
    // };
    const fetchClients = async () => {
  
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get("https://taskbe.sharda.co.in/api/clients", {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-app-client": "frontend-authenticated",
      },
    });

    const data = response.data;

    const formattedClients = Array.isArray(data)
      ? data.map((client) => ({
          label: client.name || client,
          value: client.name || client,
        }))
      : [];

    setClientOptions(formattedClients);
  } catch (err) {
         console.error("Failed to fetch clients", err);
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
      assignedBy: assignedByUser
        ? {
            name: employees.find((user) => user.email === assignedByUser.value)
              ?.name,
            email: assignedByUser.value,
          }
        : {
            name: localStorage.getItem("name"),
            email: localStorage.getItem("userId"),
          },
      createdBy: {
        name: localStorage.getItem("name"),
        email: localStorage.getItem("userId"),
      },
      isRepetitive,
    };

    if (initialData) {
      taskPayload.updatedBy = {
        name: localStorage.getItem("name"),
        email: localStorage.getItem("userId"),
      };
    }

    // ➕ Repeat Settings (DO NOT send `nextRepetitionDate` or `nextDueDate`)
    if (isRepetitive) {
      taskPayload.repeatType = repeatType;

      if (!["Daily"].includes(repeatType)) {
        taskPayload.repeatDay = Number(customRepeat.day);
      }

    if (repeatType === "Annually") {
      taskPayload.repeatMonth = Number(customRepeat.month);
    }

      if (repeatType === "Annually") {
        taskPayload.repeatMonth = Number(customRepeat.month);
      }

      // ❌ DO NOT send nextRepetitionDate or nextDueDate — backend handles this
    } else {
      taskPayload.repeatType = null;
      taskPayload.repeatDay = null;
      taskPayload.repeatMonth = null;
    }

    try {
      setIsSubmitting(true);
      const url = initialData
        ? `https://taskbe.sharda.co.in/api/tasks/${initialData._id}`
        : "https://taskbe.sharda.co.in/api/tasks";

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
        console.error("Backend error response:", result);
        throw new Error(result.message || "Failed to create task");
      }

      showAlert(
        initialData
          ? "Task updated successfully!"
          : result.message || "Task created successfully!"
      );

    if (!initialData) {
      socket.emit("new-task-created", { taskId: result.task._id });
    }

      onSave(result.task);
      onClose();
    } catch (error) {
      console.error("❌ Submission error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = taskCategory
    ? employees.filter(
        (emp) => emp.department?.toLowerCase() === taskCategory.toLowerCase()
      )
    : employees;

  const assigneeOptions = filteredEmployees.map((emp) => ({
    label: `${emp.name} (${emp.email})`,
    value: emp.email,
  }));

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-40 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">
              {initialData ? "Update Task" : "Create New Task"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Work Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Description
              </label>
              <input
                type="text"
                placeholder="Enter work description"
                value={workDesc}
                onChange={(e) => setWorkDesc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Department
              </label>
              <DepartmentSelector
                selectedDepartments={department}
                setSelectedDepartments={setDepartment}
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              {/* <CreatableSelect
                isClearable
                isSearchable
                options={clientOptions}
                onChange={(selectedOption) => {
                  setClientName(selectedOption?.value || "");
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
                classNamePrefix="select"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "42px",
                    borderColor: "#d1d5db",
                    "&:hover": {
                      borderColor: "#d1d5db",
                    },
                  }),
                }}
              /> */}
              <Select
    isClearable
    isSearchable
    options={clientOptions}
    onChange={(selectedOption) => {
      setClientName(selectedOption?.value || "");
    }}
    value={
      clientName
        ? clientOptions.find((opt) => opt.value === clientName) || null
        : null
    }
    placeholder="Select client..."
    className="text-sm"
    classNamePrefix="select"
    styles={{
      control: (base) => ({
        ...base,
        minHeight: "42px",
        borderColor: "#d1d5db",
        "&:hover": {
          borderColor: "#d1d5db",
        },
      }),
    }}
  />
            </div>

            {/* Task Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Code
              </label>
              <TaskCodeSelector
                selectedCode={taskCode}
                setSelectedCode={setTaskCode}
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Abbstulate">Abbstulate</option>
              </select>
            </div>

            {/* Repetitive Task Toggle */}
            <div className="flex items-center gap-3 col-span-1 md:col-span-2">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isRepetitive}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsRepetitive(checked);
                      if (checked) {
                        setRepeatType("Monthly");
                        setCustomRepeat({
                          day: new Date().getDate().toString(),
                        });
                        setShowRepeatPopup(true);
                      } else {
                        setShowRepeatPopup(false);
                        setCustomRepeat({ day: "", month: "" });
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-all duration-300"></div>
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform peer-checked:translate-x-full transition-all duration-300"></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {isRepetitive
                    ? "This is a repetitive task"
                    : "Is this a repetitive task?"}
                </span>
              </label>
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to <span className="text-red-500">*</span>
            </label>
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
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "42px",
                  borderColor: "#d1d5db",
                  "&:hover": {
                    borderColor: "#d1d5db",
                  },
                }),
                menu: (provided) => ({
                  ...provided,
                  maxHeight: "200px",
                  overflowY: "auto",
                }),
                menuList: (provided) => ({
                  ...provided,
                  maxHeight: "200px",
                  overflowY: "auto",
                }),
              }}
              placeholder="Select team members..."
            />
          </div>

          {/* Assigned By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned By (Admin)
            </label>
            <Select
              options={adminOptions}
              isClearable
              value={assignedByUser}
              onChange={(selected) => setAssignedByUser(selected)}
              placeholder="Select Admin..."
              className="w-full"
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "42px",
                  borderColor: "#d1d5db",
                  "&:hover": {
                    borderColor: "#d1d5db",
                  },
                }),
                menu: (provided) => ({
                  ...provided,
                  maxHeight: "250px",
                  overflowY: "auto",
                  position: "absolute", // Ensure proper positioning
                  zIndex: 9999,
                }),
                menuList: (provided) => ({
                  ...provided,
                  maxHeight: "250px",
                  padding: 0,
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }), // For portal positioning
                option: (provided) => ({
                  ...provided,
                  padding: "8px 12px",
                }),
              }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {initialData ? "Updating..." : "Creating..."}
              </span>
            ) : initialData ? (
              "Update Task"
            ) : (
              "Create Task"
            )}
          </button>
        </div>
      </div>

      {/* Repetition Settings Popup */}
      {showRepeatPopup && (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Repetition Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repeat Type:
                </label>
                <select
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {repeatType === "Annually" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-4 py-2 text-gray-700 font-medium hover:text-red-600"
                onClick={() => {
                  setIsRepetitive(false);
                  setShowRepeatPopup(false);
                  setCustomRepeat({ day: "", month: "" });
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => {
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
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFormModal;
