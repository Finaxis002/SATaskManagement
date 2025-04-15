import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { format, isBefore, isToday } from "date-fns";

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");

  const { userId } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/tasks");
        const userTasks = res.data.filter(task => task.assignee?._id === userId);
        setTasks(userTasks);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };

    fetchTasks();
  }, [userId]);

  const now = new Date();
  const completed = tasks.filter(t => t.completed);
  const overdue = tasks.filter(t => !t.completed && isBefore(new Date(t.due), now));
  const upcoming = tasks.filter(t => !t.completed && (isToday(new Date(t.due)) || new Date(t.due) > now));

  const getTasks = () => {
    switch (activeTab) {
      case "completed": return completed;
      case "overdue": return overdue;
      case "upcoming":
      default: return upcoming;
    }
  };

  return (
    <div className="mt-10 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">My Tasks</h2>
        <div className="flex gap-6 text-sm">
          {["upcoming", "overdue", "completed"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 border-b-2 ${activeTab === tab ? "border-gray-600 text-black" : "border-transparent text-gray-500"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y">
        {getTasks().map(task => (
          <div key={task._id} className="px-6 py-4 flex justify-between items-center">
            <span className={`text-gray-800 ${task.completed ? "line-through" : ""}`}>
              {task.name}
            </span>
            <span className="text-xs text-gray-600">
              {task.due ? format(new Date(task.due), "MMM d") : "No date"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
