import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useTransition,
  useRef,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Loader2,
  Filter,
  TrendingUp,
} from "lucide-react";

// --- Utility: Fast Date Formatting ---
const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const month = date.toLocaleString("default", { month: "short" });
  return `${month} ${date.getDate()}`;
};

// --- Configs ---
const TABS = [
  { key: "today", label: "Today", icon: Calendar, color: "blue" },
  { key: "tomorrow", label: "Tomorrow", icon: Clock, color: "yellow" },
  { key: "upcoming", label: "Upcoming", icon: TrendingUp, color: "orange" },
  { key: "overdue", label: "Overdue", icon: AlertCircle, color: "red" },
  { key: "completed", label: "Completed", icon: CheckCircle2, color: "green" },
];

const COLOR_CLASSES = {
  blue: {
    active: "bg-blue-600 text-white",
    inactive: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    mobile: "bg-blue-500 text-white",
  },
  yellow: {
    active: "bg-amber-500 text-white",
    inactive: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    mobile: "bg-amber-500 text-white",
  },
  orange: {
    active: "bg-orange-500 text-white",
    inactive: "bg-orange-50 text-orange-700 hover:bg-orange-100",
    mobile: "bg-orange-500 text-white",
  },
  red: {
    active: "bg-red-500 text-white",
    inactive: "bg-red-50 text-red-700 hover:bg-red-100",
    mobile: "bg-red-500 text-white",
  },
  green: {
    active: "bg-green-500 text-white",
    inactive: "bg-green-50 text-green-700 hover:bg-green-100",
    mobile: "bg-green-500 text-white",
  },
};

