import React, { useEffect, useState } from "react";
import { format, isBefore, isToday, isTomorrow, parseISO } from "date-fns";
import { useSelector } from "react-redux";
import axios from "axios";

const TaskOverview = () => {
  const [tasks, setTasks] = useState([]); // Store tasks in state
  const [activeTab, setActiveTab] = useState("today"); // Track active tab (today, tomorrow, etc.)

  // ✅ Get logged-in user info from Redux state
  const { role, userId } = useSelector((state) => state.auth);

  // Fetch tasks from the API and categorize them
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(
          "https://sataskmanagementbackend.onrender.com/api/tasks"
        );
        setTasks(res.data); // Store fetched tasks in state
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };

    fetchTasks();
  }, []);

  const now = new Date();

  // Filter tasks based on user role (only show tasks assigned to the logged-in user if not an admin)
  const filteredTasks = tasks.filter((task) => {
    if (role === "admin") return true; // Admin sees all tasks
    return task.assignees?.some(
      (assignee) => assignee.email.toLowerCase() === userId?.toLowerCase()
    );
  });

  // Categorize tasks based on due date (Today, Tomorrow, Overdue, etc.)
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

    if (task.status === "Completed") {
      categorizedTasks.completed.push(task);
      return;
    }

    if (isToday(parsedDate)) {
      categorizedTasks.today.push(task);
    } else if (isTomorrow(parsedDate)) {
      categorizedTasks.tomorrow.push(task);
    } else if (isBefore(parsedDate, new Date())) {
      categorizedTasks.overdue.push(task);
    } else {
      categorizedTasks.upcoming.push(task);
    }
  });

  // Filter tasks by the active tab (Today, Tomorrow, etc.)
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

  const handleToggleCompleted = async (taskId, isCompletedNow) => {
    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };
  
    const newStatus = isCompletedNow ? "Completed" : "To Do";
  
    console.log("🔁 Optimistically updating to:", newStatus);
  
    // 🧠 1. Optimistic UI update immediately
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );
  
    // 🧠 2. Instant Tab switch
    if (newStatus === "Completed") {
      setActiveTab("completed");
    }
  
    // 🧠 3. Fire API in background
    try {
      const response = await fetch(
        `https://sataskmanagementbackend.onrender.com/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus, updatedBy }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update task status");
      }
  
      console.log("✅ Status updated on server");
      // You may re-fetch or rely on local update
    } catch (error) {
      console.error("❌ Error updating task status:", error);
      alert("Something went wrong while updating. Please refresh.");
    }
  };
  

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8">
      <div className="flex justify-between items-center px-6 py-4 border-b ">
        <h2 className="text-xl font-semibold text-gray-900">My Tasks</h2>

        <div className="flex gap-6 text-sm">
          {["today", "tomorrow", "upcoming", "overdue", "completed"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 capitalize border-b-2 transition-all duration-300 ${
                  activeTab === tab
                    ? "border-indigo-600 text-indigo-600 font-semibold"
                    : "border-transparent text-gray-600 hover:text-indigo-600"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {categorizedTasks[tab] && categorizedTasks[tab].length > 0
                  ? ` (${categorizedTasks[tab].length})`
                  : ""}
              </button>
            )
          )}
        </div>
      </div>

      <div className="divide-y">
        {getTasksByTab().length === 0 ? (
          <div className="px-6 py-4 text-gray-500 text-sm">No tasks found.</div>
        ) : (
          getTasksByTab().map((task) => (
            <div
              key={task._id}
              className="flex justify-between items-center border-b px-6 py-4 hover:bg-gray-50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.status === "Completed"}
                  onChange={() =>
                    task.status !== "Completed" &&
                    handleToggleCompleted(task._id, true)
                  }
                  disabled={task.status === "Completed"} // ✅ Prevent re-click
                  className="accent-indigo-600 cursor-pointer"
                />
                <span
                  className={`text-gray-800 text-lg ${
                    task.status === "Completed"
                      ? "line-through text-gray-400"
                      : ""
                  }`}
                >
                  {task.taskName}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {task?.assignees?.map((assignee) => (
                  <span
                    key={assignee.email}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {assignee.name}
                  </span>
                ))}
                <span className="text-gray-500">
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
