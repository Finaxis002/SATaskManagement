import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FaTrashAlt, FaExclamationCircle, FaSpinner, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import { fetchUsers } from "../../redux/userSlice";
import { fetchDepartments } from "../../redux/departmentSlice";
import FilterSection from "./FilterSection";
import MessagePopup from "./MessagePopup";
import StatusDropdownPortal from "../StatusDropdownPortal";
import axios from "../../utils/secureAxios";

const socket = io("https://taskbe.sharda.co.in");
const ITEMS_PER_PAGE = 20; // Default page size for virtual pagination
const MAX_LOAD_FOR_HIGH_PRIORITY = 20000; // Large limit for initial load to ensure all High Priority tasks are fetched
const MOBILE_ITEMS_PER_PAGE = 10; 
const MOBILE_INITIAL_LOAD = 20000; 

const TaskList = ({ onEdit, refreshTrigger, setTaskListExternally, tasksOverride, hideCompleted }) => {
    // Redux
    const dispatch = useDispatch();
    const users = useSelector((state) => state.users.list);
    const departmentData = useSelector((state) => state.departments.list);

    // State Management
    const [tasks, setTasks] = useState([]); // All fetched tasks (up to 20k on page 1)
    const [page, setPage] = useState(1); // Current page for server-side API fetch
    const [hasMore, setHasMore] = useState(true); 
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0); 
    const [stats, setStats] = useState({ highCount: 0, mediumCount: 0, lowCount: 0 });
    const [loadingStatus, setLoadingStatus] = useState({}); 

    // ⭐ NEW STATE: Virtual pagination/scroll index for High tasks (requested change)
    const [highScrollIndex, setHighScrollIndex] = useState(ITEMS_PER_PAGE);
    // ⭐ MODIFIED STATE: Virtual pagination/scroll index for Medium and Low tasks (renamed for clarity)
    const [otherScrollIndex, setOtherScrollIndex] = useState(ITEMS_PER_PAGE);
    
    // Filter data state
    const [departments, setDepartments] = useState([]);
    const [uniqueUsers, setUniqueUsers] = useState([]);
    const [uniqueAssignedBy, setUniqueAssignedBy] = useState([]);
    const [uniqueStatuses, setUniqueStatuses] = useState([]);

    // Filter & Sort State
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

    // UI State
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

    // Mobile Pagination State
    const [mobileCurrentPage, setMobileCurrentPage] = useState(1);

    // Refs
    const scrollContainerRef = useRef(null);
    const highObserverTarget = useRef(null); // ⭐ NEW: Ref for High Priority scroll trigger
    const otherObserverTarget = useRef(null); // ⭐ MODIFIED: Ref for Medium/Low scroll trigger
    const isInitialLoadRef = useRef(true);
    const dropdownRef = useRef(null);

    // 💡 Get role and convert to lowercase for reliable admin check
    const rawRole = localStorage.getItem("role");
    const userRole = rawRole ? rawRole.toLowerCase() : null;
    const isAdmin = userRole === "admin"; 
    const currentUserName = JSON.parse(localStorage.getItem("user"))?.name;

    // Load users and departments
    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchDepartments());
    }, [dispatch]);

    // Update departments state
    useEffect(() => {
        setDepartments(departmentData || []);
    }, [departmentData]);

    // Update unique users
    useEffect(() => {
        if (users?.length) {
            const names = users.map((u) => u.name);
            setUniqueUsers([...new Set(names)]);
        }
    }, [users]);

    // Detect if mobile view
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

    // Update mobile view state on resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch tasks with pagination (Main API Call)
    const fetchTasks = useCallback(async (pageNum = 1, append = false) => {
        if (!append) setLoading(true);

        try {
            // ⭐ FIX: Set a large limit for the initial load (Page 1) to get all high priority tasks.
            let itemsPerPage;
            if (isMobileView) {
                itemsPerPage = MOBILE_INITIAL_LOAD; 
            } else if (pageNum === 1) {
                itemsPerPage = MAX_LOAD_FOR_HIGH_PRIORITY; // Desktop initial load to capture all High tasks
            } else {
                itemsPerPage = ITEMS_PER_PAGE; 
            }

            // ⭐ FIX: Reset ALL virtual scroll indices on new full fetch
            if (pageNum === 1 && !isMobileView) {
                setHighScrollIndex(ITEMS_PER_PAGE); 
                setOtherScrollIndex(ITEMS_PER_PAGE); 
            }
            
            const params = new URLSearchParams({
                page: pageNum,
                limit: itemsPerPage,
                // ✅ PRIMARY SORT: Sort by Priority first (descending: High, Medium, Low)
                sortBy: "priority", 
                sortOrder: "desc",
            });

            // ⚡️ USER FILTERING LOGIC ⚡️
            if (!isAdmin && !filters.assignee && currentUserName) {
                params.append("assignee", currentUserName); 
            }

            // Add other filters from state
            Object.entries(filters).forEach(([key, value]) => {
                if (key === "assignee" && !isAdmin && currentUserName) {
                     if (value !== currentUserName) params.append(key, value);
                } else if (value) {
                    params.append(key, value);
                }
            });

            if (searchTerm) params.append("search", searchTerm);
            if (hideCompleted) params.append("status", "!Completed");

            const response = await fetch(`https://taskbe.sharda.co.in/api/tasks?${params}`);
            const data = await response.json();

            // Handle tasks state
            setTasks(prev => append ? [...prev, ...data.tasks] : data.tasks);
            if (!append && setTaskListExternally) setTaskListExternally(data.tasks);

            // Initialize/Update remarks and workDescs for all fetched tasks
            const newRemarks = {};
            const newWorkDescs = {};
            data.tasks.forEach(task => {
                newRemarks[task._id] = task.remark || "";
                newWorkDescs[task._id] = task.workDesc || "";
            });

            setRemarks(prev => ({ ...prev, ...newRemarks }));
            setWorkDescs(prev => ({ ...prev, ...newWorkDescs }));


            setHasMore(data.hasMore);
            setTotalCount(data.totalCount);
            setPage(pageNum);
            setMobileCurrentPage(1); 

            // Update unique values for filters
            if (!append && data.tasks.length > 0) {
                const assignedBySet = new Set();
                const statusSet = new Set();
                data.tasks.forEach(task => {
                    if (task.assignedBy?.name) assignedBySet.add(task.assignedBy.name);
                    if (task.status) statusSet.add(task.status);
                });
                setUniqueAssignedBy([...assignedBySet]);
                setUniqueStatuses([...statusSet]);
            }

        } catch (error) {
            console.error("Failed to fetch tasks:", error);
            Swal.fire("Error", "Failed to load tasks", "error");
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, [filters, searchTerm, hideCompleted, setTaskListExternally, isMobileView, isAdmin, currentUserName]); 

    // Fetch statistics
    const fetchStats = useCallback(async () => {
        try {
            const params = new URLSearchParams();

            // ⚡️ USER FILTERING LOGIC FOR STATS ⚡️
            if (!isAdmin && !filters.assignee && currentUserName) {
                params.append("assignee", currentUserName); 
            }

            // Add other filters
            Object.entries(filters).forEach(([key, value]) => {
                if (key === "assignee" && !isAdmin && currentUserName) {
                     if (value !== currentUserName) params.append(key, value);
                } else if (value) {
                    params.append(key, value);
                }
            });

            const response = await fetch(`https://taskbe.sharda.co.in/api/tasks/stats?${params}`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    }, [filters, isAdmin, currentUserName]); 

    // Initial load
    useEffect(() => {
        fetchTasks(1, false);
        fetchStats();
    }, [fetchTasks, fetchStats, refreshTrigger]);

    // Reset to page 1 and fetch when filters change
    useEffect(() => {
        if (!isInitialLoadRef.current) {
            setPage(1);
            fetchTasks(1, false);
            fetchStats();
        }
        isInitialLoadRef.current = false;
    }, [filters, searchTerm, dueDateSortOrder]); 
    
    // ⭐ NEW Intersection Observer for High Priority Virtual Scroll (Desktop)
    const allHighTasks = tasks.filter(t => t.priority === "High"); // Need this for dependency
    
    useEffect(() => {
        if (isMobileView) return; 

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && highScrollIndex < allHighTasks.length && !loading) {
                    // Load next batch of High tasks
                    setHighScrollIndex(prevIndex => prevIndex + ITEMS_PER_PAGE);
                }
            },
            { threshold: 0.1 }
        );

        if (highObserverTarget.current) {
            observer.observe(highObserverTarget.current);
        }

        return () => {
            if (highObserverTarget.current) {
                observer.unobserve(highObserverTarget.current);
            }
        };
    }, [highScrollIndex, loading, isMobileView, allHighTasks.length]); 

    // ⭐ MODIFIED Intersection Observer for Medium/Low Virtual Scroll (Desktop)
    const otherTasks = tasks.filter(t => t.priority !== "High"); // Need this for dependency
    
    useEffect(() => {
        // Only run this observer for desktop (non-mobile) view
        if (isMobileView) return; 

        const observer = new IntersectionObserver(
            entries => {
                // If the observer target is intersecting, and we have more tasks in the tasks array to show
                if (entries[0].isIntersecting && otherScrollIndex < otherTasks.length && !loading) {
                    // Load next batch of Medium/Low tasks
                    setOtherScrollIndex(prevIndex => prevIndex + ITEMS_PER_PAGE);
                }
            },
            { threshold: 0.1 }
        );

        if (otherObserverTarget.current) {
            observer.observe(otherObserverTarget.current);
        }

        return () => {
            if (otherObserverTarget.current) {
                observer.unobserve(otherObserverTarget.current);
            }
        };
    }, [otherScrollIndex, loading, isMobileView, otherTasks.length]); 

    // Handle closing dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setEditingStatus(null);
            }
        };
        const timeout = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeout);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [editingStatus]);


    // WebSocket for real-time updates
    useEffect(() => {
        const handleTaskEvent = () => {
            fetchTasks(1, false);
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
    }, [fetchTasks, fetchStats]);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setMobileCurrentPage(1); 
        // Reset ALL virtual scroll indices
        setHighScrollIndex(ITEMS_PER_PAGE); 
        setOtherScrollIndex(ITEMS_PER_PAGE); 
    };

    // Helper to find the task in the current visible list
    const getTaskById = (taskId) => tasks.find((t) => t._id === taskId);

    // ... (Rest of the handler functions remain the same) ...
    // Handle message send from MessagePopup
    const handleMessageSend = async (payload) => {
        try {
            const response = await axios.post(
                "https://taskbe.sharda.co.in/api/message-history",
                payload
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
        const taskText = `Task: ${task.taskName}\nCode: ${task.code || 'N/A'}\nDue Date: ${new Date(task.dueDate).toLocaleDateString("en-GB")}\nPriority: ${task.priority}`;
        
        try {
            // Use the modern Clipboard API
            await navigator.clipboard.writeText(taskText);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `Task "${task.taskName}" copied to clipboard!`,
                showConfirmButton: false,
                timer: 3000
            });
        } catch (error) {
            console.error("Failed to copy task:", error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Failed to copy task.',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    // Status update
    const handleStatusChange = async (taskId, newStatus) => {
        setLoadingStatus(prev => ({ ...prev, [taskId]: true }));

        // Optimistic update
        setTasks(prev => prev.map(task =>
            task._id === taskId ? { ...task, status: newStatus } : task
        ));

        // Update remarks if completed status is set
        if (newStatus === "Completed") {
            setRemarks((prevRemarks) => {
                const currentRemark = prevRemarks[taskId] || "";
                if (!currentRemark.includes("[Completed]")) {
                    return { ...prevRemarks, [taskId]: currentRemark + " [Completed]" };
                }
                return prevRemarks;
            });
        }


        const updatedBy = {
            name: localStorage.getItem("name"),
            email: localStorage.getItem("userId"),
        };

        try {
            const remarkText = remarks[taskId] || "";
            const response = await fetch(`https://taskbe.sharda.co.in/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, updatedBy, remark: remarkText }),
            });

            if (!response.ok) throw new Error("Failed to update");

            const updatedTask = await response.json();
            setTasks(prev => prev.map(task =>
                task._id === taskId ? updatedTask : task
            ));
            setRemarks(prev => ({ ...prev, [taskId]: updatedTask.remark || "" }));

        } catch (error) {
            console.error("Error updating status:", error);
            fetchTasks(1, false); // Revert on error
            Swal.fire("Error", "Failed to update status", "error");
        }
        setEditingStatus(null);
        setLoadingStatus(prev => ({ ...prev, [taskId]: false }));
    };

    // Work Description handlers
    const handleWorkDescEditClick = (taskId) => {
        const task = getTaskById(taskId);
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
            const response = await fetch(`https://taskbe.sharda.co.in/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workDesc: workDescText, updatedBy }),
            });

            if (response.ok) {
                const updatedTask = await response.json();
                setTasks(prev => prev.map(task =>
                    task._id === taskId ? updatedTask : task
                ));
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
    const handleRemarkEditClick = (taskId) => {
        const task = getTaskById(taskId);
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
            const response = await fetch(`https://taskbe.sharda.co.in/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ remark: remarkText, updatedBy }),
            });

            if (response.ok) {
                const updatedTask = await response.json();
                setTasks(prev => prev.map(task =>
                    task._id === taskId ? updatedTask : task
                ));
                setOpenRemarkPopup(null);
            } else {
                throw new Error("Failed to update remark");
            }
        } catch (error) {
            console.error("Error updating remark:", error);
            Swal.fire("Error", "Failed to update remark", "error");
        }
    };

    // Repetitive Task Deletion Logic
    const permanentlyStopRepetition = async (task) => {
        try {
            const updatedBy = {
                name: localStorage.getItem("name"),
                email: localStorage.getItem("userId"),
            };

            const response = await fetch(`https://taskbe.sharda.co.in/api/tasks/${task._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isRepetitive: false,
                    nextRepetitionDate: null,
                    updatedBy,
                }),
            });

            if (!response.ok) throw new Error("Failed to update repetition status");

            await deleteTaskRequest(task._id);
        } catch (error) {
            console.error("Error stopping repetition", error);
            Swal.fire("Error", "Failed to stop future repetitions.", "error");
        }
    };

    // Base Delete API call
    const deleteTaskRequest = async (taskId) => {
        try {
             setTasks(prev => prev.filter(t => t._id !== taskId));

            const response = await fetch(
                `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
                { method: "DELETE" }
            );
            if (!response.ok) throw new Error("Failed to delete task");

            Swal.fire({
                title: "Deleted!",
                text: "Task has been deleted.",
                icon: "success",
                confirmButtonText: "OK",
            });
            fetchTasks(1, false);
        } catch (err) {
            console.error("Error deleting task:", err);
            Swal.fire({
                title: "Error!",
                text: "Failed to delete task. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
            });
             fetchTasks(1, false);
        }
    };

    // Delete task (Enhanced with Repetitive Task Option)
    const handleDeleteTask = async (task) => {
        if (!task || !task._id) {
            Swal.fire({
                icon: "error",
                title: "Invalid Task",
                text: "The selected task is not valid or is missing required data.",
                confirmButtonColor: "#d33",
            });
            return;
        }

        if (!task.isRepetitive) {
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
            return deleteTaskRequest(task._id);
        }

        const result = await Swal.fire({
            title: "Repetitive Task Options",
            html: `
                <p>This task repeats regularly. What action do you want to take?</p>
                <ul style="text-align: left; font-size: 14px; list-style-type: none; padding-left: 0;">
                    <li><b>Delete Only This:</b> Deletes this instance only.</li>
                    <li><b>Stop Repeating & Delete:</b> Ends the repetition and deletes it.</li>
                </ul>
            `,
            icon: "question",
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "Delete Only This",
            denyButtonText: "Stop & Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#3085d6",
            denyButtonColor: "#e3342f",
            cancelButtonColor: "#6c757d",
        });

        if (result.isConfirmed) {
            await deleteTaskRequest(task._id);
        } else if (result.isDenied) {
            await permanentlyStopRepetition(task);
        }
    };

    // Helper for client-side sorting by Due Date (Secondary Sort)
    const sortByDueDate = (a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dueDateSortOrder === "asc" ? dateA - dateB : dateB - dateA;
    };
    
    // Separate tasks by priority and apply client-side Due Date sorting
    // allHighTasks and otherTasks are already defined outside to be used as useEffect dependencies
    const allHighTasksSorted = allHighTasks.sort(sortByDueDate);
    const otherTasksSorted = otherTasks.sort(sortByDueDate);

    // ⭐ FIX: High Priority tasks now use client-side pagination limit (highScrollIndex)
    const virtualHighTasks = allHighTasksSorted.slice(0, highScrollIndex);

    // Medium/Low Priority tasks use the otherScrollIndex
    const virtualOtherTasks = otherTasksSorted.slice(0, otherScrollIndex);

    const highTasks = virtualHighTasks;
    const mediumTasks = virtualOtherTasks.filter(t => t.priority === "Medium");
    const lowTasks = virtualOtherTasks.filter(t => t.priority === "Low");

    // Mobile Pagination Logic
    const mobileIndexOfLast = mobileCurrentPage * MOBILE_ITEMS_PER_PAGE;
    const mobileIndexOfFirst = mobileIndexOfLast - MOBILE_ITEMS_PER_PAGE;
    // Task data for mobile view is sliced based on client-side pagination indices
    const mobileTasksToRender = tasks.slice(mobileIndexOfFirst, mobileIndexOfLast);
    const mobileTotalPages = Math.ceil(tasks.length / MOBILE_ITEMS_PER_PAGE);

    // Apply sorting/grouping on the subset of tasks for the current mobile page
    const mobileHigh = mobileTasksToRender.filter((t) => t.priority === "High").sort(sortByDueDate);
    const mobileMedium = mobileTasksToRender.filter((t) => t.priority === "Medium").sort(sortByDueDate);
    const mobileLow = mobileTasksToRender.filter((t) => t.priority === "Low").sort(sortByDueDate);


    const handleNextPage = () => {
        setMobileCurrentPage((prev) => Math.min(prev + 1, mobileTotalPages));
    };

    const handlePreviousPage = () => {
        setMobileCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const statusColors = {
        "To Do": { bg: "#EFF6FF", text: "#1E40AF", border: "#3B82F6", glow: "rgba(59, 130, 246, 0.3)" },
        "In Progress": { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B", glow: "rgba(245, 158, 11, 0.3)" },
        "Completed": { bg: "#D1FAE5", text: "#065F46", border: "#10B981", glow: "rgba(16, 185, 129, 0.3)" },
        "Obsolete": { bg: "#F3E8FF", text: "#6B21A8", border: "#A855F7", glow: "rgba(168, 85, 247, 0.3)" },
    };

    const priorityColors = {
        "High": { bg: "#FEE2E2", text: "#991B1B", border: "#DC2626", glow: "rgba(220, 38, 38, 0.3)" },
        "Medium": { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B", glow: "rgba(245, 158, 11, 0.3)" },
        "Low": { bg: "#DBEAFE", text: "#1E40AF", border: "#3B82F6", glow: "rgba(59, 130, 246, 0.3)" },
    };

    // Render task row (Desktop)
    const renderTaskRow = (task, cumulativeIndex) => {
        const serialIndex = cumulativeIndex + 1;

        return (
            <tr key={task._id} className="group border-b border-gray-200 hover:bg-slate-50">
                {/* Index */}
                <td className="py-3 px-2 text-sm text-gray-700 font-semibold">{serialIndex}</td>

                {/* Task Name & Code (Enhanced with Overdue Icon) */}
                <td className="py-3 px-2">
                    <div className="flex flex-col gap-1">
                        <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            {task.taskName}
                            {new Date(task.dueDate) < new Date() &&
                                task.status !== "Completed" &&
                                task.status !== "Obsolete" && (
                                    <FaExclamationCircle
                                        className="text-red-600 animate-pulse"
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

                {/* Work Description (with Edit) */}
                <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                        <p className="text-xs text-gray-600 line-clamp-2">
                            {task.workDesc ? (task.workDesc.length > 50 ? task.workDesc.slice(0, 50) + "..." : task.workDesc) : "No description"}
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

                {/* Work Date */}
                <td className="py-3 px-2 text-xs text-gray-700">
                    {new Date(task.assignedDate).toLocaleDateString("en-GB")}
                </td>

                {/* Due Date */}
                <td className="py-3 px-2 text-xs text-gray-700 font-semibold">
                    {new Date(task.dueDate).toLocaleDateString("en-GB")}
                </td>

                {/* Status (with Dropdown Trigger/Loading) */}
                <td className="py-3 px-2">
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold cursor-pointer border ${loadingStatus[task._id] ? 'opacity-75' : ''}`}
                        style={{
                            backgroundColor: statusColors[task.status]?.bg,
                            color: statusColors[task.status]?.text,
                            borderColor: statusColors[task.status]?.border,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.target.getBoundingClientRect();
                            setDropdownPosition({
                                top: rect.top + window.scrollY + 30,
                                left: rect.left + window.scrollX,
                            });
                            setEditingStatus(task._id);
                        }}
                    >
                        {loadingStatus[task._id] ? <FaSpinner className="animate-spin h-3 w-3" /> : task.status}
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

                {/* Remarks (with Edit) */}
                <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-600 line-clamp-1">
                            {(remarks[task._id] || "No remark").slice(0, 20)}
                            {(remarks[task._id] || "").length > 20 && "..."}
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

                {/* Team (with Popup Trigger) */}
                <td className="py-3 px-2">
                    <div className="flex flex-wrap gap-1">
                        {task.assignees?.slice(0, 2).map((assignee) => (
                            <span key={assignee.email} className="text-xs py-0.5 px-2 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                                {assignee.name.split(" ")[0]}
                            </span>
                        ))}
                        {task.assignees?.length > 2 && (
                            <span
                                onClick={() => setShowTeamPopup(task._id)}
                                className="text-xs py-0.5 px-2 rounded-full bg-gray-100 text-gray-600 font-semibold cursor-pointer hover:bg-gray-200 transition-all"
                                title="View all team members"
                            >
                                +{task.assignees.length - 2}
                            </span>
                        )}
                    </div>
                </td>

                {/* Assigned By */}
                <td className="py-3 px-2 text-xs text-gray-700 font-semibold">
                    {task.assignedBy?.name || "—"}
                </td>

                {/* Actions (Enhanced with Message/Copy) */}
                <td className="py-3 px-2">
                    <div className="flex gap-1">
                        {/* Message Button */}
                        <button
                            onClick={() => {
                                setTaskForMessage(task);
                                setOpenMessagePopup(true);
                            }}
                            className="p-1.5 hover:bg-blue-50 rounded-lg transition-all text-blue-600"
                            title="Message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                                <path d="m21.854 2.147-10.94 10.939" />
                            </svg>
                        </button>
                        {/* Copy Button */}
                        <button
                            onClick={() => handleCopyTask(task)}
                            className="p-1.5 hover:bg-indigo-50 rounded-lg transition-all text-indigo-600"
                            title="Copy"
                        >
                            <FontAwesomeIcon icon={faCopy} className="h-3.5 w-3.5" />
                        </button>
                        {/* Edit Button */}
                        <button onClick={() => onEdit(task)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600" title="Edit">
                            <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                        </button>
                        {/* Delete Button */}
                        {isAdmin && (
                            <button onClick={() => handleDeleteTask(task)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600" title="Delete">
                                <FaTrashAlt size={12} />
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    // Render task card (Mobile)
    const renderTaskCard = (task, cumulativeIndex) => {
        const serialIndex = cumulativeIndex + 1;

        return (
            <div
                key={task._id}
                id={`task-${task._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 overflow-hidden mb-4"
            >
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                {/* Use serialIndex here */}
                                <span className="text-xs text-gray-500 font-medium">#{serialIndex}</span>
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
                            <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-1">
                                {task.taskName}
                            </h3>
                            {task.code && (
                                <span className="inline-block text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                    {task.code}
                                </span>
                            )}
                            {new Date(task.dueDate) < new Date() &&
                                task.status !== "Completed" &&
                                task.status !== "Obsolete" && (
                                    <FaExclamationCircle
                                        className="text-red-600 animate-pulse ml-2"
                                        size={12}
                                        title="Overdue"
                                    />
                                )}
                        </div>

                        <div className="flex gap-1 ml-2">
                            <button
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                                onClick={() => handleCopyTask(task)}
                                title="Copy"
                            >
                                <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onEdit(task)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                                title="Edit"
                            >
                                <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
                            </button>
                            {isAdmin && (
                                <button
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                    onClick={() => handleDeleteTask(task)}
                                    title="Delete"
                                >
                                    <FaTrashAlt size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer border ${loadingStatus[task._id] ? 'opacity-75' : ''}`}
                        style={{
                            backgroundColor: statusColors[task.status]?.bg,
                            color: statusColors[task.status]?.text,
                            borderColor: statusColors[task.status]?.border,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.target.getBoundingClientRect();
                            setDropdownPosition({
                                top: rect.top + window.scrollY + 40,
                                left: rect.left + window.scrollX,
                            });
                            setEditingStatus(task._id);
                        }}
                    >
                        {loadingStatus[task._id] ? <FaSpinner className="animate-spin h-3 w-3" /> : (
                            <>
                                {task.status === "Completed" && <span>✓</span>}
                                {task.status === "In Progress" && <span className="animate-pulse">⏱</span>}
                                {task.status === "To Do" && <span>📝</span>}
                                {task.status === "Obsolete" && <span>⊗</span>}
                                <span>{task.status}</span>
                            </>
                        )}
                    </span>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                    <div>
                        <span className="text-xs font-semibold text-gray-600 uppercase block mb-1">
                            Description
                        </span>
                        <p className="text-sm text-gray-700 line-clamp-3">
                            {task.workDesc || "No description"}
                        </p>
                        <button
                            onClick={() => handleWorkDescEditClick(task._id)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 font-semibold"
                        >
                            Edit <FontAwesomeIcon icon={faPen} className="h-2.5 w-2.5 ml-1" />
                        </button>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-gray-600 uppercase block mb-1">
                            Remark
                        </span>
                        <p className="text-sm text-gray-700 line-clamp-3">
                            {remarks[task._id] || "No remark"}
                        </p>
                        <button
                            onClick={() => handleRemarkEditClick(task._id)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 font-semibold"
                        >
                            Edit <FontAwesomeIcon icon={faPen} className="h-2.5 w-2.5 ml-1" />
                        </button>
                    </div>


                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <span className="text-xs font-semibold text-gray-600 block mb-1">Work Date</span>
                            <div className="text-sm text-gray-900 font-medium">
                                {new Date(task.assignedDate).toLocaleDateString("en-GB")}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-gray-600 block mb-1">Due Date</span>
                            <div className="text-sm text-gray-900 font-medium">
                                {new Date(task.dueDate).toLocaleDateString("en-GB")}
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-gray-600 uppercase block mb-2">Team</span>
                        <div className="flex flex-wrap gap-1.5">
                            {task.assignees?.slice(0, 3).map((assignee) => (
                                <span key={assignee.email} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
                                    {assignee.name.split(" ")[0]}
                                </span>
                            ))}
                            {task.assignees?.length > 3 && (
                                <span
                                    onClick={() => setShowTeamPopup(task._id)}
                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-medium cursor-pointer"
                                >
                                    +{task.assignees.length - 3}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="font-semibold">Assigned by:</span>
                        <span className="font-medium text-gray-900">{task.assignedBy?.name || "—"}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button
                            onClick={() => setOpenTaskPopup(task._id)}
                            className="flex-1 py-2 rounded bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
                        >
                            View Details
                        </button>
                        <button
                            onClick={() => {
                                setTaskForMessage(task);
                                setOpenMessagePopup(true);
                            }}
                            className="p-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            title="Message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                                <path d="m21.854 2.147-10.94 10.939" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Task Details Popup */}
                {openTaskPopup === task._id && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                                onClick={() => setOpenTaskPopup(null)}
                            >
                                ×
                            </button>

                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {task.taskName}
                                </h2>
                                {task.code && (
                                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                                        {task.code}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-gray-900 text-sm">
                                            Description
                                        </span>
                                        <button
                                            onClick={() => {
                                                handleWorkDescEditClick(task._id);
                                                setOpenTaskPopup(null);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                        {task.workDesc || "No description"}
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-gray-900 text-sm">
                                            Remark
                                        </span>
                                        <button
                                            onClick={() => {
                                                handleRemarkEditClick(task._id);
                                                setOpenTaskPopup(null);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                        {remarks[task._id] || "No remark"}
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <span className="font-semibold text-gray-900 block mb-3 text-sm">
                                        Team Members
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {task.assignees?.map((assignee) => (
                                            <span
                                                key={assignee.email}
                                                className="px-3 py-1.5 bg-white text-gray-700 rounded text-sm font-medium border border-gray-200"
                                            >
                                                {assignee.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => onEdit(task)}
                                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm transition-colors"
                                    >
                                        Edit Task
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(task._id, "Completed")}
                                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold text-sm transition-colors"
                                    >
                                        Mark Complete
                                    </button>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDeleteTask(task)}
                                            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold text-sm transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Team Members Popup
    const renderTeamPopup = (task) => (
           <div
               className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
               onClick={() => setShowTeamPopup(null)}
           >
               <div
                   className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border-2"
                   style={{ borderColor: "#4332d2" }}
                   onClick={(e) => e.stopPropagation()}
               >
                   <div
                       className="flex justify-between items-center mb-4 pb-3 border-b-2"
                       style={{ borderColor: "#e0dcf9" }}
                   >
                       <h3 className="text-xl font-bold" style={{ color: "#4332d2" }}>
                           👥 Team Members
                       </h3>
                       <button
                           onClick={() => setShowTeamPopup(null)}
                           className="text-gray-400 hover:text-gray-700 text-2xl font-light"
                       >
                           ×
                       </button>
                   </div>

                   <div className="space-y-2 max-h-96 overflow-y-auto">
                       {task.assignees?.map((assignee, idx) => (
                           <div
                               key={assignee.email}
                               className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-all"
                           >
                               <div
                                   className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                   style={{ backgroundColor: "#4332d2" }}
                               >
                                   {assignee.name.charAt(0).toUpperCase()}
                               </div>
                               <div className="flex-1">
                                   <div className="font-bold text-gray-900">
                                       {assignee.name}
                                   </div>
                                   <div className="text-sm text-gray-600">
                                       {assignee.email}
                                   </div>
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

    // Initialize a counter for desktop/mobile index outside the return
    let cumulativeIndex = -1;

    // --- RENDER START ---
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                <FilterSection
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    departments={departments}
                    uniqueUsers={uniqueUsers}
                    uniqueAssignedBy={uniqueAssignedBy}
                    uniqueStatuses={uniqueStatuses}
                    role={rawRole} // Passing the original role string
                />

                {/* Desktop Table (Virtual Scroll for Medium/Low) */}
                <div className="hidden lg:block bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden mt-6">
                    <div ref={scrollContainerRef} className="overflow-y-auto max-h-[70vh]">
                        <table className="w-full table-fixed">
                            <colgroup>
                                <col style={{ width: "3%" }} /> {/* # */}
                                <col style={{ width: "8%" }} /> {/* TASK */}
                                <col style={{ width: "10%" }} /> {/* DESCRIPTION */}
                                <col style={{ width: "7%" }} /> {/* WORK DATE */}
                                <col style={{ width: "7%" }} /> {/* DUE DATE */}
                                <col style={{ width: "8%" }} /> {/* STATUS */}
                                <col style={{ width: "7%" }} /> {/* PRIORITY */}
                                <col style={{ width: "12%" }} /> {/* REMARKS */}
                                <col style={{ width: "10%" }} /> {/* TEAM */}
                                <col style={{ width: "10%" }} /> {/* ASSIGNED BY */}
                                <col style={{ width: "8%" }} /> {/* ACTIONS */}
                            </colgroup>

                            <thead className="sticky top-0 z-20 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 border-b-2 border-indigo-200">
                                <tr>
                                    <th className="py-3 px-2 text-xs font-black">#</th>
                                    <th className="py-3 px-2 text-left text-xs font-black">TASK</th>
                                    <th className="py-3 px-2 text-left text-xs font-black">DESCRIPTION</th>
                                    <th className="py-3 px-2 text-left text-xs font-black">WORK DATE</th>
                                    <th
                                        className="py-3 px-2 text-left text-xs font-black cursor-pointer hover:text-indigo-600"
                                        onClick={() => setDueDateSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                                    >
                                        DUE DATE {dueDateSortOrder === "asc" ? "↑" : "↓"}
                                    </th>
                                    <th className="py-3 px-2 text-left text-xs font-black">STATUS</th>
                                    <th className="py-3 px-2 text-left text-xs font-black">PRIORITY</th>
                                    <th className="py-3 px-2 text-left text-xs font-black">REMARKS</th>
                                    <th className="py-3 px-2 text-left text-xs font-black">TEAM</th>
                                    <th className="py-3 px-2 text-left text-xs font-black">ASSIGNED BY</th>
                                    <th className="py-3 px-2 text-center text-xs font-black">ACTIONS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {initialLoading ? (
                                    <tr>
                                        <td colSpan={11} className="py-20 text-center">
                                            <FaSpinner className="animate-spin h-10 w-10 mx-auto mb-3 text-indigo-600" />
                                            <p className="text-gray-600 font-bold">Loading tasks...</p>
                                        </td>
                                    </tr>
                                ) : tasks.length === 0 && totalCount === 0 ? (
                                        <tr>
                                            <td colSpan={11} className="text-center py-20">
                                                <div className="text-6xl mb-4">📋</div>
                                                <p className="text-gray-500 font-black text-xl">No tasks assigned yet</p>
                                            </td>
                                        </tr>
                                ) : tasks.length === 0 && totalCount > 0 ? (
                                        <tr>
                                            <td colSpan={11} className="text-center py-20">
                                                <div className="text-6xl mb-4">🔍</div>
                                                <p className="text-gray-500 font-black text-xl">No tasks match your current filters.</p>
                                            </td>
                                        </tr>
                                ) : (
                                        <>
                                            {/* ⭐ High Priority Tasks (WITH VIRTUAL SCROLL) */}
                                            {highTasks.length > 0 && (
                                                <>
                                                    <tr>
                                                        <td colSpan={11} className="bg-gradient-to-r from-red-100 to-orange-100 text-red-900 font-black text-sm py-3 px-3 border-y-2 border-red-300">
                                                            🔴 High Priority ({allHighTasks.length} total)
                                                        </td>
                                                    </tr>
                                                    {highTasks.map((task) => {
                                                        cumulativeIndex++;
                                                        return renderTaskRow(task, cumulativeIndex);
                                                    })}
                                                    
                                                    {/* ⭐ HIGH PRIORITY SCROLL TRIGGER */}
                                                    {highScrollIndex < allHighTasks.length && (
                                                        <tr ref={highObserverTarget}>
                                                            <td colSpan={11} className="text-center py-4 bg-red-50/50">
                                                                <FaSpinner className="animate-spin h-6 w-6 mx-auto text-red-600" />
                                                                <p className="text-xs text-red-700 mt-1">Loading more High Priority tasks...</p>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            )}

                                            {/* Medium Priority Tasks (VIRTUAL SCROLL APPLIED) */}
                                            {mediumTasks.length > 0 && (
                                                <>
                                                    <tr>
                                                        <td colSpan={11} className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-900 font-black text-sm py-3 px-3 border-y-2 border-yellow-300">
                                                            🟡 Medium Priority ({stats.mediumCount} total)
                                                        </td>
                                                    </tr>
                                                    {mediumTasks.map((task) => {
                                                        cumulativeIndex++;
                                                        return renderTaskRow(task, cumulativeIndex);
                                                    })}
                                                </>
                                            )}

                                            {/* Low Priority Tasks (VIRTUAL SCROLL APPLIED) */}
                                            {lowTasks.length > 0 && (
                                                <>
                                                    <tr>
                                                        <td colSpan={11} className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 font-black text-sm py-3 px-3 border-y-2 border-green-300">
                                                            🟢 Low Priority ({stats.lowCount} total)
                                                        </td>
                                                    </tr>
                                                    {lowTasks.map((task) => {
                                                        cumulativeIndex++;
                                                        return renderTaskRow(task, cumulativeIndex);
                                                    })}
                                                </>
                                            )}

                                            {/* ⭐ MEDIUM/LOW SCROLL TRIGGER (Modified ref) */}
                                            {otherScrollIndex < otherTasks.length && (
                                                <tr ref={otherObserverTarget}>
                                                    <td colSpan={11} className="text-center py-4">
                                                        <FaSpinner className="animate-spin h-6 w-6 mx-auto text-indigo-600" />
                                                        <p className="text-xs text-indigo-700 mt-1">Loading more Medium/Low Priority tasks...</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Task Count Footer */}
                    <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                            Showing {tasks.length} of {totalCount} tasks
                        </span>
                        {loading && (
                            <span className="text-sm text-gray-500 flex items-center gap-2">
                                <FaSpinner className="animate-spin" /> Loading...
                            </span>
                        )}
                    </div>
                </div>

                {/* --- MOBILE VIEW (Remains the same, uses MAX_LOAD) --- */}
                <div className="lg:hidden mt-6 space-y-4">
                    {initialLoading ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
                            <FaSpinner className="animate-spin h-8 w-8 mx-auto mb-3 text-blue-600" />
                            <p className="text-gray-600 font-semibold">Loading tasks...</p>
                        </div>
                    ) : tasks.length === 0 && totalCount === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
                            <div className="text-5xl mb-3">📋</div>
                            <p className="text-gray-500 font-semibold text-lg">No tasks assigned yet</p>
                        </div>
                    ) : tasks.length === 0 && totalCount > 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
                            <div className="text-5xl mb-3">🔍</div>
                            <p className="text-gray-500 font-semibold text-lg">No tasks match your current filters.</p>
                        </div>
                    ) : (
                        <>
                            {/* Re-initialize cumulativeIndex for mobile view based on the current page start */}
                            {mobileTasksToRender.length > 0 && (
                                (cumulativeIndex = mobileIndexOfFirst - 1)
                            )}

                            {/* High Priority Mobile */}
                            {mobileHigh.length > 0 && (<><div className="bg-red-50 text-red-900 font-semibold text-sm py-2.5 px-4 rounded-lg border border-red-200">High Priority ({tasks.filter(t => t.priority === "High").length} total)</div>
                                {mobileHigh.map((task) => {
                                    cumulativeIndex++;
                                    return renderTaskCard(task, cumulativeIndex);
                                })}
                            </>)}
                            {/* Medium Priority Mobile */}
                            {mobileMedium.length > 0 && (<><div className="bg-yellow-50 text-yellow-900 font-semibold text-sm py-2.5 px-4 rounded-lg border border-yellow-200">Medium Priority ({tasks.filter(t => t.priority === "Medium").length} total)</div>
                                {mobileMedium.map((task) => {
                                    cumulativeIndex++;
                                    return renderTaskCard(task, cumulativeIndex);
                                })}
                            </>)}
                            {/* Low Priority Mobile */}
                            {mobileLow.length > 0 && (<><div className="bg-green-50 text-green-900 font-semibold text-sm py-2.5 px-4 rounded-lg border border-green-200">Low Priority ({tasks.filter(t => t.priority === "Low").length} total)</div>
                                {mobileLow.map((task) => {
                                    cumulativeIndex++;
                                    return renderTaskCard(task, cumulativeIndex);
                                })}
                            </>)}

                            {/* Mobile Pagination Controls */}
                            {mobileTotalPages > 1 && (
                                <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200 mb-12">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={mobileCurrentPage === 1}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                            mobileCurrentPage === 1
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                                        }`}
                                    >
                                        <FaChevronLeft size={10} /> Previous
                                    </button>

                                    <span className="text-sm text-gray-700 font-semibold">
                                        Page {mobileCurrentPage} of {mobileTotalPages}
                                    </span>

                                    <button
                                        onClick={handleNextPage}
                                        disabled={mobileCurrentPage === mobileTotalPages}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                            mobileCurrentPage === mobileTotalPages
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                                        }`}
                                    >
                                        Next <FaChevronRight size={10} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>


                {/* Work Description Popup */}
                {openWorkDescPopup && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                                <h4 className="font-bold text-xl text-gray-900">Edit Description</h4>
                                <button
                                    className="text-gray-400 hover:text-gray-700 text-2xl"
                                    onClick={() => setOpenWorkDescPopup(null)}
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
                                className="w-full px-4 py-3 text-base rounded-lg resize-y border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                            />
                            <div className="flex justify-end mt-4 gap-3">
                                <button
                                    onClick={() => setOpenWorkDescPopup(null)}
                                    className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleWorkDescSave(openWorkDescPopup)}
                                    className="px-5 py-2 text-sm rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Remark Popup */}
                {openRemarkPopup && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                                <h4 className="font-bold text-xl text-gray-900">Edit Remark</h4>
                                <button
                                    className="text-gray-400 hover:text-gray-700 text-2xl"
                                    onClick={() => setOpenRemarkPopup(null)}
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
                                className="w-full px-4 py-3 text-base rounded-lg resize-y border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                            />
                            <div className="flex justify-end mt-4 gap-3">
                                <button
                                    onClick={() => setOpenRemarkPopup(null)}
                                    className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRemarkSave(openRemarkPopup)}
                                    className="px-5 py-2 text-sm rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
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
                   {showTeamPopup && getTaskById(showTeamPopup) && (
                       renderTeamPopup(getTaskById(showTeamPopup))
                   )}

                {/* Status Dropdown */}
                {editingStatus && (
                    <StatusDropdownPortal>
                        <div
                            ref={dropdownRef}
                            className="absolute rounded-xl shadow-2xl border-2 border-gray-300 w-44 mt-1 z-50 bg-white overflow-hidden"
                            style={{
                                position: "absolute",
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                            }}
                        >
                            {["To Do", "In Progress", "Completed", "Obsolete"].map((statusOption) => (
                                <div
                                    key={statusOption}
                                    className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all font-bold border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                                    style={{ color: statusColors[statusOption]?.text }}
                                    onClick={() => {
                                        const taskId = editingStatus;
                                        handleStatusChange(taskId, statusOption);
                                    }}
                                >
                                    {statusOption === "Completed" && <span>✓</span>}
                                    {statusOption === "In Progress" && <span>⏱</span>}
                                    {statusOption === "To Do" && <span>📝</span>}
                                    {statusOption === "Obsolete" && <span>⊗</span>}
                                    {statusOption}
                                </div>
                            ))}
                        </div>
                    </StatusDropdownPortal>
                )}
            </div>
        </div>
    );
};

export default TaskList;