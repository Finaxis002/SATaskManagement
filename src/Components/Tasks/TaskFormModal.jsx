import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssignees } from "../../redux/taskSlice";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import TaskCodeSelector from "./TaskCodeSelector";
import DepartmentSelector from "./DepartmentSelector";
import { io } from "socket.io-client";
import { showAlert } from "../../utils/alert";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import CreateClientModal from "../client/CreateClientModal";

const socket = io("https://taskbe.sharda.co.in", { withCredentials: true });

const selectBaseStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 12,
    borderColor: state.isFocused ? "#a5b4fc" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(99,102,241,0.25)" : "none",
    ":hover": { borderColor: "#a5b4fc" },
    fontSize: 14,
    fontFamily: "Inter, ui-sans-serif, system-ui",
    background: "#fff",
  }),
  valueContainer: (base) => ({ ...base, padding: "4px 10px" }),
  input: (base) => ({ ...base, fontSize: 14, color: "#0f172a" }),
  singleValue: (base) => ({
    ...base,
    fontSize: 14,
    fontWeight: 500,
    color: "#0f172a",
  }),
  placeholder: (base) => ({ ...base, color: "#94a3b8" }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#6366f1" : "#94a3b8",
    padding: "2px 8px",
  }),
  clearIndicator: (base) => ({ ...base, padding: "2px 8px", color: "#cbd5e1" }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: (base) => ({
    ...base,
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 14px 40px rgba(2,8,23,0.15)",
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    padding: "10px 12px",
    background: state.isSelected
      ? "#eef2ff"
      : state.isFocused
      ? "#f8fafc"
      : "#fff",
    color: "#0f172a",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 99999 }),
};

