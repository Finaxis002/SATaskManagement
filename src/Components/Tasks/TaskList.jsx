// import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faPen, faCopy } from "@fortawesome/free-solid-svg-icons";
// import { FaTrashAlt, FaExclamationCircle, FaSpinner, FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import Swal from "sweetalert2";
// import { io } from "socket.io-client";
// import { fetchUsers } from "../../redux/userSlice";
// import { fetchDepartments } from "../../redux/departmentSlice";
// import FilterSection from "./FilterSection";
// import MessagePopup from "./MessagePopup";
// import StatusDropdownPortal from "../StatusDropdownPortal";
// import axios from "../../utils/secureAxios";
// import { Loader2 } from "lucide-react";

// const socket = io("https://taskbe.sharda.co.in");
// const ITEMS_PER_PAGE = 50; // Increased for better virtual scroll
// const MOBILE_ITEMS_PER_PAGE = 20;
// // const BATCH_SIZE = 500; // For fetching in batches
// // const CONCURRENT_BATCHES = 1; // Number of parallel requests
// const DEBOUNCE_DELAY = 300; // Delay for filter changes
// // const BASE_URL = "https://taskbe.sharda.co.in/api/tasks";
// const BASE_URL = "http://localhost:1100/api/tasks";

// // const fetchAllTasksSingle = async (signal, baseUrl, userFilter = {}) => {
// //     try {
// //         console.log("🔄 Trying single request fetch...");
// //         console.time('API-Request');
// //         const params = new URLSearchParams(userFilter);
// //         const response = await fetch(
// //             // `${baseUrl}/all?${params}`,
// //              `${BASE_URL}?${params}`,
// //             { signal, headers: { 'Content-Type': 'application/json' } }
// //         );

// //         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

// //         const data = await response.json();
// //         const tasks = data.tasks || [];

// //         console.log(`✅ Single request loaded ${tasks.length} tasks`);
// //         return tasks;

// //     } catch (err) {
// //         if (err.name !== 'AbortError') {
// //             console.error("❌ Single request fetch failed:", err);
// //             throw err;
// //         }
// //         return [];
// //     }
// // };

// const fetchAllTasksSingle = async (signal, baseUrl, userFilter = {}) => {
//     try {
//         console.log("🔄 Fetching with server-side filters...");
//         console.time('API-Request');

//         // Build comprehensive filter for server-side processing
//         const filterParams = {
//             ...userFilter,
//             ...filters,  // Pass all current filters to backend
//             searchTerm,   // Pass search term
//             sortBy: "priority",
//             sortOrder: "desc",
//             page: 1,
//             limit: isMobileView ? MOBILE_ITEMS_PER_PAGE * 5 : ITEMS_PER_PAGE * 10
//         };

//         const params = new URLSearchParams(filterParams);
//         const response = await fetch(
//             `${baseUrl}?${params}`,
//             { signal, headers: { 'Content-Type': 'application/json' } }
//         );

//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//         const data = await response.json();
//         const tasks = data.tasks || [];

//         console.log(`✅ Server returned ${tasks.length} filtered tasks`);
//         console.timeEnd('API-Request');
//         return tasks;

//     } catch (err) {
//         if (err.name !== 'AbortError') {
//             console.error("❌ Fetch failed:", err);
//             throw err;
//         }
//         return [];
//     }
// };

// const TaskList = ({ onEdit, refreshTrigger, setTaskListExternally, tasksOverride, hideCompleted, showFilters, onHideFilters }) => {
//     // Add at the VERY beginning of TaskList function:

//     // Redux
//     const dispatch = useDispatch();
//     const users = useSelector((state) => state.users.list);
//     const departmentData = useSelector((state) => state.departments.list);

//     const [allTasks, setAllTasks] = useState([]); // ALL tasks from database
//     const [filteredTasks, setFilteredTasks] = useState([]); // Tasks after filtering
//     const [loading, setLoading] = useState(false);
//     const [initialLoading, setInitialLoading] = useState(true);
//     const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0, status: '' });
//     const [totalCount, setTotalCount] = useState(0);
//     const [stats, setStats] = useState({ highCount: 0, mediumCount: 0, lowCount: 0, totalCount: 0 });
//     const [loadingStatus, setLoadingStatus] = useState({});

//     // Virtual pagination/scroll index
//     const [highScrollIndex, setHighScrollIndex] = useState(ITEMS_PER_PAGE);
//     const [otherScrollIndex, setOtherScrollIndex] = useState(ITEMS_PER_PAGE);

//     // Filter data state
//     const [departments, setDepartments] = useState([]);
//     const [uniqueUsers, setUniqueUsers] = useState([]);
//     const [uniqueAssignedBy, setUniqueAssignedBy] = useState([]);
//     const [uniqueStatuses, setUniqueStatuses] = useState([]);

//     // Filter & Sort State
//     const [filters, setFilters] = useState({
//         priority: "",
//         assignee: "",
//         assignedBy: "",
//         status: "",
//         code: "",
//         department: "",
//         dueBefore: "",
//     });
//     const [dueDateSortOrder, setDueDateSortOrder] = useState("asc");
//     const [searchTerm, setSearchTerm] = useState("");

//     // UI State
//     const [editingStatus, setEditingStatus] = useState(null);
//     const [remarks, setRemarks] = useState({});
//     const [workDescs, setWorkDescs] = useState({});
//     const [openRemarkPopup, setOpenRemarkPopup] = useState(null);
//     const [openWorkDescPopup, setOpenWorkDescPopup] = useState(null);
//     const [openTaskPopup, setOpenTaskPopup] = useState(null);
//     const [openMessagePopup, setOpenMessagePopup] = useState(null);
//     const [taskForMessage, setTaskForMessage] = useState(null);
//     const [showTeamPopup, setShowTeamPopup] = useState(null);
//     const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

//     // Mobile Pagination State
//     const [mobileCurrentPage, setMobileCurrentPage] = useState(1);
// // Add this state near your other states
// const [isFetchingMore, setIsFetchingMore] = useState(false);
// const [currentServerPage, setCurrentServerPage] = useState(1);
// const [hasMoreServerData, setHasMoreServerData] = useState(true);

// // Progressive loading function
// const loadMoreTasks = async () => {
//     if (isFetchingMore || !hasMoreServerData) return;

//     setIsFetchingMore(true);
//     try {
//         const nextPage = currentServerPage + 1;
//         const params = new URLSearchParams({
//             ...filters,
//             searchTerm,
//             page: nextPage.toString(),
//             limit: "50", // Smaller batch for progressive loading
//             sortBy: "priority",
//             sortOrder: "desc"
//         });

//         const response = await fetch(
//             `${BASE_URL}?${params}`,
//             { headers: { 'Content-Type': 'application/json' } }
//         );

//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//         const data = await response.json();
//         const newTasks = data.tasks || [];

//         if (newTasks.length === 0) {
//             setHasMoreServerData(false);
//             return;
//         }

//         // Merge new tasks with existing, avoiding duplicates
//         setAllTasks(prev => {
//             const existingIds = new Set(prev.map(t => t._id));
//             const uniqueNewTasks = newTasks.filter(t => !existingIds.has(t._id));
//             return [...prev, ...uniqueNewTasks];
//         });

//         setCurrentServerPage(nextPage);
//         setHasMoreServerData(data.hasMore === true);

//     } catch (error) {
//         console.error("Failed to load more tasks:", error);
//     } finally {
//         setIsFetchingMore(false);
//     }
// };
//     // Refs
//     const scrollContainerRef = useRef(null);
//     const highObserverTarget = useRef(null);
//     const otherObserverTarget = useRef(null);
//     const dropdownRef = useRef(null);

//     // Add these refs near your existing refs:
//     const fetchControllerRef = useRef(null);
//     const filterTimeoutRef = useRef(null);
//     const isInitialMount = useRef(true);

//     // User Role
//     const rawRole = localStorage.getItem("role");
//     const userRole = rawRole ? rawRole.toLowerCase() : null;
//     const isAdmin = userRole === "admin";
//     const currentUserName = JSON.parse(localStorage.getItem("user"))?.name;

//     // Detect if mobile view
//     const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

//     // Load users and departments and set up mobile resize listener
//     useEffect(() => {
//         dispatch(fetchUsers());
//         dispatch(fetchDepartments());

//         const handleResize = () => {
//             setIsMobileView(window.innerWidth < 1024);
//         };
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, [dispatch]);

//     useEffect(() => {
//         setDepartments(departmentData || []);
//     }, [departmentData]);

//     useEffect(() => {
//         if (users?.length) {
//             const names = users.map((u) => u.name);
//             setUniqueUsers([...new Set(names)]);
//         }
//     }, [users]);

//     // Helper function to apply filters
//     const applyFiltersToTasks = useCallback((tasks) => {
//         let filtered = [...tasks];

//         // Apply assignee filter for non-admin (if not already filtered by backend)
//         if (!isAdmin && currentUserName && !filters.assignee) {
//             filtered = filtered.filter(task =>
//                 task.assignees?.some(a => a.name === currentUserName)
//             );
//         }

//         // Apply other filters
//         Object.entries(filters).forEach(([key, value]) => {
//             if (!value) return;

//             switch (key) {
//                 case 'priority':
//                     filtered = filtered.filter(task => task.priority === value);
//                     break;
//                 case 'assignee':
//                     filtered = filtered.filter(task =>
//                         task.assignees?.some(a => a.name === value)
//                     );
//                     break;
//                 case 'assignedBy':
//                     filtered = filtered.filter(task => task.assignedBy?.name === value);
//                     break;
//                 case 'status':
//                     if (value === "!Completed") {
//                         filtered = filtered.filter(task => task.status !== "Completed");
//                     } else {
//                         filtered = filtered.filter(task => task.status === value);
//                     }
//                     break;
//                 case 'department':
//                     // filtered = filtered.filter(task => {
//                     //     const taskDept = typeof task.department === 'string' ? task.department.toLowerCase() : task.department?.name?.toLowerCase();
//                     //     return taskDept === value.toLowerCase();
//                     // });
//                     // break;
//                     filtered = filtered.filter(task => {
//                         if (Array.isArray(task.department)) {
//                             return task.department.some(dept =>
//                                 dept.toLowerCase() === value.toLowerCase()
//                             );
//                         }
//                         // Fallback for string format
//                         else if (typeof task.department === 'string') {
//                             return task.department.toLowerCase() === value.toLowerCase();
//                         }
//                         // Fallback for object format
//                         else if (task.department?.name) {
//                             return task.department.name.toLowerCase() === value.toLowerCase();
//                         }
//                         return false;
//                     });
//                     break;
//                 case 'code':
//                     filtered = filtered.filter(task =>
//                         task.code?.toLowerCase().includes(value.toLowerCase())
//                     );
//                     break;
//                 case 'dueBefore':
//                     const dueBeforeDate = new Date(value);
//                     filtered = filtered.filter(task => new Date(task.dueDate) <= dueBeforeDate);
//                     break;
//             }
//         });

//         // Apply search term
//         if (searchTerm) {
//             const searchLower = searchTerm.toLowerCase();
//             filtered = filtered.filter(task =>
//                 task.taskName?.toLowerCase().includes(searchLower) ||
//                 task.workDesc?.toLowerCase().includes(searchLower) ||
//                 task.code?.toLowerCase().includes(searchLower) ||
//                 task.assignedBy?.name?.toLowerCase().includes(searchLower) ||
//                 task.assignees?.some(a => a.name?.toLowerCase().includes(searchLower))
//             );
//         }

//         // Apply hide completed
//         if (hideCompleted) {
//             filtered = filtered.filter(task => task.status !== "Completed");
//         }

//         // Apply due date sorting
//         filtered.sort((a, b) => {
//             const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
//             const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
//             return dueDateSortOrder === "asc" ? dateA - dateB : dateB - dateA;
//         });

//         return filtered;
//     }, [filters, searchTerm, hideCompleted, dueDateSortOrder, isAdmin, currentUserName]);

//     // Update unique values for filters
//     const updateUniqueValues = useCallback((tasks) => {
//         const assignedBySet = new Set();
//         const statusSet = new Set();

//         tasks.forEach(task => {
//             if (task.assignedBy?.name) assignedBySet.add(task.assignedBy.name);
//             if (task.status) statusSet.add(task.status);
//         });

//         setUniqueAssignedBy([...assignedBySet]);
//         setUniqueStatuses([...statusSet]);
//     }, []);

//     // Fetch stats
//     const fetchStats = useCallback(async () => {
//         try {
//             // Calculate stats from filteredTasks
//             const highCount = filteredTasks.filter(t => t.priority === "High").length;
//             const mediumCount = filteredTasks.filter(t => t.priority === "Medium").length;
//             const lowCount = filteredTasks.filter(t => t.priority === "Low").length;

//             setStats({
//                 highCount,
//                 mediumCount,
//                 lowCount,
//                 totalCount: allTasks.length
//             });

//         } catch (error) {
//             console.error("Failed to fetch stats:", error);
//         }
//     }, [filteredTasks, allTasks]);

//     // Fetch all tasks - FIXED DEPENDENCIES
//     const fetchAllTasks = useCallback(async () => {
//         if (fetchControllerRef.current) {
//             fetchControllerRef.current.abort();
//         }

//         fetchControllerRef.current = new AbortController();
//         const signal = fetchControllerRef.current.signal;

//         try {
//             setLoading(true);
//             setInitialLoading(true);
//             setFetchProgress({ current: 0, total: 0, status: 'Starting...' });

//             // If we have tasksOverride, use them
//             if (tasksOverride && tasksOverride.length > 0) {
//                 console.log("Using tasks override");
//                 setAllTasks(tasksOverride);
//                 // Apply filters directly
//                 const filtered = applyFiltersToTasks(tasksOverride);
//                 setFilteredTasks(filtered);
//                 setLoading(false);
//                 setInitialLoading(false);
//                 return;
//             }

//             // Build user filter for non-admin
//             const userFilter = {};
//             if (!isAdmin && currentUserName) {
//                 userFilter.assignee = currentUserName;
//             }

