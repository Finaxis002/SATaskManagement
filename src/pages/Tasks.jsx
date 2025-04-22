import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import TaskColumn from "../Components/TaskColumn";

import {
  addTaskToColumn,
  fetchTasks,
  fetchAssignees,
} from "../redux/taskSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-regular-svg-icons";
import { faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { io } from "socket.io-client";

const socket = io("https://sataskmanagementbackend.onrender.com", {
  withCredentials: true,
});

const TaskBoard = () => {
  const taskColumns = useSelector((state) => state.tasks.taskColumns);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchAssignees());
  }, [dispatch]);

  const [tasks, setTasks] = useState();

  const [showPopup, setShowPopup] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [taskToUpdate, setTaskToUpdate] = useState(null); // For task editing

  const { role, userId } = useSelector((state) => state.auth);

  const [showAssigneeList, setShowAssigneeList] = useState(false);
  const [assignee, setAssignee] = useState(null);

  const assignees = useSelector((state) => state.tasks.assignees);

  // Fetch tasks initially from the backend
  useEffect(() => {
    fetch("https://sataskmanagementbackend.onrender.com/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error("Error fetching tasks:", error));

    // Listen for the task-updated event to handle real-time updates
    socket.on("task-updated", (updatedTask) => {
      setTasks((prevTasks) => {
        // Update the task in the state
        return prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        );
      });
    });

    // Clean up the socket listener when the component unmounts
    return () => {
      socket.off("task-updated");
    };
  }, []);

  const popupRef = useRef(null);

  const handleAddTask = async () => {
    if (!newTaskName || !selectedDate || !assignee) return; // Ensure Assignee is selected as well.

    const isoDueDate = new Date(selectedDate).toISOString();

    const newTask = {
      name: newTaskName,
      due: isoDueDate,
      completed: false,
      assignee,
      column: taskColumns[currentColumnIndex].title,
    };

    try {
      // Create task via task API
      const taskResponse = await fetch(
        "https://sataskmanagementbackend.onrender.com/api/tasks",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        }
      );

      const taskData = await taskResponse.json();
      console.log("Task Data:", taskData); // Log to verify the response

      // Accessing _id from the correct location
      const taskId = taskData.task?._id; // Accessing _id from task property

      if (!taskId) {
        throw new Error("Task ID is missing in the response");
      }

      const assigneeEmail = assignee.email; // Ensure assignee email is correctly set
      console.log("This is the assignee email:", assigneeEmail);

      if (!assigneeEmail) {
        throw new Error("Assignee email is missing");
      }

      // Send notification to the assigned employee

      const notificationResponse = await fetch(
        "https://sataskmanagementbackend.onrender.com/api/notifications",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientEmail: assigneeEmail, // Ensure email of assignee is sent correctly
            message: `New task assigned: ${newTask.name} (Due: ${new Date(
              newTask.due
            ).toLocaleDateString()})`,
            taskId: taskId, // Using the task ID for notification
          }),
        }
      );

      const notificationData = await notificationResponse.json();
      console.log("Notification response:", notificationData);

      // Now, dispatch the task to the column in the frontend (Redux)
      dispatch(
        addTaskToColumn({ columnIndex: currentColumnIndex, task: newTask })
      );

      // Close the popup and reset fields
      closePopup();
    } catch (err) {
      console.error("Failed to save task", err);
    }
  };

  // Open the popup for adding a new task or editing an existing task
  const handleOpenPopup = (columnIndex, task = null) => {
    setTaskToUpdate(task);
    setNewTaskName(task ? task.name : "");
    setSelectedDate(task ? task.due : "");
    setAssignee(
      task ? { name: task.assignee.name, email: task.assignee.email } : null
    );
    setCurrentColumnIndex(columnIndex);
    setShowPopup(true);
  };

  const closePopup = () => {
    setNewTaskName("");
    setSelectedDate("");
    setShowPopup(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closePopup();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        closePopup();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Filter tasks per column based on role

  const filteredTaskColumns = taskColumns.map((column) => {
    const filteredTasks =
      role === "admin"
        ? column.tasks // admin sees all tasks
        : column.tasks.filter(
            (task) =>
              task.assignee?.email?.toLowerCase() === userId?.toLowerCase()
          );

    return {
      ...column,
      tasks: filteredTasks,
    };
  });

  const Role = localStorage.getItem("role");

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6  bg-white w-full min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Tasks</h2>
          {Role === "admin" && (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => handleOpenPopup(0)}
            >
              + Add task
            </button>
          )}
        </div>

        {showPopup && (
          <div
            ref={popupRef}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm bg-white p-4 rounded shadow-md"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">
                {taskToUpdate ? "Update Task" : "Create Task"}
              </h3>

              <FontAwesomeIcon
                icon={faTimes}
                onClick={closePopup}
                className="text-gray-900 hover:text-gray-700 cursor-pointer"
              />
            </div>

            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Task name"
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />

            <div className="flex justify-between items-center mb-3">
              <label className="flex items-center text-sm text-gray-600">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="h-5 w-5 mr-2"
                />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-sm border border-gray-300 rounded p-1"
                />
              </label>

              <button
                onClick={handleAddTask}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>

            {/* Assignee Section (bottom left) */}
            <div className="relative mt-2 flex items-center gap-2 text-sm text-gray-600">
              <FontAwesomeIcon
                icon={faUser}
                onClick={() => setShowAssigneeList((prev) => !prev)}
                className="cursor-pointer h-4 w-4 hover:text-gray-800"
                title="Assign task"
              />

              {assignee && (
                <span className="text-sm text-gray-700">
                  Assigned to: {assignee.name}
                </span>
              )}

              {/* Dropdown */}
              {showAssigneeList && (
                <div className="absolute left-0 top-6 z-50 w-64 max-h-40 overflow-y-auto bg-white shadow border rounded p-2">
                  {assignees.length === 0 ? (
                    <p className="text-sm text-gray-900 text-center">
                      No users found
                    </p>
                  ) : (
                    assignees.map((emp) => (
                      <div
                        key={emp._id}
                        onClick={() => {
                          setAssignee({ name: emp.name, email: emp.email });
                          setShowAssigneeList(false);
                        }}
                        className="hover:bg-gray-100 p-1 cursor-pointer text-sm"
                      >
                        {emp.name} ({emp.email})
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-gray-100 rounded-md overflow-hidden">
          {/* Optional: List Header Row */}
          <div className="flex justify-between p-3 font-semibold text-gray-600 border-b">
            <span className="w-1/4">Task</span>
            <span className="w-1/4">Due Date</span>
            <span className="w-1/4">Assignee</span>
            <span className="w-1/4 text-right">Status</span>
          </div>

          {/* All tasks in flat list */}
          {filteredTaskColumns.flatMap((column, columnIndex) => (
            <TaskColumn
              key={columnIndex}
              column={column}
              columnIndex={columnIndex}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default TaskBoard;
