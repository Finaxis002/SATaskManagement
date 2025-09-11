import React, { useEffect, useState } from "react";
import { format, isBefore, isToday, isTomorrow, parseISO } from "date-fns";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const TaskOverview = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("today");
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;
  const [justCompleted, setJustCompleted] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const tabs = ["today", "tomorrow", "upcoming", "overdue", "completed"];

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
    const isActuallyCompleted = task.status === "Completed";
    const isJustNowCompleted = justCompleted.has(task._id);

    if (isActuallyCompleted && !isJustNowCompleted) {
      categorizedTasks.completed.push(task);
      return;
    }

    if (isToday(parsedDate)) {
      categorizedTasks.today.push(task);
    } else if (isTomorrow(parsedDate)) {
      categorizedTasks.tomorrow.push(task);
    } else if (isBefore(parsedDate, now)) {
      categorizedTasks.overdue.push(task);
    } else {
      categorizedTasks.upcoming.push(task);
    }
  });

  // ✅ Dashboard ko stats bhejna
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

  const getTasksByTab = () => {
    switch (activeTab) {
      case "today":
        return categorizedTasks.today;
      case "tomorrow":
        return categorizedTasks.tomorrow;
      case "upcoming":
        return categorizedTasks.upcoming;
      case "overdue":
        return categorizedTasks.overdue;
      case "completed":
        return categorizedTasks.completed;
      default:
        return [];
    }
  };

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
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
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

  useEffect(() => {
    setJustCompleted(new Set());
  }, [activeTab]);

  const isHiddenCompletedTask = (task) =>
    task.status === "Completed" && task.isHidden === true;

  const currentTabIndex = tabs.indexOf(activeTab);

  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1]);
    } else {
      setActiveTab(tabs[tabs.length - 1]);
    }
  };

  const handleNextTab = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1]);
    } else {
      setActiveTab(tabs[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <svg
          className="animate-spin h-8 w-8 text-indigo-500"
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
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
        <span className="ml-3 text-indigo-600 font-semibold">
          Loading tasks...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg  pb-4  ">
      <div className="px-6 py-4 border-b flex flex-col  gap-3">
        <h2 className="text-lg font-bold text-gray-800 mb-3 sm:mb-0">
          Task Overview
        </h2>

        {/* Desktop Tabs */}
        <div className="hidden sm:flex gap-3 bg-gray-200 rounded-xl p-2 ">
          {tabs.map((tab) => {
            const visibleCount = categorizedTasks[tab]?.filter(
              (task) => !isHiddenCompletedTask(task)
            ).length;
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {visibleCount > 0 && (
                  <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {visibleCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Tabs with Slider */}
        <div className="flex sm:hidden items-center justify-between w-full">
          {/* Left Arrow */}
          <button
            onClick={handlePrevTab}
            className="p-2 text-gray-600 disabled:opacity-50"
          >
            <ChevronLeft className="w-8 h-8" /> {/* 👈 Icon */}
          </button>

          {/* Active Tab with Dynamic Color */}
          <span
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm
      ${
        activeTab === "today"
          ? "bg-blue-500 text-white"
          : activeTab === "tomorrow"
          ? "bg-yellow-400 text-white"
          : activeTab === "upcoming"
          ? "bg-orange-500 text-white"
          : activeTab === "overdue"
          ? "bg-red-500 text-white"
          : "bg-green-500 text-white"
      }`}
          >
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            <span className="bg-white text-black px-2 py-0.5 rounded-full text-xs font-bold">
              {categorizedTasks[activeTab]?.filter(
                (task) => !isHiddenCompletedTask(task)
              ).length || 0}
            </span>
          </span>

          {/* Right Arrow */}
          <button
            onClick={handleNextTab}
            className="p-2 text-gray-600 disabled:opacity-50"
          >
            <ChevronRight className="w-8 h-8" /> {/* 👉 Icon */}
          </button>
        </div>
      </div>

      {/* Task list - Desktop */}
      <div className="divide-y hidden md:block h-[60vh] overflow-auto">
        {getTasksByTab().filter((task) => !isHiddenCompletedTask(task))
          .length === 0 ? (
          <div className="px-6 py-4 text-gray-500 text-sm">No tasks found.</div>
        ) : (
          getTasksByTab()
            .filter((task) => !isHiddenCompletedTask(task))
            .map((task) => (
              <div
                key={task._id}
                className="flex justify-between items-center px-6 py-3 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      task.status === "Completed" || justCompleted.has(task._id)
                    }
                    onChange={() => handleToggleCompleted(task._id)}
                    disabled={task.status === "Completed"}
                    className="accent-indigo-600 cursor-pointer"
                  />
                  <span
                    className={`text-sm ${
                      task.status === "Completed" || justCompleted.has(task._id)
                        ? "line-through text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    {task.taskName}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1 text-sm">
                  <span className="text-gray-500 text-xs">
                    {task.dueDate && !isNaN(new Date(task.dueDate).getTime())
                      ? format(new Date(task.dueDate), "MMM d")
                      : "Invalid date"}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {task?.assignees?.map((assignee) => (
                      <span
                        key={assignee.email}
                        className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium"
                      >
                        {assignee.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Task list - Mobile */}
      <div className=" flex gap-10 flex-col mt-8 mb-4 md:hidden h-[60vh] overflow-auto">
        {getTasksByTab().filter((task) => !isHiddenCompletedTask(task))
          .length === 0 ? (
          <div className="px-6 py-4 text-gray-500 text-sm">No tasks found.</div>
        ) : (
          getTasksByTab()
            .filter((task) => !isHiddenCompletedTask(task))
            .map((task) => (
              <div
                key={task._id}
                className="flex justify-between items-center mb-1 px-6 py-3 h-20 hover:bg-gray-50 transition-all shadow-xl"
              >
                <div className="flex items-start flex-col gap-3">
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={
                        task.status === "Completed" ||
                        justCompleted.has(task._id)
                      }
                      onChange={() => handleToggleCompleted(task._id)}
                      disabled={task.status === "Completed"}
                      className="accent-indigo-600 cursor-pointer"
                    />
                    <span
                      className={`text-sm ${
                        task.status === "Completed" ||
                        justCompleted.has(task._id)
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {task.taskName}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {task?.assignees?.map((assignee) => (
                      <span
                        key={assignee.email}
                        className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium"
                      >
                        {assignee.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-sm italic">
                  <span className="text-gray-500 text-xs">
                    {task.dueDate && !isNaN(new Date(task.dueDate).getTime())
                      ? format(new Date(task.dueDate), "MMM d")
                      : "Invalid date"}
                  </span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default TaskOverview;
