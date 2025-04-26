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
        const res = await axios.get("https://sataskmanagementbackend.onrender.com/api/tasks");
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
    return task.assignees?.some((assignee) => assignee.email.toLowerCase() === userId?.toLowerCase());
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
    if (!task.dueDate) {
      console.warn("⚠️ Skipping task with missing dueDate:", task);
      return; // Skip this task
    }
  
    const parsedDate = parseISO(task.dueDate); // ✅ Safe to parse now
  
    if (isToday(parsedDate)) {
      categorizedTasks.today.push(task);
    } else if (isTomorrow(parsedDate)) {
      categorizedTasks.tomorrow.push(task);
    } else if (isBefore(parsedDate, new Date())) {
      categorizedTasks.overdue.push(task);
    } else {
      categorizedTasks.upcoming.push(task);
    }
  
    if (task.completed) {
      categorizedTasks.completed.push(task);
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
                {tab}
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
                  checked={task.completed}
                  readOnly
                  className="accent-indigo-600"
                />
                <span
                  className={`text-gray-800 text-lg ${
                    task.completed ? "line-through text-gray-400" : ""
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
