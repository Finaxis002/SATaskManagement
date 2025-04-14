import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, isBefore, isToday } from "date-fns";

const TaskOverview = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/tasks");
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };

    fetchTasks();
  }, []);

  // Categorize tasks
  const now = new Date();
  const completed = tasks.filter((t) => t.completed);
  const overdue = tasks.filter((t) => !t.completed && isBefore(new Date(t.due), now));
  const upcoming = tasks.filter((t) => !t.completed && (isToday(new Date(t.due)) || new Date(t.due) > now));

  const getTasksByTab = () => {
    switch (activeTab) {
      case "completed":
        return completed;
      case "overdue":
        return overdue;
      case "upcoming":
      default:
        return upcoming;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-10">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">My tasks</h2>
        <div className="flex gap-6 text-sm">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`pb-1 border-b-2 ${
              activeTab === "upcoming" ? "border-gray-600 text-black font-medium" : "border-transparent text-gray-500"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("overdue")}
            className={`pb-1 border-b-2 ${
              activeTab === "overdue" ? "border-gray-600 text-black font-medium" : "border-transparent text-gray-500"
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`pb-1 border-b-2 ${
              activeTab === "completed" ? "border-gray-600 text-black font-medium" : "border-transparent text-gray-500"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="divide-y">
        {getTasksByTab().length === 0 ? (
          <div className="px-6 py-4 text-gray-500 text-sm">No tasks found.</div>
        ) : (
          getTasksByTab().map((task) => (
            <div
              key={task._id}
              className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={task.completed} readOnly className="accent-blue-600" />
                <span className={`text-gray-800 ${task.completed ? "line-through" : ""}`}>{task.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {task?.assignee?.name && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    {task.assignee.name}
                  </span>
                )}
                <span className="text-gray-500">
                  {task.due ? format(new Date(task.due), "MMM d") : "No date"}
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
