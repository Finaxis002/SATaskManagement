import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { fetchTaskCodes } from "../redux/taskCodeSlice";
import { fetchClients } from "../redux/clientSlice";
import { FaUserTie, FaTasks, FaCalendarAlt, FaHourglassHalf, FaUsers, FaUserCheck, FaSpinner, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ITEMS_PER_PAGE = 10;
const TABS = ["completed", "obsolete"];

// Move formatDate outside component to prevent recreation
const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString("en-GB") : "—";
};

// Memoized sub-components with React.memo equality checks
const TaskRow = memo(({ task, index }) => (
  <tr className="border-b hover:bg-gray-50 transition-colors">
    <td className="py-3 px-4">{index}</td>
    <td className="py-3 px-4">{task.taskName}</td>
    <td className="py-3 px-4">{task.clientName}</td>
    <td className="py-3 px-4">
      {task.workDesc} {task.code && <span className="text-blue-600 font-semibold ml-2">({task.code})</span>}
    </td>
    <td className="py-3 px-4">{formatDate(task.assignedDate)}</td>
    <td className="py-3 px-4">{formatDate(task.dueDate)}</td>
    <td className="py-3 px-4 text-center">
      <span className="bg-green-200 text-green-700 px-2 py-1 rounded-full text-xs">{task.status}</span>
    </td>
    <td className="py-3 px-4">
      <div className="flex flex-wrap gap-1">
        {task.assignees?.map(a => (
          <span key={a.email} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{a.name}</span>
        ))}
      </div>
    </td>
    <td className="py-3 px-4">{task.assignedBy?.name || "—"}</td>
  </tr>
), (prevProps, nextProps) => 
  prevProps.task._id === nextProps.task._id && 
  prevProps.index === nextProps.index
);

const TaskCardTablet = memo(({ task }) => (
  <div className="bg-white border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
    <div className="flex justify-between items-center mb-2">
      <span className="font-semibold">{task.taskName}</span>
      <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">{task.status}</span>
    </div>
    <div className="text-sm text-gray-600 space-y-1">
      <div><strong>Client:</strong> {task.clientName}</div>
      <div><strong>Work:</strong> {task.workDesc}{task.code && ` (${task.code})`}</div>
      <div><strong>Date:</strong> {formatDate(task.assignedDate)}</div>
      <div><strong>Due:</strong> {formatDate(task.dueDate)}</div>
      <div className="flex flex-wrap gap-1">
        <strong>Team:</strong> {task.assignees?.map(a => (
          <span key={a.email} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{a.name}</span>
        ))}
      </div>
      <div><strong>Assigned By:</strong> {task.assignedBy?.name || "—"}</div>
    </div>
  </div>
), (prevProps, nextProps) => prevProps.task._id === nextProps.task._id);

const TaskCardMobile = memo(({ task }) => (
  <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
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
        <span><strong>Date:</strong> {formatDate(task.assignedDate)}</span>
      </div>
      <div className="flex items-center gap-2">
        <FaHourglassHalf className="text-indigo-600" />
        <span><strong>Due:</strong> {formatDate(task.dueDate)}</span>
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
), (prevProps, nextProps) => prevProps.task._id === nextProps.task._id);

const EmptyState = memo(() => (
  <div className="text-center py-6 text-gray-500">🚫 No completed tasks available.</div>
));

// Static select styles outside component
const SELECT_STYLES = {
  control: (provided) => ({ ...provided, minHeight: "32px", height: "32px", fontSize: "0.875rem" }),
  option: (provided) => ({ ...provided, fontSize: "0.875rem" }),
};

