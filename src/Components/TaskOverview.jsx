
import React, { useEffect, useState } from "react";
import axios from "axios";

import { format, isBefore, isToday, isTomorrow } from "date-fns";

import { useSelector } from "react-redux";



const TaskOverview = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("today");

  // ✅ Get logged-in user info
  const { role, userId } = useSelector((state) => state.auth);

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


  const now = new Date();

  const filteredTasks = tasks.filter((task) => {
    if (role === "admin") return true;
    return task.assignee?.email?.toLowerCase() === userId?.toLowerCase();
  });


  
  const patchedTasks = filteredTasks.map((t) => {
    let fixedDue = t.due;
    if (t.due === "Today") {
      fixedDue = new Date().toISOString();
    } else if (t.due === "Tomorrow") {
      fixedDue = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
    return { ...t, due: fixedDue };
  });

  const todayTasks = patchedTasks.filter(
    (t) => !t.completed && t.due && isToday(new Date(t.due))
  );
  
  const tomorrowTasks = patchedTasks.filter(
    (t) => !t.completed && t.due && isTomorrow(new Date(t.due))
  );
  
  const upcoming = patchedTasks.filter(
    (t) =>
      !t.completed &&
      t.due &&
      new Date(t.due) > now &&
      !isToday(new Date(t.due)) &&
      !isTomorrow(new Date(t.due))
  );
  
  const overdue = patchedTasks.filter(
    (t) =>
      !t.completed &&
      t.due &&
      isBefore(new Date(t.due), now) &&
      !isToday(new Date(t.due)) &&
      !isTomorrow(new Date(t.due))
  );
  
  const completed = patchedTasks.filter((t) => t.completed);
  

  

 


  // ✅ Categorize filtered tasks
//   const now = new Date();
//   const completed = filteredTasks.filter((t) => t.completed);
//   const overdue = filteredTasks.filter((t) => !t.completed && isBefore(new Date(t.due), now));
//   const upcoming = filteredTasks.filter(
//     (t) => !t.completed && (isToday(new Date(t.due)) || new Date(t.due) > now)
//   );


  const getTasksByTab = () => {
    switch (activeTab) {
      case "today":
        return todayTasks;
      case "tomorrow":
        return tomorrowTasks;
      case "upcoming":
        return upcoming;
      case "overdue":
        return overdue;
      case "completed":
        return completed;
      default:
        return [];
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-10">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">My Tasks</h2>

        <div className="flex gap-4 text-sm">
          {["today", "tomorrow", "upcoming", "overdue", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 capitalize border-b-2 ${

                activeTab === tab
                  ? "border-gray-600 text-black font-medium"
                  : "border-transparent text-gray-500"
              }`}
            >

              {tab}


            </button>
          ))}
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

                <input
                  type="checkbox"
                  checked={task.completed}
                  readOnly
                  className="accent-blue-600"
                />
                <span
                  className={`text-gray-800 ${
                    task.completed ? "line-through" : ""
                  }`}
                >

                  {task.name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {task?.assignee?.name && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    {task.assignee.name}
                  </span>
                )}
                <span className="text-gray-500">
                  {task.due && !isNaN(new Date(task.due).getTime())
                    ? format(new Date(task.due), "MMM d")
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