//             let allTasksData = [];

//             // Strategy 1: Try single request first
//             try {
//                 setFetchProgress({ current: 0, total: 0, status: 'Fetching all at once...' });
//                 allTasksData = await fetchAllTasksSingle(signal, BASE_URL, userFilter);
//             } catch (singleError) {
//                 console.log("Single request failed:", singleError.message);

//                 // Strategy 2: Fallback to original paginated API
//                 try {
//                     setFetchProgress({ current: 0, total: 0, status: 'Using fallback...' });
//                     allTasksData = await fetchWithPaginationFallback(signal, userFilter);
//                 } catch (fallbackError) {
//                     console.log("All fetch methods failed:", fallbackError.message);
//                     throw new Error("All fetch methods failed");
//                 }
//             }

//             if (signal.aborted) return;

//             console.log(`🎯 Final loaded: ${allTasksData.length} tasks`);

//             // CRITICAL: Ensure no duplicates
//             const uniqueTasksMap = new Map();
//             allTasksData.forEach(task => {
//                 if (task._id && !uniqueTasksMap.has(task._id)) {
//                     uniqueTasksMap.set(task._id, task);
//                 }
//             });

//             const uniqueTasks = Array.from(uniqueTasksMap.values());
//             console.log(`🔄 After deduplication: ${uniqueTasks.length} unique tasks`);

//             // Store all tasks
//             setAllTasks(uniqueTasks);
//             setTotalCount(uniqueTasks.length);

//             // Apply initial filters
//             const filtered = applyFiltersToTasks(uniqueTasks);
//             setFilteredTasks(filtered);

//             // Update unique values
//             updateUniqueValues(uniqueTasks);

//             // Update external if needed
//             if (setTaskListExternally) {
//                 setTaskListExternally(uniqueTasks);
//             }

//             // Fetch stats
//             await fetchStats();

//         } catch (error) {
//             if (error.name !== 'AbortError') {
//                 console.error("Failed to fetch tasks:", error);
//                 Swal.fire("Error", "Failed to load tasks", "error");
//             }
//         } finally {
//             if (!signal.aborted) {
//                 setLoading(false);
//                 setInitialLoading(false);
//                 setFetchProgress({ current: 0, total: 0, status: '' });
//             }
//         }
//     }, [isAdmin, currentUserName, tasksOverride, setTaskListExternally, applyFiltersToTasks, updateUniqueValues, fetchStats]);

//     // Add this fallback function inside the component
//     // const fetchWithPaginationFallback = async (signal, userFilter = {}) => {
//     //     let allTasks = [];
//     //     let page = 1;
//     //     const LIMIT = 500;
//     //     let hasMore = true;

//     //     while (hasMore && !signal.aborted) {
//     //         const params = new URLSearchParams({
//     //             ...userFilter,
//     //             page: page.toString(),
//     //             limit: LIMIT.toString(),
//     //             sortBy: "priority",
//     //             sortOrder: "desc"
//     //         });

//     //         const response = await fetch(
//     //             `${BASE_URL}?${params}`,
//     //             { signal, headers: { 'Content-Type': 'application/json' } }
//     //         );

//     //         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//     //         const data = await response.json();
//     //         const tasks = data.tasks || [];

//     //         if (tasks.length === 0) break;

//     //         allTasks = [...allTasks, ...tasks];
//     //         setFetchProgress({
//     //             current: allTasks.length,
//     //             total: data.totalCount || allTasks.length,
//     //             status: `Fetching page ${page}...`
//     //         });

//     //         hasMore = data.hasMore === true;
//     //         page++;

//     //         // Small delay
//     //         await new Promise(resolve => setTimeout(resolve, 100));
//     //     }

//     //     return allTasks;
//     // };

//     const fetchWithPaginationFallback = async (signal, userFilter = {}) => {
//     let allTasks = [];
//     let page = 1;
//     const LIMIT = 500;
//     let hasMore = true;

//     while (hasMore && !signal.aborted) {
//         const params = new URLSearchParams({
//             ...userFilter,
//             page: page.toString(),
//             limit: LIMIT.toString(),
//             sortBy: "priority",
//             sortOrder: "desc"
//         });

//         const response = await fetch(
//             `${BASE_URL}?${params}`,
//             { signal, headers: { 'Content-Type': 'application/json' } }
//         );

//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//         const data = await response.json();
//         const tasks = data.tasks || [];

//         if (tasks.length === 0) break;

//         allTasks = [...allTasks, ...tasks];
//         setFetchProgress({
//             current: allTasks.length,
//             total: data.totalCount || allTasks.length,
//             status: `Fetching page ${page}...`
//         });

//         // Check if there are more pages
//         hasMore = data.hasMore === true ||
//                   data.totalPages > page ||
//                   data.nextPage !== null;

//         page++;

//         // Small delay
//         await new Promise(resolve => setTimeout(resolve, 100));
//     }

//     return allTasks;
// };

//     // Initial load and refresh
//     useEffect(() => {
//         if (isInitialMount.current) {
//             fetchAllTasks();
//             isInitialMount.current = false;
//         }
//     }, [fetchAllTasks]);

//     useEffect(() => {
//         fetchAllTasks();
//     }, [refreshTrigger]);

//     // Apply filters when they change (debounced) - STABILIZED
//     useEffect(() => {
//         if (filterTimeoutRef.current) {
//             clearTimeout(filterTimeoutRef.current);
//         }

//         // Don't apply filters if still loading or no tasks
//         if (loading || allTasks.length === 0) return;

//         filterTimeoutRef.current = setTimeout(() => {
//             console.log("🔄 Applying filters...");
//             const filtered = applyFiltersToTasks(allTasks);
//             console.log(`📊 Filtered from ${allTasks.length} to ${filtered.length} tasks`);

//             // Only update if actually different
//             setFilteredTasks(prev => {
//                 if (JSON.stringify(prev) === JSON.stringify(filtered)) {
//                     return prev;
//                 }
//                 return filtered;
//             });

//             // Reset states
//             setMobileCurrentPage(1);
//             setHighScrollIndex(ITEMS_PER_PAGE);
//             setOtherScrollIndex(ITEMS_PER_PAGE);

//             // Update stats
//             fetchStats();
//         }, DEBOUNCE_DELAY);

//         return () => {
//             if (filterTimeoutRef.current) {
//                 clearTimeout(filterTimeoutRef.current);
//             }
//         };
//     }, [filters, searchTerm, hideCompleted, dueDateSortOrder, allTasks, applyFiltersToTasks, fetchStats, loading]);

//     // Helper for client-side sorting by Due Date (Secondary Sort) - FIXED
//     const sortByDueDate = useCallback((a, b) => {
//         const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
//         const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
//         return dueDateSortOrder === "asc" ? dateA - dateB : dateB - dateA;
//     }, [dueDateSortOrder]);

//     // Task categorization with memoization - COMPLETELY REWRITTEN
//     // const taskCategories = useMemo(() => {
//     //     if (filteredTasks.length === 0) {
//     //         return {
//     //             allHighTasks: [],
//     //             otherTasks: [],
//     //             highTasks: [],
//     //             mediumTasks: [],
//     //             lowTasks: []
//     //         };
//     //     }

//     //     // Sort by due date first
//     //     const sortedTasks = [...filteredTasks].sort(sortByDueDate);

//     //     // Separate by priority
//     //     const allHigh = sortedTasks.filter(t => t.priority === "High");
//     //     const other = sortedTasks.filter(t => t.priority !== "High");

//     //     if (isMobileView) {
//     //         const medium = other.filter(t => t.priority === "Medium");
//     //         const low = other.filter(t => t.priority === "Low");
//     //         return {
//     //             allHighTasks: allHigh,
//     //             otherTasks: other,
//     //             highTasks: allHigh,
//     //             mediumTasks: medium,
//     //             lowTasks: low
//     //         };
//     //     }

//     //     // For desktop, apply virtual scroll
//     //     const virtualHigh = allHigh.slice(0, highScrollIndex);

//     //     // IMPORTANT: Medium and Low should be calculated from ALL other tasks,
//     //     // then sliced separately
//     //     const medium = other.filter(t => t.priority === "Medium");
//     //     const low = other.filter(t => t.priority === "Low");

//     //     const virtualMedium = medium.slice(0, otherScrollIndex);
//     //     const virtualLow = low.slice(0, otherScrollIndex);

//     //     return {
//     //         allHighTasks: allHigh,
//     //         otherTasks: other,
//     //         highTasks: virtualHigh,
//     //         mediumTasks: virtualMedium,
//     //         lowTasks: virtualLow
//     //     };
//     // }, [filteredTasks, isMobileView, highScrollIndex, otherScrollIndex, sortByDueDate]);

//     // Optimized Task categorization - Priority FIRST, then sort only what's needed
// const taskCategories = useMemo(() => {
//     // Quick exit for empty state
//     if (filteredTasks.length === 0) {
//         return {
//             allHighTasks: [],
//             otherTasks: [],
//             highTasks: [],
//             mediumTasks: [],
//             lowTasks: []
//         };
//     }

//     // Separate by priority FIRST (fast operation)
//     const highTasks = [];
//     const mediumTasks = [];
//     const lowTasks = [];

//     for (const task of filteredTasks) {
//         if (task.priority === "High") {
//             highTasks.push(task);
//         } else if (task.priority === "Medium") {
//             mediumTasks.push(task);
//         } else if (task.priority === "Low") {
//             lowTasks.push(task);
//         }
//     }

//     // Sort only what we'll actually display (lazy sorting)
//     const sortIfNeeded = (tasks) => {
//         if (tasks.length === 0) return tasks;
//         // Only sort when needed - copy and sort
//         return [...tasks].sort(sortByDueDate);
//     };

//     // Sort high priority tasks (always sorted since they're always visible)
//     const sortedHigh = sortIfNeeded(highTasks);

//     if (isMobileView) {
//         // Mobile: sort medium/low separately
//         const sortedMedium = sortIfNeeded(mediumTasks);
//         const sortedLow = sortIfNeeded(lowTasks);

//         return {
//             allHighTasks: sortedHigh,
//             otherTasks: [...mediumTasks, ...lowTasks], // unsorted for mobile
//             highTasks: sortedHigh,
//             mediumTasks: sortedMedium,
//             lowTasks: sortedLow
//         };
//     }

//     // Desktop with virtualization
//     const sortedMedium = sortIfNeeded(mediumTasks);
//     const sortedLow = sortIfNeeded(lowTasks);

//     // Apply virtualization slicing AFTER sorting
//     const virtualHigh = sortedHigh.slice(0, highScrollIndex);
//     const virtualMedium = sortedMedium.slice(0, otherScrollIndex);
//     const virtualLow = sortedLow.slice(0, otherScrollIndex);

//     return {
//         allHighTasks: sortedHigh,
//         otherTasks: [...mediumTasks, ...lowTasks], // keep unsorted for length reference
//         highTasks: virtualHigh,
//         mediumTasks: virtualMedium,
//         lowTasks: virtualLow
//     };
// }, [filteredTasks, isMobileView, highScrollIndex, otherScrollIndex, sortByDueDate]);

//     // Destructure after useMemo
//     const { allHighTasks, otherTasks, highTasks, mediumTasks, lowTasks } = taskCategories;

//     // ⭐️ Intersection Observer for High Priority Virtual Scroll (Desktop)
//     // useEffect(() => {
//     //     if (isMobileView || loading || !highObserverTarget.current) return;

//     //     const observer = new IntersectionObserver(
//     //         entries => {
//     //             if (entries[0].isIntersecting && highScrollIndex < allHighTasks.length) {
//     //                 console.log("📜 Loading more High tasks...");
//     //                 setHighScrollIndex(prev => Math.min(prev + ITEMS_PER_PAGE, allHighTasks.length));
//     //             }
//     //         },
//     //         { threshold: 0.1, rootMargin: "100px" }
//     //     );

//     //     const currentTarget = highObserverTarget.current;
//     //     observer.observe(currentTarget);

//     //     return () => {
//     //         if (currentTarget) observer.unobserve(currentTarget);
//     //     };
//     // }, [highScrollIndex, loading, isMobileView, allHighTasks.length]);

//     // Replace your current observers with this optimized version
// useEffect(() => {
//     if (isMobileView || loading || !highObserverTarget.current) return;

//     const observer = new IntersectionObserver(
//         entries => {
//             const entry = entries[0];
//             if (entry.isIntersecting && entry.intersectionRatio > 0) {
//                 if (highScrollIndex < allHighTasks.length) {
//                     console.log("📜 Loading more High tasks...");
//                     setHighScrollIndex(prev => Math.min(prev + ITEMS_PER_PAGE, allHighTasks.length));
//                 } else if (hasMoreServerData) {
//                     // Load more from server when client-side limit reached
//                     loadMoreTasks();
//                 }
//             }
//         },
//         {
//             threshold: 0.1,
//             rootMargin: "200px" // Increased margin for smoother loading
//         }
//     );

//     const currentTarget = highObserverTarget.current;
//     if (currentTarget) observer.observe(currentTarget);

//     return () => {
//         if (currentTarget) observer.unobserve(currentTarget);
//     };
// }, [highScrollIndex, loading, isMobileView, allHighTasks.length, hasMoreServerData]);

//     // // ⭐️ Intersection Observer for Medium/Low Virtual Scroll (Desktop)
//     useEffect(() => {
//         if (isMobileView || loading || !otherObserverTarget.current) return;

//         const observer = new IntersectionObserver(
//             entries => {
//                 if (entries[0].isIntersecting) {
//                     // Calculate total remaining Medium + Low tasks
//                     const totalMediumLow = mediumTasks.length + lowTasks.length;
//                     const totalAllMediumLow = otherTasks.length;

//                     if (otherScrollIndex < totalAllMediumLow) {
//                         console.log("📜 Loading more Medium/Low tasks...");
//                         setOtherScrollIndex(prev => Math.min(prev + ITEMS_PER_PAGE, totalAllMediumLow));
//                     }
//                 }
//             },
//             { threshold: 0.1, rootMargin: "100px" }
//         );

