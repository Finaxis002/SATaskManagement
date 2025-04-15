



import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import bgImage from "../assets/bg.png";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import TaskOverview from "../Components/TaskOverview";


const Dashboard = () => {
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");

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
    <div className="relative w-full min-h-screen text-gray-800 bg-gray-100">
      <img src={bgImage} alt="Background" className="absolute top-0 left-0 w-full h-full object-cover z-0" />

      <div className="relative z-10 px-6 py-8 max-w-5xl mx-auto w-full backdrop-blur-sm">
        <div className="text-center mb-10">
          <p className="text-sm text-gray-500">{currentDate}</p>
          <h1 className="text-3xl font-semibold text-gray-800 mt-1">
            {greeting}, <span className="text-black">{name || "User"}</span>
          </h1>
        </div>


        {/* Task Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Title + Tabs */}
          {/* <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">My tasks</h2>
            <div className="flex gap-6 text-sm">
              <button className="pb-1 border-b-2 border-gray-600 text-black font-medium">
                Upcoming
              </button>
              <button className="hover:text-black text-gray-500">Overdue</button>
              <button className="hover:text-black text-gray-500">Completed</button>
            </div>
          </div> */}

          {/* Task List */}
          {/* <div className="divide-y">
            <div className="px-6 py-3 text-sm text-gray-500 cursor-pointer hover:bg-gray-50">
              + Create task
            </div>

            
            {(role === "admin" ? adminTasks : tasks).map((task, index) => (
              <div key={index} className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="accent-blue-600" />
                  <span className="text-gray-800">{task.title}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {task.tag && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      {task.tag}
                    </span>
                  )}
                  <span className="text-gray-500">{task.date}</span>
                </div>
              </div>
            ))}
          </div> */}
        </div>

        <TaskOverview />

        {role === "admin" ? <AdminDashboard /> : <UserDashboard />}

      </div>
    </div>
  );
};

export default Dashboard;
