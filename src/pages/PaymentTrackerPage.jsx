import React, { useState, useMemo, useRef, useEffect } from "react";
import { DollarSign, X, Search, ChevronDown, RefreshCw } from "lucide-react";
import { usePaymentTracker } from "../hook/usePaymentTracker";
import PaymentStats from "../Components/PaymentTracker/PaymentStats";
import PaymentFilters from "../Components/PaymentTracker/PaymentFilters";
import PaymentTaskCard from "../Components/PaymentTracker/PaymentTaskCard";
import StageEditor from "../Components/PaymentTracker/StageEditor";
import PaymentLogger from "../Components/PaymentTracker/PaymentLogger";
import PaymentTaskTable from "../Components/PaymentTracker/PaymentTaskTable";

const baseURL = 'https://taskbe.sharda.co.in';

const PaymentTrackerPage = () => {
  const userData = useMemo(
    () => ({
      role: localStorage.getItem("role"),
      userName: localStorage.getItem("name"),
      userId: localStorage.getItem("userId"),
    }),
    []
  );

  const {
    tasks,
    allTasks,
    loading,
    filter,
    searchTerm,
    stats,
    filteredTasks,
    setFilter,
    setSearchTerm,
    saveStages,
    logPayment,
    refreshTasks,
    updateTaskLocally,
  } = usePaymentTracker(userData);

  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [selectedTask, setSelectedTask] = useState(null); // Full task data
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Stage editor state
  const [stagesForEdit, setStagesForEdit] = useState([]);

  // Payment logger state
  const [selectedTaskForPayment, setSelectedTaskForPayment] = useState(null);
  const [paymentPercentage, setPaymentPercentage] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  // Loading states
  const [isSavingStages, setIsSavingStages] = useState(false);
  const [isLoggingPayment, setIsLoggingPayment] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingTaskDetails, setIsLoadingTaskDetails] = useState(false);

  // Searchable dropdown states
  const [taskSearchInput, setTaskSearchInput] = useState("");
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };
  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  const dropdownRef = useRef(null);

  const getTaskDescription = (task) =>
    task?.workDesc ||
    task?.remark ||
    "No task description added";

  // ✅ Fetch complete task details including paymentStages
  const fetchCompleteTaskDetails = async (taskId) => {
    try {
      setIsLoadingTaskDetails(true);
      const response = await fetch(`${baseURL}/api/tasks/${taskId}`);
      const data = await response.json();

      if (data && data._id) {
        console.log("Fetched complete task details:", data);
        console.log("Payment stages:", data.paymentStages);
        setSelectedTask(data);

        // Load stages for editing
        if (data.paymentStages && data.paymentStages.length > 0) {
          const normalizedForEdit = data.paymentStages.map((stage) => ({
            ...stage,
            status: stage.status || "unpaid", // ✅ fill in missing status from old data
          }));
          setStagesForEdit(normalizedForEdit);
          // setStagesForEdit([...data.paymentStages]);
        } else {
          setStagesForEdit([{ percentage: 0, description: "" }]);
        }
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
    } finally {
      setIsLoadingTaskDetails(false);
    }
  };

  const handleTaskSelect = async (task) => {
    setSelectedTaskId(task._id);
    setTaskSearchInput(task.taskName);
    setShowTaskDropdown(false);

    // Fetch complete task details including payment stages
    await fetchCompleteTaskDetails(task._id);
  };

  // Open Payment Logger
  const openPaymentLogger = () => {
    if (!selectedTask) {
      alert("Please select a task first");
      return;
    }

    console.log("Opening payment logger for:", selectedTask.taskName);
    setSelectedTaskForPayment(selectedTask);
    setPaymentPercentage(selectedTask.paidPercentage?.toString() || "0");
    setPaymentNote("");
    setShowPaymentModal(true);
  };


  const handleSaveStages = async () => {
    if (!selectedTask) {
      showError("Please select a task first");
      return;
    }

    const validStages = stagesForEdit.filter(
      stage => stage.description && stage.description.trim() !== ""
    );

    if (validStages.length === 0) {
      showError("Please add at least one valid stage with description");
      return;
    }
    console.log("Stages being saved:", JSON.stringify(validStages));
    setIsSavingStages(true);

    try {
      const success = await saveStages(selectedTask._id, validStages);

      if (success) {
        setIsSavingStages(false); // ✅ release button before background refresh
        showSuccess("Payment stages saved successfully!");
        await Promise.all([
          fetchCompleteTaskDetails(selectedTask._id),
          refreshTasks(),
        ]);
      } else {
        setIsSavingStages(false);
        showError("Failed to save stages. Please try again.");
      }
    } catch (error) {
      console.error("Error saving stages:", error);
      setIsSavingStages(false);
      showError("An error occurred while saving stages.");
    }
    // ❌ no finally — we set false manually in each branch above
  };

  const handleLogPayment = async () => {
    if (!selectedTaskForPayment) {
      showError("Please select a task first");
      return;
    }

    const percentage = parseFloat(paymentPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      showError("Please enter a valid percentage between 0 and 100");
      return;
    }

    setIsLoggingPayment(true);

    try {
      const success = await logPayment(
        selectedTaskForPayment._id,
        percentage,
        paymentNote,
        userData.userName
      );

      if (success) {
        setIsLoggingPayment(false); // ✅ release button before background refresh
        updateTaskLocally(selectedTaskForPayment._id, {
          paidPercentage: percentage,
        });

        // ✅ Also update selectedTask so the task detail panel reflects it
        setSelectedTask((prev) =>
          prev && prev._id === selectedTaskForPayment._id
            ? { ...prev, paidPercentage: percentage }
            : prev
        );
        setShowPaymentModal(false);
        setPaymentPercentage("");
        setPaymentNote("");
        setSelectedTaskForPayment(null);
        showSuccess("Payment logged successfully!");

        if (selectedTask) {
          Promise.all([
            fetchCompleteTaskDetails(selectedTask._id),
            refreshTasks(),
          ]).catch(console.error);
        }
      } else {
        setIsLoggingPayment(false);
        showError("Failed to log payment. Please try again.");
      }
    } catch (error) {
      console.error("Error logging payment:", error);
      setIsLoggingPayment(false);
      showError("An error occurred while logging payment.");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (selectedTask) {
      await fetchCompleteTaskDetails(selectedTask._id);
    }
    await refreshTasks();
    setIsRefreshing(false);
  };

  const viewTaskDetails = (task) => {
    window.location.href = `/tasks?id=${task._id}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTaskDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // Filter tasks for dropdown
  const filteredTaskOptions = useMemo(() => {
    if (!taskSearchInput.trim()) {
      return allTasks.slice(0, 20);
    }
    const searchLower = taskSearchInput.toLowerCase();
    return allTasks.filter(
      (task) =>
        task.taskName.toLowerCase().includes(searchLower) ||
        (task.clientName && task.clientName.toLowerCase().includes(searchLower))
    );
  }, [allTasks, taskSearchInput]);

  // Get button text based on whether task has existing stages
  const getSaveButtonText = () => {
    if (!selectedTask) return "Save Stages";
    const hasStages = selectedTask.paymentStages && selectedTask.paymentStages.length > 0;
    return hasStages ? "Update Stages" : "Create Stages";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex justify-between items-center">
          <PaymentStats stats={stats} />
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-gray-100">
        <PaymentFilters
          filter={filter}
          setFilter={setFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          stats={stats}
        />
      </div>

      {/* Task selector with searchable dropdown */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,400px)_1fr] gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select task for payment stages
            </label>

            <div ref={dropdownRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={taskSearchInput}
                  onChange={(e) => {
                    setTaskSearchInput(e.target.value);
                    setShowTaskDropdown(true);
                    if (!e.target.value) {
                      setSelectedTaskId("");
                      setSelectedTask(null);
                    }
                  }}
                  onFocus={() => setShowTaskDropdown(true)}
                  placeholder={loading ? "Loading tasks..." : "Type to search tasks..."}
                  disabled={loading}
                  className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {showTaskDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading tasks...</div>
                  ) : filteredTaskOptions.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No tasks found. Try a different search term.
                    </div>
                  ) : (
                    filteredTaskOptions.map((task) => (
                      <div
                        key={task._id}
                        onClick={() => handleTaskSelect(task)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <div className="font-medium text-gray-800 text-sm">
                          {task.taskName}
                          {task.paidPercentage > 0 && (
                            <span className="ml-2 text-xs text-indigo-600">
                              ({task.paidPercentage}% paid)
                            </span>
                          )}
                        </div>
                        {task.clientName && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Client: {task.clientName}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedTask ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              {isLoadingTaskDetails ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading task details...</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-800 truncate">
                        {selectedTask.taskName}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {getTaskDescription(selectedTask)}
                      </p>
                      {/* Show existing stages summary */}
                      {selectedTask.paymentStages && selectedTask.paymentStages.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-green-600 font-medium">
                            ✓ Currently configured stages:
                          </p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {selectedTask.paymentStages.map((stage, idx) => (
                              <span key={idx} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                {stage.percentage}% - {stage.description.substring(0, 30)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* <span className="shrink-0 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                      {selectedTask.paidPercentage || 0}% paid
                    </span> */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                        {selectedTask.paidPercentage || 0}% paid
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTask(null);
                          setSelectedTaskId("");
                          setTaskSearchInput("");
                          setStagesForEdit([]);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                        title="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stage Editor - Always visible */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedTask.paymentStages?.length > 0 ? 'Edit Stages' : 'Add Stages'}
                    </label>
                    <StageEditor
                      stages={stagesForEdit}
                      onChange={setStagesForEdit}
                      onAdd={() =>
                        setStagesForEdit([...stagesForEdit, { percentage: 0, description: "", status: "unpaid" }])
                      }
                      onRemove={(idx) =>
                        setStagesForEdit(stagesForEdit.filter((_, i) => i !== idx))
                      }
                    />
                  </div>

                  <div className="mt-4 flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <button
                      onClick={openPaymentLogger}
                      disabled={isLoggingPayment}
                      className="px-4 py-2 text-sm text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Log Payment
                    </button>
                    <button
                      onClick={handleSaveStages}
                      disabled={isSavingStages}
                      className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSavingStages && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      {getSaveButtonText()}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
              Type in the search box and select a task to add payment percentages and stage descriptions.
            </div>
          )}
        </div>
      </div>

      {/* Task List - Only shows tasks with payment stages */}
      <div className="px-6 py-2">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Tasks with Payment Tracking
        </h3>
      </div>
      <div className="p-6 pt-0 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No tasks with payment tracking found</p>
            <p className="text-xs mt-1">
              Select a task above and configure payment stages
            </p>
          </div>
        ) : (
          // <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          //   {filteredTasks.map((task) => (
          //     <PaymentTaskCard
          //       key={task._id}
          //       task={task}
          //       onViewDetails={viewTaskDetails}
          //       onEditStages={() => handleTaskSelect(task)}
          //       onLogPayment={() => {
          //         setSelectedTaskId(task._id);
          //         setTaskSearchInput(task.taskName);
          //         setSelectedTaskForPayment(task);
          //         setPaymentPercentage(task.paidPercentage?.toString() || "0");
          //         setPaymentNote("");
          //         setShowPaymentModal(true);
          //       }}
          //     />
          //   ))}
          // </div>
          <PaymentTaskTable
            tasks={filteredTasks}
            onViewDetails={viewTaskDetails}
            onEditStages={(task) => handleTaskSelect(task)}
            onLogPayment={(task) => {
              setSelectedTaskId(task._id);
              setTaskSearchInput(task.taskName);
              setSelectedTaskForPayment(task);
              setPaymentPercentage(task.paidPercentage?.toString() || "0");
              setPaymentNote("");
              setShowPaymentModal(true);
            }}
          />
        )}
      </div>

      {/* Payment Logger Modal */}
      {showPaymentModal && selectedTaskForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Log Payment - {selectedTaskForPayment.taskName}
              </h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setIsLoggingPayment(false);
                  setPaymentPercentage("");
                  setPaymentNote("");
                  setSelectedTaskForPayment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <PaymentLogger
                taskName={selectedTaskForPayment.taskName}
                currentPercentage={selectedTaskForPayment.paidPercentage || 0}
                paymentPercentage={paymentPercentage}
                setPaymentPercentage={setPaymentPercentage}
                paymentNote={paymentNote}
                setPaymentNote={setPaymentNote}
                onSave={handleLogPayment}
                onCancel={() => {
                  setShowPaymentModal(false);
                  setIsLoggingPayment(false);
                  setPaymentPercentage("");
                  setPaymentNote("");
                  setSelectedTaskForPayment(null);
                }}
                saving={isLoggingPayment}
              />
            </div>
          </div>
        </div>
      )}
      {successMsg && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 text-sm flex items-center gap-2">
          <span>✓</span> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 text-sm flex items-center gap-2">
          <span>✕</span> {errorMsg}
        </div>
      )}
    </div>
  );
};

export default PaymentTrackerPage;