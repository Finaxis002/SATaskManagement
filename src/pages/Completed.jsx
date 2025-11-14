import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { fetchTaskCodes } from "../redux/taskCodeSlice";
import { fetchClients } from "../redux/clientSlice";
import { FaUserTie, FaTasks, FaCalendarAlt, FaHourglassHalf, FaUsers, FaUserCheck } from "react-icons/fa";


const Completed = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [activeTab, setActiveTab] = useState("completed");

  const codeOptions = useSelector((state) => state.taskCodes.list);
  const clientOptions = useSelector((state) => state.clients.list);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("https://taskbe.sharda.co.in/api/tasks");
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => { dispatch(fetchClients()); }, [dispatch]);
  useEffect(() => { dispatch(fetchTaskCodes()); }, [dispatch]);

  const filteredTasks = tasks.filter((task) => {
    const clientMatch = selectedClient === "" || task.clientName === selectedClient;
    const codeMatch = selectedCode === "" || task.code === selectedCode;
    if (activeTab === "completed") {
      return task.status === "Completed" && task.isHidden === true && clientMatch && codeMatch;
    } else if (activeTab === "obsolete") {
      return task.status === "Obsolete" && task.isObsoleteHidden === true && clientMatch && codeMatch;
    }
    return false;
  });

  return (
    <div className="px-2 sm:px-4  h-[90vh] overflow-auto">

      {/* Tabs + Filters */}
      <div className="sticky top-0 z-20 bg-white py-4 px-2 sm:px-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-md border-b border-gray-100">
        {/* Tabs */}
        <div className="flex gap-1 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["completed", "obsolete"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab === "completed" ? "Completed Tasks" : "Obsolete Tasks"}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="w-full md:w-auto grid grid-cols-1 sm:grid-cols-2 gap-2 md:flex md:gap-4 md:items-center">
          {/* Client Filter */}
          <div className="flex items-center gap-2 min-w-[140px]">
            <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Client:</label>
            <div className="flex-1 min-w-[120px]">
              <Select
                options={[{ value: "", label: "All Clients" }, ...clientOptions.map(c => ({ value: c.name, label: c.name }))]}
                value={selectedClient ? { value: selectedClient, label: selectedClient } : { value: "", label: "All Clients" }}
                onChange={(opt) => setSelectedClient(opt.value)}
                className="text-sm"
                isSearchable
                placeholder="Select..."
                styles={{
                  control: (provided) => ({ ...provided, minHeight: "32px", height: "32px", fontSize: "0.875rem" }),
                  option: (provided) => ({ ...provided, fontSize: "0.875rem" }),
                }}
              />
            </div>
          </div>

          {/* Code Filter */}
          <div className="flex items-center gap-2 min-w-[140px]">
            <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Code:</label>
            <div className="flex-1 min-w-[120px]">
              <Select
                options={[{ value: "", label: "All Codes" }, ...codeOptions.map(c => ({ value: c, label: c }))]}
                value={selectedCode ? { value: selectedCode, label: selectedCode } : { value: "", label: "All Codes" }}
                onChange={(opt) => setSelectedCode(opt.value)}
                className="text-sm"
                isSearchable
                placeholder="Select..."
                styles={{
                  control: (provided) => ({ ...provided, minHeight: "32px", height: "32px", fontSize: "0.875rem" }),
                  option: (provided) => ({ ...provided, fontSize: "0.875rem" }),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table for Laptop & Desktop */}
      <div className="hidden lg:block w-full">
        <table className="w-full table-auto border-collapse text-sm text-gray-800">
          <thead className="bg-gradient-to-r from-indigo-400 to-indigo-700 text-white text-sm">
            <tr className="text-left">
              <th className="py-4 px-4 font-semibold">S. No</th>
              <th className="py-4 px-6 font-semibold">Task Name</th>
              <th className="py-4 px-6 font-semibold">Client Name</th>
              <th className="py-4 px-6 font-semibold">Work Description + Code</th>
              <th className="py-4 px-6 font-semibold">Date of Work</th>
              <th className="py-4 px-6 font-semibold">Due Date</th>
              <th className="py-4 px-6 font-semibold text-center">Status</th>
              <th className="py-4 px-6 font-semibold">Team</th>
              <th className="py-4 px-6 font-semibold">Assigned By</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">🚫 No completed tasks available.</td>
              </tr>
            ) : (
              filteredTasks.map((task, index) => (
                <tr key={task._id} className="border-b">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{task.taskName}</td>
                  <td className="py-3 px-4">{task.clientName}</td>
                  <td className="py-3 px-4">{task.workDesc} {task.code && <span className="text-blue-600 font-semibold ml-2">({task.code})</span>}</td>
                  <td className="py-3 px-4">{task.assignedDate ? new Date(task.assignedDate).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="py-3 px-4">{task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="py-3 px-4 text-center"><span className="bg-green-200 text-green-700 px-2 py-1 rounded-full text-xs">{task.status}</span></td>
                  <td className="py-3 px-4 flex flex-wrap gap-1">{task.assignees?.map(a => (<span key={a.email} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{a.name}</span>))}</td>
                  <td className="py-3 px-4">{task.assignedBy?.name || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tablet View (md:block, lg:hidden) */}
      <div className="hidden md:block lg:hidden">
        <div className="grid grid-cols-1 gap-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-6 text-gray-500">🚫 No completed tasks available.</div>
          ) : (
            filteredTasks.map((task, index) => (
              <div key={task._id} className="bg-white border rounded-lg p-4 shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{task.taskName}</span>
                  <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">{task.status}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Client:</strong> {task.clientName}</div>
                  <div><strong>Work:</strong> {task.workDesc}{task.code && ` (${task.code})`}</div>
                  <div><strong>Date:</strong> {task.assignedDate ? new Date(task.assignedDate).toLocaleDateString("en-GB") : "—"}</div>
                  <div><strong>Due:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-GB") : "—"}</div>
                  <div className="flex flex-wrap gap-1"><strong>Team:</strong> {task.assignees?.map(a => (<span key={a.email} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{a.name}</span>))}</div>
                  <div><strong>Assigned By:</strong> {task.assignedBy?.name || "—"}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile View */}
<div className="md:hidden flex flex-col gap-3">
  {filteredTasks.length === 0 ? (
    <div className="text-center py-6 text-gray-500">🚫 No completed tasks available.</div>
  ) : (
    filteredTasks.map((task, index) => (
      <div key={task._id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">{task.taskName}</span>
          <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">{task.status}</span>
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <FaUserTie className="text-indigo-600" />
            <span><strong>Client:</strong> {task.clientName}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaTasks className="text-indigo-600" />
            <span><strong>Work:</strong> {task.workDesc}{task.code && ` (${task.code})`}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-indigo-600" />
            <span><strong>Date:</strong> {task.assignedDate ? new Date(task.assignedDate).toLocaleDateString("en-GB") : "—"}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaHourglassHalf className="text-indigo-600" />
            <span><strong>Due:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-GB") : "—"}</span>
          </div>

          <div className="flex items-start gap-2">
            <FaUsers className="text-indigo-600 mt-1" />
            <span className="flex flex-wrap gap-1">
              <strong>Team:</strong> {task.assignees?.map(a => (
                <span key={a.email} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{a.name}</span>
              ))}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FaUserCheck className="text-indigo-600" />
            <span><strong>Assigned By:</strong> {task.assignedBy?.name || "—"}</span>
          </div>
        </div>
      </div>
    ))
  )}
</div>

    </div>
  );
};

export default Completed;
