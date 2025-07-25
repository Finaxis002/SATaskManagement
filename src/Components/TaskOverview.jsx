import React, { useEffect, useState } from "react";
import { format, isBefore, isToday, isTomorrow, parseISO } from "date-fns";
import { useSelector } from "react-redux";
import axios from "axios";
const TaskOverview = () => {
  const [tasks, setTasks] = useState([]); // Store tasks in state
  const [activeTab, setActiveTab] = useState("today"); // Track active tab (today, tomorrow, etc.)

  // ✅ Get logged-in user info from Redux state
  const { role, userId } = useSelector((state) => state.auth);
  const [justCompleted, setJustCompleted] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch tasks from the API and categorize them
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("https://taskbe.sharda.co.in/api/tasks");
        setTasks(res.data); // Store fetched tasks in state
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const now = new Date();

  // Filter tasks based on user role (only show tasks assigned to the logged-in user if not an admin)
  const filteredTasks = tasks.filter((task) => {
    // Exclude hidden completed tasks no matter what
    if (task.status === "Completed" && task.isHidden) return false;

    if (role === "admin") return true; // Admin sees all non-hidden tasks

    // Show tasks assigned to the user
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

    const isActuallyCompleted = task.status === "Completed";
    const isJustNowCompleted = justCompleted.has(task._id);

    // ✅ This prevents re-showing the task in the current tab after a tab switch
    if (isActuallyCompleted && !isJustNowCompleted) {
      categorizedTasks.completed.push(task);
      return;
    }

    // ✅ Temporarily keep it in current tab if just completed
    if (isToday(parsedDate)) {
      if (activeTab === "today" && isJustNowCompleted) {
        categorizedTasks.today.push(task);
      } else if (!isJustNowCompleted) {
        categorizedTasks.today.push(task);
      }
    } else if (isTomorrow(parsedDate)) {
      if (activeTab === "tomorrow" && isJustNowCompleted) {
        categorizedTasks.tomorrow.push(task);
      } else if (!isJustNowCompleted) {
        categorizedTasks.tomorrow.push(task);
      }
    } else if (isBefore(parsedDate, now)) {
      if (activeTab === "overdue" && isJustNowCompleted) {
        categorizedTasks.overdue.push(task);
      } else if (!isJustNowCompleted) {
        categorizedTasks.overdue.push(task);
      }
    } else {
      if (activeTab === "upcoming" && isJustNowCompleted) {
        categorizedTasks.upcoming.push(task);
      } else if (!isJustNowCompleted) {
        categorizedTasks.upcoming.push(task);
      }
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

  const handleToggleCompleted = async (taskId) => {
    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };

    // Show crossed UI immediately
    setJustCompleted((prev) => new Set(prev).add(taskId));

    try {
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Completed", updatedBy }),
        }
      );

      if (!response.ok) throw new Error("Failed to update task status");

      // ✅ Update local task list so next render shows correct status
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: "Completed" } : task
        )
      );

      console.log("✅ Task marked as completed");
    } catch (error) {
      console.error("❌ Failed to update status", error);

      // Revert justCompleted if error happens
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8">
      <div className="flex justify-between items-center px-6 py- border-b ">
        {role === "user" && (
          <h2
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            My Tasks
          </h2>
        )}

        <div
          className="flex gap-6 text-sm"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {["today", "tomorrow", "upcoming", "overdue", "completed"].map(
            (tab) => {
              const visibleCount = categorizedTasks[tab]?.filter(
                (task) => !isHiddenCompletedTask(task)
              ).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 capitalize border-b-2 transition-all duration-300 ${
                    activeTab === tab
                      ? "border-indigo-600 text-black font-semibold"
                      : "border-transparent text-gray-600 hover:text-indigo-600"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {/* {visibleCount > 0 ? ` ${ visibleCount}` : ""} */}
                  {visibleCount > 0 && (
                    <span className="ml-1 text-sm font-bold text-indigo-600">
                      {visibleCount}
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      <div className="divide-y  max-h-[47vh] overflow-y-scroll">
        {getTasksByTab().filter((task) => !isHiddenCompletedTask(task))
          .length === 0 ? (
          <div className="px-6 py-4 text-gray-500 text-sm">No tasks found.</div>
        ) : (
          getTasksByTab()
            .filter((task) => !isHiddenCompletedTask(task))
            .map((task) => (
              <div
                key={task._id}
                className="flex justify-between items-center border-b px-6 py-4 hover:bg-gray-50 transition-all duration-200"
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
                    className={`text-gray-800 text-sm  ${
                      task.status === "Completed" || justCompleted.has(task._id)
                        ? "line-through text-gray-400"
                        : ""
                    }`}
                    style={{ fontFamily: "Roboto, sans-serif" }}
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