//         const currentTarget = otherObserverTarget.current;
//         observer.observe(currentTarget);

//         return () => {
//             if (currentTarget) observer.unobserve(currentTarget);
//         };
//     }, [otherScrollIndex, loading, isMobileView, otherTasks.length]);

// //mediumTasks.length, lowTasks.length,
//     // ⭐️ Intersection Observer for Medium/Low Virtual Scroll (Desktop)
//     // useEffect(() => {
//     //     if (isMobileView || loading) return;

//     //     const observer = new IntersectionObserver(
//     //         entries => {
//     //             if (entries[0].isIntersecting && otherScrollIndex < otherTasks.length && !loading) {
//     //                 setOtherScrollIndex(prevIndex => prevIndex + ITEMS_PER_PAGE);
//     //             }
//     //         },
//     //         { threshold: 0.1 }
//     //     );

//     //     if (otherObserverTarget.current) {
//     //         observer.observe(otherObserverTarget.current);
//     //     }

//     //     return () => {
//     //         // Cleanup logic improved for observer targets
//     //         if (otherObserverTarget.current) observer.unobserve(otherObserverTarget.current);
//     //     };
//     // }, [otherScrollIndex, loading, isMobileView, otherTasks.length]);

//     // Handle closing dropdown on outside click
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setEditingStatus(null);
//             }
//         };
//         // Use requestAnimationFrame to defer adding the listener, ensuring it runs after the current click event bubble finishes
//         const rafId = requestAnimationFrame(() => {
//             document.addEventListener("mousedown", handleClickOutside);
//         });

//         return () => {
//             cancelAnimationFrame(rafId);
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, [editingStatus]);

//     // WebSocket for real-time updates
//     useEffect(() => {
//         const handleTaskEvent = () => {
//             // fetchTasks(1, false);
//             fetchAllTasks();
//             fetchStats();
//         };

//         socket.on("new-task-created", handleTaskEvent);
//         socket.on("task-updated", handleTaskEvent);
//         socket.on("task-deleted", handleTaskEvent);

//         return () => {
//             socket.off("new-task-created", handleTaskEvent);
//             socket.off("task-updated", handleTaskEvent);
//             socket.off("task-deleted", handleTaskEvent);
//         };
//     }, [fetchAllTasks, fetchStats]);

//     // Cleanup on unmount
//     useEffect(() => {
//         return () => {
//             if (fetchControllerRef.current) {
//                 fetchControllerRef.current.abort();
//             }
//             if (filterTimeoutRef.current) {
//                 clearTimeout(filterTimeoutRef.current);
//             }
//         };
//     }, []);

//     // Handle filter changes
//     const handleFilterChange = (key, value) => {
//         setFilters(prev => ({ ...prev, [key]: value }));
//         setMobileCurrentPage(1);
//         setHighScrollIndex(ITEMS_PER_PAGE);
//         setOtherScrollIndex(ITEMS_PER_PAGE);
//     };

//     // Helper to find the task in the current visible list
//     const getTaskById = (taskId) => allTasks.find((t) => t._id === taskId);

//     // Handle message send from MessagePopup (using secureAxios)
//     const handleMessageSend = async (payload) => {
//         try {
//             const response = await axios.post(
//                 "https://taskbe.sharda.co.in/api/message-history",
//                 payload
//             );

//             if (response.status === 201) {
//                 Swal.fire("Message sent successfully!");
//             } else {
//                 // If axios returns a non-2xx status, it should throw an error, but this check is kept for robustness.
//                 throw new Error("Message sending failed");
//             }
//         } catch (error) {
//             console.error("Failed to send message:", error);
//             Swal.fire("Error", "Failed to send message", "error");
//         }
//     };

//     // Handle Copy Task functionality
//     const handleCopyTask = async (task) => {
//         const taskText = `Task: ${task.taskName}\nCode: ${task.code || 'N/A'}\nDue Date: ${new Date(task.dueDate).toLocaleDateString("en-GB")}\nPriority: ${task.priority}`;

//         try {
//             await navigator.clipboard.writeText(taskText);
//             Swal.fire({
//                 toast: true,
//                 position: 'top-end',
//                 icon: 'success',
//                 title: `Task "${task.taskName}" copied to clipboard!`,
//                 showConfirmButton: false,
//                 timer: 3000
//             });
//         } catch (error) {
//             console.error("Failed to copy task:", error);
//             Swal.fire({
//                 toast: true,
//                 position: 'top-end',
//                 icon: 'error',
//                 title: 'Failed to copy task.',
//                 showConfirmButton: false,
//                 timer: 3000
//             });
//         }
//     };

//     // Status update
//     const handleStatusChange = async (taskId, newStatus) => {
//         setLoadingStatus(prev => ({ ...prev, [taskId]: true }));
//         setEditingStatus(null); // Close dropdown immediately

//         // Optimistic update
//         // setTasks(prev => prev.map(task =>
//         //     task._id === taskId ? { ...task, status: newStatus } : task
//         // ));
//         setAllTasks(prev => prev.map(task =>
//             task._id === taskId ? { ...task, status: newStatus } : task
//         ));

//         let updatedRemark = remarks[taskId] || "";
//         // Update remarks if setting status to Completed
//         if (newStatus === "Completed" && !updatedRemark.includes("[Completed]")) {
//             updatedRemark += " [Completed]";
//             setRemarks(prev => ({ ...prev, [taskId]: updatedRemark }));
//         }
//         // Clean up [Completed] tag if status is reverted from completed
//         if (newStatus !== "Completed") {
//             updatedRemark = updatedRemark.replace(" [Completed]", "").trim();
//             setRemarks(prev => ({ ...prev, [taskId]: updatedRemark }));
//         }

//         const updatedBy = {
//             name: localStorage.getItem("name"),
//             email: localStorage.getItem("userId"),
//         };

//         try {
//             const response = await fetch(`https://taskbe.sharda.co.in/api/tasks/${taskId}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ status: newStatus, updatedBy, remark: updatedRemark }),
//             });

//             if (!response.ok) throw new Error("Failed to update status on server");

//             const updatedTask = await response.json();
//             setAllTasks(prev => prev.map(task =>
//                 task._id === taskId ? updatedTask : task
//             ));
//             setRemarks(prev => ({ ...prev, [taskId]: updatedTask.remark || "" }));
//             fetchStats(); // Update stats count

//         } catch (error) {
//             console.error("Error updating status:", error);
//             fetchAllTasks(); // Revert or re-fetch on error
//             Swal.fire("Error", "Failed to update status", "error");
//         }
//         setLoadingStatus(prev => ({ ...prev, [taskId]: false }));
//     };

//     // Work Description handlers
//     const handleWorkDescEditClick = (taskId) => {
//         const task = getTaskById(taskId);
//         if (task && !workDescs[taskId]) {
//             setWorkDescs((prev) => ({ ...prev, [taskId]: task.workDesc || "" }));
//         }
//         setOpenWorkDescPopup(taskId);
//     };

//     const handleWorkDescSave = async (taskId) => {
//         const workDescText = workDescs[taskId] || "";
//         const updatedBy = {
//             name: localStorage.getItem("name"),
//             email: localStorage.getItem("userId"),
//         };

//         try {
//             const response = await fetch(`https://taskbe.sharda.co.in/api/tasks/${taskId}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ workDesc: workDescText, updatedBy }),
//             });

//             if (response.ok) {
//                 const updatedTask = await response.json();
//                 setAllTasks(prev => prev.map(task =>
//                     task._id === taskId ? updatedTask : task
//                 ));
//                 setOpenWorkDescPopup(null);
//             } else {
//                 throw new Error("Failed to update description");
//             }
//         } catch (error) {
//             console.error("Error updating work description:", error);
//             Swal.fire("Error", "Failed to update description", "error");
//         }
//     };

//     // Remark handlers
//     const handleRemarkEditClick = (taskId) => {
//         const task = getTaskById(taskId);
//         if (task && !remarks[taskId]) {
//             setRemarks((prev) => ({ ...prev, [taskId]: task.remark || "" }));
//         }
//         setOpenRemarkPopup(taskId);
//     };

//     const handleRemarkSave = async (taskId) => {
//         const remarkText = remarks[taskId] || "";
//         const updatedBy = {
//             name: localStorage.getItem("name"),
//             email: localStorage.getItem("userId"),
//         };

//         try {
//             const response = await fetch(`https://taskbe.sharda.co.in/api/tasks/${taskId}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ remark: remarkText, updatedBy }),
//             });

//             if (response.ok) {
//                 const updatedTask = await response.json();
//                 setAllTasks(prev => prev.map(task =>
//                     task._id === taskId ? updatedTask : task
//                 ));
//                 setOpenRemarkPopup(null);
//             } else {
//                 throw new Error("Failed to update remark");
//             }
//         } catch (error) {
//             console.error("Error updating remark:", error);
//             Swal.fire("Error", "Failed to update remark", "error");
//         }
//     };

//     // Repetitive Task Deletion Logic
//     const permanentlyStopRepetition = async (task) => {
//         try {
//             const updatedBy = {
//                 name: localStorage.getItem("name"),
//                 email: localStorage.getItem("userId"),
//             };

//             const response = await fetch(`https://taskbe.sharda.co.in/api/tasks/${task._id}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     isRepetitive: false,
//                     nextRepetitionDate: null,
//                     updatedBy,
//                 }),
//             });

//             if (!response.ok) throw new Error("Failed to update repetition status");

//             await deleteTaskRequest(task._id);
//         } catch (error) {
//             console.error("Error stopping repetition", error);
//             Swal.fire("Error", "Failed to stop future repetitions.", "error");
//         }
//     };

//     // Base Delete API call
//     const deleteTaskRequest = async (taskId) => {
//         try {
//             // Optimistic removal
//             setAllTasks(prev => prev.filter(t => t._id !== taskId));

//             const response = await fetch(
//                 `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
//                 { method: "DELETE" }
//             );
//             if (!response.ok) throw new Error("Failed to delete task");

//             Swal.fire({
//                 title: "Deleted!",
//                 text: "Task has been deleted.",
//                 icon: "success",
//                 confirmButtonText: "OK",
//             });
//             fetchAllTasks(); // Re-fetch to ensure data integrity and update counts
//         } catch (err) {
//             console.error("Error deleting task:", err);
//             Swal.fire({
//                 title: "Error!",
//                 text: "Failed to delete task. Please try again.",
//                 icon: "error",
//                 confirmButtonText: "OK",
//             });
//             fetchAllTasks(); // Re-fetch in case of failure to revert state
//         }
//     };

//     // Delete task (Enhanced with Repetitive Task Option)
//     const handleDeleteTask = async (task) => {
//         if (!task || !task._id) {
//             Swal.fire({
//                 icon: "error",
//                 title: "Invalid Task",
//                 text: "The selected task is not valid or is missing required data.",
//                 confirmButtonColor: "#d33",
//             });
//             return;
//         }

//         if (!task.isRepetitive) {
//             const confirmDelete = await Swal.fire({
//                 title: "Are you sure?",
//                 text: `Task: ${task.taskName} will be permanently removed.`,
//                 icon: "warning",
//                 showCancelButton: true,
//                 confirmButtonColor: "#dc2626",
//                 cancelButtonColor: "#6c757d",
//                 confirmButtonText: "Yes, delete!",
//                 cancelButtonText: "Cancel",
//             });
//             if (!confirmDelete.isConfirmed) return;
//             return deleteTaskRequest(task._id);
//         }

//         const result = await Swal.fire({
//             title: "Repetitive Task Options",
//             html: `
//                 <p>This task repeats regularly. What action do you want to take?</p>
//                 <ul style="text-align: left; font-size: 14px; list-style-type: none; padding-left: 0;">
//                     <li><b>Delete Only This:</b> Deletes this instance only.</li>
//                     <li><b>Stop Repeating & Delete:</b> Ends the repetition and deletes it.</li>
//                 </ul>
//             `,
//             icon: "question",
//             showCancelButton: true,
//             showDenyButton: true,
//             confirmButtonText: "Delete Only This",
//             denyButtonText: "Stop & Delete",
//             cancelButtonText: "Cancel",
//             confirmButtonColor: "#3085d6",
//             denyButtonColor: "#e3342f",
//             cancelButtonColor: "#6c757d",
//         });

//         if (result.isConfirmed) {
//             await deleteTaskRequest(task._id);
//         } else if (result.isDenied) {
//             await permanentlyStopRepetition(task);
//         }
//     };

//     // Mobile Pagination Logic based on the full tasks array (after memoization/sorting logic)
//     const allTasksForMobile = useMemo(() => {
//         return [...allHighTasks, ...otherTasks];
//     }, [allHighTasks, otherTasks]);
//     const mobileIndexOfLast = mobileCurrentPage * MOBILE_ITEMS_PER_PAGE;
//     const mobileIndexOfFirst = mobileIndexOfLast - MOBILE_ITEMS_PER_PAGE;

//     // ⭐️ PERFORMANCE: Slice the combined, sorted tasks array once for the current mobile page view
//     const mobileTasksToRender = allTasksForMobile.slice(mobileIndexOfFirst, mobileIndexOfLast);
//     const mobileTotalPages = Math.ceil(allTasksForMobile.length / MOBILE_ITEMS_PER_PAGE);

//     // Apply sorting/grouping on the subset of tasks for the current mobile page
//     const mobileHigh = mobileTasksToRender.filter((t) => t.priority === "High");
//     const mobileMedium = mobileTasksToRender.filter((t) => t.priority === "Medium");
//     const mobileLow = mobileTasksToRender.filter((t) => t.priority === "Low");

//     const handleNextPage = () => {
//         setMobileCurrentPage((prev) => Math.min(prev + 1, mobileTotalPages));
//     };

//     const handlePreviousPage = () => {
//         setMobileCurrentPage((prev) => Math.max(prev - 1, 1));
//     };

