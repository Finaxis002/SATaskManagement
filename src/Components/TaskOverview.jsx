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
const isToday = (date) => date.toDateString() === new Date().toDateString();
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

  const categorizedTasks = { today: [], tomorrow: [], upcoming: [], overdue: [], completed: [] };

  filteredTasks.forEach((task) => {
    if (!task.dueDate) return;
    const parsedDate = parseISO(task.dueDate);
    const isCompleted = task.status === "Completed";
    if (isCompleted) return categorizedTasks.completed.push(task);
    if (isToday(parsedDate)) categorizedTasks.today.push(task);
    else if (isTomorrow(parsedDate)) categorizedTasks.tomorrow.push(task);
    else if (isBefore(parsedDate, now)) categorizedTasks.overdue.push(task);
    else categorizedTasks.upcoming.push(task);
  });

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
      if (!response.ok) throw new Error("Failed to update task");
      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, status: "Completed" } : task
        )
      );
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const isHiddenCompletedTask = (task) =>
    task.status === "Completed" && task.isHidden === true;

  const currentTabIndex = tabs.findIndex(tab => tab.key === activeTab);
  const handlePrevTab = () => setActiveTab(
    tabs[(currentTabIndex - 1 + tabs.length) % tabs.length].key
  );
  const handleNextTab = () => setActiveTab(
    tabs[(currentTabIndex + 1) % tabs.length].key
  );

  const getTabColorClasses = (color, isActive) => {
    const colorMap = {
      blue: isActive ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700",
      yellow: isActive ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700",
      orange: isActive ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-700",
      red: isActive ? "bg-red-500 text-white" : "bg-red-50 text-red-700",
      green: isActive ? "bg-green-500 text-white" : "bg-green-50 text-green-700"
    };
    return colorMap[color] || colorMap.blue;
  };

  const getMobileTabColors = (color) => {
    const colorMap = {
      blue: "bg-blue-600 text-white",
      yellow: "bg-amber-500 text-white",
      orange: "bg-orange-500 text-white",
      red: "bg-red-500 text-white",
      green: "bg-green-500 text-white"
    };
    return colorMap[color] || colorMap.blue;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mx-2 sm:mx-0 flex justify-center items-center h-[300px]">
        <div className="text-gray-600 font-medium">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 mx-2 sm:mx-0">
      {/* Header */}
      <div className="px-3 sm:px-6 py-3 sm:py-5 border-b border-gray-100 bg-gray-50 rounded-t-xl sm:rounded-t-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-800">Task Overview</h2>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:flex gap-2 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const visibleCount = categorizedTasks[tab.key]?.filter(
              (t) => !isHiddenCompletedTask(t)
            ).length;
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${getTabColorClasses(tab.color, isActive)}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {visibleCount > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                    {visibleCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Tabs */}
        <div className="flex sm:hidden items-center justify-between w-full mt-2">
          <button onClick={handlePrevTab} className="p-2 text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className={`flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full ${getMobileTabColors(tabs[currentTabIndex].color)}`}>
            {React.createElement(tabs[currentTabIndex].icon, { className: "w-4 h-4 text-white" })}
            <span className="font-semibold text-white text-sm">
              {tabs[currentTabIndex].label}
            </span>
            <span className="bg-white/30 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              {categorizedTasks[activeTab]?.filter(
                (t) => !isHiddenCompletedTask(t)
              ).length || 0}
            </span>
          </div>
          <button onClick={handleNextTab} className="p-2 text-gray-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="h-[50vh] sm:h-[60vh] overflow-auto">
        {getTasksByTab().filter((t) => !isHiddenCompletedTask(t)).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Calendar className="w-10 h-10 mb-3 opacity-50" />
            <span className="text-sm font-medium">No tasks found</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {getTasksByTab()
              .filter((t) => !isHiddenCompletedTask(t))
              .map((task) => (
                <div key={task._id} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.status === "Completed" || justCompleted.has(task._id)}
                      onChange={() => handleToggleCompleted(task._id)}
                      disabled={task.status === "Completed"}
                      className="w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                    <span
                      className={`text-sm font-medium truncate ${
                        task.status === "Completed" ? "line-through text-gray-400" : "text-gray-800"
                      }`}
                    >
                      {task.taskName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {task.dueDate && !isNaN(new Date(task.dueDate).getTime())
                        ? format(new Date(task.dueDate), "MMM d")
                        : "Invalid"}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {task?.assignees?.slice(0, 2).map((a) => (
                        <div key={a.email} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                          <Users className="w-3 h-3" />
                          <span className="text-xs font-medium truncate">
                            {a.name.split(' ')[0]}
                          </span>
                        </div>
                      ))}
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
