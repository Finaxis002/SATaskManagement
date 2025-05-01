import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import bgImage from "../assets/bg.png";
import TaskOverview from "../Components/TaskOverview";
import UserGrid from "../Components/UserGrid";
import useSocketSetup from "../hook/useSocketSetup";

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
    <div className="relative w-full  h-[90vh] overflow-y-auto p-6 text-gray-800 bg-gray-50">
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
        
        </div>
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
  <div className="bg-white border rounded-lg shadow p-4 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">Total Tasks</p>
      <h3 className="text-2xl font-semibold text-gray-800">1</h3>
    </div>
    <div className="text-blue-500 text-3xl">
    <FontAwesomeIcon icon="fa-solid fa-square-poll-vertical" />
    </div>
  </div>

  <div className="bg-white border rounded-lg shadow p-4 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">In Progress</p>
      <h3 className="text-2xl font-semibold text-gray-800">0</h3>
    </div>
    <div className="text-purple-500 text-3xl">
      ⏳
    </div>
  </div>

  <div className="bg-white border rounded-lg shadow p-4 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">Completed</p>
      <h3 className="text-2xl font-semibold text-gray-800">0</h3>
    </div>
    <div className="text-green-500 text-3xl">
      ✅
    </div>
  </div>

  <div className="bg-white border rounded-lg shadow p-4 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">Overdue</p>
      <h3 className="text-2xl font-semibold text-gray-800">0</h3>
    </div>
    <div className="text-red-500 text-3xl">
      ⚠️
    </div>
  </div>
</div> */}

        <div className="mt-6">
          <TaskOverview />
        </div>
      </div>
  
      {/* UserGrid for Admin */}
      {role === "admin" ? (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6 grid ">
         
          <UserGrid />
        </div>
      ) : null}
    </div>
  
  );
};

export default Dashboard;