//     const statusColors = {
//         "To Do": { bg: "#EFF6FF", text: "#1E40AF", border: "#3B82F6", glow: "rgba(59, 130, 246, 0.3)" },
//         "In Progress": { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B", glow: "rgba(245, 158, 11, 0.3)" },
//         "Completed": { bg: "#D1FAE5", text: "#065F46", border: "#10B981", glow: "rgba(16, 185, 129, 0.3)" },
//         "Obsolete": { bg: "#F3E8FF", text: "#6B21A8", border: "#A855F7", glow: "rgba(168, 85, 247, 0.3)" },
//     };

//     const priorityColors = {
//         "High": { bg: "#FEE2E2", text: "#991B1B", border: "#DC2626", glow: "rgba(220, 38, 38, 0.3)" },
//         "Medium": { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B", glow: "rgba(245, 158, 11, 0.3)" },
//         "Low": { bg: "#DBEAFE", text: "#1E40AF", border: "#3B82F6", glow: "rgba(59, 130, 246, 0.3)" },
//     };

//     // Render task row (Desktop)
//     const renderTaskRow = (task, serialIndex, category) => {
//         // const serialIndex = cumulativeIndex + 1;
//         const uniqueKey = `${category}-${task._id}-${serialIndex}-${task.priority}`;
//         return (
//             <tr key={uniqueKey} className="group border-b border-gray-200 hover:bg-slate-50">
//                 {/* Index */}
//                 <td className="py-3 px-2 text-sm text-gray-700 font-semibold">{serialIndex}</td>

//                 {/* Task Name & Code (Enhanced with Overdue Icon) */}
//                 <td className="py-3 px-2">
//                     <div className="flex flex-col gap-1">
//                         <div className="font-bold text-gray-900 text-sm flex items-center gap-2"
//                             style={{ willChange: 'transform' }}>
//                             {task.taskName}
//                             {new Date(task.dueDate) < new Date() &&
//                                 task.status !== "Completed" &&
//                                 task.status !== "Obsolete" && (
//                                     <FaExclamationCircle
//                                         className="text-red-600 animate-pulse"
//                                         size={12}
//                                         title="Overdue"
//                                     />
//                                 )}
//                         </div>
//                         {task.code && (
//                             <span className="text-xs text-indigo-700 font-semibold">
//                                 📋 {task.code}
//                             </span>
//                         )}
//                     </div>
//                 </td>

//                 {/* Work Description (with Edit) */}
//                 <td className="py-3 px-2">
//                     <div className="flex items-center gap-1">
//                         <p className="text-xs text-gray-600 line-clamp-2">
//                             {task.workDesc ? (task.workDesc.length > 50 ? task.workDesc.slice(0, 50) + "..." : task.workDesc) : "No description"}
//                         </p>
//                         <button
//                             onClick={() => handleWorkDescEditClick(task._id)}
//                             className="text-indigo-600 hover:text-indigo-800 p-1"
//                             title="Edit Description"
//                         >
//                             <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
//                         </button>
//                     </div>
//                 </td>

//                 {/* Work Date */}
//                 {/* <td className="py-3 px-2 text-xs text-gray-700">

//                     {formatDate(task.assignedDate)}
//                 </td> */}
//                 {/* {new Date(task.assignedDate).toLocaleDateString("en-GB")} */}

//                 {/* Due Date */}
//                 <td className="py-3 px-2 text-xs text-gray-700 font-semibold">
//                     {new Date(task.dueDate).toLocaleDateString("en-GB")}
//                 </td>

//                 {/* Status (with Dropdown Trigger/Loading) */}
//                 <td className="py-3 px-2">
//                     <span
//                         className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold cursor-pointer border ${loadingStatus[task._id] ? 'opacity-75' : ''}`}
//                         style={{
//                             backgroundColor: statusColors[task.status]?.bg,
//                             color: statusColors[task.status]?.text,
//                             borderColor: statusColors[task.status]?.border,
//                         }}
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             const rect = e.currentTarget.getBoundingClientRect(); // Use currentTarget for accurate position
//                             setDropdownPosition({
//                                 top: rect.bottom + window.scrollY + 5, // Position below the button
//                                 left: rect.left + window.scrollX,
//                             });
//                             setEditingStatus(task._id);
//                         }}
//                     >
//                         {loadingStatus[task._id] ? <FaSpinner className="animate-spin h-3 w-3" /> : task.status}
//                     </span>
//                 </td>

//                 {/* Priority */}
//                 <td className="py-3 px-2">
//                     <span
//                         className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border"
//                         style={{
//                             backgroundColor: priorityColors[task.priority]?.bg,
//                             color: priorityColors[task.priority]?.text,
//                             borderColor: priorityColors[task.priority]?.border,
//                         }}
//                     >
//                         {task.priority}
//                     </span>
//                 </td>

//                 {/* Remarks (with Edit) */}
//                 <td className="py-3 px-2">
//                     <div className="flex items-center gap-1">
//                         <span className="text-xs text-gray-600 line-clamp-1">
//                             {(remarks[task._id] || "No remark").slice(0, 20)}
//                             {(remarks[task._id] || "").length > 20 && "..."}
//                         </span>
//                         <button
//                             onClick={() => handleRemarkEditClick(task._id)}
//                             className="text-indigo-600 hover:text-indigo-800"
//                             title="Edit Remark"
//                         >
//                             <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
//                         </button>
//                     </div>
//                 </td>

//                 {/* Team (with Popup Trigger) */}
//                 <td className="py-3 px-2">
//                     <div className="flex flex-wrap gap-1">
//                         {task.assignees?.slice(0, 2).map((assignee) => (
//                             <span key={assignee.email} className="text-xs py-0.5 px-2 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
//                                 {assignee.name.split(" ")[0]}
//                             </span>
//                         ))}
//                         {task.assignees?.length > 2 && (
//                             <span
//                                 onClick={() => setShowTeamPopup(task._id)}
//                                 className="text-xs py-0.5 px-2 rounded-full bg-gray-100 text-gray-600 font-semibold cursor-pointer hover:bg-gray-200 transition-all"
//                                 title="View all team members"
//                             >
//                                 +{task.assignees.length - 2}
//                             </span>
//                         )}
//                     </div>
//                 </td>

//                 {/* Assigned By */}
//                 <td className="py-3 px-2 text-xs text-gray-700 font-semibold">
//                     {task.assignedBy?.name || "—"}
//                 </td>

//                 {/* Actions (Enhanced with Message/Copy) */}
//                 <td className="py-3 px-2">
//                     <div className="flex gap-1">
//                         {/* Message Button */}
//                         <button
//                             onClick={() => {
//                                 setTaskForMessage(task);
//                                 setOpenMessagePopup(true);
//                             }}
//                             className="p-1.5 hover:bg-blue-50 rounded-lg transition-all text-blue-600"
//                             title="Message"
//                         >
//                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                                 <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
//                                 <path d="m21.854 2.147-10.94 10.939" />
//                             </svg>
//                         </button>
//                         {/* Copy Button */}
//                         <button
//                             onClick={() => handleCopyTask(task)}
//                             className="p-1.5 hover:bg-indigo-50 rounded-lg transition-all text-indigo-600"
//                             title="Copy"
//                         >
//                             <FontAwesomeIcon icon={faCopy} className="h-3.5 w-3.5" />
//                         </button>
//                         {/* Edit Button */}
//                         <button onClick={() => onEdit(task)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600" title="Edit">
//                             <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
//                         </button>
//                         {/* Delete Button */}
//                         {isAdmin && (
//                             <button onClick={() => handleDeleteTask(task)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600" title="Delete">
//                                 <FaTrashAlt size={12} />
//                             </button>
//                         )}
//                     </div>
//                 </td>
//             </tr>
//         );
//     };

//     // Render task card (Mobile)
//     const renderTaskCard = (task, cumulativeIndex) => {
//         const serialIndex = mobileIndexOfFirst + cumulativeIndex + 1; // Correct index for mobile card view

//         return (
//             <div
//                 key={task._id}
//                 id={`task-${task._id}`}
//                 className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 overflow-hidden mb-4"
//             >
//                 {/* Header */}
//                 <div className="bg-gray-50 border-b border-gray-200 p-4">
//                     <div className="flex items-start justify-between mb-3">
//                         <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-2">
//                                 {/* Use serialIndex here */}
//                                 <span className="text-xs text-gray-500 font-medium">#{serialIndex}</span>
//                                 <span
//                                     className="text-xs px-2 py-1 rounded font-semibold"
//                                     style={{
//                                         backgroundColor: priorityColors[task.priority]?.bg,
//                                         color: priorityColors[task.priority]?.text,
//                                     }}
//                                 >
//                                     {task.priority}
//                                 </span>
//                             </div>
//                             <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-1 flex items-center">
//                                 {task.taskName}
//                                 {new Date(task.dueDate) < new Date() &&
//                                     task.status !== "Completed" &&
//                                     task.status !== "Obsolete" && (
//                                         <FaExclamationCircle
//                                             className="text-red-600 animate-pulse ml-2"
//                                             size={12}
//                                             title="Overdue"
//                                         />
//                                     )}
//                             </h3>
//                             {task.code && (
//                                 <span className="inline-block text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
//                                     {task.code}
//                                 </span>
//                             )}
//                         </div>

//                         <div className="flex gap-1 ml-2">
//                             <button
//                                 className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
//                                 onClick={() => handleCopyTask(task)}
//                                 title="Copy"
//                             >
//                                 <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
//                             </button>
//                             <button
//                                 onClick={() => onEdit(task)}
//                                 className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
//                                 title="Edit"
//                             >
//                                 <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
//                             </button>
//                             {isAdmin && (
//                                 <button
//                                     className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"
//                                     onClick={() => handleDeleteTask(task)}
//                                     title="Delete"
//                                 >
//                                     <FaTrashAlt size={14} />
//                                 </button>
//                             )}
//                         </div>
//                     </div>

//                     {/* Status */}
//                     <span
//                         className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer border ${loadingStatus[task._id] ? 'opacity-75' : ''}`}
//                         style={{
//                             backgroundColor: statusColors[task.status]?.bg,
//                             color: statusColors[task.status]?.text,
//                             borderColor: statusColors[task.status]?.border,
//                         }}
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             const rect = e.currentTarget.getBoundingClientRect();
//                             setDropdownPosition({
//                                 top: rect.bottom + window.scrollY + 5,
//                                 left: rect.left + window.scrollX,
//                             });
//                             setEditingStatus(task._id);
//                         }}
//                     >
//                         {loadingStatus[task._id] ? <FaSpinner className="animate-spin h-3 w-3" /> : (
//                             <>
//                                 {task.status === "Completed" && <span>✓</span>}
//                                 {task.status === "In Progress" && <span className="animate-pulse">⏱</span>}
//                                 {task.status === "To Do" && <span>📝</span>}
//                                 {task.status === "Obsolete" && <span>⊗</span>}
//                                 <span>{task.status}</span>
//                             </>
//                         )}
//                     </span>
//                 </div>

//                 {/* Body */}
//                 <div className="p-4 space-y-3">
//                     <div>
//                         <span className="text-xs font-semibold text-gray-600 uppercase block mb-1">
//                             Description
//                         </span>
//                         <p className="text-sm text-gray-700 line-clamp-3">
//                             {task.workDesc || "No description"}
//                         </p>
//                         <button
//                             onClick={() => handleWorkDescEditClick(task._id)}
//                             className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 font-semibold"
//                         >
//                             Edit <FontAwesomeIcon icon={faPen} className="h-2.5 w-2.5 ml-1" />
//                         </button>
//                     </div>

//                     <div>
//                         <span className="text-xs font-semibold text-gray-600 uppercase block mb-1">
//                             Remark
//                         </span>
//                         <p className="text-sm text-gray-700 line-clamp-3">
//                             {remarks[task._id] || "No remark"}
//                         </p>
//                         <button
//                             onClick={() => handleRemarkEditClick(task._id)}
//                             className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 font-semibold"
//                         >
//                             Edit <FontAwesomeIcon icon={faPen} className="h-2.5 w-2.5 ml-1" />
//                         </button>
//                     </div>

//                     <div className="grid grid-cols-2 gap-3">
//                         {/* <div>
//                             <span className="text-xs font-semibold text-gray-600 block mb-1">Work Date</span>
//                             <div className="text-sm text-gray-900 font-medium">

//                                 {formatDate(task.assignedDate)}
//                             </div>
//                         </div> */}
//                         {/* {new Date(task.assignedDate).toLocaleDateString("en-GB")} */}
//                         <div>
//                             <span className="text-xs font-semibold text-gray-600 block mb-1">Due Date</span>
//                             <div className="text-sm text-gray-900 font-medium">
//                                 {new Date(task.dueDate).toLocaleDateString("en-GB")}
//                             </div>
//                         </div>
//                     </div>

//                     <div>
//                         <span className="text-xs font-semibold text-gray-600 uppercase block mb-2">Team</span>
//                         <div className="flex flex-wrap gap-1.5">
//                             {task.assignees?.slice(0, 3).map((assignee) => (
//                                 <span key={assignee.email} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
//                                     {assignee.name.split(" ")[0]}
//                                 </span>
//                             ))}
//                             {task.assignees?.length > 3 && (
//                                 <span
//                                     onClick={() => setShowTeamPopup(task._id)}
//                                     className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-medium cursor-pointer"
//                                 >
//                                     +{task.assignees.length - 3}
//                                 </span>
//                             )}
//                         </div>
//                     </div>

//                     <div className="flex items-center gap-2 text-xs text-gray-600">
//                         <span className="font-semibold">Assigned by:</span>
//                         <span className="font-medium text-gray-900">{task.assignedBy?.name || "—"}</span>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex gap-2 pt-2 border-t border-gray-100">
//                         <button
//                             onClick={() => setOpenTaskPopup(task._id)}
//                             className="flex-1 py-2 rounded bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
//                         >
//                             View Details
//                         </button>
//                         <button
//                             onClick={() => {
//                                 setTaskForMessage(task);
//                                 setOpenMessagePopup(true);
//                             }}
//                             className="p-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
//                             title="Message"
//                         >
//                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                 <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
//                                 <path d="m21.854 2.147-10.94 10.939" />
//                             </svg>
//                         </button>
//                     </div>
//                 </div>

//                 {/* Task Details Popup (Mobile) */}
//                 {openTaskPopup === task._id && (
//                     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpenTaskPopup(null)}>
//                         <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative" onClick={(e) => e.stopPropagation()}>
//                             <button
//                                 className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
//                                 onClick={() => setOpenTaskPopup(null)}
//                             >
//                                 ×
//                             </button>

//                             <div className="mb-6">
//                                 <h2 className="text-2xl font-bold text-gray-900 mb-2">
//                                     {task.taskName}
//                                 </h2>
//                                 {task.code && (
//                                     <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
//                                         {task.code}
//                                     </span>
//                                 )}
//                             </div>

//                             <div className="space-y-4">
//                                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                                     <div className="flex justify-between items-start mb-2">
//                                         <span className="font-semibold text-gray-900 text-sm">
//                                             Description
//                                         </span>
//                                         <button
//                                             onClick={() => {
//                                                 handleWorkDescEditClick(task._id);
//                                                 setOpenTaskPopup(null);
//                                             }}
//                                             className="text-blue-600 hover:text-blue-800"
//                                         >
//                                             <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
//                                         </button>
//                                     </div>
//                                     <p className="text-gray-700 text-sm whitespace-pre-wrap">
//                                         {task.workDesc || "No description"}
//                                     </p>
//                                 </div>

//                                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                                     <div className="flex justify-between items-start mb-2">
//                                         <span className="font-semibold text-gray-900 text-sm">
//                                             Remark
//                                         </span>
//                                         <button
//                                             onClick={() => {
//                                                 handleRemarkEditClick(task._id);
//                                                 setOpenTaskPopup(null);
//                                             }}
//                                             className="text-blue-600 hover:text-blue-800"
//                                         >
//                                             <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
//                                         </button>
//                                     </div>
//                                     <p className="text-gray-700 text-sm whitespace-pre-wrap">
//                                         {remarks[task._id] || "No remark"}
//                                     </p>
//                                 </div>

//                                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                                     <span className="font-semibold text-gray-900 block mb-3 text-sm">
//                                         Team Members
//                                     </span>
//                                     <div className="flex flex-wrap gap-2">
//                                         {task.assignees?.map((assignee) => (
//                                             <span
//                                                 key={assignee.email}
//                                                 className="px-3 py-1.5 bg-white text-gray-700 rounded text-sm font-medium border border-gray-200"
//                                             >
//                                                 {assignee.name}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
//                                     <button
//                                         onClick={() => onEdit(task)}
//                                         className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm transition-colors"
//                                     >
//                                         Edit Task
//                                     </button>
//                                     <button
//                                         onClick={() => handleStatusChange(task._id, "Completed")}
//                                         className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold text-sm transition-colors"
//                                     >
//                                         Mark Complete
//                                     </button>
//                                     {isAdmin && (
//                                         <button
//                                             onClick={() => handleDeleteTask(task)}
//                                             className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold text-sm transition-colors"
//                                         >
//                                             Delete
//                                         </button>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     // Team Members Popup
//     const renderTeamPopup = (task) => (
//         <div
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//             onClick={() => setShowTeamPopup(null)}
//         >
//             <div
//                 className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border-2"
//                 style={{ borderColor: "#4332d2" }}
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 <div
//                     className="flex justify-between items-center mb-4 pb-3 border-b-2"
//                     style={{ borderColor: "#e0dcf9" }}
//                 >
//                     <h3 className="text-xl font-bold" style={{ color: "#4332d2" }}>
//                         👥 Team Members
//                     </h3>
//                     <button
//                         onClick={() => setShowTeamPopup(null)}
//                         className="text-gray-400 hover:text-gray-700 text-2xl font-light"
//                     >
//                         ×
//                     </button>
//                 </div>

//                 <div className="space-y-2 max-h-96 overflow-y-auto">
//                     {task.assignees?.map((assignee, idx) => (
//                         <div
//                             key={assignee.email}
//                             className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-all"
//                         >
//                             <div
//                                 className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
//                                 style={{ backgroundColor: "#4332d2" }}
//                             >
//                                 {assignee.name.charAt(0).toUpperCase()}
//                             </div>
//                             <div className="flex-1">
//                                 <div className="font-bold text-gray-900">
//                                     {assignee.name}
//                                 </div>
//                                 <div className="text-sm text-gray-600">
//                                     {assignee.email}
//                                 </div>
//                             </div>
//                             <span className="text-xs font-semibold text-gray-500">
//                                 #{idx + 1}
//                             </span>
//                         </div>
//                     ))}
//                 </div>

//                 <div className="mt-4 pt-3 border-t border-gray-200 text-center">
//                     <span className="text-sm text-gray-600 font-semibold">
//                         Total: {task.assignees?.length} members
//                     </span>
//                 </div>
//             </div>
//         </div>
//     );

//     // Initialize a counter for desktop/mobile index outside the return
//     let cumulativeIndex = -1;
//     let mobileCardIndex = -1; // Specific index for mobile card rendering

//     // --- RENDER START ---

//     return (
//         <div className="min-h-screen via-indigo-50 to-purple-50">

//             <div className="w-full ">
//                 {showFilters && (
//                     <FilterSection
//                         filters={filters}
//                         handleFilterChange={handleFilterChange}
//                         departments={departments}
//                         uniqueUsers={uniqueUsers}
//                         uniqueAssignedBy={uniqueAssignedBy}
//                         uniqueStatuses={uniqueStatuses}
//                         role={rawRole} // Passing the original role string
//                         searchTerm={searchTerm}
//                         setSearchTerm={setSearchTerm}
//                         onHide={onHideFilters}
//                     />
//                 )}

//                 {/* Desktop Table (Virtual Scroll for Medium/Low) */}
//                 <div className="hidden lg:block bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden mt-6 relative z-10">
//                     <div ref={scrollContainerRef} className="overflow-y-auto max-h-[70vh]">
//                         <table  className="w-full table-fixed">
//                             <colgroup>
//                                 <col style={{ width: "3%" }} />
//                                 <col style={{ width: "8%" }} />
//                                 <col style={{ width: "10%" }} />
//                                 <col style={{ width: "7%" }} />
//                                 <col style={{ width: "8%" }} />
//                                 <col style={{ width: "7%" }} />
//                                 <col style={{ width: "12%" }} />
//                                 <col style={{ width: "10%" }} />
//                                 <col style={{ width: "10%" }} />
//                                 <col style={{ width: "8%" }} />
//                             </colgroup>

//                             <thead className="sticky top-0 z-20 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 border-b-2 border-indigo-200">
//                                 <tr>
//                                     <th className="py-3 px-2 text-xs font-black font-bold">#</th>
//                                     <th className="py-3 px-2 text-left text-xs font-black font-bold">TASK</th>
//                                     <th className="py-3 px-2 text-left text-xs font-black font-bold">DESCRIPTION</th>
//                                     {/* <th className="py-3 px-2 text-left text-xs font-black font-bold">WORK DATE</th> */}
//                                     <th
//                                         className="py-3 px-2 text-left text-xs font-black cursor-pointer hover:text-indigo-600 font-bold"
//                                         onClick={() => setDueDateSortOrder(prev => prev === "asc" ? "desc" : "asc")}
//                                     >
//                                         DUE DATE {dueDateSortOrder === "asc" ? "↑" : "↓"}
//                                     </th>
//                                     <th className="py-3 px-2 text-left text-xs font-black font-bold">STATUS</th>
//                                     <th className="py-3 px-2 text-left text-xs font-black font-bold">PRIORITY</th>
//                                     <th className="py-3 px-2 text-left text-xs font-black font-bold">REMARKS</th>
//                                     <th className="py-3 px-2 text-left text-xs font-black font-bold">TEAM</th>
//                                     <th className="py-3 px-2 text-left text-xs font-black font-bold">ASSIGNED BY</th>
//                                     <th className="py-3 px-2 text-center text-xs font-black font-bold">ACTIONS</th>
//                                 </tr>
//                             </thead>

//                             <tbody>
//                                 {initialLoading ? (
//                                     <tr>
//                                         <td colSpan={10} className="py-20 text-center">
//                                             <Loader2 className="animate-spin h-10 w-10 mx-auto mb-3 text-indigo-600" />
//                                             <p className="text-gray-600 font-bold">Loading tasks...</p>
//                                         </td>
//                                     </tr>
//                                 ) : allTasks.length === 0 && !loading ? (
//                                     <tr>
//                                         <td colSpan={10} className="text-center py-20">
//                                             <div className="text-6xl mb-4">📋</div>
//                                             <p className="text-gray-500 font-black text-xl">No tasks assigned yet</p>
//                                         </td>
//                                     </tr>
//                                 ) : filteredTasks.length === 0 && allTasks.length > 0 ? (
//                                     <tr>
//                                         <td colSpan={10} className="text-center py-20">
//                                             <div className="text-6xl mb-4">🔍</div>
//                                             <p className="text-gray-500 font-black text-xl">No tasks match your current filters.</p>
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     <>

//                                         {highTasks.length > 0 && (
//                                             <>
//                                                 <tr>
//                                                     <td colSpan={10} className="bg-gradient-to-r from-red-100 to-orange-100 text-red-900 font-black text-sm py-3 px-3 border-y-2 border-red-300 font-bold">
//                                                         🔴 High Priority ({allHighTasks.length} total)
//                                                     </td>
//                                                 </tr>
//                                                 {highTasks.map((task, index) => (
//                                                     <React.Fragment key={`high-fragment-${task._id}-${index}`}>
//                                                         {renderTaskRow(task, index + 1, 'high')}
//                                                     </React.Fragment>
//                                                 ))}

//                                                 {highScrollIndex < allHighTasks.length && (
//                                                     <tr ref={highObserverTarget} key="high-loading-trigger">
//                                                         <td colSpan={10} className="text-center py-4 bg-red-50/50">
//                                                             <FaSpinner className="animate-spin h-6 w-6 mx-auto text-red-600" />
//                                                             <p className="text-xs text-red-700 mt-1">Loading more High Priority tasks...</p>
//                                                         </td>
//                                                     </tr>
//                                                 )}
//                                             </>
//                                         )}

//                                         {mediumTasks.length > 0 && (
//                                             <>
//                                                 <tr key="medium-header">
//                                                     <td colSpan={10} className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-900 font-black text-sm py-3 px-3 border-y-2 border-yellow-300 font-bold">
//                                                         🟡 Medium Priority ({stats.mediumCount} total)
//                                                     </td>
//                                                 </tr>
//                                                 {mediumTasks.map((task, index) => (
//                                                     <React.Fragment key={`medium-fragment-${task._id}-${index}`}>
//                                                         {renderTaskRow(task, highTasks.length + index + 1, 'medium')}
//                                                     </React.Fragment>
//                                                 ))}
//                                             </>
//                                         )}

//                                         {lowTasks.length > 0 && (
//                                             <>
//                                                 <tr key="low-header">
//                                                     <td colSpan={10} className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 font-black text-sm py-3 px-3 border-y-2 border-green-300 font-bold">
//                                                         🟢 Low Priority ({stats.lowCount} total)
//                                                     </td>
//                                                 </tr>
//                                                 {lowTasks.map((task, index) => (
//                                                     <React.Fragment key={`low-fragment-${task._id}-${index}`}>
//                                                         {renderTaskRow(task, highTasks.length + mediumTasks.length + index + 1, 'low')}
//                                                     </React.Fragment>
//                                                 ))}
//                                             </>
//                                         )}

//                                         {otherScrollIndex < otherTasks.length && (
//                                             <tr ref={otherObserverTarget} key="other-loading-trigger">
//                                                 <td colSpan={10} className="text-center py-4">
//                                                     <FaSpinner className="animate-spin h-6 w-6 mx-auto text-indigo-600" />
//                                                     <p className="text-xs text-indigo-700 mt-1">Loading more Medium/Low Priority tasks...</p>
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex justify-between items-center">
//                         <span className="text-sm text-gray-600">
//                             Showing {highTasks.length + mediumTasks.length + lowTasks.length} of {totalCount} tasks
//                         </span>
//                         {loading && (
//                             <span className="text-sm text-gray-500 flex items-center gap-2">
//                                 <FaSpinner className="animate-spin" /> Loading...
//                             </span>
//                         )}
//                     </div>
//                 </div>

//                 {/* --- MOBILE VIEW --- */}
//                 <div className="lg:hidden mt-6 space-y-4">
//                     {initialLoading ? (
//                         <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
//                             <FaSpinner className="animate-spin h-8 w-8 mx-auto mb-3 text-blue-600" />
//                             <p className="text-gray-600 font-semibold">Loading tasks...</p>
//                         </div>
//                     ) : allTasks.length === 0 && !loading ? (
//                         <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
//                             <div className="text-5xl mb-3">📋</div>
//                             <p className="text-gray-500 font-semibold text-lg">No tasks assigned yet</p>
//                         </div>
//                     ) : filteredTasks.length === 0 && allTasks.length > 0 ? (
//                         <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
//                             <div className="text-5xl mb-3">🔍</div>
//                             <p className="text-gray-500 font-semibold text-lg">No tasks match your current filters.</p>
//                         </div>
//                     ) : (
//                         <>
//                             {/* Re-initialize mobileCardIndex for rendering cards on the current page */}
//                             {mobileCardIndex = -1}

