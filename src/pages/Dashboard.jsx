import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import bgImage from "../assets/bg.png";
import TaskOverview from "../Components/TaskOverview";
import UserGrid from "../Components/UserGrid";
import useSocketSetup from "../hook/useSocketSetup";

function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

const Dashboard = () => {
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  useSocketSetup();

  const { name, role } = useSelector((state) => state.auth);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const options = { weekday: "long", month: "long", day: "numeric" };
    setCurrentDate(now.toLocaleDateString("en-US", options));
  }, []);

  return (
    <div className="relative w-full  h-[90vh] overflow-y-auto p-6 text-gray-800 bg-gray-50">
      {/* Centered Header */}

      <div className="bg-gradient-to-r from-[#f6f9fc] to-[#eef2f5] py-5 px-8 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and Branding */}
          <div className="flex items-center space-x-5">
            {/* Sophisticated logo container */}
            <div className="p-2.5 rounded-lg bg-indigo-50 shadow-xs border border-indigo-100 hover:shadow-sm transition-all duration-300">
              <img
                src="/SALOGO-black.png"
                alt="ASA Logo"
                className="h-12 w-12 object-contain"
              />
            </div>

            {/* Elegant text with subtle divider */}
            <div className="border-l border-indigo-200 h-16 flex items-center pl-5">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 tracking-normal leading-tight">
                  Anunay Sharda & Associates
                </h1>
                <p className="text-[#018f95] text-sm font-light tracking-wider mt-1">
                  Strategic Business Solutions
                </p>
              </div>
            </div>
          </div>

          {/* Date and Greeting Section */}
          <div className="text-center md:text-right space-y-2">
            {/* Minimal date display */}
            <div className="flex items-center justify-center md:justify-end space-x-2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Refined greeting */}
            <h1 className="text-2xl font-normal text-gray-700 mt-1">
              {getTimeBasedGreeting()},{" "}
              <span className="text-[#2184A3] font-medium">
                {name || "User"}
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Task Container */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden pt-6 ">
        <div className="flex justify-between items-center">
          <h2
            className="text-xl font-semibold text-gray-800 p-6 pb-0"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Task Overview
          </h2>
        </div>

        <div className="mt-6">
          <TaskOverview />
        </div>
      </div>

      {/* UserGrid for Admin */}
      {role === "admin" ? (
        <div className="mt-6 bg-white rounded-lg shadow-md  grid ">
          <UserGrid />
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
