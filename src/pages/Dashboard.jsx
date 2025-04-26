import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import bgImage from "../assets/bg.png";
import TaskOverview from "../Components/TaskOverview";
import UserGrid from "../Components/UserGrid";
import useSocketSetup from "../hook/useSocketSetup";
import TaskReminders from "../Components/TaskReminder";

const Dashboard = () => {
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  useSocketSetup();

  const { name, role } = useSelector((state) => state.auth);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const options = { weekday: "long", month: "long", day: "numeric" };
    setCurrentDate(now.toLocaleDateString("en-US", options));
  }, []);

  return (
    <div className="relative w-full min-h-screen p-6 text-gray-800 bg-gray-50">
      {/* Centered Header */}
      <div className="text-center mb-6">
        {/* Date Section */}
        <p className="text-lg text-gray-600">{currentDate}</p>
  
        {/* Greeting Section */}
        <h1 className="text-4xl font-semibold text-gray-900 mt-4">
          {greeting}, <span className="text-gray-700">{name || "User"}</span>
        </h1>
      </div>
  
      {/* Task Container */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Task Overview</h2>
          <button
            className="text-sm text-indigo-600 hover:underline focus:outline-none"
            onClick={() => alert('Create New Task')}>
            Create New Task
          </button>
        </div>
        <div className="mt-6">
          <TaskOverview />
        </div>
        <div className="mt-6">
          <TaskReminders key={localStorage.getItem('userId')}/>
        </div>

      </div>
  
      {/* UserGrid for Admin */}
      {role === "admin" ? (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
         
          <UserGrid />
        </div>
      ) : null}
    </div>
  
  );
};

export default Dashboard;