//                             {/* High Priority Mobile */}
//                             {mobileHigh.length > 0 && (<><div className="bg-red-50 text-red-900 font-semibold text-sm py-2.5 px-4 rounded-lg border border-red-200">High Priority ({filteredTasks.filter(t => t.priority === "High").length} total)</div>
//                                 {mobileHigh.map((task) => {
//                                     mobileCardIndex++;
//                                     return renderTaskCard(task, mobileCardIndex);
//                                 })}
//                             </>)}
//                             {/* Medium Priority Mobile */}
//                             {mobileMedium.length > 0 && (<><div className="bg-yellow-50 text-yellow-900 font-semibold text-sm py-2.5 px-4 rounded-lg border border-yellow-200">Medium Priority ({filteredTasks.filter(t => t.priority === "Medium").length} total)</div>
//                                 {mobileMedium.map((task) => {
//                                     mobileCardIndex++;
//                                     return renderTaskCard(task, mobileCardIndex);
//                                 })}
//                             </>)}
//                             {/* Low Priority Mobile */}
//                             {mobileLow.length > 0 && (<><div className="bg-green-50 text-green-900 font-semibold text-sm py-2.5 px-4 rounded-lg border border-green-200">Low Priority ({filteredTasks.filter(t => t.priority === "Low").length} total)</div>
//                                 {mobileLow.map((task) => {
//                                     mobileCardIndex++;
//                                     return renderTaskCard(task, mobileCardIndex);
//                                 })}
//                             </>)}

//                             {/* Mobile Pagination Controls */}
//                             {mobileTotalPages > 1 && (
//                                 <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200 mb-12">
//                                     <button
//                                         onClick={handlePreviousPage}
//                                         disabled={mobileCurrentPage === 1}
//                                         className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${mobileCurrentPage === 1
//                                             ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                                             : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
//                                             }`}
//                                     >
//                                         <FaChevronLeft size={10} /> Previous
//                                     </button>

//                                     <span className="text-sm text-gray-700 font-semibold">
//                                         Page {mobileCurrentPage} of {mobileTotalPages}
//                                     </span>

//                                     <button
//                                         onClick={handleNextPage}
//                                         disabled={mobileCurrentPage === mobileTotalPages}
//                                         className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${mobileCurrentPage === mobileTotalPages
//                                             ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                                             : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
//                                             }`}
//                                     >
//                                         Next <FaChevronRight size={10} />
//                                     </button>
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </div>

//                 {/* Work Description Popup */}
//                 {openWorkDescPopup && (
//                     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpenWorkDescPopup(null)}>
//                         <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
//                             <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
//                                 <h4 className="font-bold text-xl text-gray-900">Edit Description</h4>
//                                 <button
//                                     className="text-gray-400 hover:text-gray-700 text-2xl"
//                                     onClick={() => setOpenWorkDescPopup(null)}
//                                 >
//                                     ×
//                                 </button>
//                             </div>

//                             <textarea
//                                 value={workDescs[openWorkDescPopup] || ""}
//                                 onChange={(e) =>
//                                     setWorkDescs((prev) => ({
//                                         ...prev,
//                                         [openWorkDescPopup]: e.target.value,
//                                     }))
//                                 }
//                                 rows={8}
//                                 placeholder="Enter work description..."
//                                 className="w-full px-4 py-3 text-base rounded-lg resize-y border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 autoFocus
//                             />
//                             <div className="flex justify-end mt-4 gap-3">
//                                 <button
//                                     onClick={() => setOpenWorkDescPopup(null)}
//                                     className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={() => handleWorkDescSave(openWorkDescPopup)}
//                                     className="px-5 py-2 text-sm rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
//                                 >
//                                     Save
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Remark Popup */}
//                 {openRemarkPopup && (
//                     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpenRemarkPopup(null)}>
//                         <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
//                             <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
//                                 <h4 className="font-bold text-xl text-gray-900">Edit Remark</h4>
//                                 <button
//                                     className="text-gray-400 hover:text-gray-700 text-2xl"
//                                     onClick={() => setOpenRemarkPopup(null)}
//                                 >
//                                     ×
//                                 </button>
//                             </div>

//                             <textarea
//                                 value={remarks[openRemarkPopup] || ""}
//                                 onChange={(e) =>
//                                     setRemarks((prev) => ({
//                                         ...prev,
//                                         [openRemarkPopup]: e.target.value,
//                                     }))
//                                 }
//                                 rows={8}
//                                 placeholder="Enter remark..."
//                                 className="w-full px-4 py-3 text-base rounded-lg resize-y border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 autoFocus
//                             />
//                             <div className="flex justify-end mt-4 gap-3">
//                                 <button
//                                     onClick={() => setOpenRemarkPopup(null)}
//                                     className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={() => handleRemarkSave(openRemarkPopup)}
//                                     className="px-5 py-2 text-sm rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
//                                 >
//                                     Save
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Message Popup */}
//                 {openMessagePopup && taskForMessage && (
//                     <MessagePopup
//                         isOpen={openMessagePopup}
//                         onClose={() => setOpenMessagePopup(false)}
//                         task={taskForMessage}
//                         sendMessage={handleMessageSend}
//                     />
//                 )}

//                 {/* Team Members Popup */}
//                 {showTeamPopup && getTaskById(showTeamPopup) && (
//                     renderTeamPopup(getTaskById(showTeamPopup))
//                 )}

//                 {/* Status Dropdown */}
//                 {editingStatus && (
//                     <StatusDropdownPortal>
//                         <div
//                             ref={dropdownRef}
//                             className="absolute rounded-xl shadow-2xl border-2 border-gray-300 w-44 mt-1 z-50 bg-white overflow-hidden"
//                             style={{
//                                 position: "fixed",
//                                 top: dropdownPosition.top,
//                                 left: dropdownPosition.left,
//                             }}
//                         >
//                             {["To Do", "In Progress", "Completed", "Obsolete"].map((statusOption) => (
//                                 <div
//                                     key={statusOption}
//                                     className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all font-bold border-b border-gray-100 last:border-b-0 flex items-center gap-2"
//                                     style={{ color: statusColors[statusOption]?.text }}
//                                     onClick={() => handleStatusChange(editingStatus, statusOption)}
//                                 >
//                                     {statusOption === "Completed" && <span>✓</span>}
//                                     {statusOption === "In Progress" && <span>⏱</span>}
//                                     {statusOption === "To Do" && <span>📝</span>}
//                                     {statusOption === "Obsolete" && <span>⊗</span>}
//                                     {statusOption}
//                                 </div>
//                             ))}
//                         </div>
//                     </StatusDropdownPortal>
//                 )}

//             </div>

//         </div>
//     );
// };

// export default TaskList;

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FaTrashAlt, FaExclamationCircle, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import { fetchUsers } from "../../redux/userSlice";
import { fetchDepartments } from "../../redux/departmentSlice";
import FilterSection from "./FilterSection";
import MessagePopup from "./MessagePopup";
import StatusDropdownPortal from "../StatusDropdownPortal";
import axios from "../../utils/secureAxios";
import { Loader2 } from "lucide-react";

const socket = io("https://taskbe.sharda.co.in");
const ITEMS_PER_PAGE = 30;
const MOBILE_ITEMS_PER_PAGE = 15;
const BASE_URL = "https://taskbe.sharda.co.in/api/tasks";

// Add this helper function at the top of the component
const deduplicateTasks = (tasks) => {
  const seen = new Map();
  return tasks.filter((task) => {
    if (seen.has(task._id)) {
      console.warn(`Duplicate task found: ${task._id}`);
      return false;
    }
    seen.set(task._id, true);
    return true;
  });
};

const TaskList = ({
  onEdit,
  refreshTrigger,
  setTaskListExternally,
  tasksOverride,
  hideCompleted,
  showFilters,
  onHideFilters,
}) => {
  // State for paginated tasks
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  // Removed hasMore state as it's not needed for standard pagination

  // Loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState({});

  // Full task details cache
  const [taskDetailsCache, setTaskDetailsCache] = useState({});

  // Stats
  const [stats, setStats] = useState({
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    totalCount: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    priority: "",
    assignee: "",
    assignedBy: "",
    status: "",
    code: "",
    department: "",
    dueBefore: "",
  });
  const [dueDateSortOrder, setDueDateSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");

  // UI states
  const [editingStatus, setEditingStatus] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [workDescs, setWorkDescs] = useState({});
  const [openRemarkPopup, setOpenRemarkPopup] = useState(null);
  const [openWorkDescPopup, setOpenWorkDescPopup] = useState(null);
  const [openTaskPopup, setOpenTaskPopup] = useState(null);
  const [openMessagePopup, setOpenMessagePopup] = useState(null);
  const [taskForMessage, setTaskForMessage] = useState(null);
  const [showTeamPopup, setShowTeamPopup] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [uniqueAssignedBy, setUniqueAssignedBy] = useState([]);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [userManuallyScrolled, setUserManuallyScrolled] = useState(false);
  const tableContainerRef = useRef(null);

  // Refs
  const fetchControllerRef = useRef(null);
  const dropdownRef = useRef(null);
  const isInitialMount = useRef(true);
  // Removed observerRef

  // User info
  const rawRole = localStorage.getItem("role");
  const userRole = rawRole ? rawRole.toLowerCase() : null;
  const isAdmin = userRole === "admin";
  const currentUserName = JSON.parse(localStorage.getItem("user"))?.name;

  // Mobile detection
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  // Redux data
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.list);
  const departmentData = useSelector((state) => state.departments.list);

  // Initialize
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDepartments());

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  // ✅ OPTIMIZED: Fetch tasks (Infinite Scroll Removed - Logic updated to replace tasks)
  const fetchTasks = useCallback(
    async (page = 1, shouldReset = false) => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }

      fetchControllerRef.current = new AbortController();
      const signal = fetchControllerRef.current.signal;

      try {
        setLoading(true);
        if (shouldReset) {
          setInitialLoading(true);
        }

        // Build filter params
        const params = new URLSearchParams({
          page: page.toString(),
          limit: isMobileView
            ? MOBILE_ITEMS_PER_PAGE.toString()
            : ITEMS_PER_PAGE.toString(),
          sortBy: "priority",
          sortOrder: "desc",
        });

        // Add filters
        if (filters.priority) params.append("priority", filters.priority);
        if (filters.status) params.append("status", filters.status);
        if (filters.assignee) params.append("assignee", filters.assignee);
        if (filters.assignedBy) params.append("assignedBy", filters.assignedBy);
        if (filters.department) params.append("department", filters.department);
        if (filters.code) params.append("code", filters.code);
        if (searchTerm) params.append("search", searchTerm);

        // For non-admin, filter by assignee
        if (!isAdmin && currentUserName && !filters.assignee) {
          params.append("assignee", currentUserName);
        }

        const response = await fetch(`${BASE_URL}?${params}`, {
          signal,
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        // Update state - ALWAYS REPLACE TASKS (No appending)
        setTasks(deduplicateTasks(data.tasks || []));

        setCurrentPage(page);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);

        // Fetch stats separately
        await fetchStats();

        // Scroll to top when page changes
        if (!isInitialMount.current) {
          scrollToTop();
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch tasks:", error);
          Swal.fire("Error", "Failed to load tasks", "error");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    },
    [filters, searchTerm, isAdmin, currentUserName, isMobileView],
  );

  // ✅ OPTIMIZED: Fetch stats only
  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (!isAdmin && currentUserName) {
        params.append("assignee", currentUserName);
      }

      const response = await fetch(`${BASE_URL}/stats?${params}`);
      const data = await response.json();

      setStats({
        highCount: data.highCount || 0,
        mediumCount: data.mediumCount || 0,
        lowCount: data.lowCount || 0,
        totalCount: data.totalCount || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, [isAdmin, currentUserName]);

  // ✅ Fetch full task details when needed
  const fetchTaskDetails = useCallback(
    async (taskId) => {
      if (taskDetailsCache[taskId]) {
        return taskDetailsCache[taskId];
      }

      try {
        const response = await fetch(`${BASE_URL}/${taskId}`);
        if (!response.ok) throw new Error("Failed to fetch task details");

        const task = await response.json();

        // Cache the result
        setTaskDetailsCache((prev) => ({
          ...prev,
          taskId: task,
        }));

        return task;
      } catch (error) {
        console.error("Error fetching task details:", error);
        return null;
      }
    },
    [taskDetailsCache],
  );

  // Initial load and refresh
  useEffect(() => {
    if (isInitialMount.current) {
      fetchTasks(1, true);
      isInitialMount.current = false;
    }
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks(1, true);
  }, [refreshTrigger, fetchTasks]);

  // Handle filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTasks(1, true);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, searchTerm, fetchTasks]);

  // REMOVED: Infinite scroll useEffect block

  // WebSocket updates
  useEffect(() => {
    const handleTaskEvent = () => {
      fetchTasks(currentPage, false); // Reload current page
      fetchStats();
    };

    socket.on("new-task-created", handleTaskEvent);
    socket.on("task-updated", handleTaskEvent);
    socket.on("task-deleted", handleTaskEvent);

    return () => {
      socket.off("new-task-created", handleTaskEvent);
      socket.off("task-updated", handleTaskEvent);
      socket.off("task-deleted", handleTaskEvent);
    };
  }, [currentPage, fetchTasks, fetchStats]);

  // Handle closing dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setEditingStatus(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll close logic
  useEffect(() => {
    const handleScrollClose = () => {
      if (editingStatus) {
        setEditingStatus(null);
      }
    };
    window.addEventListener("scroll", handleScrollClose, true);
    return () => {
      window.removeEventListener("scroll", handleScrollClose, true);
    };
  }, [editingStatus]);

  useEffect(() => {
    if (tasks.length > 0) {
      const assigneeSet = new Set();
      const assignedBySet = new Set();
      const statusSet = new Set();

      tasks.forEach((task) => {
        if (task.assignees && Array.isArray(task.assignees)) {
          task.assignees.forEach((assignee) => {
            if (assignee.name) assigneeSet.add(assignee.name);
          });
        }
        if (task.assignedBy?.name) {
          assignedBySet.add(task.assignedBy.name);
        }
        if (task.status) {
          statusSet.add(task.status);
        }
      });

      setUniqueUsers([...assigneeSet]);
      setUniqueAssignedBy([...assignedBySet]);
      setUniqueStatuses([...statusSet]);
    }
  }, [tasks]);

  const goToFirstPage = () => {
    setCurrentPage(1);
    fetchTasks(1, true);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    setUserManuallyScrolled(false);
  };

  // Track user scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (tableContainerRef.current && !isMobileView) {
        const scrollTop = tableContainerRef.current.scrollTop;
        setShowScrollTop(scrollTop > 100);
      } else {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        setShowScrollTop(scrollTop > 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    if (tableContainerRef.current && !isMobileView) {
      tableContainerRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (tableContainerRef.current) {
        tableContainerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isMobileView, currentPage, userManuallyScrolled]);

  useEffect(() => {
    // Auto go to first page on filter/refresh
    if (!initialLoading && !isInitialMount.current) {
      // Logic handled in filter useEffect
    }
  }, [filters, searchTerm, refreshTrigger]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
    };
  }, []);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchTasks(currentPage + 1, false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchTasks(currentPage - 1, false);
    }
  };

  useEffect(() => {
    if (users?.length) {
      const names = users.map((u) => u.name);
      setUniqueUsers((prev) => {
        const combined = new Set([...prev, ...names]);
        return [...combined];
      });
    }
  }, [users]);

  // Handle message send
  const handleMessageSend = async (payload) => {
    try {
      const response = await axios.post(
        "https://taskbe.sharda.co.in/api/message-history",
        payload,
      );

      if (response.status === 201) {
        Swal.fire("Message sent successfully!");
      } else {
        throw new Error("Message sending failed");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      Swal.fire("Error", "Failed to send message", "error");
    }
  };

  // Handle Copy Task functionality
  const handleCopyTask = async (task) => {
    const taskText = `Task: ${task.taskName}\nCode: ${task.code || "N/A"
      }\nDue Date: ${new Date(task.dueDate).toLocaleDateString(
        "en-GB",
      )}\nPriority: ${task.priority}`;

    try {
      await navigator.clipboard.writeText(taskText);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Task "${task.taskName}" copied to clipboard!`,
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (error) {
      console.error("Failed to copy task:", error);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Failed to copy task.",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setLoadingStatus((prev) => ({ ...prev, [taskId]: true }));
    setEditingStatus(null);

    // Optimistic update
    setTasks((prev) =>
      deduplicateTasks(
        prev.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task,
        ),
      ),
    );

    let updatedRemark = remarks[taskId] || "";
    if (newStatus === "Completed" && !updatedRemark.includes("[Completed]")) {
      updatedRemark += " [Completed]";
      setRemarks((prev) => ({ ...prev, [taskId]: updatedRemark }));
    }
    if (newStatus !== "Completed") {
      updatedRemark = updatedRemark.replace(" [Completed]", "").trim();
      setRemarks((prev) => ({ ...prev, [taskId]: updatedRemark }));
    }

    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };

    try {
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            updatedBy,
            remark: updatedRemark,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to update status");

      const updatedTask = await response.json();

      setTasks((prev) =>
        deduplicateTasks(
          prev.map((task) =>
            task._id === taskId ? { ...task, ...updatedTask } : task,
          ),
        ),
      );

      setRemarks((prev) => ({ ...prev, [taskId]: updatedTask.remark || "" }));

      setTaskDetailsCache((prev) => ({
        ...prev,
        [taskId]: updatedTask,
      }));

      fetchStats();
    } catch (error) {
      console.error("Error updating status:", error);
      fetchTasks(currentPage, false);
      Swal.fire("Error", "Failed to update status", "error");
    }
    setLoadingStatus((prev) => ({ ...prev, [taskId]: false }));
  };

  // Work Description handlers
  const handleWorkDescEditClick = async (taskId) => {
    const task = await fetchTaskDetails(taskId);
    if (task && !workDescs[taskId]) {
      setWorkDescs((prev) => ({ ...prev, [taskId]: task.workDesc || "" }));
    }
    setOpenWorkDescPopup(taskId);
  };

  const handleWorkDescSave = async (taskId) => {
    const workDescText = workDescs[taskId] || "";
    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };

    try {
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workDesc: workDescText, updatedBy }),
        },
      );

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prev) =>
          prev.map((task) => (task._id === taskId ? updatedTask : task)),
        );
        setTaskDetailsCache((prev) => ({
          ...prev,
          [taskId]: updatedTask,
        }));
        setOpenWorkDescPopup(null);
      } else {
        throw new Error("Failed to update description");
      }
    } catch (error) {
      console.error("Error updating work description:", error);
      Swal.fire("Error", "Failed to update description", "error");
    }
  };

  // Remark handlers
  const handleRemarkEditClick = async (taskId) => {
    const task = await fetchTaskDetails(taskId);
    if (task && !remarks[taskId]) {
      setRemarks((prev) => ({ ...prev, [taskId]: task.remark || "" }));
    }
    setOpenRemarkPopup(taskId);
  };

  const handleRemarkSave = async (taskId) => {
    const remarkText = remarks[taskId] || "";
    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };

    try {
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remark: remarkText, updatedBy }),
        },
      );

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prev) =>
          prev.map((task) => (task._id === taskId ? updatedTask : task)),
        );
        setTaskDetailsCache((prev) => ({
          ...prev,
          [taskId]: updatedTask,
        }));
        setOpenRemarkPopup(null);
      } else {
        throw new Error("Failed to update remark");
      }
    } catch (error) {
      console.error("Error updating remark:", error);
      Swal.fire("Error", "Failed to update remark", "error");
    }
  };

  // Delete task
  const handleDeleteTask = async (task) => {
    if (!task || !task._id) {
      Swal.fire({
        icon: "error",
        title: "Invalid Task",
        text: "The selected task is not valid.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: `Task: ${task.taskName} will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      // Optimistic removal
      setTasks((prev) => prev.filter((t) => t._id !== task._id));

      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${task._id}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to delete task");

      Swal.fire({
        title: "Deleted!",
        text: "Task has been deleted.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // Clear cache
      setTaskDetailsCache((prev) => {
        const newCache = { ...prev };
        delete newCache[task._id];
        return newCache;
      });

      fetchTasks(currentPage, false);
    } catch (err) {
      console.error("Error deleting task:", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete task. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
      fetchTasks(currentPage, false);
    }
  };

  // Handle task details view
  const handleViewTaskDetails = async (taskId) => {
    const task = await fetchTaskDetails(taskId);
    setSelectedTaskDetails(task);
    setOpenTaskPopup(taskId);
  };

  // Categorize tasks by priority
  const highTasks = tasks.filter((t) => t.priority === "High");
  const mediumTasks = tasks.filter((t) => t.priority === "Medium");
  const lowTasks = tasks.filter((t) => t.priority === "Low");

  // Sort by due date
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return dueDateSortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [tasks, dueDateSortOrder]);

  // Color definitions
  const statusColors = {
    "To Do": { bg: "#EFF6FF", text: "#1E40AF", border: "#3B82F6" },
    "In Progress": { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },
    Completed: { bg: "#D1FAE5", text: "#065F46", border: "#10B981" },
    Obsolete: { bg: "#F3E8FF", text: "#6B21A8", border: "#A855F7" },
  };

  const priorityColors = {
    High: { bg: "#FEE2E2", text: "#991B1B", border: "#DC2626" },
    Medium: { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },
    Low: { bg: "#DBEAFE", text: "#1E40AF", border: "#3B82F6" },
  };

  // Render task row (Desktop)
  const renderTaskRow = (task, index) => {
    const serialIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

    return (
      <tr key={task._id} className="border-b border-gray-200 hover:bg-slate-50">
        <td className="py-3 px-2 text-sm text-gray-700 font-semibold">
          {serialIndex}
        </td>

        {/* Task Name & Code */}
        <td className="py-3 px-2">
          <div className="flex flex-col gap-1">
            <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
              {task.taskName}
              {new Date(task.dueDate) < new Date() &&
                task.status !== "Completed" &&
                task.status !== "Obsolete" && (
                  <FaExclamationCircle
                    // Yahan 'flex-shrink-0' add kiya hai taaki icon shrink na ho
                    className="text-red-600 animate-pulse flex-shrink-0"
                    size={12}
                    title="Overdue"
                  />
                )}
            </div>
            {task.code && (
              <span className="text-xs text-indigo-700 font-semibold">
                📋 {task.code}
              </span>
            )}
          </div>
        </td>

        {/* Work Description */}
        <td className="py-3 px-2">
          <div className="flex items-center gap-1">
            <p className="text-xs text-gray-600 line-clamp-2">
              {task.workDesc
                ? task.workDesc.length > 50
                  ? task.workDesc.slice(0, 50) + "..."
                  : task.workDesc
                : "No description"}
            </p>
            <button
              onClick={() => handleWorkDescEditClick(task._id)}
              className="text-indigo-600 hover:text-indigo-800 p-1"
              title="Edit Description"
            >
              <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
            </button>
          </div>
        </td>

        {/* Due Date */}
        <td className="py-3 px-2 text-xs text-gray-700 font-semibold">
          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString("en-GB")
            : "—"}
        </td>

        {/* Status */}
        <td className="py-3 px-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold cursor-pointer border ${loadingStatus[task._id] ? "opacity-75" : ""
              }`}
            style={{
              backgroundColor: statusColors[task.status]?.bg,
              color: statusColors[task.status]?.text,
              borderColor: statusColors[task.status]?.border,
            }}
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const dropdownHeight = 180; // Dropdown ki height ka anuman
              const spaceBelow = window.innerHeight - rect.bottom;

              // Agar niche jagah kam hai to upar khulega, nahi to niche
              const topPosition =
                spaceBelow < dropdownHeight
                  ? rect.top + window.scrollY - dropdownHeight
                  : rect.bottom + window.scrollY + 5;

              setDropdownPosition({
                top: topPosition,
                left: rect.left + window.scrollX,
              });
              setEditingStatus(task._id);
            }}
          >
            {loadingStatus[task._id] ? (
              <FaSpinner className="animate-spin h-3 w-3" />
            ) : (
              task.status
            )}
          </span>
        </td>

        {/* Priority */}
        <td className="py-3 px-2">
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border"
            style={{
              backgroundColor: priorityColors[task.priority]?.bg,
              color: priorityColors[task.priority]?.text,
              borderColor: priorityColors[task.priority]?.border,
            }}
          >
            {task.priority}
          </span>
        </td>

        {/* Remarks */}
        <td className="py-3 px-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600 line-clamp-1">
              {(remarks[task._id] || task.remark || "No remark").slice(0, 20)}
              {(remarks[task._id] || task.remark || "").length > 20 && "..."}
            </span>
            <button
              onClick={() => handleRemarkEditClick(task._id)}
              className="text-indigo-600 hover:text-indigo-800"
              title="Edit Remark"
            >
              <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
            </button>
          </div>
        </td>

        {/* Team */}
        <td className="py-3 px-2">
          <div className="flex items-center">
            {task.assignees?.slice(0, 2).map((assignee, idx) => (
              <div
                key={assignee.email}
                onClick={() => setShowTeamPopup(task._id)}
                title={assignee.name}
                style={{
                  marginLeft: idx === 0 ? '0px' : '-8px',
                  zIndex: idx,
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: ['#BFDBFE', '#DDD6FE', '#BBF7D0', '#FDE68A', '#FBCFE8'][idx % 5],
                  color: ['#1E40AF', '#6D28D9', '#065F46', '#92400E', '#9D174D'][idx % 5],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: '2px solid white',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {assignee.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {task.assignees?.length > 2 && (
              <div
                onClick={() => setShowTeamPopup(task._id)}
                title={`+${task.assignees.length - 2} more members`}
                style={{
                  marginLeft: '-8px',
                  zIndex: 3,
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#E5E7EB',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  border: '2px solid white',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                +{task.assignees.length - 2}
              </div>
            )}
          </div>
        </td>

        {/* Assigned By */}
        <td className="py-3 px-2 text-xs text-gray-700 font-semibold">
          {task.assignedBy?.name || "—"}
        </td>

        {/* Actions */}
        <td className="py-3 px-2">
          <div className="flex gap-1">
            {/* Message Button */}
            <button
              onClick={() => {
                setTaskForMessage(task);
                setOpenMessagePopup(true);
              }}
              className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"
              title="Message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                <path d="m21.854 2.147-10.94 10.939" />
              </svg>
            </button>
            {/* Copy Button */}
            <button
              onClick={() => handleCopyTask(task)}
              className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600"
              title="Copy"
            >
              <FontAwesomeIcon icon={faCopy} className="h-3.5 w-3.5" />
            </button>
            {/* Edit Button */}
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"
              title="Edit"
            >
              <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
            </button>
            {/* Delete Button */}
            {isAdmin && (
              <button
                onClick={() => handleDeleteTask(task)}
                className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                title="Delete"
              >
                <FaTrashAlt size={12} />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // Render task card (Mobile)
  const renderTaskCard = (task, index) => {
    const serialIndex = (currentPage - 1) * MOBILE_ITEMS_PER_PAGE + index + 1;

    return (
      <div
        key={task._id}
        className="bg-white rounded-xl shadow p-4 border border-gray-200 mb-4"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">#{serialIndex}</span>
              <span
                className="text-xs px-2 py-1 rounded font-semibold"
                style={{
                  backgroundColor: priorityColors[task.priority]?.bg,
                  color: priorityColors[task.priority]?.text,
                }}
              >
                {task.priority}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 flex items-center">
              {task.taskName}
              {new Date(task.dueDate) < new Date() &&
                task.status !== "Completed" &&
                task.status !== "Obsolete" && (
                  <FaExclamationCircle
                    className="text-red-600 animate-pulse ml-2"
                    size={12}
                    title="Overdue"
                  />
                )}
            </h3>
            {task.code && (
              <span className="inline-block text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {task.code}
              </span>
            )}
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => handleCopyTask(task)}
              className="p-2 text-gray-500 hover:text-indigo-600"
              title="Copy"
            >
              <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-gray-500 hover:text-blue-600"
              title="Edit"
            >
              <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
            </button>
            {isAdmin && (
              <button
                onClick={() => handleDeleteTask(task)}
                className="p-2 text-gray-500 hover:text-red-600"
                title="Delete"
              >
                <FaTrashAlt size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Status */}
          <span
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer border ${loadingStatus[task._id] ? "opacity-75" : ""
              }`}
            style={{
              backgroundColor: statusColors[task.status]?.bg,
              color: statusColors[task.status]?.text,
              borderColor: statusColors[task.status]?.border,
            }}
            // NYA CODE (Paste Karen)
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const dropdownHeight = 180; // Dropdown ki height ka anuman
              const spaceBelow = window.innerHeight - rect.bottom;

              // Agar niche jagah kam hai to upar khulega, nahi to niche
              const topPosition =
                spaceBelow < dropdownHeight
                  ? rect.top + window.scrollY - dropdownHeight
                  : rect.bottom + window.scrollY + 5;

              setDropdownPosition({
                top: topPosition,
                left: rect.left + window.scrollX,
              });
              setEditingStatus(task._id);
            }}
          >
            {loadingStatus[task._id] ? (
              <FaSpinner className="animate-spin h-3 w-3" />
            ) : (
              task.status
            )}
          </span>

          {/* Description */}
          <div>
            <span className="text-xs font-semibold text-gray-600">
              Description:
            </span>
            <p className="text-sm text-gray-700 line-clamp-2">
              {task.workDesc || "No description"}
            </p>
            <button
              onClick={() => handleWorkDescEditClick(task._id)}
              className="text-xs text-indigo-600 hover:text-indigo-800 mt-1"
            >
              Edit <FontAwesomeIcon icon={faPen} className="h-2.5 w-2.5 ml-1" />
            </button>
          </div>

          {/* Remarks */}
          <div>
            <span className="text-xs font-semibold text-gray-600">
              Remarks:
            </span>
            <p className="text-sm text-gray-700 line-clamp-2">
              {remarks[task._id] || task.remark || "No remark"}
            </p>
            <button
              onClick={() => handleRemarkEditClick(task._id)}
              className="text-xs text-indigo-600 hover:text-indigo-800 mt-1"
            >
              Edit <FontAwesomeIcon icon={faPen} className="h-2.5 w-2.5 ml-1" />
            </button>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs font-semibold text-gray-600">
                Due Date
              </span>
              <div className="text-sm text-gray-900 font-medium">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("en-GB")
                  : "—"}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-600">
                Assigned by
              </span>
              <div className="text-sm text-gray-900 font-medium">
                {task.assignedBy?.name || "—"}
              </div>
            </div>
          </div>

          {/* Team */}
          <div>
            <span className="text-xs font-semibold text-gray-600">Team:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {task.assignees?.slice(0, 3).map((assignee) => (
                <span
                  key={assignee.email}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                >
                  {assignee.name.split(" ")[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => handleViewTaskDetails(task._id)}
              className="flex-1 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              View Details
            </button>
            <button
              onClick={() => {
                setTaskForMessage(task);
                setOpenMessagePopup(true);
              }}
              className="p-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              title="Message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                <path d="m21.854 2.147-10.94 10.939" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Team Members Popup
  const renderTeamPopup = (taskId) => {
    const task = tasks.find((t) => t._id === taskId) || selectedTaskDetails;
    if (!task) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={() => setShowTeamPopup(null)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 pb-3 border-b">
            <h3 className="text-xl font-bold text-gray-900">👥 Team Members</h3>
            <button
              onClick={() => setShowTeamPopup(null)}
              className="text-gray-400 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {task.assignees?.map((assignee, idx) => (
              <div
                key={assignee.email}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {assignee.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{assignee.name}</div>
                  <div className="text-sm text-gray-600">{assignee.email}</div>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 text-center">
            <span className="text-sm text-gray-600 font-semibold">
              Total: {task.assignees?.length} members
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="w-full px-4 py-6">
        {showFilters && (
          <FilterSection
            filters={filters}
            handleFilterChange={(key, value) =>
              setFilters((prev) => ({ ...prev, [key]: value }))
            }
            departments={Array.isArray(departmentData) ? departmentData : []}
            uniqueUsers={Array.isArray(users) ? users.map((u) => u.name) : []}
            uniqueAssignedBy={uniqueAssignedBy}
            uniqueStatuses={uniqueStatuses}
            role={rawRole || ""}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onHide={onHideFilters}
          />
        )}

        {/* Desktop Table */}
        {!isMobileView && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <colgroup>
                  <col style={{ width: "3%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "8%" }} />
                </colgroup>
                <thead className="bg-gradient-to-r from-indigo-100 to-purple-100">
                  <tr>
                    <th className="py-3 px-2 text-left text-xs font-bold">#</th>
                    <th className="py-3 px-2 text-left text-xs font-bold">
                      TASK
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-bold">
                      DESCRIPTION
                    </th>
                    <th
                      className="py-3 px-2 text-left text-xs font-bold cursor-pointer hover:text-indigo-600"
                      onClick={() =>
                        setDueDateSortOrder((prev) =>
                          prev === "asc" ? "desc" : "asc",
                        )
                      }
                    >
                      DUE DATE {dueDateSortOrder === "asc" ? "↑" : "↓"}
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-bold">
                      STATUS
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-bold">
                      PRIORITY
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-bold">
                      REMARKS
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-bold">
                      TEAM
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-bold">
                      ASSIGNED BY
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-bold">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {initialLoading ? (
                    <tr>
                      <td colSpan={10} className="py-20 text-center">
                        <Loader2 className="animate-spin h-10 w-10 mx-auto mb-3 text-indigo-600" />
                        <p className="text-gray-600">Loading tasks...</p>
                      </td>
                    </tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-20 text-center">
                        <div className="text-5xl mb-3">📋</div>
                        <p className="text-gray-500">No tasks found</p>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {/* High Priority Section */}
                      {highTasks.length > 0 && (
                        <>
                          <tr>
                            <td
                              colSpan={10}
                              className="bg-gradient-to-r from-red-100 to-orange-100 text-red-900 font-bold text-sm py-2 px-3"
                            >
                              🔴 High Priority ({stats.highCount} total)
                            </td>
                          </tr>
                          {sortedTasks
                            .filter((t) => t.priority === "High")
                            .map((task, index) => renderTaskRow(task, index))}
                        </>
                      )}

                      {/* Medium Priority Section */}
                      {mediumTasks.length > 0 && (
                        <>
                          <tr>
                            <td
                              colSpan={10}
                              className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-900 font-bold text-sm py-2 px-3"
                            >
                              🟡 Medium Priority ({stats.mediumCount} total)
                            </td>
                          </tr>
                          {sortedTasks
                            .filter((t) => t.priority === "Medium")
                            .map((task, index) => renderTaskRow(task, index))}
                        </>
                      )}

                      {/* Low Priority Section */}
                      {lowTasks.length > 0 && (
                        <>
                          <tr>
                            <td
                              colSpan={10}
                              className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 font-bold text-sm py-2 px-3"
                            >
                              🟢 Low Priority ({stats.lowCount} total)
                            </td>
                          </tr>
                          {sortedTasks
                            .filter((t) => t.priority === "Low")
                            .map((task, index) => renderTaskRow(task, index))}
                        </>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 border-t px-6 py-3 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* GO TO FIRST PAGE BUTTON - Shows when not on first page */}
                {currentPage > 1 && (
                  <button
                    onClick={goToFirstPage}
                    className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-semibold flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M10.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L6.414 10l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    First Page
                  </button>
                )}

                {/* CURRENT PAGE INFO */}
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • Showing {tasks.length} of{" "}
                  {totalCount} tasks
                </span>
              </div>

              {/* BOTTOM PAGINATION CONTROLS */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || loading}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${currentPage === 1 || loading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${currentPage === totalPages || loading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                    }`}
                >
                  Next
                </button>
              </div>

              {loading && (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <FaSpinner className="animate-spin" /> Loading...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Mobile View */}
        {isMobileView && (
          <div className="space-y-4">
            {initialLoading ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <FaSpinner className="animate-spin h-8 w-8 mx-auto mb-3 text-blue-600" />
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-gray-500">No tasks found</p>
              </div>
            ) : (
              <>
                {/* High Priority Mobile */}
                {highTasks.length > 0 && (
                  <>
                    <div className="bg-red-50 text-red-900 font-semibold text-sm py-2.5 px-4 rounded-lg border border-red-200">
                      High Priority ({stats.highCount} total)
                    </div>
                    {sortedTasks
                      .filter((t) => t.priority === "High")
                      .map((task, index) => renderTaskCard(task, index))}
                  </>
                )}

                {/* Medium Priority Mobile */}
                {mediumTasks.length > 0 && (
                  <>
                    <div className="bg-yellow-50 text-yellow-900 font-semibold text-sm py-2.5 px-4 rounded-lg border border-yellow-200">
                      Medium Priority ({stats.mediumCount} total)
                    </div>
                    {sortedTasks
                      .filter((t) => t.priority === "Medium")
                      .map((task, index) => renderTaskCard(task, index))}
                  </>
                )}

                {/* Low Priority Mobile */}
                {lowTasks.length > 0 && (
                  <>
                    <div className="bg-green-50 text-green-900 font-semibold text-sm py-2.5 px-4 rounded-lg border border-green-200">
                      Low Priority ({stats.lowCount} total)
                    </div>
                    {sortedTasks
                      .filter((t) => t.priority === "Low")
                      .map((task, index) => renderTaskCard(task, index))}
                  </>
                )}

                {/* Mobile Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow border">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg ${currentPage === 1
                          ? "bg-gray-100 text-gray-400"
                          : "bg-blue-600 text-white"
                        }`}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                          ? "bg-gray-100 text-gray-400"
                          : "bg-blue-600 text-white"
                        }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Work Description Popup */}
        {openWorkDescPopup && (
          <div
            className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4"
            onClick={() => setOpenWorkDescPopup(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-xl text-gray-900">
                  Edit Description
                </h4>
                <button
                  onClick={() => setOpenWorkDescPopup(null)}
                  className="text-gray-400 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <textarea
                value={workDescs[openWorkDescPopup] || ""}
                onChange={(e) =>
                  setWorkDescs((prev) => ({
                    ...prev,
                    [openWorkDescPopup]: e.target.value,
                  }))
                }
                rows={8}
                placeholder="Enter work description..."
                className="w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end mt-4 gap-3">
                <button
                  onClick={() => setOpenWorkDescPopup(null)}
                  className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleWorkDescSave(openWorkDescPopup)}
                  className="px-5 py-2 text-sm rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Remark Popup */}
        {openRemarkPopup && (
          <div
            className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4"
            onClick={() => setOpenRemarkPopup(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-xl text-gray-900">Edit Remark</h4>
                <button
                  onClick={() => setOpenRemarkPopup(null)}
                  className="text-gray-400 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <textarea
                value={remarks[openRemarkPopup] || ""}
                onChange={(e) =>
                  setRemarks((prev) => ({
                    ...prev,
                    [openRemarkPopup]: e.target.value,
                  }))
                }
                rows={8}
                placeholder="Enter remark..."
                className="w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end mt-4 gap-3">
                <button
                  onClick={() => setOpenRemarkPopup(null)}
                  className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemarkSave(openRemarkPopup)}
                  className="px-5 py-2 text-sm rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Popup */}
        {openMessagePopup && taskForMessage && (
          <MessagePopup
            isOpen={openMessagePopup}
            onClose={() => setOpenMessagePopup(false)}
            task={taskForMessage}
            sendMessage={handleMessageSend}
          />
        )}

        {/* Team Members Popup */}
        {showTeamPopup && renderTeamPopup(showTeamPopup)}

        {/* Task Details Popup (Mobile) */}
        {openTaskPopup && selectedTaskDetails && (
          <div
            className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
            onClick={() => setOpenTaskPopup(null)}
          >
            {/* Added 'relative' class here */}
            <div
              className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cross Button added here */}
              <button
                onClick={() => setOpenTaskPopup(null)}
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors z-10"
                title="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="mb-6 pr-8">
                {" "}
                {/* Added pr-8 to prevent text overlap with button */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedTaskDetails.taskName}
                </h2>
                {selectedTaskDetails.code && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                    {selectedTaskDetails.code}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900">
                      Description
                    </span>
                    <button
                      onClick={() =>
                        handleWorkDescEditClick(selectedTaskDetails._id)
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedTaskDetails.workDesc || "No description"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900">Remarks</span>
                    <button
                      onClick={() =>
                        handleRemarkEditClick(selectedTaskDetails._id)
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedTaskDetails.remark || "No remark"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <span className="text-sm text-gray-600">Due Date</span>
                    <div className="font-semibold">
                      {selectedTaskDetails.dueDate
                        ? new Date(
                          selectedTaskDetails.dueDate,
                        ).toLocaleDateString("en-GB")
                        : "—"}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <span className="text-sm text-gray-600">Priority</span>
                    <div className="font-semibold">
                      {selectedTaskDetails.priority}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="font-semibold">
                      {selectedTaskDetails.status}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <span className="text-sm text-gray-600">Assigned by</span>
                    <div className="font-semibold">
                      {selectedTaskDetails.assignedBy?.name || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <button
                    onClick={() => onEdit(selectedTaskDetails)}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Edit Task
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(selectedTaskDetails._id, "Completed")
                    }
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    Mark Complete
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteTask(selectedTaskDetails)}
                      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Dropdown */}
        {editingStatus && (
          <StatusDropdownPortal>
            <div
              ref={dropdownRef}
              className="absolute rounded-xl shadow-2xl border-2 border-gray-300 w-44 mt-1 z-50 bg-white overflow-hidden"
              style={{
                position: "fixed",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
              }}
            >
              {["To Do", "In Progress", "Completed", "Obsolete"].map(
                (statusOption) => (
                  <div
                    key={statusOption}
                    className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all font-bold border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                    style={{ color: statusColors[statusOption]?.text }}
                    onClick={() =>
                      handleStatusChange(editingStatus, statusOption)
                    }
                  >
                    {statusOption === "Completed" && <span>✓</span>}
                    {statusOption === "In Progress" && <span>⏱</span>}
                    {statusOption === "To Do" && <span>📝</span>}
                    {statusOption === "Obsolete" && <span>⊗</span>}
                    {statusOption}
                  </div>
                ),
              )}
            </div>
          </StatusDropdownPortal>
        )}
      </div>
    </div>
  );
};

export default TaskList;
