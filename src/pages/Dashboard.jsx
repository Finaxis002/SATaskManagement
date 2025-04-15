import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import bgImage from "../assets/bg.png";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import TaskOverview from "../Components/TaskOverview";
import UserGrid from "../Components/UserGrid";

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
      <img
        src={bgImage}
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />

      <div className="relative z-10 px-6 py-8 max-w-5xl mx-auto w-full backdrop-blur-sm">
        <div className="text-center mb-10">
          <p className="text-sm text-gray-500">{currentDate}</p>
          <h1 className="text-3xl font-semibold text-gray-800 mt-1">
            {greeting}, <span className="text-black">{name || "User"}</span>
          </h1>
        </div>

        {/* Task Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden"></div>

        <div className="flex flex-col gap-4">
          <TaskOverview />

          {/* {role === "admin" ? <AdminDashboard /> : <UserDashboard />} */}
          {role == "admin" ? <UserGrid /> : null}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