const Completed = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [activeTab, setActiveTab] = useState("completed");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const codeOptions = useSelector((state) => state.taskCodes.list);
  const clientOptions = useSelector((state) => state.clients.list);
  const codeLoading = useSelector((state) => state.taskCodes.loading);
  const clientLoading = useSelector((state) => state.clients.loading);

  const dispatch = useDispatch();

  // Fetch tasks once
  useEffect(() => {
    let isMounted = true;
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://taskbe.sharda.co.in/api/tasks");
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        if (isMounted) setTasks(data);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTasks();
    return () => { isMounted = false; };
  }, []);

  // Fetch clients and codes once
  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchTaskCodes());
  }, [dispatch]);

  // Optimized filtering with dependency array
  const filteredTasks = useMemo(() => {
    const statusCondition = activeTab === "completed" 
      ? (task) => task.status === "Completed" && task.isHidden === true
      : (task) => task.status === "Obsolete" && task.isObsoleteHidden === true;
    
    return tasks.filter((task) => {
      if (!statusCondition(task)) return false;
      if (selectedClient && task.clientName !== selectedClient) return false;
      if (selectedCode && task.code !== selectedCode) return false;
      return true;
    });
  }, [tasks, selectedClient, selectedCode, activeTab]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClient, selectedCode, activeTab]);

  // Pagination calculations
  const paginationData = useMemo(() => {
    const total = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
    const lastIndex = currentPage * ITEMS_PER_PAGE;
    const firstIndex = lastIndex - ITEMS_PER_PAGE;
    
    return {
      totalPages: total,
      indexOfFirstItem: firstIndex,
      indexOfLastItem: lastIndex,
      currentTasks: filteredTasks.slice(firstIndex, lastIndex)
    };
  }, [filteredTasks, currentPage]);

  const { totalPages, indexOfFirstItem, indexOfLastItem, currentTasks } = paginationData;

  // Memoize select options
  const clientSelectOptions = useMemo(() => [
    { value: "", label: "All Clients" },
    ...clientOptions.map(c => ({ value: c.name, label: c.name }))
  ], [clientOptions]);

  const codeSelectOptions = useMemo(() => [
    { value: "", label: "All Codes" },
    ...codeOptions.map(c => ({ value: c, label: c }))
  ], [codeOptions]);

  // Stable callbacks
  const handlePrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const handleClientChange = useCallback((opt) => {
    setSelectedClient(opt?.value || "");
  }, []);

  const handleCodeChange = useCallback((opt) => {
    setSelectedCode(opt?.value || "");
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  if (loading) {
    return (
      <div className="px-2 sm:px-4 h-[90vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-indigo-600 text-4xl mb-3" />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 h-[90vh] overflow-auto ">
      <div className="sticky top-0 z-20 bg-white py-4 px-2 sm:px-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-md border-b border-gray-100">
        <div className="flex gap-1 md:gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab === "completed" ? "Completed Tasks" : "Obsolete Tasks"}
            </button>
          ))}
        </div>

        <div className="w-full md:w-auto grid grid-cols-1 sm:grid-cols-2 gap-2 md:flex md:gap-4 md:items-center">
          <div className="flex items-center gap-2 min-w-[140px]">
            <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Client:</label>
            <div className="flex-1 min-w-[120px]">
              <Select
                options={clientSelectOptions}
                value={selectedClient ? { value: selectedClient, label: selectedClient } : clientSelectOptions[0]}
                onChange={handleClientChange}
                className="text-sm"
                isSearchable
                isDisabled={clientLoading}
                isLoading={clientLoading}
                styles={SELECT_STYLES}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 min-w-[140px]">
            <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Code:</label>
            <div className="flex-1 min-w-[120px]">
              <Select
                options={codeSelectOptions}
                value={selectedCode ? { value: selectedCode, label: selectedCode } : codeSelectOptions[0]}
                onChange={handleCodeChange}
                className="text-sm"
                isSearchable
                isDisabled={codeLoading}
                isLoading={codeLoading}
                styles={SELECT_STYLES}
              />
            </div>
          </div>
        </div>
      </div>

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
            {currentTasks.length === 0 ? (
              <tr><td colSpan="9"><EmptyState /></td></tr>
            ) : (
              currentTasks.map((task, idx) => (
                <TaskRow key={task._id} task={task} index={indexOfFirstItem + idx + 1} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="hidden md:block lg:hidden">
        <div className="grid grid-cols-1 gap-3">
          {currentTasks.length === 0 ? <EmptyState /> : currentTasks.map((task) => (
            <TaskCardTablet key={task._id} task={task} />
          ))}
        </div>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {currentTasks.length === 0 ? <EmptyState /> : currentTasks.map((task) => (
          <TaskCardMobile key={task._id} task={task} />
        ))}
      </div>

      {filteredTasks.length > 0 && (
        <div className="flex items-center justify-between px-4 py-4 bg-white mt-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-medium">{Math.min(indexOfLastItem, filteredTasks.length)}</span> of{" "}
            <span className="font-medium">{filteredTasks.length}</span> tasks
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 1 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              <FaChevronLeft className="h-3 w-3" />
              Previous
            </button>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
              <FaChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Completed);