const TaskFormModal = ({ onClose, onSave, initialData }) => {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.tasks.assignees);

  const [isLoadingFullData, setIsLoadingFullData] = useState(false);
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
  const [clientId, setClientId] = useState("");
  const [code, setCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [department, setDepartment] = useState([]);
  const [taskCode, setTaskCode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientOptions, setClientOptions] = useState([]);
  const [isRepetitive, setIsRepetitive] = useState(false);
  const [showRepeatPopup, setShowRepeatPopup] = useState(false);
  const [repeatType, setRepeatType] = useState("Daily");
  const [customRepeat, setCustomRepeat] = useState({ day: "", month: "" });
  const [assignedByUser, setAssignedByUser] = useState(null);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [tempNewClientName, setTempNewClientName] = useState("");
  const [agents, setAgents] = useState([]);
  const [fullTaskData, setFullTaskData] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    const fetchCompleteTaskData = async () => {
      if (initialData && initialData._id && !hasAttemptedFetch) {
        console.log("🔍 Edit mode detected. Fetching complete task data...");
        setIsLoadingFullData(true);
        setHasAttemptedFetch(true);

        try {
          const token =
            localStorage.getItem("authToken") || localStorage.getItem("token");
          const response = await fetch(
            `https://taskbe.sharda.co.in/api/tasks/${initialData._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "x-app-client": "frontend-authenticated",
              },
            }
          );

          if (response.ok) {
            const fullData = await response.json();
            console.log("✅ COMPLETE Task data fetched:", fullData);
            console.log("✅ Client Name from API:", fullData.clientName);
            console.log("✅ Client ID from API:", fullData.clientId);

            setFullTaskData(fullData);
            setTaskName(fullData.taskName || initialData.taskName || "");
            setWorkDesc(fullData.workDesc || initialData.workDesc || "");
            setDueDate(
              fullData.dueDate
                ? new Date(fullData.dueDate).toISOString().split("T")[0]
                : initialData.dueDate
                ? new Date(initialData.dueDate).toISOString().split("T")[0]
                : ""
            );
            setPriority(fullData.priority || initialData.priority || "Medium");
            setStatus(fullData.status || initialData.status || "To Do");
            setAssignees(fullData.assignees || initialData.assignees || []);
            setTaskCategory(
              fullData.taskCategory || initialData.taskCategory || ""
            );
            setTaskCode(
              fullData.code
                ? { label: fullData.code, value: fullData.code }
                : initialData.code
                ? { label: initialData.code, value: initialData.code }
                : null
            );
            setDepartment(fullData.department || initialData.department || []);
            setIsRepetitive(
              fullData.isRepetitive !== undefined
                ? fullData.isRepetitive
                : initialData.isRepetitive || false
            );
            setRepeatType(
              fullData.repeatType || initialData.repeatType || "Monthly"
            );

            const finalClientName =
              fullData.clientName || initialData.clientName || "";
            const finalClientId =
              fullData.clientId || initialData.clientId || "";

            if (finalClientName) {
              console.log("🎯 Setting clientName:", finalClientName);
              console.log(
                "🎯 Setting clientId:",
                finalClientId || "No ID found"
              );
              setClientName(finalClientName);
              setClientId(finalClientId);
            } else {
              console.error("❌ No clientName in API response or initialData!");
            }

            setCustomRepeat({
              day: fullData.repeatDay
                ? fullData.repeatDay.toString()
                : initialData.repeatDay
                ? initialData.repeatDay.toString()
                : "",
              month: fullData.repeatMonth
                ? fullData.repeatMonth.toString()
                : initialData.repeatMonth
                ? initialData.repeatMonth.toString()
                : "",
            });

            setAssignedByUser(
              fullData.assignedBy || initialData.assignedBy
                ? {
                    label: `${
                      (fullData.assignedBy || initialData.assignedBy).name
                    } (${
                      (fullData.assignedBy || initialData.assignedBy).email
                    })`,
                    value: (fullData.assignedBy || initialData.assignedBy)
                      .email,
                  }
                : null
            );
          } else {
            console.error("❌ API returned error:", response.status);
            useInitialDataDirectly();
          }
        } catch (error) {
          console.error("❌ Failed to fetch complete task:", error);
          useInitialDataDirectly();
        } finally {
          setIsLoadingFullData(false);
        }
      } else if (!initialData) {
        console.log("✅ New task mode - no fetch needed");
      }
    };

    const useInitialDataDirectly = () => {
      if (initialData) {
        console.log("⚠️ Using initialData directly as fallback");
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

        if (initialData.clientName) {
          setClientName(initialData.clientName);
          setClientId(initialData.clientId || "");
          console.log(
            "✅ Client set from initialData:",
            initialData.clientName
          );
        }

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

        setAssignedByUser(
          initialData.assignedBy
            ? {
                label: `${initialData.assignedBy.name} (${initialData.assignedBy.email})`,
                value: initialData.assignedBy.email,
              }
            : null
        );
      }
    };

    fetchCompleteTaskData();
  }, [initialData?._id, hasAttemptedFetch]);

  useEffect(() => {
    if (clientName && !clientId && clientOptions.length > 0) {
      const matchingOption = clientOptions.find(
        (opt) => opt.value === clientName
      );
      if (matchingOption && matchingOption.clientId) {
        console.log("🔍 Found clientId in options:", matchingOption.clientId);
        setClientId(matchingOption.clientId);
      }
    }
  }, [clientName, clientOptions, clientId]);

  useEffect(() => {
    dispatch(fetchAssignees());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-app-client": "frontend-authenticated",
      },
    };

    const fetchClientData = async () => {
      try {
        const { data } = await axios.get(
          "https://taskbe.sharda.co.in/api/clients",
          config
        );
        const formatted = Array.isArray(data)
          ? data.map((c) => ({
              label: c.name || c,
              value: c.name || c,
              clientId: c.id || c._id || c.clientId,
            }))
          : [];
        setClientOptions(formatted);
      } catch (e) {
        console.error("Failed to fetch clients", e);
      }
    };

    const fetchAgentData = async () => {
      try {
        const { data } = await axios.get(
          "https://taskbe.sharda.co.in/api/agents",
          config
        );
        setAgents(data);
      } catch (e) {
        console.error("Failed to fetch agents:", e);
      }
    };

    fetchClientData();
    fetchAgentData();
  }, [dispatch]);

  useEffect(() => {
    if (fullTaskData) {
      console.log("⏭️ Skipping initialData useEffect - already have full data");
      return;
    }

    if (initialData && !initialData._id) {
      console.log("🔍 Using initialData directly (no _id found)");

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

      if (initialData.clientName) {
        const dbClientName =
          initialData.clientName || initialData.client?.name || "";
        const dbClientId =
          initialData.clientId ||
          initialData.client?.id ||
          initialData.client?._id ||
          "";

        console.log("✅ Setting client from initialData:", dbClientName);
        setClientName(dbClientName);
        setClientId(dbClientId);
      }

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
      setAssignedByUser(
        initialData.assignedBy
          ? {
              label: `${initialData.assignedBy.name} (${initialData.assignedBy.email})`,
              value: initialData.assignedBy.email,
            }
          : null
      );
    }
  }, [initialData, clientOptions, fullTaskData]);

  const inputClass =
    "w-full h-11 rounded-xl border border-slate-200 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 placeholder:text-slate-400";

  const labelClass =
    "block text-[12px] font-medium text-slate-600 mb-1 ml-0.5 tracking-wide";

  const handleClientChange = (selectedOption, actionMeta) => {
    if (!selectedOption) {
      setClientName("");
      setClientId("");
      return;
    }

    if (actionMeta && actionMeta.action === "create-option") {
      setTempNewClientName(selectedOption.value);
      setShowCreateClientModal(true);
    } else {
      setClientName(selectedOption.value);
      setClientId(selectedOption.clientId || "");
    }
  };

  const handleClientCreate = async (clientData) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        "https://taskbe.sharda.co.in/api/clients",
        clientData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-app-client": "frontend-authenticated",
          },
        }
      );

      const newClient = res.data.client || res.data;

      showAlert(`Client "${newClient.name}" created successfully!`);

      const newOption = {
        label: newClient.name,
        value: newClient.name,
        clientId: newClient._id || newClient.id || newClient.clientId,
      };

      setClientOptions((prevOptions) => [...prevOptions, newOption]);
      setClientName(newClient.name);
      setClientId(newOption.clientId);
    } catch (err) {
      console.error(
        "❌ Client creation failed:",
        err.response?.data?.message || err
      );
      showAlert(
        `❌ Error: ${
          err.response?.data?.message || "Failed to create client."
        }`,
        "error"
      );
    } finally {
      setShowCreateClientModal(false);
      setTempNewClientName("");
    }
  };

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
      clientId,
      department: Array.isArray(department) ? department : [department],
      code: taskCode?.value || "",
      assignedBy: assignedByUser
        ? {
            name: employees.find((u) => u.email === assignedByUser.value)?.name,
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

    if (isRepetitive) {
      taskPayload.repeatType = repeatType;
      if (!["Daily"].includes(repeatType))
        taskPayload.repeatDay = Number(customRepeat.day);
      if (repeatType === "Annually")
        taskPayload.repeatMonth = Number(customRepeat.month);
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

      const res = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(taskPayload),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to create task");

      showAlert(
        initialData
          ? "Task updated successfully!"
          : result.message || "Task created successfully!"
      );
      if (!initialData)
        socket.emit("new-task-created", { taskId: result.task._id });

      onSave(result.task);
      onClose();
    } catch (err) {
      console.error("❌ Submission error:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = taskCategory
    ? employees.filter(
        (e) => e.department?.toLowerCase() === taskCategory.toLowerCase()
      )
    : employees;

  const assigneeOptions = filteredEmployees.map((emp) => ({
    label: `${emp.name} (${emp.email})`,
    value: emp.email,
  }));

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 p-3 sm:p-4 md:p-6 flex items-center justify-center font-inter overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-none sm:rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[80vh] relative z-[10000]">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-2xl border-b border-slate-200 bg-white/90 backdrop-blur px-4 sm:px-6 py-2">
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900">
              {initialData ? "Update Task" : "Create New Task"}
            </h3>
            <p className="text-[12px] text-slate-500 hidden sm:block">
              Fill the details below and assign to team members
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 transition"
            aria-label="Close"
            title="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-5 space-y-6 flex-1 overflow-y-auto">
          {isLoadingFullData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm text-blue-700">
                Loading complete task data...
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className={labelClass} htmlFor="taskName">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                id="taskName"
                type="text"
                placeholder="e.g. GST filing for June"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="workDesc">
                Work Description
              </label>
              <input
                id="workDesc"
                type="text"
                placeholder="Short summary of the task"
                value={workDesc}
                onChange={(e) => setWorkDesc(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Task Department</label>
              <div className="py-1">
                <DepartmentSelector
                  selectedDepartments={department}
                  setSelectedDepartments={setDepartment}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Select one or more departments.
              </p>
            </div>

            <div>
              <label className={labelClass}>Client Name</label>
              <CreatableSelect
                isClearable
                isSearchable
                options={clientOptions}
                onChange={handleClientChange}
                onCreateOption={(inputValue) => {
                  handleClientChange(
                    { value: inputValue, label: `Create "${inputValue}"` },
                    { action: "create-option" }
                  );
                }}
                value={(() => {
                  if (!clientName) return null;
                  const foundOption = clientOptions.find(
                    (o) => o.value === clientName
                  );
                  const finalValue = foundOption || {
                    label: clientName,
                    value: clientName,
                  };
                  return finalValue;
                })()}
                placeholder="Select client or type to create..."
                classNamePrefix="select"
                menuPortalTarget={document.body}
                styles={selectBaseStyles}
              />
            </div>

            <div>
              <label className={labelClass}>Task Code</label>
              <TaskCodeSelector
                selectedCode={taskCode}
                setSelectedCode={setTaskCode}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="dueDate">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={inputClass}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="status">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Abbstulate">Obsolete</option>
              </select>
            </div>

            {/* <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
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
                  <div className="w-12 h-6 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 transition"></div>
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform peer-checked:translate-x-full transition"></div>
                </div>
                <span className="text-[14px] text-slate-700">
                  {isRepetitive
                    ? "This is a repetitive task"
                    : "Is this a repetitive task?"}
                </span>
              </label>
            </div> */}
          </div>

          <div>
            <label className={labelClass}>
              Assign to <span className="text-red-500">*</span>
            </label>
            <Select
              isMulti
              name="assignees"
              options={assigneeOptions}
              value={assignees.map((a) => ({
                label: `${a.name} (${a.email})`,
                value: a.email,
              }))}
              onChange={(opts) => {
                const selected = (opts || []).map((o) => {
                  const emp = employees.find((e) => e.email === o.value);
                  return { name: emp?.name || o.label, email: o.value };
                });
                setAssignees(selected);
              }}
              classNamePrefix="select"
              menuPortalTarget={document.body}
              styles={{
                ...selectBaseStyles,
                menu: (p) => ({ ...selectBaseStyles.menu(p), maxHeight: 260 }),
                menuList: (p) => ({ ...p, maxHeight: 260, overflowY: "auto" }),
              }}
              placeholder="Select team members..."
            />
          </div>

          <div>
            <label className={labelClass}>Assigned By (Admin)</label>
            <Select
              options={employees.map((emp) => ({
                label: `${emp.name} (${emp.email})`,
                value: emp.email,
              }))}
              isClearable
              value={assignedByUser}
              onChange={(selected) => setAssignedByUser(selected)}
              placeholder="Select Admin..."
              classNamePrefix="select"
              menuPortalTarget={document.body}
              styles={{
                ...selectBaseStyles,
                menu: (p) => ({ ...selectBaseStyles.menu(p), maxHeight: 280 }),
                menuList: (p) => ({ ...p, maxHeight: 280, overflowY: "auto" }),
              }}
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-2xl border-t border-slate-200 bg-white px-4 sm:px-6 py-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting
              ? "Submitting..."
              : initialData
              ? "Update Task"
              : "Create Task"}
          </button>
        </div>
      </div>

      {showRepeatPopup && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[10001] p-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-5 sm:p-6">
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

      {showCreateClientModal && (
        <CreateClientModal
          client={{ name: tempNewClientName }}
          agents={agents}
          onClose={() => {
            setShowCreateClientModal(false);
            setTempNewClientName("");
          }}
          onCreate={handleClientCreate}
        />
      )}
    </div>
  );
};

export default TaskFormModal;
