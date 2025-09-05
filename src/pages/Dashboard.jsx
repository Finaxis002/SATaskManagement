import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import useSocketSetup from "../hook/useSocketSetup";
import useStickyNotes from "../hook/useStickyNotes";
import StickyNotesDashboard from "../Components/notes/StickyNotesDashboard";
import { ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Briefcase, CalendarDays, Receipt, UsersRound } from "lucide-react";
import { isToday, parseISO, format, startOfToday, endOfToday } from "date-fns";
import TaskOverview from "../Components/TaskOverview";

function getTimeBasedGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

const TodaysList = ({ rows = [] }) => {
  const tagCls = (c) =>
    ({
      indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200",
      emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      amber: "bg-amber-50 text-amber-700 border border-amber-200",
      rose: "bg-rose-50 text-rose-700 border border-rose-200",
      gray: "bg-gray-100 text-gray-700 border border-gray-200",
    }[c] || "bg-gray-100 text-gray-700 border border-gray-200");

  return (
    <div className="mt-4 mb-4 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <svg
              className="h-4 w-4 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Todays Event
          </h3>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-10 text-sm text-gray-500 text-center">
          No events for today.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <li
              key={i}
              className="px-5 py-3 flex flex-col md:flex-row gap-2 md:gap-0 hover:bg-gray-50/60 transition"
            >
              <div className="flex items-center w-full md:w-36">
                <span className="relative flex items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-300 mr-2" />
                  <span className="text-xs font-medium text-gray-700">
                    {row.time}
                  </span>
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium truncate">
                  {row.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {row.location || "—"}{" "}
                  {row.duration ? `• ${row.duration}` : ""}
                </p>
              </div>
              <div className="flex w-full md:w-auto justify-between items-center">
                {row.tag && (
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full ${tagCls(
                      row.color
                    )}`}
                  >
                    {row.tag}
                  </span>
                )}
                <svg
                  className="ml-3 h-4 w-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="px-5 py-3 border-t border-gray-100 bg-white flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {rows.length} event{rows.length > 1 ? "s" : ""} today
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  useSocketSetup();
  useStickyNotes(3);

  const { role, loading } = useSelector((s) => s.auth);
  const [events, setEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [showStats, setShowStats] = useState(false); // State to handle filter button visibility

  const rawUser = localStorage.getItem("user");
  const userObj = rawUser ? JSON.parse(rawUser) : null;
  const userId = userObj?.userId || localStorage.getItem("userId") || null;

  // Dynamically get the user's name from localStorage
  const name = userObj?.name || "Guest"; // Fallback to "Guest" if name is not found

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const [evRes, remRes] = await Promise.all([
          fetch(`https://taskbe.sharda.co.in/api/events?userId=${userId}`),
          fetch(`https://taskbe.sharda.co.in/api/reminders?userId=${userId}`),
        ]);
        const [evData, remData] = await Promise.all([
          evRes.json(),
          remRes.json(),
        ]);
        setEvents(Array.isArray(evData) ? evData : []);
        setReminders(Array.isArray(remData) ? remData : []);
      } catch (e) {
        console.error("Failed to load today's rows:", e);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
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
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  const stats = {
    TotalTask: 125, // -> Total
    Completed: 125, // -> Completed
    Progress: 5, // -> In Progress
    Overdue: 6, // -> Overdue
  };

  // StatCard component with updated icon style (no outer circle)
  const StatCard = ({ pillLabel, variant = "gray", label, value, icon }) => {
    const pill =
      {
        blue: "bg-indigo-100 text-indigo-700 border border-indigo-200",
        green: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        gray: "bg-gray-100 text-gray-700 border border-gray-200",
        red: "bg-rose-100 text-rose-700 border border-rose-200",
      }[variant] || "bg-gray-100 text-gray-700 border border-gray-200";

    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className={`text-[11px] px-2 py-1 rounded-full ${pill}`}>
            {pillLabel}
          </span>
          {/* Directly render the icon without the surrounding circle */}
          <div className="grid place-items-center">{icon}</div>
        </div>

        <p className="mt-3 text-3xl font-semibold text-gray-900">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{label}</p>
      </div>
    );
  };

  const startT = startOfToday();
  const endT = endOfToday();

  const todayEventRows = (events || [])
    .filter((e) => e?.startDateTime && e?.endDateTime)
    .filter((e) => {
      const s = parseISO(e.startDateTime);
      const en = parseISO(e.endDateTime);
      return s <= endT && en >= startT;
    })
    .map((e) => ({
      ts: parseISO(e.startDateTime).getTime(),
      time: format(parseISO(e.startDateTime), "h:mm a"),
      title: e.title || e.summary || "Event",
      tag: "Event",
      color: "indigo",
      location: e.location || "—",
    }));

  const todayReminderRows = (reminders || [])
    .filter((r) => r?.datetime && isToday(parseISO(r.datetime)))
    .map((r) => ({
      ts: parseISO(r.datetime).getTime(),
      time: format(parseISO(r.datetime), "h:mm a"),
      title: r.text || "Reminder",
      tag: "Reminder",
      color: "amber",
      location: "—",
    }));

  const todaysRows = useMemo(
    () => [...todayEventRows, ...todayReminderRows].sort((a, b) => a.ts - b.ts),
    [events, reminders]
  );

  return (
    <div className="relative w-full h-full bg-white pb-24 overflow-y-auto px-2 md:px-5 ">
      <div className="py-5  md:pl-0 pl-8 ">
        <div className=" flex flex-col md:flex-row md:justify-between  gap-6">
          {/* Logo & Title */}
          <div className="flex flex-col md:items-start space-x-4 md:space-x-0  ">
            <div className="flex ">
              <div className="p-2  rounded-lg w-16 h-16 bg-indigo-50 shadow-xs border border-indigo-100 ">
                {" "}
                {/* Adjusted margin-left and margin-top */}
                <img
                  src="/SALOGO-black.png"
                  alt="ASA Logo"
                  className="  object-contain"
                />
              </div>
              <div className="inline-block ml-2 mt-1 md:mt-3">
                <h1 className="text-xl font-semibold text-gray-800 tracking-normal leading-tight w-48  md:w-80">
                  Anunay Sharda & Associates
                </h1>
                <p className="text-[#018f95] md:text-sm text-[13px] font-light tracking-widest hidden md:block">
                  Strategic Business Solutions
                </p>
              </div>
            </div>
            <p className="text-[#018f95] md:text-sm text-[13px] font-light tracking-widest md:hidden ml-1">
              Strategic Business Solutions
            </p>
          </div>

          {/* Greeting, Date, and Name */}
          <div className="flex flex-col  md:flex-col  space-y-0  ">
            {/* Greeting and Date: Mobile and Desktop */}
            <div className="flex flex-row md:flex-row  md:items-end gap-1 ">
              <h1 className="text-m font-normal text-gray-700 md:text-left">
                {getTimeBasedGreeting()},
              </h1>
              <p className="text-gray-500 text-sm text-center italic  mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Name - Mobile view only */}
            <span className="text-[#018f95] font-medium   ">
              {name}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white    border-gray-200">
        <div className="w-full ">
          {/* Filter Button for Mobile */}
          <button
            className="md:hidden flex items-center justify-between w-full bg-indigo-600 text-white px-6 py-3 rounded-md"
            onClick={() => setShowStats(!showStats)}
          >
            <span className="text-sm">Show Statistics</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Desktop stats */}
          <div className="hidden md:grid md:grid-cols-4 gap-3 mt-0">
            <StatCard
              pillLabel="Total Task"
              variant="blue"
              label="AllTasks"
              value={stats.TotalTask}
              icon={<ClipboardList />} // Total Task: ClipboardList icon
            />
            <StatCard
              pillLabel="Completed"
              variant="green"
              label="Done"
              value={stats.Completed}
              icon={<CheckCircle />} // Completed: CheckCircle icon
            />
            <StatCard
              pillLabel="Progress"
              variant="gray"
              label="Currently being worked on"
              value={stats.Progress}
              icon={<Clock />} // In Progress: Clock icon
            />
            <StatCard
              pillLabel="Overdue"
              variant="red"
              label="Past over due"
              value={stats.Overdue}
              icon={<AlertCircle />} // Overdue: AlertCircle icon
            />
          </div>

          {/* Mobile stats */}
          {showStats && (
            <div className="mt-4 h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  md:hidden">
              <StatCard
                pillLabel="Total Task"
                variant="blue"
                label="AllTasks"
                value={stats.TotalTask}
                icon={<ClipboardList />} // Total Task: ClipboardList icon
              />
              <StatCard
                pillLabel="Completed"
                variant="green"
                label="Done"
                value={stats.Completed}
                icon={<CheckCircle />} // Completed: CheckCircle icon
              />
              <StatCard
                pillLabel="Progress"
                variant="gray"
                label="Currently being worked on"
                value={stats.Progress}
                icon={<Clock />} // In Progress: Clock icon
              />
              <StatCard
                pillLabel="Overdue"
                variant="red"
                label="Past over due"
                value={stats.Overdue}
                icon={<AlertCircle />} // Overdue: AlertCircle icon
              />
            </div>
          )}
        </div>
      </div>

      <div className="md:mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 ">
        <div className="sticky top-0 max-h-[90vh]">
          <TodaysList rows={todaysRows} />
          <TaskOverview />
        </div>

        <div className="lg:border-l lg:border-gray-200 lg:pl-6 hidden md:block max-h-[90vh] overflow-y-auto">
          <div className="space-y-6">
            <StickyNotesDashboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
