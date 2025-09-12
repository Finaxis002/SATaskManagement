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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <motion.div
          className="h-10 w-10 rounded-full border-4 border-indigo-400 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <span className="ml-3 text-indigo-600 font-semibold">
          Loading tasks...
        </span>
      </div>
    );
  }

  return (

    <div>
      {/* Desktop view */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-6 font-sans hidden sm:block">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-4">
          Task Overview
        </h2>

        {/* Tabs */}
        <div className="flex gap-3 flex-wrap mb-6">
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
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                  ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700"
                  }
                  shadow-md active:shadow-inner
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {visibleCount > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {visibleCount}
                  </span>
                )}
              </motion.button>

            );
          })}
        </div>


        {/* Task List */}
        <div className="overflow-y-auto h-[65vh]">
          {getTasksByTab().filter((t) => !isHiddenCompletedTask(t)).length ===
          0 ? (
            <div className="text-gray-500 text-sm text-center italic py-12">
              No tasks found
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
                      className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={
                            task.status === "Completed" ||
                            justCompleted.has(task._id)
                          }
                          onChange={() => handleToggleCompleted(task._id)}
                          disabled={task.status === "Completed"}
                          className="accent-indigo-600 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <p
                            className={`font-medium ${
                              task.status === "Completed" ||
                              justCompleted.has(task._id)
                                ? "line-through text-gray-400"
                                : "text-gray-800"
                            }`}
                          >
                            {task.taskName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {task.dueDate &&
                            !isNaN(new Date(task.dueDate).getTime())
                              ? format(new Date(task.dueDate), "MMM d, yyyy")
                              : "No due date"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {task.assignees?.map((assignee) => (
                          <span
                            key={assignee.email}
                            className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
                          >
                            {assignee.name}
                          </span>
                        ))}
                      </div>
                    </motion.li>
                  ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden block bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-4 font-sans">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Task Overview</h2>

        {/* Tabs Carousel */}
        <div className="relative flex items-center mb-5">
          <button
            onClick={() => handleArrowClick("left")}
            className="absolute left-0 z-10 bg-white shadow-md rounded-full p-1 -ml-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
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
            className="flex gap-2 overflow-x-auto scrollbar-hide px-8 w-full scroll-smooth"
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
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-200"
                    }
                    active:scale-95`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-800"
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
            className="absolute right-0 z-10 bg-white shadow-md rounded-full p-1 -mr-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
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

        {/* Task List */}
        <div className="overflow-y-auto max-h-[70vh]">
          {getTasksByTab().filter((t) => !isHiddenCompletedTask(t)).length ===
          0 ? (
            <div className="text-gray-500 text-xs text-center italic py-8">
              No tasks
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
                      className="bg-white rounded-xl shadow-md p-3 flex items-center justify-between hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            task.status === "Completed" ||
                            justCompleted.has(task._id)
                          }
                          onChange={() => handleToggleCompleted(task._id)}
                          disabled={task.status === "Completed"}
                          className="accent-indigo-600 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              task.status === "Completed" ||
                              justCompleted.has(task._id)
                                ? "line-through text-gray-400"
                                : "text-gray-800"
                            }`}
                          >
                            {task.taskName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {task.dueDate &&
                            !isNaN(new Date(task.dueDate).getTime())
                              ? format(new Date(task.dueDate), "MMM d")
                              : "No date"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 max-w-[40%] justify-end">
                        {task.assignees?.map((assignee) => (
                          <span
                            key={assignee.email}
                            className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-medium truncate"
                          >
                            {assignee.name}
                          </span>
                        ))}
                      </div>
                    </motion.li>
                  ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default TaskOverview;
