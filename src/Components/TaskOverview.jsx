import React, { useEffect, useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Loader2,
  Filter,
  TrendingUp
} from "lucide-react";

// Date utility functions
const parseISO = (dateString) => new Date(dateString);
const format = (date, formatStr) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (formatStr === "MMM d") {
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }
  return date.toLocaleDateString();
};
const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};
const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};
const isBefore = (date, compareDate) => date < compareDate;

const TaskOverview = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("today");
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;
  const [justCompleted, setJustCompleted] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [animatingTask, setAnimatingTask] = useState(null);

  const tabs = [
    { key: "today", label: "Today", icon: Calendar, color: "blue" },
    { key: "tomorrow", label: "Tomorrow", icon: Clock, color: "yellow" },
    { key: "upcoming", label: "Upcoming", icon: TrendingUp, color: "orange" },
    { key: "overdue", label: "Overdue", icon: AlertCircle, color: "red" },
    { key: "completed", label: "Completed", icon: CheckCircle2, color: "green" }
  ];

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("https://taskbe.sharda.co.in/api/tasks");
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setTimeout(() => setLoading(false), 800); // Smooth loading transition
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
    
    setAnimatingTask(taskId);
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
      
      setTimeout(() => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, status: "Completed" } : task
          )
        );
        setAnimatingTask(null);
      }, 500);
    } catch (error) {
      console.error("Failed to update status", error);
      setJustCompleted((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      setAnimatingTask(null);
    }
  };

  useEffect(() => {
    setJustCompleted(new Set());
  }, [activeTab]);

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

  const isHiddenCompletedTask = (task) =>
    task.status === "Completed" && task.isHidden === true;

  const currentTabIndex = tabs.findIndex(tab => tab.key === activeTab);

  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1].key);
    } else {
      setActiveTab(tabs[tabs.length - 1].key);
    }
  };

  const handleNextTab = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1].key);
    } else {
      setActiveTab(tabs[0].key);
    }
  };

  const getTabColorClasses = (color, isActive) => {
    const colorMap = {
      blue: isActive ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100",
      yellow: isActive ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100",
      orange: isActive ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-700 hover:bg-orange-100",
      red: isActive ? "bg-red-500 text-white" : "bg-red-50 text-red-700 hover:bg-red-100",
      green: isActive ? "bg-green-500 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"
    };
    return colorMap[color] || colorMap.blue;
  };

  const getMobileTabColors = (color) => {
    const colorMap = {
      blue: "bg-blue-500 text-white",
      yellow: "bg-amber-500 text-white",
      orange: "bg-orange-500 text-white",
      red: "bg-red-500 text-white",
      green: "bg-green-500 text-white"
    };
    return colorMap[color] || colorMap.blue;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 mx-2 sm:mx-0">
        <div className="flex items-center justify-center h-[300px] sm:h-[400px]">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 animate-spin" />
            <div className="flex flex-col items-center gap-2">
              <span className="text-gray-600 font-medium text-sm sm:text-base">Loading tasks...</span>
              <div className="w-32 sm:w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-xl mx-2 sm:mx-0">
      {/* Header */}
      <div className="px-3 sm:px-6 py-3 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-xl sm:rounded-t-2xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Task Overview</h2>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:flex gap-2 bg-gray-100 rounded-xl p-1.5">
          {tabs.map((tab) => {
            const visibleCount = categorizedTasks[tab.key]?.filter(
              (task) => !isHiddenCompletedTask(task)
            ).length;
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  getTabColorClasses(tab.color, isActive)
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {visibleCount > 0 && (
                  <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center">
                    {visibleCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tablet Tabs */}
        <div className="hidden sm:flex lg:hidden gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const visibleCount = categorizedTasks[tab.key]?.filter(
              (task) => !isHiddenCompletedTask(task)
            ).length;
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                  getTabColorClasses(tab.color, isActive)
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden md:inline">{tab.label}</span>
                {visibleCount > 0 && (
                  <span className="bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-xs font-bold min-w-[16px] text-center">
                    {visibleCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Tabs */}
        <div className="flex sm:hidden items-center justify-between w-full">
          <button
            onClick={handlePrevTab}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-200 transform hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border border-gray-200 bg-white">
            <div className={`p-1.5 rounded-lg ${getMobileTabColors(tabs[currentTabIndex].color)}`}>
              {React.createElement(tabs[currentTabIndex].icon, { className: "w-3 h-3" })}
            </div>
            <span className="font-semibold text-gray-800 text-sm">
              {tabs[currentTabIndex].label}
            </span>
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center">
              {categorizedTasks[activeTab]?.filter(
                (task) => !isHiddenCompletedTask(task)
              ).length || 0}
            </span>
          </div>

          <button
            onClick={handleNextTab}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-200 transform hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Task List - Desktop/Tablet */}
      <div className="hidden sm:block h-[50vh] sm:h-[60vh] overflow-auto">
        {getTasksByTab().filter((task) => !isHiddenCompletedTask(task)).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-50" />
            <span className="text-sm font-medium">No tasks found</span>
            <span className="text-xs mt-1">You're all caught up!</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {getTasksByTab()
              .filter((task) => !isHiddenCompletedTask(task))
              .map((task, index) => (
                <div
                  key={task._id}
                  className={`flex justify-between items-center px-3 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-all duration-200 transform hover:translate-x-1 ${
                    animatingTask === task._id ? 'animate-pulse bg-green-50' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={task.status === "Completed" || justCompleted.has(task._id)}
                        onChange={() => handleToggleCompleted(task._id)}
                        disabled={task.status === "Completed"}
                        className="w-4 h-4 sm:w-5 sm:h-5 accent-indigo-600 cursor-pointer transition-transform duration-200 hover:scale-110"
                      />
                      {animatingTask === task._id && (
                        <div className="absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 border-2 border-green-500 rounded animate-ping"></div>
                      )}
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-medium transition-all duration-300 truncate ${
                        task.status === "Completed" || justCompleted.has(task._id)
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {task.taskName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <div className="flex flex-col items-end gap-1 sm:gap-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">
                          {task.dueDate && !isNaN(new Date(task.dueDate).getTime())
                            ? format(new Date(task.dueDate), "MMM d")
                            : "Invalid"}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 max-w-24 sm:max-w-48">
                        {task?.assignees?.slice(0, 2).map((assignee) => (
                          <div key={assignee.email} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                            <Users className="w-2 h-2 sm:w-3 sm:h-3" />
                            <span className="text-xs font-medium truncate max-w-12 sm:max-w-20">
                              {assignee.name.split(' ')[0]}
                            </span>
                          </div>
                        ))}
                        {task?.assignees?.length > 2 && (
                          <div className="flex items-center bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                            <span className="text-xs font-medium">+{task.assignees.length - 2}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Task List - Mobile */}
      <div className="sm:hidden h-[calc(100vh-200px)] max-h-[500px] overflow-auto">
        {getTasksByTab().filter((task) => !isHiddenCompletedTask(task)).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
            <Calendar className="w-12 h-12 mb-3 opacity-50" />
            <span className="text-sm font-medium text-center">No tasks found</span>
            <span className="text-xs mt-1 text-center">You're all caught up for {tabs[currentTabIndex].label.toLowerCase()}!</span>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {getTasksByTab()
              .filter((task) => !isHiddenCompletedTask(task))
              .map((task, index) => (
                <div
                  key={task._id}
                  className={`bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md active:scale-[0.99] ${
                    animatingTask === task._id ? 'animate-pulse bg-green-50 border-green-200' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={task.status === "Completed" || justCompleted.has(task._id)}
                        onChange={() => handleToggleCompleted(task._id)}
                        disabled={task.status === "Completed"}
                        className="w-4 h-4 accent-indigo-600 cursor-pointer"
                      />
                      {animatingTask === task._id && (
                        <div className="absolute inset-0 w-4 h-4 border-2 border-green-500 rounded animate-ping"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm font-medium block mb-2 leading-5 transition-all duration-300 ${
                          task.status === "Completed" || justCompleted.has(task._id)
                            ? "line-through text-gray-400"
                            : "text-gray-800"
                        }`}
                      >
                        {task.taskName}
                      </span>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {task?.assignees?.slice(0, 3).map((assignee) => (
                          <div key={assignee.email} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                            <Users className="w-2.5 h-2.5" />
                            <span className="text-xs font-medium">
                              {assignee.name.split(' ')[0]}
                            </span>
                          </div>
                        ))}
                        {task?.assignees?.length > 3 && (
                          <div className="flex items-center bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            <span className="text-xs font-medium">+{task.assignees.length - 3}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {task.dueDate && !isNaN(new Date(task.dueDate).getTime())
                            ? format(new Date(task.dueDate), "MMM d")
                            : "Invalid date"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskOverview;