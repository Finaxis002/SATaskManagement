import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import bgImage from "../assets/bg.png";
import TaskOverview from "../Components/TaskOverview";
import UserGrid from "../Components/UserGrid";
import useSocketSetup from "../hook/useSocketSetup";
import useStickyNotes from "../hook/useStickyNotes";
import StickyNotesDashboard from "../Components/notes/StickyNotesDashboard";

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

  const { name, role, loading } = useSelector((state) => state.auth);

  const { notes: latestNotes, loading: notesLoading } = useStickyNotes(3);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const options = { weekday: "long", month: "long", day: "numeric" };
    setCurrentDate(now.toLocaleDateString("en-US", options));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[90vh] bg-gray-50">
        <svg
          className="animate-spin h-10 w-10 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
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
        <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full pb-5 h-[90vh] overflow-y-auto px-6 text-gray-800 bg-gray-50">
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

      <div className="mt-6 flex flex-col md:flex-row gap-2">
        {/* Task Overview - 70% width on medium screens and up */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden w-full md:w-[70%]">
          <div className="flex justify-between items-center">
            <h2
              className="text-xl font-semibold text-gray-800 p-6 pb-0"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Task Overview
            </h2>
          </div>

          <div className="">
            <TaskOverview />
          </div>
        </div>

        {/* Sticky Notes - 30% width on medium screens and up */}
        <div className= "w-full md:w-[30%]  w-full">
          <StickyNotesDashboard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