// --- Component: Task Item (Memoized) ---
const TaskItem = React.memo(({ task, onToggleCompleted, isMobile }) => {
  // Use local state for immediate UI feedback on click
  const [isChecked, setIsChecked] = useState(task.status === "Completed");

  const handleChange = () => {
    if (task.status === "Completed") return;
    setIsChecked(true);
    onToggleCompleted(task._id);
  };

  const dateDisplay = useMemo(
    () => formatDisplayDate(task.dueDate),
    [task.dueDate]
  );

  if (isMobile) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            disabled={task.status === "Completed"}
            className="w-5 h-5 accent-indigo-600 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <span
              className={`text-sm font-medium block ${
                isChecked ? "line-through text-gray-400" : "text-gray-800"
              }`}
            >
              {task.taskName}
            </span>
            {task.assignees?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.assignees.slice(0, 2).map((a, i) => (
                  <span
                    key={i}
                    className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-medium"
                  >
                    {a.name?.split(" ")[0]}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
              <Calendar className="w-3 h-3" />
              <span>{dateDisplay}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 group transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          disabled={task.status === "Completed"}
          className="w-4 h-4 accent-indigo-600 cursor-pointer"
        />
        <span
          className={`text-sm font-medium truncate ${
            isChecked ? "line-through text-gray-400" : "text-gray-800"
          }`}
        >
          {task.taskName}
        </span>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{dateDisplay}</span>
          </div>
          {task.assignees?.length > 0 && (
            <div className="flex -space-x-1">
              {task.assignees.slice(0, 2).map((a, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] text-indigo-700 ring-1 ring-white"
                  title={a.name}
                >
                  {a.name?.charAt(0)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TaskItem.displayName = "TaskItem";

// --- Main Component ---
const TaskOverview = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("today");
  const [stats, setStats] = useState({
    today: 0,
    tomorrow: 0,
    upcoming: 0,
    overdue: 0,
    completed: 0,
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  const [isPending, startTransition] = useTransition();
  const observerTarget = useRef(null);
  const fetchController = useRef(null);

  // User Data
  const userData = useMemo(
    () => ({
      role: localStorage.getItem("role"),
      userName: localStorage.getItem("name"),
      userId: localStorage.getItem("userId"),
    }),
    []
  );

  // 1. Fetch Stats separately (Fast)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = new URLSearchParams({
          role: userData.role || "user",
          assignee: userData.userName || "",
        });
        const res = await fetch(
          `https://taskbe.sharda.co.in/api/tasks/dashboard-stats?${params}`
        );
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          // Global window update if needed
          if (window.updateDashboardStats)
            window.updateDashboardStats(data.stats);
        }
      } catch (e) {
        console.error("Stats error", e);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [userData]);

  // 2. Fetch Tasks (Paginated)
  const fetchTasks = useCallback(
    async (pageNum, tabKey, isNewTab = false) => {
      if (fetchController.current) fetchController.current.abort();
      fetchController.current = new AbortController();

      try {
        setLoading(true);
        const params = new URLSearchParams({
          role: userData.role || "user",
          assignee: userData.userName || "",
          page: pageNum,
          limit: 20, // Load 20 at a time
          tab: tabKey,
        });

        const res = await fetch(
          `https://taskbe.sharda.co.in/api/tasks/dashboard-overview?${params}`,
          {
            signal: fetchController.current.signal,
          }
        );

        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        startTransition(() => {
          setTasks((prev) =>
            isNewTab ? data.tasks : [...prev, ...data.tasks]
          );
          setHasMore(data.hasMore);
          setLoading(false);
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
          setLoading(false);
        }
      }
    },
    [userData]
  );

  // Handle Tab Change
  const handleTabChange = (key) => {
    if (key === activeTab) return;
    startTransition(() => {
      setActiveTab(key);
      setPage(1);
      setTasks([]); // Clear list immediately
      setHasMore(true);
    });
    // Trigger fetch for new tab
    fetchTasks(1, key, true);
  };

  // Handle Load More (Infinite Scroll)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchTasks(nextPage, activeTab, false);
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, activeTab, fetchTasks]);

  // Initial Load
  useEffect(() => {
    fetchTasks(1, "today", true);
  }, []);

  // Handle Task Completion
  const handleToggleCompleted = useCallback(
    async (taskId) => {
      try {
        // Optimistic Update: Remove from UI immediately
        setTasks((prev) => prev.filter((t) => t._id !== taskId));

        // Update Stats locally
        setStats((prev) => ({
          ...prev,
          [activeTab]: Math.max(0, prev[activeTab] - 1),
          completed: prev.completed + 1,
        }));

        // API Call
        await fetch(`https://taskbe.sharda.co.in/api/tasks/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Completed",
            updatedBy: { name: userData.userName },
          }),
        });
      } catch (e) {
        console.error("Update failed", e);
        // Revert (Simple reload tab or toast error)
        fetchTasks(1, activeTab, true);
      }
    },
    [userData, activeTab, fetchTasks]
  );

  const currentTabIndex = TABS.findIndex((t) => t.key === activeTab);

  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-gray-100 
                mx-2 sm:mx-0 flex flex-col 
                h-[600px] sm:h-[650px] 
                overflow-hidden"
    >
      {/* --- Header --- */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-800">Task Overview</h2>
          <span className="text-xs text-gray-500 ml-auto">
            {statsLoading ? "..." : stats.total} total
          </span>
        </div>

        {/* --- Tabs --- */}
        <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            // Use server stats
            const count = stats[tab.key] || 0;
            const colorClass =
              COLOR_CLASSES[tab.color][isActive ? "active" : "inactive"];

            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${colorClass}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {count > 0 && (
                  <span className="bg-white/20 px-1.5 rounded text-xs font-bold min-w-[20px] text-center">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- List Area --- */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white">
        {tasks.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Calendar className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm">No tasks in {activeTab}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                onToggleCompleted={handleToggleCompleted}
                isMobile={false} // Use media query hook if needed
              />
            ))}

            {/* Loading Indicator / Observer Target */}
            <div
              ref={observerTarget}
              className="h-12 flex justify-center items-center w-full"
            >
              {loading && (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              )}
              {!hasMore && tasks.length > 0 && (
                <span className="text-xs text-gray-300">End of list</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- Mobile Navigation (Optional) --- */}
      {/* <div className="sm:hidden border-t p-2 flex justify-between items-center bg-gray-50 rounded-b-xl">
         <button 
           onClick={() => handleTabChange(TABS[currentTabIndex > 0 ? currentTabIndex - 1 : 4].key)}
           className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
         >
            <ChevronLeft size={20} />
         </button>
         <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            {TABS[currentTabIndex].label}
         </span>
         <button 
           onClick={() => handleTabChange(TABS[currentTabIndex < 4 ? currentTabIndex + 1 : 0].key)}
           className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
         >
            <ChevronRight size={20} />
         </button>
      </div> */}
    </div>
  );
};

export default TaskOverview;
