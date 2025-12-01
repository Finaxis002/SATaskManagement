import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateTaskStatus, fetchTasks } from "../redux/taskSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchDepartments } from "../redux/departmentSlice";
import ExcelJS from "exceljs";
import {
  faFilter,
  faPen,
  faTrash,
  faCalendar,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { FaTrashAlt, FaPen, FaCalendar } from "react-icons/fa";
import { fetchUsers } from "../redux/userSlice";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { io } from "socket.io-client";
const socket = io("https://taskbe.sharda.co.in");

const ReportGeneration = ({
  onEdit = () => {
    console.warn("onEdit function not provided to ReportGeneration.");
  },
  refreshTrigger,
  setTaskListExternally,
  tasksOverride,
  hideCompleted,
}) => {
  const role = localStorage.getItem("role");
  const userEmail = localStorage.getItem("userId");
  const userName = localStorage.getItem("name");

  const [tasks, setTasks] = useState([]);
  const [editingStatus, setEditingStatus] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [filters, setFilters] = useState({
    priority: "",
    assignee: "",
    assignedBy: "",
    status: "",
    code: "",
    department: "",
    // Non-admin users see their own tasks by default.
    user: role !== "admin" && userName ? userName : "",
  });
  const [dueDateSortOrder, setDueDateSortOrder] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [editingWorkDesc, setEditingWorkDesc] = useState(null);
  const [workDescs, setWorkDescs] = useState({});
  const [openWorkDescPopup, setOpenWorkDescPopup] = useState(null);
  const [workDescMode, setWorkDescMode] = useState("view");
  const [departments, setDepartments] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [departmentsForAdmin, setDepartmentsForAdmin] = useState([]);
  const [departmentsLoaded, setDepartmentsLoaded] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const users = useSelector((state) => state.users.list);
  const reportRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const departmentData = useSelector((state) => state.departments.list);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    setDepartments(departmentData);
  }, [departmentData]);

  useEffect(() => {
    if (role === "admin" && users?.length) {
      const adminUser = users.find((u) => u.email === userEmail);
      const adminDepartments = adminUser?.department || [];
      setDepartmentsForAdmin(adminDepartments);
      setDepartmentsLoaded(true);
    }
  }, [users, role, userEmail]);

  useEffect(() => {
    dispatch(updateTaskStatus());
  }, [dispatch]);

  useEffect(() => {
    if (users?.length) {
      const names = users.map((u) => u.name);
      setUniqueUsers([...new Set(names)]);
    }
  }, [users]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchTasksFromAPI = async () => {
    try {
      const response = await fetch("https://taskbe.sharda.co.in/api/tasks");
      const data = await response.json();

      // FIX: Check if data is an object with a 'tasks' array, or if it's the array itself.
      // API returned: {tasks: Array(100), ...} -> We need data.tasks
      const rawTasks = data && Array.isArray(data.tasks) 
        ? data.tasks 
        : Array.isArray(data) 
        ? data 
        : [];
        
      if (rawTasks.length === 0 && data) {
           console.warn("API data returned but tasks array is empty or missing:", data);
      }
      // END FIX

      const hiddenTaskIds = JSON.parse(
        localStorage.getItem("hiddenCompletedTasks") || "[]"
      );

      const visibleTasks = rawTasks.filter( // Use the correctly extracted/safeguarded tasks array
        (task) => !hiddenTaskIds.includes(task._id)
      );

      let filtered = [];

      if (role !== "admin") {
        filtered = visibleTasks.filter(
          (task) =>
            task.assignees?.some((a) => a.email === userEmail) ||
            task.assignedBy?.email === userEmail
        );
        setTasks(filtered);
        if (setTaskListExternally) setTaskListExternally(filtered);
      } else {
        setTasks(visibleTasks);
        if (setTaskListExternally) setTaskListExternally(visibleTasks);
      }

      const taskRemarks = {};
      const tasksToProcess = role !== "admin" ? filtered : visibleTasks;
      tasksToProcess.forEach((task) => {
        taskRemarks[task._id] = task.remark || "";
      });
      setRemarks(taskRemarks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]); 
    }
  };

  useEffect(() => {
    if (role !== "admin" || departmentsLoaded) {
      fetchTasksFromAPI();
    }
  }, [role, userEmail, refreshTrigger, departmentsLoaded]);

  useEffect(() => {
    const handleTaskEvent = () => {
      if (role === "admin" && !departmentsLoaded) {
        const interval = setInterval(() => {
          if (departmentsLoaded) {
            fetchTasksFromAPI();
            clearInterval(interval);
          }
        }, 300);
      } else {
        fetchTasksFromAPI();
      }
    };

    socket.on("new-task-created", handleTaskEvent);
    socket.on("task-updated", handleTaskEvent);
    socket.on("task-deleted", handleTaskEvent);

    return () => {
      socket.off("new-task-created", handleTaskEvent);
      socket.off("task-updated", handleTaskEvent);
      socket.off("task-deleted", handleTaskEvent);
    };
  }, [departmentsLoaded, role]);

  useEffect(() => {
    fetchTasksFromAPI();
  }, [role, userEmail, refreshTrigger]);

  const formatAssignedDate = (assignedDate) => {
    if (!assignedDate) return "";
    const date = new Date(assignedDate);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );

    const updatedBy = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("userId"),
    };

    try {
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus, updatedBy }),
        }
      );

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
      } else {
        throw new Error("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Error updating task status. Please try again.");

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: task.status } : task
        )
      );
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const uniqueAssignedBy = [
    ...new Set(tasks.map((t) => t.assignedBy?.name).filter(Boolean)),
  ];

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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ workDesc: workDescText, updatedBy }),
        }
      );

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
        setEditingWorkDesc(null);
      } else {
        throw new Error("Failed to update work description");
      }
    } catch (error) {
      console.error("Error updating work description:", error);
      alert("Error updating work description. Please try again.");
    }
  };

  const sortedTasks = (tasksOverride || tasks).sort((a, b) => {
    if (dueDateSortOrder === "asc") {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (dueDateSortOrder === "desc") {
      return new Date(b.dueDate) - new Date(a.dueDate);
    }
    return 0;
  });

  const filteredTasks = sortedTasks.filter((task) => {
    const assignedDate = new Date(task.assignedDate);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (to) to.setHours(23, 59, 59, 999);

    // Filter condition: Match the selected user (filters.user)
    const matchesUser =
      !filters.user || // If no user is selected (e.g., admin default view), always match
      task.assignees?.some((a) => a.name === filters.user) ||
      task.assignedBy?.name === filters.user;

    const matchesDateRange =
      (!from || assignedDate >= from) && (!to || assignedDate <= to);

    const matchesOtherFilters =
      (filters.department === "" ||
        task.department.includes(filters.department)) &&
      (filters.code === "" || task.code === filters.code) &&
      (filters.priority === "" || task.priority === filters.priority) &&
      (filters.status === "" || task.status === filters.status);

    const shouldHide = hideCompleted && task.status === "Completed";

    // Combine all filters
    const isFiltered =
      matchesUser && matchesDateRange && matchesOtherFilters && !shouldHide;

    return isFiltered;
  });

  const highPriorityTasks = filteredTasks.filter(
    (task) => task.priority === "High"
  );
  const mediumPriorityTasks = filteredTasks.filter(
    (task) => task.priority === "Medium"
  );
  const lowPriorityTasks = filteredTasks.filter(
    (task) => task.priority === "Low"
  );

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setEditingStatus(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleDownloadPDF = () => {
    // If Admin, check if a user is selected before generating a specific user report
    if (!filters.user && role === "admin" && filteredTasks.length > 0) {
      const confirmAll = window.confirm("You are about to generate a report for ALL tasks visible. Do you want to proceed?");
      if (!confirmAll) return;
    }
    
    if (filteredTasks.length === 0) {
        alert("No tasks match the current filters to generate a report.");
        return;
    }

    // Fallback title for non-admin/unfiltered admin view
    const reportUserName = filters.user || (role !== "admin" ? userName : "All Tasks");
    
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });

    const title = `${reportUserName}'s Task Report`;
    const subtitle =
      fromDate && toDate
        ? `From ${new Date(fromDate).toLocaleDateString("en-GB")} to ${new Date(
            toDate
          ).toLocaleDateString("en-GB")}`
        : "";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 40, {
      align: "center",
    });

    if (subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, 60, {
        align: "center",
      });
    }

    const tableData = filteredTasks.map((task, index) => [
      index + 1,
      task.taskName,
      task.workDesc || "No description",
      task.code || "",
      formatAssignedDate(task.assignedDate),
      new Date(task.dueDate).toLocaleDateString("en-GB"),
      task.status,
      task.priority,
    ]);

    autoTable(doc, {
      head: [
        [
          "S. No",
          "Task Name",
          "Work Description",
          "Code",
          "Date of Work",
          "Due Date",
          "Status",
          "Priority",
        ],
      ],
      body: tableData,
      startY: 80,
      styles: {
        fontSize: 8,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [47, 62, 158],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    doc.save(`${reportUserName.replace(/\s+/g, "_")}-Task-Report.pdf`);
  };

  const handleDownloadExcel = async () => {
    // If Admin, check if a user is selected before generating a specific user report
    if (!filters.user && role === "admin" && filteredTasks.length > 0) {
      const confirmAll = window.confirm("You are about to generate an Excel report for ALL tasks visible. Do you want to proceed?");
      if (!confirmAll) return;
    }

    if (filteredTasks.length === 0) {
        alert("No tasks match the current filters to generate an Excel report.");
        return;
    }
    
    const reportUserName = filters.user || (role !== "admin" ? userName : "All Tasks");

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Task Report", {
        pageSetup: { paperSize: 9, orientation: "landscape" },
        views: [{ state: "frozen", xSplit: 0, ySplit: 3 }],
      });

      // Set column widths
      worksheet.columns = [
        { width: 10 }, // S. No
        { width: 35 }, // Task Name
        { width: 50 }, // Work Description
        { width: 18 }, // Code
        { width: 24 }, // Date of Work
        { width: 16 }, // Due Date
        { width: 16 }, // Status
        { width: 14 }, // Priority
      ];

      // Title Row with gradient effect
      worksheet.mergeCells("A1:H1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = `📋 ${reportUserName}'s Task Report`;
      titleCell.font = {
        bold: true,
        size: 18,
        color: { argb: "FFFFFFFF" },
        name: "Calibri",
      };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E40AF" }, // Deep blue
      };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.border = {
        top: { style: "medium", color: { argb: "FF1E3A8A" } },
        left: { style: "medium", color: { argb: "FF1E3A8A" } },
        bottom: { style: "medium", color: { argb: "FF1E3A8A" } },
        right: { style: "medium", color: { argb: "FF1E3A8A" } },
      };
      worksheet.getRow(1).height = 35;

      // Date Range Row with better styling
      if (fromDate && toDate) {
        worksheet.mergeCells("A2:H2");
        const dateCell = worksheet.getCell("A2");
        dateCell.value = `📅 Report Period: ${new Date(
          fromDate
        ).toLocaleDateString("en-GB")} to ${new Date(toDate).toLocaleDateString(
          "en-GB"
        )}`;
        dateCell.font = {
          italic: true,
          size: 12,
          color: { argb: "FF475569" },
          name: "Calibri",
        };
        dateCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E7FF" }, // Light blue
        };
        dateCell.alignment = { horizontal: "center", vertical: "middle" };
        dateCell.border = {
          left: { style: "thin", color: { argb: "FFCBD5E1" } },
          right: { style: "thin", color: { argb: "FFCBD5E1" } },
          bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
        };
        worksheet.getRow(2).height = 24;
      }

      let currentRow = fromDate && toDate ? 4 : 3;

      const addPrioritySection = (tasks, label, headerColor, iconColor) => {
        if (tasks.length === 0) return;

        // Priority Header with shadow effect
        worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
        const priorityHeader = worksheet.getCell(`A${currentRow}`);
        priorityHeader.value = label;
        priorityHeader.font = {
          bold: true,
          size: 14,
          color: { argb: "FFFFFFFF" },
          name: "Calibri",
        };
        priorityHeader.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: headerColor },
        };
        priorityHeader.alignment = {
          horizontal: "left",
          vertical: "middle",
          indent: 1,
        };
        priorityHeader.border = {
          top: { style: "medium", color: { argb: iconColor } },
          left: { style: "medium", color: { argb: iconColor } },
          bottom: { style: "medium", color: { argb: iconColor } },
          right: { style: "medium", color: { argb: iconColor } },
        };
        worksheet.getRow(currentRow).height = 28;
        currentRow++;

        // Column Headers with gradient
        const headerRow = worksheet.getRow(currentRow);
        const headers = [
          "S. No",
          "Task Name",
          "Work Description",
          "Code",
          "Date of Work",
          "Due Date",
          "Status",
          "Priority",
        ];
        headers.forEach((header, idx) => {
          const cell = headerRow.getCell(idx + 1);
          cell.value = header;
          cell.font = {
            bold: true,
            size: 11,
            color: { argb: "FFFFFFFF" },
            name: "Calibri",
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF334155" }, // Dark gray
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "medium", color: { argb: "FF1E293B" } },
            left: { style: "thin", color: { argb: "FF475569" } },
            bottom: { style: "medium", color: { argb: "FF1E293B" } },
            right: { style: "thin", color: { argb: "FF475569" } },
          };
        });
        headerRow.height = 22;
        currentRow++;

        // Data Rows with enhanced styling
        tasks.forEach((task, index) => {
          const dataRow = worksheet.getRow(currentRow);
          const isEven = index % 2 === 0;

          const rowData = [
            index + 1,
            task.taskName,
            task.workDesc || "No description",
            task.code || "-",
            formatAssignedDate(task.assignedDate),
            new Date(task.dueDate).toLocaleDateString("en-GB"),
            task.status,
            task.priority,
          ];

          rowData.forEach((value, idx) => {
            const cell = dataRow.getCell(idx + 1);
            cell.value = value;
            cell.font = {
              size: 10,
              name: "Calibri",
              color: { argb: "FF1F2937" },
            };

            // Special styling for status column
            if (idx === 6) {
              // Status column
              let statusColor = "FF3B82F6"; // Blue for To Do
              if (value === "Completed") statusColor = "FF10B981";
              else if (value === "In Progress") statusColor = "FFF59E0B";
              else if (value === "Overdue") statusColor = "FFEF4444";
              else if (value === "Abbstulate") statusColor = "FF8B5CF6";

              cell.font = {
                size: 10,
                bold: true,
                name: "Calibri",
                color: { argb: statusColor },
              };
            }

            // Special styling for priority column
            if (idx === 7) {
              // Priority column
              let priorityColor = "FF10B981"; // Green for Low
              if (value === "High") priorityColor = "FFEF4444";
              else if (value === "Medium") priorityColor = "FFF59E0B";

              cell.font = {
                size: 10,
                bold: true,
                name: "Calibri",
                color: { argb: priorityColor },
              };
            }

            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: isEven ? "FFFAFAFA" : "FFFFFFFF" },
            };
            cell.alignment = {
              vertical: "middle",
              wrapText: true,
              horizontal: idx === 0 ? "center" : "left",
              indent: idx > 0 && idx !== 6 && idx !== 7 ? 1 : 0,
            };
            cell.border = {
              top: { style: "thin", color: { argb: "FFE5E7EB" } },
              left: { style: "thin", color: { argb: "FFE5E7EB" } },
              bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
              right: { style: "thin", color: { argb: "FFE5E7EB" } },
            };
          });

          dataRow.height = 20;
          currentRow++;
        });

        // Add summary row
        const summaryRow = worksheet.getRow(currentRow);
        summaryRow.getCell(1).value = `Total ${
          label.split(" ")[1]
        } Priority Tasks: ${tasks.length}`;
        worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
        summaryRow.getCell(1).font = {
          bold: true,
          size: 10,
          color: { argb: "FF475569" },
          italic: true,
          name: "Calibri",
        };
        summaryRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F5F9" },
        };
        summaryRow.getCell(1).alignment = {
          horizontal: "right",
          vertical: "middle",
          indent: 1,
        };
        summaryRow.getCell(1).border = {
          top: { style: "thin", color: { argb: "FFCBD5E1" } },
          bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
        };
        summaryRow.height = 18;
        currentRow += 2; // Empty row separator
      };

      // Add sections by priority with enhanced colors
      addPrioritySection(
        highPriorityTasks,
        "🔴 HIGH PRIORITY TASKS",
        "FFDC2626",
        "FFB91C1C"
      );
      addPrioritySection(
        mediumPriorityTasks,
        "🟡 MEDIUM PRIORITY TASKS",
        "FFF59E0B",
        "FFD97706"
      );
      addPrioritySection(
        lowPriorityTasks,
        "🟢 LOW PRIORITY TASKS",
        "FF10B981",
        "FF059669"
      );

      // Add footer with total summary
      currentRow += 1;
      worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
      const footerCell = worksheet.getCell(`A${currentRow}`);
      footerCell.value = `📊 Total Tasks: ${
        filteredTasks.length
      } | Generated on: ${new Date().toLocaleString("en-GB")}`;
      footerCell.font = {
        italic: true,
        size: 10,
        color: { argb: "FF64748B" },
        name: "Calibri",
      };
      footerCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF8FAFC" },
      };
      footerCell.alignment = { horizontal: "center", vertical: "middle" };
      footerCell.border = {
        top: { style: "medium", color: { argb: "FFCBD5E1" } },
      };
      worksheet.getRow(currentRow).height = 20;

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `${reportUserName.replace(/\s+/g, "_")}-Task-Report.xlsx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Error generating Excel file. Please try again.");
    }
  };
  const renderTaskCardOrRow = (task, index) => {
    const isOverdue =
      new Date(task.dueDate) < new Date() &&
      task.status !== "Completed" &&
      task.status !== "Obsolete";

    const StatusBadge = ({ status, onClick }) => {
      let bgColor, textColor;
      switch (status) {
        case "Completed":
          bgColor = "bg-green-200";
          textColor = "text-green-600";
          break;
        case "In Progress":
          bgColor = "bg-yellow-200";
          textColor = "text-yellow-600";
          break;
        case "To Do":
          bgColor = "bg-blue-200";
          textColor = "text-blue-600";
          break;
        case "Abbstulate":
          bgColor = "bg-purple-200";
          textColor = "text-purple-600";
          break;
        default:
          bgColor = "bg-red-200";
          textColor = "text-red-600";
          break;
      }

      return (
        <span
          className={`py-1 px-2 sm:px-3 rounded-full text-xs font-semibold ${bgColor} ${textColor} cursor-pointer`}
          onClick={onClick}
        >
          {status}
        </span>
      );
    };

    if (isMobile) {
      return (
        <div
          key={task._id}
          className={`bg-white p-4 rounded-lg shadow-md border-l-4 mb-3 relative ${
            editingStatus === task._id ? "z-[100]" : "z-10"
          } ${
            isOverdue ? "border-red-500 bg-red-50" : "border-indigo-500"
          }`}
        >
          <div className="flex justify-between items-start mb-2 border-b pb-2">
            <h3 className="text-sm font-bold text-gray-800 break-words">
              {index + 1}. {task.taskName}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge
                status={task.status}
                onClick={() => setEditingStatus(task._id)}
              />
              <FontAwesomeIcon
                icon={faPen}
                className="cursor-pointer text-blue-500 hover:text-blue-700 w-3 h-3"
                onClick={() => onEdit(task)}
              />
            </div>
          </div>

          <div className="text-xs text-gray-600 space-y-1">
            <p className="flex justify-between">
              <span className="font-medium">Priority:</span>
              <span
                className={`font-semibold ${
                  task.priority === "High"
                    ? "text-red-500"
                    : task.priority === "Medium"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {task.priority}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Date of Work:</span>
              <span>{formatAssignedDate(task.assignedDate)}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Due Date:</span>
              <span>{new Date(task.dueDate).toLocaleDateString("en-GB")}</span>
            </p>

            <div className="pt-2 border-t mt-2">
              <span className="font-medium block mb-1">Description:</span>
              <div className="text-xs text-gray-700 whitespace-pre-wrap">
                {(task.workDesc || "No description").length > 100
                  ? `${task.workDesc.slice(0, 100)}...`
                  : task.workDesc || "No description"}
                {task.code && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({task.code})
                  </span>
                )}
                {(task.workDesc || "").length > 100 && (
                  <button
                    className="text-blue-500 hover:text-blue-700 text-xs font-medium ml-1"
                    onClick={() => {
                      setOpenWorkDescPopup(task._id);
                      setWorkDescMode("view");
                    }}
                  >
                    Read more
                  </button>
                )}
              </div>
            </div>

            {editingStatus === task._id && (
              <div
                className="absolute right-2 top-12 z-[9999] w-36 max-w-xs bg-white   rounded-lg shadow-2xl"
                ref={dropdownRef}
                style={{ position: "absolute" }}
              >
                <div className="p-2 flex flex-col gap-1 w-full">
                  <h4 className="text-xs font-semibold text-gray-700 mb-1 border-b pb-1">
                    Change Status:
                  </h4>

                  {["To Do", "In Progress", "Completed", "Overdue", "Abbstulate"].map(
                    (statusOption) => (
                      <span
                        key={statusOption}
                        className={`py-1.5 px-2 text-center rounded-md text-xs font-semibold cursor-pointer transition-colors 
                                      ${
                          statusOption === "Completed"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : statusOption === "In Progress"
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : statusOption === "To Do"
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : statusOption === "Abbstulate"
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                        onClick={() => {
                          setNewStatus(statusOption);
                          handleStatusChange(task._id, statusOption);
                          setEditingStatus(null);
                        }}
                      >
                        {statusOption}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <tr
        key={task._id}
        id={`task-${task._id}`}
        className={`hover:bg-indigo-50 transition duration-300 ease-in-out cursor-pointer border-b border-gray-200 
      ${isOverdue ? "bg-orange-100 hover:bg-orange-200" : ""}
    `}
      >
        <td className="py-3 px-2 sm:px-4 font-medium text-xs">{index + 1}</td>

        <td className="py-3 px-2 sm:px-6 relative flex items-center gap-2">
          <span className="text-xs break-words">{task.taskName}</span>
          <FontAwesomeIcon
            icon={faPen}
            className="cursor-pointer text-blue-500 hover:text-blue-700 flex-shrink-0"
            onClick={() => onEdit(task)}
          />
        </td>

        <td className="py-3 px-2 sm:px-6 relative group">
          <div className="flex items-center gap-2 min-h-[24px]">
            <span className="text-xs text-gray-700 break-words">
              {(task.workDesc || "No description").length > 60
                ? `${task.workDesc.slice(0, 60)}...`
                : task.workDesc || "No description"}
              {task.code && (
                <span className="ml-2 text-blue-600 font-medium">
                  ({task.code})
                </span>
              )}
            </span>

            {(task.workDesc || "").length > 60 && (
              <button
                className="text-blue-500 hover:text-blue-700 text-xs font-medium transition-colors flex-shrink-0"
                onClick={() => {
                  setOpenWorkDescPopup(task._id);
                  setWorkDescMode("view");
                }}
              >
                Read more
              </button>
            )}
            <FontAwesomeIcon
              icon={faPen}
              className="cursor-pointer text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity w-3 h-3 flex-shrink-0"
              onClick={() => {
                setOpenWorkDescPopup(task._id);
                setWorkDescMode("edit");
              }}
            />
          </div>

          {openWorkDescPopup === task._id && (
            <div className="fixed sm:absolute top-1/2 left-1/2 sm:top-full sm:left-0 transform -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 sm:mt-1 w-11/12 sm:w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4 transition-all duration-200 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <span className="font-semibold text-sm text-gray-800">
                  {workDescMode === "edit" ? "Edit Description" : "Description"}
                </span>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors text-lg"
                  onClick={() => setOpenWorkDescPopup(null)}
                >
                  ×
                </button>
              </div>

              {workDescMode === "edit" ? (
                <>
                  <textarea
                    value={workDescs[task._id] || task.workDesc || ""}
                    onChange={(e) =>
                      setWorkDescs((prev) => ({
                        ...prev,
                        [task._id]: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Enter work description..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
                    autoFocus
                  />

                  <div className="flex justify-end mt-3 gap-2">
                    <button
                      onClick={() => setOpenWorkDescPopup(null)}
                      className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleWorkDescSave(task._id);
                        setOpenWorkDescPopup(null);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-gray-700 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {task.workDesc || "No description available"}
                </div>
              )}

              {task.code && (
                <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
                  <span className="font-medium">Code:</span> {task.code}
                </div>
              )}
            </div>
          )}
        </td>

        <td className="py-3 px-2 sm:px-6 text-xs">
          {formatAssignedDate(task.assignedDate)}
        </td>

        <td className="py-3 px-2 sm:px-6 text-xs">
          {new Date(task.dueDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </td>

        <td className="py-3 px-2 sm:px-6 text-center relative">
          {editingStatus === task._id ? (
            <div
              ref={dropdownRef}
              className="flex flex-col w-32 sm:w-40 justify-between bg-white absolute shadow-lg rounded-lg z-50 right-0 sm:left-1/2 sm:-translate-x-[65%] top-10 p-2"
            >
              {["To Do", "In Progress", "Completed", "Overdue", "Abbstulate"].map(
                (statusOption) => (
                  <span
                    key={statusOption}
                    className={`py-2 px-2 sm:px-4 text-center rounded-md text-xs font-semibold cursor-pointer mb-1 ${
                      statusOption === "Completed"
                        ? "bg-green-200 text-green-600 hover:bg-green-300"
                        : statusOption === "In Progress"
                        ? "bg-yellow-200 text-yellow-600 hover:bg-yellow-300"
                        : statusOption === "To Do"
                        ? "bg-blue-200 text-blue-600 hover:bg-blue-300"
                        : statusOption === "Abbstulate"
                        ? "bg-purple-200 text-purple-600 hover:bg-purple-300"
                        : "bg-red-200 text-red-600 hover:bg-red-300"
                    }`}
                    onClick={() => {
                      setNewStatus(statusOption);
                      handleStatusChange(task._id, statusOption);
                      setEditingStatus(null);
                    }}
                  >
                    {statusOption}
                  </span>
                )
              )}
            </div>
          ) : (
            <StatusBadge
              status={task.status}
              onClick={() => setEditingStatus(task._id)}
            />
          )}
        </td>
      </tr>
    );
  };

  // Determine which title to display
  const isUserFilterSet = !!filters.user || role !== 'admin';
  const displayUserTitle = filters.user || (role === 'admin' ? "All Tasks" : userName);


  return (
    <div className="p-2 sm:p-4 bg-gray-100 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
          {role === "admin" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <label
                htmlFor="userFilter"
                className="text-xs font-medium text-gray-700"
              >
                Filter by User:
              </label>
              <select
                id="userFilter"
                value={filters.user}
                onChange={(e) => handleFilterChange("user", e.target.value)}
                className="appearance-none w-full sm:w-56 pl-4 pr-10 py-2 text-xs border border-gray-300 rounded-md shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a user (Admin View All)</option>
                {[...new Set([...uniqueUsers, ...uniqueAssignedBy])].map(
                  (user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                From:
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="p-2 border border-gray-300 text-xs rounded-md shadow-sm w-full sm:w-auto"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                To:
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="p-2 border border-gray-300 text-xs rounded-md shadow-sm w-full sm:w-auto"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow w-full sm:w-auto"
          >
            📊 Download Excel
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow w-full sm:w-auto"
          >
            📄 Download PDF
          </button>
        </div>
      </div>

      {/* Conditional rendering based on whether a user is selected OR if it's a non-admin user */}
      {!isUserFilterSet && role === "admin" ? (
        <div className="text-center text-gray-500 mt-10">
          🔍 **Please select a user to view a specific report.** (Admin currently sees all tasks filtered below)
        </div>
      ) : (
        <>
          <div ref={reportRef} className="w-full p-2 sm:p-4">
            <h2 className="text-sm sm:text-base font-semibold mb-4">
              <span className="capitalize block sm:inline">
                {displayUserTitle}'s Task Report
              </span>
              {fromDate && toDate && (
                <span className="block sm:inline sm:ml-2 text-xs sm:text-sm font-medium text-gray-700 mt-2 sm:mt-0">
                  (from{" "}
                  <span className="font-semibold text-gray-800">
                    {new Date(fromDate).toLocaleDateString("en-GB")}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-800">
                    {new Date(toDate).toLocaleDateString("en-GB")}
                  </span>
                  )
                </span>
              )}
            </h2>

            <div className="overflow-x-auto h-auto max-h-screen relative">
              {isMobile ? (
                <div className="space-y-3 pb-20 relative">
                  {highPriorityTasks.length === 0 &&
                  mediumPriorityTasks.length === 0 &&
                  lowPriorityTasks.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      🚫 **No tasks Assigned Yet matching filters.**
                    </div>
                  ) : (
                    <>
                      {highPriorityTasks.length > 0 && (
                        <>
                          <div className="bg-red-200 text-red-800 font-bold text-xs p-2 rounded-md">
                            High Priority Tasks
                          </div>
                          {highPriorityTasks.map((task, idx) =>
                            renderTaskCardOrRow(task, idx)
                          )}
                        </>
                      )}
                      {mediumPriorityTasks.length > 0 && (
                        <>
                          <div className="bg-yellow-200 text-yellow-800 font-bold text-xs p-2 rounded-md">
                            Medium Priority Tasks
                          </div>
                          {mediumPriorityTasks.map((task, idx) =>
                            renderTaskCardOrRow(task, idx)
                          )}
                        </>
                      )}
                      {lowPriorityTasks.length > 0 && (
                        <>
                          <div className="bg-green-200 text-green-800 font-bold text-xs p-2 rounded-md">
                            Low Priority Tasks
                          </div>
                          {lowPriorityTasks.map((task, idx) =>
                            renderTaskCardOrRow(task, idx)
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[70vh]">
                  <table className="w-full table-auto border-collapse text-xs text-gray-800 min-w-[600px]">
                    <thead className="bg-gradient-to-r from-indigo-400 to-indigo-700 text-white text-xs sticky top-0 z-10">
                      <tr className="text-left">
                        <th className="py-3 px-2 sm:px-4 min-w-[50px] sm:min-w-[70px] font-semibold">
                          S. No
                        </th>
                        <th className="py-3 px-2 sm:px-6 min-w-[120px] sm:min-w-[180px] font-semibold">
                          Task Name
                        </th>
                        <th className="py-3 px-2 sm:px-6 min-w-[180px] sm:min-w-[250px] font-semibold">
                          Work Description + Code
                        </th>
                        <th className="py-3 px-2 sm:px-6 min-w-[120px] sm:min-w-[150px] font-semibold">
                          Date of Work
                        </th>
                        <th
                          className="py-3 px-2 sm:px-6 min-w-[100px] font-semibold cursor-pointer"
                          onClick={() => {
                            setDueDateSortOrder((prev) =>
                              prev === "asc" ? "desc" : "asc"
                            );
                          }}
                        >
                          Due Date
                          {dueDateSortOrder === "asc"
                            ? " 🔼"
                            : dueDateSortOrder === "desc"
                            ? " 🔽"
                            : ""}
                        </th>
                        <th className="py-3 px-2 sm:px-6 min-w-[100px] sm:min-w-[140px] font-semibold text-center">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="text-xs text-gray-700">
                      {highPriorityTasks.length === 0 &&
                      mediumPriorityTasks.length === 0 &&
                      lowPriorityTasks.length === 0 ? (
                        <tr>
                          <td
                            colSpan="13"
                            className="text-center py-6 text-gray-500"
                          >
                            🚫 **No tasks Assigned Yet matching filters.**
                          </td>
                        </tr>
                      ) : (
                        <>
                          {highPriorityTasks.length > 0 && (
                            <>
                              <tr className="bg-red-100 text-red-800 font-bold text-xs">
                                <td colSpan="13" className="py-2 px-2 sm:px-6">
                                  High Priority Tasks
                                </td>
                              </tr>
                              {highPriorityTasks.map((task, idx) =>
                                renderTaskCardOrRow(task, idx)
                              )}
                            </>
                          )}

                          {mediumPriorityTasks.length > 0 && (
                            <>
                              <tr className="bg-yellow-100 text-yellow-800 font-bold text-xs">
                                <td colSpan="13" className="py-2 px-2 sm:px-6">
                                  Medium Priority Tasks
                                </td>
                              </tr>
                              {mediumPriorityTasks.map((task, idx) =>
                                renderTaskCardOrRow(task, idx)
                              )}
                            </>
                          )}

                          {lowPriorityTasks.length > 0 && (
                            <>
                              <tr className="bg-green-100 text-green-800 font-bold text-xs">
                                <td colSpan="13" className="py-2 px-2 sm:px-6">
                                  Low Priority Tasks
                                </td>
                              </tr>
                              {lowPriorityTasks.map((task, idx) =>
                                renderTaskCardOrRow(task, idx)
                              )}
                            </>
                          )}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportGeneration;