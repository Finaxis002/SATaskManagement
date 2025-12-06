import React, { useEffect, useState, useMemo, useCallback, useTransition, startTransition, useRef } from "react";
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
  TrendingUp
} from "lucide-react";

// Optimize date utilities with minimal allocations
const DATE_CACHE = new Map();
const TODAY_KEY = new Date().toDateString();
const TOMORROW_KEY = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toDateString();
})();

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parseISO = (dateString) => {
  if (DATE_CACHE.has(dateString)) return DATE_CACHE.get(dateString);
  const date = new Date(dateString);
  DATE_CACHE.set(dateString, date);
  if (DATE_CACHE.size > 100) DATE_CACHE.clear();
  return date;
};

const format = (date, formatStr) => {
  return formatStr === "MMM d"
    ? `${MONTHS[date.getMonth()]} ${date.getDate()}`
    : date.toLocaleDateString();
};

const isToday = (date) => date.toDateString() === TODAY_KEY;
const isTomorrow = (date) => date.toDateString() === TOMORROW_KEY;
const isBefore = (date, compareDate) => date < compareDate;

// Static configurations
const TABS = [
  { key: "today", label: "Today", icon: Calendar, color: "blue" },
  { key: "tomorrow", label: "Tomorrow", icon: Clock, color: "yellow" },
  { key: "upcoming", label: "Upcoming", icon: TrendingUp, color: "orange" },
  { key: "overdue", label: "Overdue", icon: AlertCircle, color: "red" },
  { key: "completed", label: "Completed", icon: CheckCircle2, color: "green" }
];

const COLOR_CLASSES = {
  blue: { active: "bg-blue-600 text-white", inactive: "bg-blue-50 text-blue-700 hover:bg-blue-100", mobile: "bg-blue-500 text-white" },
  yellow: { active: "bg-amber-500 text-white", inactive: "bg-amber-50 text-amber-700 hover:bg-amber-100", mobile: "bg-amber-500 text-white" },
  orange: { active: "bg-orange-500 text-white", inactive: "bg-orange-50 text-orange-700 hover:bg-orange-100", mobile: "bg-orange-500 text-white" },
  red: { active: "bg-red-500 text-white", inactive: "bg-red-50 text-red-700 hover:bg-red-100", mobile: "bg-red-500 text-white" },
  green: { active: "bg-green-500 text-white", inactive: "bg-green-50 text-green-700 hover:bg-green-100", mobile: "bg-green-500 text-white" }
};

// Virtualized task item
const TaskItem = React.memo(({ task, justCompleted, onToggleCompleted, isMobile }) => {
  const isCompleted = task.status === "Completed" || justCompleted.has(task._id);
  const parsedDate = useMemo(() => parseISO(task.dueDate), [task.dueDate]);
  const dueDate = useMemo(() =>
    task.dueDate && !isNaN(parsedDate.getTime()) ? format(parsedDate, "MMM d") : "Invalid"
    , [task.dueDate, parsedDate]);

  const handleChange = useCallback(() => {
    onToggleCompleted(task._id);
  }, [task._id, onToggleCompleted]);

  if (isMobile) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={handleChange}
            disabled={task.status === "Completed"}
            className="w-4 h-4 accent-indigo-600 cursor-pointer mt-0.5 flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <span className={`text-sm font-medium block mb-2 leading-5 ${isCompleted ? "line-through text-gray-400" : "text-gray-800"
              }`}>
              {task.taskName}
            </span>

            {task.assignees?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {task.assignees.slice(0, 3).map((assignee, idx) => (
                  <div key={assignee.email || idx} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    <Users className="w-2.5 h-2.5" />
                    <span className="text-xs font-medium">
                      {assignee.name?.split(' ')[0] || 'User'}
                    </span>
                  </div>
                ))}
                {task.assignees.length > 3 && (
                  <div className="flex items-center bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    <span className="text-xs font-medium">+{task.assignees.length - 3}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{dueDate}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center px-3 sm:px-6 py-3 sm:py-4 hover:bg-gray-50">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleChange}
          disabled={task.status === "Completed"}
          className="w-4 h-4 sm:w-5 sm:h-5 accent-indigo-600 cursor-pointer flex-shrink-0"
        />
        <span className={`text-xs sm:text-sm font-medium truncate ${isCompleted ? "line-through text-gray-400" : "text-gray-800"
          }`}>
          {task.taskName}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className="flex flex-col items-end gap-1 sm:gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span className="text-xs">{dueDate}</span>
          </div>

          {task.assignees?.length > 0 && (
            <div className="flex flex-wrap gap-1 max-w-24 sm:max-w-48">
              {task.assignees.slice(0, 2).map((assignee, idx) => (
                <div key={assignee.email || idx} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  <Users className="w-2 h-2 sm:w-3 sm:h-3" />
                  <span className="text-xs font-medium truncate max-w-12 sm:max-w-20">
                    {assignee.name?.split(' ')[0] || 'User'}
                  </span>
                </div>
              ))}
              {task.assignees.length > 2 && (
                <div className="flex items-center bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  <span className="text-xs font-medium">+{task.assignees.length - 2}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.task._id === nextProps.task._id &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.justCompleted.has(prevProps.task._id) === nextProps.justCompleted.has(nextProps.task._id)
  );
});

TaskItem.displayName = 'TaskItem';

const TaskOverview = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("today");
  const [justCompleted, setJustCompleted] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPending, startTransitionHook] = useTransition();
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0 });
const fetchController = useRef(null);


  // Cache user data
  const userData = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        role: localStorage.getItem("role"),
        userEmail: user?.email?.toLowerCase(),
        userName: localStorage.getItem("name"),
        userId: localStorage.getItem("userId")
      };
    } catch (e) {
      console.error("Error parsing user data:", e);
      return { role: null, userEmail: null, userName: null, userId: null };
    }
  }, []);

  // // Fetch tasks
  // useEffect(() => {
  //   const controller = new AbortController();

  //   const fetchTasks = async () => {
  //     try {
  //       setLoading(true);
  //       setError(null);



  //       const response = await fetch("https://taskbe.sharda.co.in/api/tasks?limit=1000", {
  //         signal: controller.signal,
  //         headers: {
  //           'Content-Type': 'application/json',
  //         }
  //       });

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const data = await response.json();


  //       // ✅ CRITICAL FIX: Handle your backend's response structure
  //       // Your backend returns: { tasks: [...], currentPage, totalPages, totalCount, hasMore }
  //       const taskArray = Array.isArray(data.tasks) ? data.tasks : (Array.isArray(data) ? data : []);


  //       startTransition(() => {
  //         setTasks(taskArray);
  //         setLoading(false);
  //       });
  //     } catch (err) {
  //       if (err.name !== 'AbortError') {
  //         console.error("❌ Failed to fetch tasks:", err);
  //         setError(err.message);
  //         setLoading(false);
  //       }
  //     }
  //   };

  //   fetchTasks();

  //   return () => controller.abort();
  // }, []);

  // Fetch tasks - FAST PARALLEL APPROACH
useEffect(() => {
  fetchController.current = new AbortController();
  const signal = fetchController.current.signal;

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      setFetchProgress({ current: 0, total: 0 });

      console.log("🚀 Starting parallel fetch of all tasks...");
      
      // First, get total task count
      const countResponse = await fetch(
        "https://taskbe.sharda.co.in/api/tasks?page=1&limit=1",
        { signal, headers: { 'Content-Type': 'application/json' } }
      );
      
      if (!countResponse.ok) {
        throw new Error(`HTTP error! status: ${countResponse.status}`);
      }
      
      const countData = await countResponse.json();
      const totalCount = countData.totalCount || 0;
      
      console.log(`📊 Total tasks in database: ${totalCount}`);
      
      if (totalCount === 0) {
        startTransition(() => {
          setTasks([]);
          setLoading(false);
        });
        return;
      }
      
      // Set maximum batch size (larger = fewer requests but more data per request)
      const BATCH_SIZE = 500;
      const totalPages = Math.ceil(totalCount / BATCH_SIZE);
      
      console.log(`🔄 Fetching ${totalPages} pages (${BATCH_SIZE} tasks per page)`);
      setFetchProgress({ current: 0, total: totalCount });
      
      // Fetch all pages in parallel for maximum speed
      const pagePromises = [];
      
      for (let page = 1; page <= totalPages; page++) {
        const pagePromise = fetch(
          `https://taskbe.sharda.co.in/api/tasks?page=${page}&limit=${BATCH_SIZE}`,
          { signal, headers: { 'Content-Type': 'application/json' } }
        )
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then(data => {
            // Update progress
            const newTasks = data.tasks || [];
            setFetchProgress(prev => ({
              ...prev,
              current: prev.current + newTasks.length
            }));
            return newTasks;
          });
        
        pagePromises.push(pagePromise);
      }
      
      // Wait for ALL pages to complete
      const allPageResults = await Promise.all(pagePromises);
      
      // Combine all tasks and remove duplicates
      let allTasks = [];
      allPageResults.forEach(tasks => {
        allTasks = [...allTasks, ...tasks];
      });
      
      // Remove duplicates by _id (just in case)
      const uniqueTasks = Array.from(
        new Map(allTasks.map(task => [task._id, task])).values()
      );
      
      console.log(`✅ Successfully loaded ${uniqueTasks.length} unique tasks`);
      
      startTransition(() => {
        setTasks(uniqueTasks);
        setLoading(false);
      });
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("❌ Failed to fetch tasks:", err);
        
        // Fallback: Try sequential fetch
        console.log("🔄 Trying sequential fallback...");
        try {
          await fetchTasksSequentially(signal);
        } catch (fallbackError) {
          setError(fallbackError.message);
          setLoading(false);
        }
      }
    }
  };

  // Sequential fallback function
  const fetchTasksSequentially = async (signal) => {
    let allTasks = [];
    let page = 1;
    const BATCH_SIZE = 200;
    let hasMore = true;
    
    while (hasMore) {
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks?page=${page}&limit=${BATCH_SIZE}`,
        { signal, headers: { 'Content-Type': 'application/json' } }
      );
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const tasks = data.tasks || [];
      
      if (tasks.length === 0) break;
      
      allTasks = [...allTasks, ...tasks];
      setFetchProgress({ current: allTasks.length, total: data.totalCount || allTasks.length });
      
      // Check if we have all tasks
      const totalFetched = allTasks.length;
      const totalInDB = data.totalCount || 0;
      
      if (totalInDB > 0 && totalFetched >= totalInDB) {
        break; // Got all tasks
      }
      
      if (data.hasMore === false) {
        break;
      }
      
      page++;
      
      // Small delay to prevent overwhelming server
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`✅ Sequentially loaded ${allTasks.length} tasks`);
    
    startTransition(() => {
      setTasks(allTasks);
      setLoading(false);
    });
  };

  fetchTasks();

  return () => {
    if (fetchController.current) {
      fetchController.current.abort();
    }
  };
}, []);

  // Optimized categorization
  const categorizedTasks = useMemo(() => {

    if (tasks.length === 0) {
      return {
        today: [], tomorrow: [], upcoming: [], overdue: [], completed: []
      };
    }

    const now = new Date();
    const { role, userEmail } = userData;

    const categories = {
      today: [],
      tomorrow: [],
      upcoming: [],
      overdue: [],
      completed: [],
    };

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      // Skip hidden completed tasks
      if (task.status === "Completed" && task.isHidden) {

        continue;
      }

      // Filter by assignee for non-admin users
      if (role !== "admin" && userEmail) {
        const isAssigned = task.assignees?.some(a =>
          a.email?.toLowerCase() === userEmail
        );
        if (!isAssigned) {

          continue;
        }
      }

      if (!task.dueDate) {

        continue;
      }

      const parsedDate = parseISO(task.dueDate);
      const isActuallyCompleted = task.status === "Completed";
      const isJustNowCompleted = justCompleted.has(task._id);

      if (isActuallyCompleted && !isJustNowCompleted) {
        categories.completed.push(task);
        continue;
      }

      // Categorize by date
      if (isToday(parsedDate)) {

        categories.today.push(task);
      } else if (isTomorrow(parsedDate)) {

        categories.tomorrow.push(task);
      } else if (isBefore(parsedDate, now)) {

        categories.overdue.push(task);
      } else {

        categories.upcoming.push(task);
      }
    }


    return categories;
  }, [tasks, userData, justCompleted]);

  // Toggle task completion
  const handleToggleCompleted = useCallback(async (taskId) => {
    const updatedBy = {
      name: userData.userName || "Unknown",
      email: userData.userId || "unknown@example.com"
    };

    setJustCompleted((prev) => new Set([...prev, taskId]));

    try {
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Completed", updatedBy }),
        }
      );

      if (!response.ok) throw new Error("Failed to update task");

      startTransition(() => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, status: "Completed" } : task
          )
        );
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
      setJustCompleted((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }, [userData]);

  // Reset completed tasks on tab change
  useEffect(() => {
    setJustCompleted(new Set());
  }, [activeTab]);

  // Update dashboard stats
  // useEffect(() => {
  //   if (typeof window.updateDashboardStats !== "function") {
  //     console.log("⚠️ window.updateDashboardStats not found");
  //     return;
  //   }

  //   const rafId = requestAnimationFrame(() => {
  //     const counts = {
  //       completed: categorizedTasks.completed.length,
  //       overdue: categorizedTasks.overdue.length,
  //       progress:
  //         categorizedTasks.today.length +
  //         categorizedTasks.tomorrow.length +
  //         categorizedTasks.upcoming.length,
  //       total:
  //         categorizedTasks.today.length +
  //         categorizedTasks.tomorrow.length +
  //         categorizedTasks.upcoming.length +
  //         categorizedTasks.overdue.length +
  //         categorizedTasks.completed.length,
  //       loading,
  //     };


  //     window.updateDashboardStats(counts);
  //   });

  //   return () => cancelAnimationFrame(rafId);
  // }, [categorizedTasks]);

  // Update dashboard stats
useEffect(() => {
  if (typeof window.updateDashboardStats !== "function") {
    console.log("⚠️ window.updateDashboardStats not found");
    return;
  }

  const rafId = requestAnimationFrame(() => {
    // If loading, pass loading state
    if (loading) {
      window.updateDashboardStats({
        loading: true,
        total: null,
        completed: null,
        progress: null,
        overdue: null
      });
      return;
    }

    const counts = {
      loading: false,
      completed: categorizedTasks.completed.length,
      overdue: categorizedTasks.overdue.length,
      progress:
        categorizedTasks.today.length +
        categorizedTasks.tomorrow.length +
        categorizedTasks.upcoming.length,
      total:
        categorizedTasks.today.length +
        categorizedTasks.tomorrow.length +
        categorizedTasks.upcoming.length +
        categorizedTasks.overdue.length +
        categorizedTasks.completed.length,
    };

    window.updateDashboardStats(counts);
  });

  return () => cancelAnimationFrame(rafId);
}, [categorizedTasks, loading]);


  const currentTabIndex = TABS.findIndex(tab => tab.key === activeTab);
  const currentTasks = categorizedTasks[activeTab] || [];

  const visibleTasks = useMemo(() =>
    currentTasks.filter((task) => !(task.status === "Completed" && task.isHidden)),
    [currentTasks]
  );

  // Memoize visible counts for all tabs to avoid recalculating in render
  const visibleCounts = useMemo(() => {
    const counts = {};
    TABS.forEach(tab => {
      counts[tab.key] = categorizedTasks[tab.key]?.filter(
        (task) => !(task.status === "Completed" && task.isHidden)
      ).length || 0;
    });
    return counts;
  }, [categorizedTasks]);

  const handlePrevTab = useCallback(() => {
    startTransitionHook(() => {
      setActiveTab(currentTabIndex > 0 ? TABS[currentTabIndex - 1].key : TABS[TABS.length - 1].key);
    });
  }, [currentTabIndex, startTransitionHook]);

  const handleNextTab = useCallback(() => {
    startTransitionHook(() => {
      setActiveTab(currentTabIndex < TABS.length - 1 ? TABS[currentTabIndex + 1].key : TABS[0].key);
    });
  }, [currentTabIndex, startTransitionHook]);

  // if (loading) {
  //   return (
  //     <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 mx-2 sm:mx-0">
  //       <div className="flex items-center justify-center h-[300px] sm:h-[400px]">
  //         <div className="flex flex-col items-center gap-3 sm:gap-4">
  //           <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 animate-spin" />
  //           <span className="text-gray-600 font-medium text-sm sm:text-base">Loading tasks...</span>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (loading) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 mx-2 sm:mx-0">
      <div className="flex flex-col items-center justify-center h-[300px] sm:h-[400px] p-4">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500 animate-spin" />
          <div className="text-center">
            <span className="text-gray-600 font-medium text-sm sm:text-base block mb-1">
              Loading tasks...
            </span>
            {fetchProgress.total > 0 && (
              <span className="text-xs text-gray-500">
                {fetchProgress.current} of {fetchProgress.total} tasks loaded
              </span>
            )}
          </div>
          {fetchProgress.total > 0 && (
            <div className="w-48 sm:w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ 
                  width: `${(fetchProgress.current / fetchProgress.total) * 100}%` 
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

  if (error) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 mx-2 sm:mx-0">
        <div className="flex items-center justify-center h-[300px] sm:h-[400px]">
          <div className="flex flex-col items-center gap-3 sm:gap-4 text-red-500">
            <AlertCircle className="w-8 h-8" />
            <span className="text-sm font-medium">Failed to load tasks</span>
            <span className="text-xs text-gray-500">{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 mx-2 sm:mx-0">
      {/* Header */}
      <div className="px-3 sm:px-6 py-3 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-xl sm:rounded-t-2xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Task Overview</h2>
          {/* <span className="text-xs text-gray-500 ml-auto">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : `${tasks.length} total`}
          </span> */}
          <span className="text-xs text-gray-500 ml-auto">
  {loading ? (
    <div className="flex items-center gap-1">
      <Loader2 className="w-3 h-3 animate-spin" />
      <span>{fetchProgress.current}/{fetchProgress.total}</span>
    </div>
  ) : (
    `${tasks.length} total`
  )}
</span>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:flex gap-2 bg-gray-100 rounded-xl p-1.5">
          {TABS.map((tab) => {
            const visibleCount = visibleCounts[tab.key];
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            const colorClass = COLOR_CLASSES[tab.color][isActive ? 'active' : 'inactive'];

            return (
              <button
                key={tab.key}
                onClick={() => startTransitionHook(() => setActiveTab(tab.key))}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${colorClass}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {(visibleCount > 0 || loading) && (
                  <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : visibleCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tablet Tabs */}
        <div className="hidden sm:flex lg:hidden gap-1 bg-gray-100 rounded-lg p-1">
          {TABS.map((tab) => {
            const visibleCount = visibleCounts[tab.key];
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            const colorClass = COLOR_CLASSES[tab.color][isActive ? 'active' : 'inactive'];

            return (
              <button
                key={tab.key}
                onClick={() => startTransitionHook(() => setActiveTab(tab.key))}
                className={`flex items-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${colorClass}`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden md:inline">{tab.label}</span>
                {(visibleCount > 0 || loading) && (
                  <span className="bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-xs font-bold min-w-[16px] text-center">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : visibleCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Tabs */}
        <div className="flex sm:hidden items-center justify-between w-full">
          <button
            onClick={handlePrevTab}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Previous tab"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border border-gray-200 bg-white">
            <div className={`p-1.5 rounded-lg ${COLOR_CLASSES[TABS[currentTabIndex].color].mobile}`}>
              {React.createElement(TABS[currentTabIndex].icon, { className: "w-3 h-3" })}
            </div>
            <span className="font-semibold text-gray-800 text-sm">
              {TABS[currentTabIndex].label}
            </span>
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : visibleTasks.length}
            </span>
          </div>

          <button
            onClick={handleNextTab}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Next tab"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Task List - Desktop/Tablet */}
      <div className="hidden sm:block h-[50vh] sm:h-[60vh] overflow-auto">
        {visibleTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-50" />
            <span className="text-sm font-medium">No tasks found</span>
            <span className="text-xs mt-1">You're all caught up!</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {visibleTasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                justCompleted={justCompleted}
                onToggleCompleted={handleToggleCompleted}
                isMobile={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task List - Mobile */}
      <div className="sm:hidden h-[calc(100vh-200px)] max-h-[500px] overflow-auto">
        {visibleTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
            <Calendar className="w-12 h-12 mb-3 opacity-50" />
            <span className="text-sm font-medium text-center">No tasks found</span>
            <span className="text-xs mt-1 text-center">You're all caught up for {TABS[currentTabIndex].label.toLowerCase()}!</span>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {visibleTasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                justCompleted={justCompleted}
                onToggleCompleted={handleToggleCompleted}
                isMobile={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskOverview;