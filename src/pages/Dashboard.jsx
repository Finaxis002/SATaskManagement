import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import bgImage from "../assets/bg.png";
import TaskOverview from "../Components/TaskOverview";
import UserGrid from "../Components/UserGrid";
import useSocketSetup from "../hook/useSocketSetup";
import useStickyNotes from "../hook/useStickyNotes";
import StickyNotesDashboard from "../Components/notes/StickyNotesDashboard";
import axios from "axios";

function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

const Dashboard = () => {
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [todaysBirthdays, setTodaysBirthdays] = useState([]);
  const [showBirthdayBanner, setShowBirthdayBanner] = useState(false);

  useSocketSetup();

  const { name, role, loading, isBirthdayToday, birthdate, userId } =
    useSelector((state) => state.auth);

  const computeIsToday = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth();
  };

  const showUserBirthday =
    role !== "admin" && (isBirthdayToday ?? computeIsToday(birthdate));

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

  useEffect(() => {
    if (role === "admin") {
      axios
        .get(`https://taskbe.sharda.co.in/api/employees/birthdays/today`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        })
        .then((res) => setTodaysBirthdays(res.data.birthdays || []))
        .catch(() => setTodaysBirthdays([]));
    }
  }, [role]);

  useEffect(() => {
    // compute fallback if backend flag missing
    const computeIsToday = (iso) => {
      if (!iso) return false;
      const d = new Date(iso),
        t = new Date();
      return d.getDate() === t.getDate() && d.getMonth() === t.getMonth();
    };

    // user banner shows only for non-admins
    const shouldShowByDate =
      role !== "admin" &&
      ((isBirthdayToday ?? false) || computeIsToday(birthdate));

    const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const storageKey = `birthdayBannerDismissed:${userId || "anon"}`;

    if (!shouldShowByDate) {
      setShowBirthdayBanner(false);
      return;
    }

    const lastDismissed = localStorage.getItem(storageKey);
    setShowBirthdayBanner(lastDismissed !== todayKey);
  }, [role, isBirthdayToday, birthdate, userId]);

  // normalize departments → array of strings
  const toDeptArray = (d) =>
    Array.isArray(d)
      ? d
      : typeof d === "string"
      ? d
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

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
      
      {role === "admin" && todaysBirthdays.length > 0 && (
        <div className="mt-4">
          <div className="rounded-2xl border border-indigo-200/60 bg-gradient-to-r from-indigo-50 to-indigo-100 p-0.5">
            <div className="rounded-2xl bg-white/60 backdrop-blur-sm">
              {/* Header */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-indigo-100/70">
                <span className="text-xl">🎂</span>
                <h3 className="text-indigo-900 font-semibold">
                  Today’s Birthdays
                </h3>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                {todaysBirthdays.length === 0 ? (
                  <div className="text-sm text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                    No birthdays today.
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {todaysBirthdays.map((emp) => (
                      <li
                        key={emp._id}
                        className="group flex flex-wrap items-center gap-2 rounded-lg px-3  hover:bg-white transition"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        <span className="font-medium text-gray-900">
                          {emp.name}
                        </span>
                        <span className="text-gray-400">—</span>

                        {/* departments as subtle chips */}
                        <span className="flex flex-wrap gap-1.5">
                          {toDeptArray(emp.department).map((dep, i) => (
                            <span
                              key={i}
                              className="text-[11px] leading-5 px-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
                            >
                              {dep}
                            </span>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserBirthday && (
        <div className="mt-4 relative">
          {/* tiny CSS for animations */}
          <style>{`
      @keyframes float {
        0%,100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-4px) rotate(3deg); }
      }
      @keyframes fall {
        0%   { transform: translateY(-10px) rotate(0deg); opacity: .9; }
        100% { transform: translateY(140%) rotate(720deg); opacity: .9; }
      }
      .confetti {
        position:absolute; top:-10px;
        width:8px; height:8px; border-radius:2px;
        animation: fall 3.8s linear infinite;
        opacity:.9;
      }
      .confetti:nth-child(odd)  { width:6px; height:10px; border-radius:1px; }
    `}</style>

          <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 shadow-sm ring-1 ring-amber-100">
            {/* confetti pieces */}
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className="confetti"
                  style={{
                    left: `${(i + 1) * (100 / 17)}%`,
                    background: `hsl(${i * 24}, 90%, 60%)`,
                    animationDelay: `${-i * 0.2}s`,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-4 px-5 py-4 relative">
              {/* animated emoji (no file) */}
              <div
                className="text-3xl select-none"
                style={{ animation: "float 2.5s ease-in-out infinite" }}
                aria-hidden="true"
              >
                🎉
              </div>

              <div className="flex-1">
                <div className="text-lg md:text-xl font-semibold">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-yellow-700">
                    Happy Birthday {name}!
                  </span>
                </div>
                <p className="text-sm text-amber-800/90 mt-0.5">
                  Wishing you a wonderful year ahead.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <div className="w-full md:w-[30%]  w-full">
          <StickyNotesDashboard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
