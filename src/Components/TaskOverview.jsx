import React, { useEffect, useState, useRef } from "react";
import { format, isBefore, isToday, isTomorrow, parseISO } from "date-fns";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Tabs
const tabs = ["today", "tomorrow", "upcoming", "overdue", "completed"];

// Tab Button Animation (desktop only)
const buttonVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, type: "spring", stiffness: 200 },
  }),
  hover: {
    scale: 1.05,
    y: -2,
    boxShadow: "0px 6px 15px rgba(79,70,229,0.4)",
    transition: { type: "spring", stiffness: 300 },
  },
};

// Task Row Animation
const rowVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" },
  }),
  exit: { opacity: 0, y: -15, transition: { duration: 0.25 } },
};

const TaskOverview = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("today");
  const [justCompleted, setJustCompleted] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);

  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("https://taskbe.sharda.co.in/api/tasks");
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const now = new Date();

  // Filter & categorize
  const filteredTasks = tasks.filter((task) => {
    if (task.status === "Completed" && task.isHidden) return false;
    if (role === "admin") return true;
    return task.assignees?.some(
      (assignee) => assignee.email.toLowerCase() === userEmail?.toLowerCase()
    );
  });

  const categorizedTasks = {
    today: [],
    tomorrow: [],
    upcoming: [],
    overdue: [],
    completed: [],
  };

  filteredTasks.forEach((task) => {
    if (!task.dueDate) return;
    const parsedDate = parseISO(task.dueDate);
    const isCompleted = task.status === "Completed";
    const isJustNowCompleted = justCompleted.has(task._id);

    if (isCompleted && !isJustNowCompleted) {
      categorizedTasks.completed.push(task);
      return;
    }

    if (isToday(parsedDate)) categorizedTasks.today.push(task);
    else if (isTomorrow(parsedDate)) categorizedTasks.tomorrow.push(task);
    else if (isBefore(parsedDate, now)) categorizedTasks.overdue.push(task);
    else categorizedTasks.upcoming.push(task);
  });

  // Update dashboard stats
  useEffect(() => {
    const counts = {
      completed: categorizedTasks.completed.length,
      overdue: categorizedTasks.overdue.length,
      progress:
        categorizedTasks.today.length +
        categorizedTasks.tomorrow.length +
        categorizedTasks.upcoming.length,
      total:
        categorizedTasks.today.length +
        categorizedTasks.tomorrow.length +
        categorizedTasks.upcoming.length +
        categorizedTasks.overdue.length +
        categorizedTasks.completed.length,
    };
    if (typeof window.updateDashboardStats === "function") {
      window.updateDashboardStats(counts);
    }
  }, [tasks, justCompleted]);

  const getTasksByTab = () => categorizedTasks[activeTab] || [];

  const handleToggleCompleted = async (taskId) => {
    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };
    setJustCompleted((prev) => new Set(prev).add(taskId));
    try {
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Completed", updatedBy }),
        }
      );
      if (!response.ok) throw new Error("Failed to update task status");
      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, status: "Completed" } : task
        )
      );
    } catch (error) {
      console.error("❌ Failed to update status", error);
      setJustCompleted((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  useEffect(() => setJustCompleted(new Set()), [activeTab]);

  const isHiddenCompletedTask = (task) =>
    task.status === "Completed" && task.isHidden === true;

  // Handle arrows in mobile (infinite loop + center focus)
  const handleArrowClick = (direction) => {
    const currentIndex = tabs.indexOf(activeTab);
    let newIndex;

    if (direction === "left") {
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else {
      newIndex = (currentIndex + 1) % tabs.length;
    }

    setActiveTab(tabs[newIndex]);

    const container = scrollRef.current;
    const activeButton = container?.querySelector(
      `[data-tab="${tabs[newIndex]}"]`
    );
    if (activeButton && container) {
      const offset =
        activeButton.offsetLeft -
        container.offsetWidth / 2 +
        activeButton.offsetWidth / 2;
      container.scrollTo({ left: offset, behavior: "smooth" });
    }
  };

  // Get tab styling based on type
  const getTabStyle = (tab, isActive) => {
    const baseStyle = "px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2";
    
    if (isActive) {
      switch(tab) {
        case 'overdue': return `${baseStyle} bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25`;
        case 'today': return `${baseStyle} bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25`;
        case 'tomorrow': return `${baseStyle} bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25`;
        case 'upcoming': return `${baseStyle} bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25`;
        case 'completed': return `${baseStyle} bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25`;
        default: return `${baseStyle} bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg`;
      }
    }
    return `${baseStyle} bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200/60 hover:bg-white hover:shadow-md hover:scale-105`;
  };

  const getTabIcon = (tab) => {
    switch(tab) {
      case 'overdue': return '⚠️';
      case 'today': return '🔥';
      case 'tomorrow': return '⏰';
      case 'upcoming': return '📅';
      case 'completed': return '✅';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-3xl shadow-2xl border border-slate-200/60">
        <motion.div
          className="relative flex items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <motion.div
              className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-indigo-600"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-r-purple-400 opacity-60"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
          <div>
            <motion.h3 
              className="text-slate-800 font-semibold text-lg"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Loading tasks...
            </motion.h3>
            <p className="text-slate-500 text-sm">Please wait a moment</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop view */}
      <div className="bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 rounded-3xl shadow-2xl border border-slate-200/60 backdrop-blur-sm p-8 font-sans hidden sm:block relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Task Overview
              </h2>
              <p className="text-slate-600 flex items-center gap-2">
                <span>Stay organized and productive</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50 shadow-sm">
              <span className="text-sm font-medium text-slate-700">Live Updates</span>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex gap-3 flex-wrap mb-4 p-3 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-200/40">
            {tabs.map((tab, i) => {
              const visibleCount = categorizedTasks[tab]?.filter(
                (t) => !isHiddenCompletedTask(t)
              ).length;
              const isActive = activeTab === tab;
              return (
                <motion.button
                  key={tab}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  variants={buttonVariants}
                  onClick={() => setActiveTab(tab)}
                  className={getTabStyle(tab, isActive)}
                >
                  <span className="text-lg">{getTabIcon(tab)}</span>
                  <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  {visibleCount > 0 && (
                    <span
                      className={`ml-2 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {visibleCount}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Enhanced Task List */}
          <div className="overflow-y-auto h-[65vh]">
            {getTasksByTab().filter((t) => !isHiddenCompletedTask(t)).length ===
            0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <span className="text-4xl opacity-60">📝</span>
                </div>
                <h3 className="text-slate-600 text-xl font-semibold mb-2">No tasks found</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  {activeTab === 'completed' ? 'No completed tasks yet. Keep working!' : 
                   activeTab === 'overdue' ? 'Great! No overdue tasks.' :
                   'All caught up! Time to add some new tasks.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                <AnimatePresence mode="wait">
                  {getTasksByTab()
                    .filter((task) => !isHiddenCompletedTask(task))
                    .map((task, idx) => (
                      <motion.li
                        key={task._id}
                        custom={idx}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-3 hover:shadow-xl hover:-translate-y-1 hover:bg-white transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <motion.input
                              type="checkbox"
                              checked={
                                task.status === "Completed" ||
                                justCompleted.has(task._id)
                              }
                              onChange={() => handleToggleCompleted(task._id)}
                              disabled={task.status === "Completed"}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="w-4 h-4 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
                            />
                            <div className="flex-1">
                              <h3
                                className={`font-semibold text-lg leading-tight transition-all duration-300 ${
                                  task.status === "Completed" ||
                                  justCompleted.has(task._id)
                                    ? "line-through text-slate-400"
                                    : "text-slate-800 group-hover:text-slate-900"
                                }`}
                              >
                                {task.taskName}
                              </h3>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-sm text-slate-500 bg-slate-100/80 px-3 py-1 rounded-lg font-medium">
                                  📅 {task.dueDate &&
                                  !isNaN(new Date(task.dueDate).getTime())
                                    ? format(new Date(task.dueDate), "MMM d, yyyy")
                                    : "No due date"}
                                </span>
                                <span className={`text-sm px-3 py-1 rounded-lg font-medium ${
                                  task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                  activeTab === 'overdue' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {task.status === 'Completed' ? '✅ Completed' : 
                                   activeTab === 'overdue' ? '⚠️ Overdue' : 
                                   '🔄 In Progress'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 ml-4 ">
                            {task.assignees?.map((assignee, index) => (
                              <motion.div
                                key={assignee.email}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                // transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-2 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 shadow-sm"
                              >
                                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                  {assignee.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-slate-700 truncate max-w-20">
                                  {assignee.name.split(' ')[0]}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.li>
                    ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden block bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 rounded-3xl shadow-2xl border border-slate-200/60 backdrop-blur-sm p-6 font-sans relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Tasks
              </h2>
              <p className="text-slate-600 text-sm flex items-center gap-1">
                <span>Stay productive</span>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              </p>
            </div>
            <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200/50">
              <span className="text-xs font-medium text-slate-700">Live</span>
            </div>
          </div>

          {/* Enhanced Mobile Tabs Carousel */}
          <div className="relative flex items-center mb-6">
            <button
              onClick={() => handleArrowClick("left")}
              className="absolute left-0 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2.5 -ml-2 border border-slate-200/60 hover:bg-white hover:scale-110 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div
              ref={scrollRef}
              id="mobile-tabs"
              className="flex gap-2 overflow-x-auto scrollbar-hide px-10 w-full scroll-smooth"
            >
              {tabs.map((tab) => {
                const visibleCount = categorizedTasks[tab]?.filter(
                  (t) => !isHiddenCompletedTask(t)
                ).length;
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    data-tab={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 active:scale-95 ${
                      isActive
                        ? (() => {
                            switch(tab) {
                              case 'overdue': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25';
                              case 'today': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25';
                              case 'tomorrow': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25';
                              case 'upcoming': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25';
                              case 'completed': return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25';
                              default: return 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg';
                            }
                          })()
                        : "bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200/60 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <span className="text-base">{getTabIcon(tab)}</span>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {visibleCount || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handleArrowClick("right")}
              className="absolute right-0 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2.5 -mr-2 border border-slate-200/60 hover:bg-white hover:scale-110 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Enhanced Mobile Task List */}
          <div className="overflow-y-auto max-h-[70vh]">
            {getTasksByTab().filter((t) => !isHiddenCompletedTask(t)).length ===
            0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <span className="text-3xl opacity-60">📝</span>
                </div>
                <p className="text-slate-600 font-medium mb-1">No tasks</p>
                <p className="text-slate-500 text-sm">All caught up!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                <AnimatePresence mode="wait">
                  {getTasksByTab()
                    .filter((task) => !isHiddenCompletedTask(task))
                    .map((task, idx) => (
                      <motion.li
                        key={task._id}
                        custom={idx}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200/60 p-4 hover:shadow-lg hover:bg-white transition-all duration-200"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={
                                task.status === "Completed" ||
                                justCompleted.has(task._id)
                              }
                              onChange={() => handleToggleCompleted(task._id)}
                              disabled={task.status === "Completed"}
                              className="w-4 h-4 rounded border-2 border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-semibold leading-tight mb-1 ${
                                  task.status === "Completed" ||
                                  justCompleted.has(task._id)
                                    ? "line-through text-slate-400"
                                    : "text-slate-800"
                                }`}
                              >
                                {task.taskName}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                  {task.dueDate &&
                                  !isNaN(new Date(task.dueDate).getTime())
                                    ? format(new Date(task.dueDate), "MMM d")
                                    : "No date"}
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                                  task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                  activeTab === 'overdue' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {task.status === 'Completed' ? 'Done' : 
                                   activeTab === 'overdue' ? 'Late' : 
                                   'Active'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 justify-end max-w-[40%] flex-shrink-0">
                            {task.assignees?.slice(0, 2).map((assignee) => (
                              <div
                                key={assignee.email}
                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50"
                              >
                                <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {assignee.name.charAt(0)}
                                </div>
                                <span className="text-xs font-medium text-slate-700 truncate max-w-16">
                                  {assignee.name.split(' ')[0]}
                                </span>
                              </div>
                            ))}
                            {task.assignees?.length > 2 && (
                              <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-slate-600">
                                  +{task.assignees.length - 2}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.li>
                    ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskOverview;