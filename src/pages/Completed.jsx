import React, { useEffect, useState } from "react";
import Select from "react-select";
import TaskCodeSelector from "../Components/Tasks/TaskCodeSelector"; // Adjust path as needed
import { useDispatch, useSelector } from "react-redux";
import { fetchTaskCodes } from "../redux/taskCodeSlice"; // Adjust path as needed
import { fetchClients } from "../redux/clientSlice"; // Adjust path as needed
import { FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

const Completed = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");

  const [selectedCode, setSelectedCode] = useState("");
  const codeOptions = useSelector((state) => state.taskCodes.list); // ✅ Use Redux data
  const clientOptions = useSelector((state) => state.clients.list);

  const [activeTab, setActiveTab] = useState("completed"); // "completed" or "obsolete"

  // Get user role and email from localStorage
  const role = localStorage.getItem("role");
  const userEmail = localStorage.getItem("userId");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("https://taskbe.sharda.co.in/api/tasks");
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error("Failed to fetch completed tasks:", err);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTaskCodes());
  }, [dispatch]);

  const filteredTasks = tasks.filter((task) => {
    const clientMatch =
      selectedClient === "" || task.clientName === selectedClient;
    const codeMatch = selectedCode === "" || task.code === selectedCode;

    if (activeTab === "completed") {
      // Only completed & isHidden === true
      return (
        task.status === "Completed" &&
        task.isHidden === true &&
        clientMatch &&
        codeMatch
      );
    } else if (activeTab === "obsolete") {
      // Only obsolete & isObsoleteHidden === true
      return (
        task.status === "Obsolete" &&
        task.isObsoleteHidden === true &&
        clientMatch &&
        codeMatch
      );
    }
    return false;
  });

  //   useEffect(() => {
  //   console.log("Clients from Redux:", clientOptions);
  // }, [clientOptions]);

  return (
    <div className=" px-1 h-[90vh] w-[200vh] overflow-auto">
      <div className="sticky w-[101%] top-0 z-20 bg-white py-4 px-6 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md border-b border-gray-100">
        {/* Tabs */}
        <div className="w-full md:w-auto">
          <div className="flex gap-1 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === "completed"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("completed")}
            >
              Completed Tasks
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === "obsolete"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("obsolete")}
            >
              Obsolete Tasks
            </button>
          </div>
        </div>

        {/* Divider - only visible on larger screens */}
        <div className="hidden md:block h-8 border-l border-gray-200 mx-2" />

        {/* Filters */}
        <div className="w-full md:w-auto grid grid-cols-1 sm:grid-cols-2 gap-3 md:flex md:gap-4 md:items-center">
          {/* Client Filter */}
          <div className="flex items-center gap-2 min-w-[180px]">
            <label
              htmlFor="client-filter"
              className="text-sm text-gray-600 font-medium whitespace-nowrap"
            >
              Client:
            </label>
            <div className="flex-1 min-w-[120px]">
              <Select
                id="client-filter"
                options={[
                  { value: "", label: "All Clients" },
                  ...clientOptions.map((client) => ({
                    value: client.name,
                    label: client.name,
                  })),
                ]}
                value={
                  selectedClient
                    ? { value: selectedClient, label: selectedClient }
                    : { value: "", label: "All Clients" }
                }
                onChange={(selectedOption) =>
                  setSelectedClient(selectedOption.value)
                }
                className="text-sm"
                isSearchable
                placeholder="Select..."
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: "32px",
                    height: "32px",
                    fontSize: "0.875rem",
                  }),
                  option: (provided) => ({
                    ...provided,
                    fontSize: "0.875rem",
                  }),
                }}
              />
            </div>
          </div>

          {/* Code Filter */}
          <div className="flex items-center gap-2 min-w-[180px]">
            <label
              htmlFor="code-filter"
              className="text-sm text-gray-600 font-medium whitespace-nowrap"
            >
              Code:
            </label>
            <div className="flex-1 min-w-[120px]">
              <Select
                id="code-filter"
                options={[
                  { value: "", label: "All Codes" },
                  ...codeOptions.map((code) => ({
                    value: code,
                    label: code,
                  })),
                ]}
                value={
                  selectedCode
                    ? { value: selectedCode, label: selectedCode }
                    : { value: "", label: "All Codes" }
                }
                onChange={(selectedOption) =>
                  setSelectedCode(selectedOption.value)
                }
                className="text-sm"
                isSearchable
                placeholder="Select..."
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: "32px",
                    height: "32px",
                    fontSize: "0.875rem",
                  }),
                  option: (provided) => ({
                    ...provided,
                    fontSize: "0.875rem",
                  }),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <table className="w-full table-auto border-collapse text-sm text-gray-800">
        <thead className="bg-gradient-to-r from-indigo-400 to-indigo-700 text-white text-sm">
          <tr className="text-left">
            <th className="py-4 px-4 min-w-[70px] font-semibold">S. No</th>
            <th className="py-4 px-6 min-w-[180px] font-semibold">Task Name</th>
            <th className="py-4 px-6 min-w-[180px] font-semibold">
              Client Name
            </th>
            <th className="py-4 px-6  min-w-[250px] font-semibold">
              Work Description + Code
            </th>
            <th className="py-4 px-6 min-w-[180px] font-semibold">
              Date of Work
            </th>
            <th className="py-4 px-6 min-w-[180px] font-semibold cursor-pointer">
              Due Date
            </th>
            <th className="py-4 px-6 min-w-[160px] font-semibold text-center">
              Status
            </th>

            <th className="py-4 px-6 min-w-[250px] font-semibold">Team</th>
            <th className="py-4 px-6 min-w-[130px] font-semibold">
              Assigned By
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredTasks.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center py-6 text-gray-500">
                🚫 No completed tasks available.
              </td>
            </tr>
          ) : (
            filteredTasks.map((task, index) => (
              <tr key={task._id} className="border-b">
                <td className="py-3 px-4">{index + 1}</td>

                <td className="py-3 px-4">{task.taskName}</td>
                <td className="py-3 px-4">{task.clientName}</td>

                <td className="py-3 px-4">
                  {task.workDesc}{" "}
                  {task.code && (
                    <span className="text-blue-600 font-semibold ml-2">
                      ({task.code})
                    </span>
                  )}
                </td>

                <td className="py-3 px-4">
                  {task.assignedDate
                    ? new Date(task.assignedDate).toLocaleDateString("en-GB")
                    : "—"}
                </td>

                <td className="py-3 px-4">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("en-GB")
                    : "—"}
                </td>

                <td className="py-3 px-4 text-center">
                  <span className="bg-green-200 text-green-700 px-2 py-1 rounded-full text-xs">
                    {task.status}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {task.assignees?.map((a) => (
                      <span
                        key={a.email}
                        className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full"
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="py-3 px-4">{task.assignedBy?.name || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Completed;
