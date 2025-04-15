import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addTaskToColumn,
  toggleTaskCompletion,
  removeTaskFromColumn,
  fetchTasks,
  fetchAssignees,
} from "../redux/taskSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCheckCircle,
} from "@fortawesome/free-regular-svg-icons";
import { faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  TASK: "task",
};

const TaskBoard = () => {
  const taskColumns = useSelector((state) => state.tasks.taskColumns);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchAssignees());
  }, [dispatch]);

  const [showPopup, setShowPopup] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);

  const [showAssigneeList, setShowAssigneeList] = useState(false);
  const [assignee, setAssignee] = useState(null);

  const assignees = useSelector((state) => state.tasks.assignees);

  const popupRef = useRef(null);

  const getDueLabel = (date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const inputDate = new Date(date);
    if (inputDate.toDateString() === today.toDateString()) return "Today";
    if (inputDate.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date;
  };

  const handleAddTask = async () => {
    if (!newTaskName || !selectedDate) return;

    const newTask = {
      name: newTaskName,
      due: getDueLabel(selectedDate),
      completed: false,
      assignee,
      column: taskColumns[currentColumnIndex].title,
    };

    try {
      await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      dispatch(
        addTaskToColumn({ columnIndex: currentColumnIndex, task: newTask })
      );
      closePopup();
    } catch (err) {
      console.error("Failed to save task", err);
    }
  };

  const handleToggleCompletion = (columnIndex, taskIndex) => {
    dispatch(toggleTaskCompletion({ columnIndex, taskIndex }));
  };

  const handleOpenPopup = (columnIndex) => {
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

  const TaskCard = ({ task, columnIndex, taskIndex }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.TASK,
      item: { columnIndex, taskIndex, task },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    return (
      <div
        ref={drag}
        className={`bg-white rounded-md p-3 shadow-sm hover:shadow-md cursor-pointer border border-gray-200 flex justify-between items-start ${
          task.completed ? "opacity-60" : ""
        }`}
      >
        <div>
          <h4
            className={`text-sm mb-1 ${
              task.completed
                ? "line-through text-gray-400"
                : "text-gray-800 font-medium"
            }`}
          >
            {task.name}
          </h4>
          <div className="text-xs text-gray-500 flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4 mr-1" />
            {task.due}
          </div>

          {/* ✅ Assignee display */}
          {task.assignee?.name && (
            <div className="text-xs text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faUser} className="h-4 w-4 mr-1" />
              {task.assignee.name}
            </div>
          )}
        </div>
        <FontAwesomeIcon
          icon={faCheckCircle}
          onClick={() => handleToggleCompletion(columnIndex, taskIndex)}
          className={`h-5 w-5 ml-2 cursor-pointer ${
            task.completed ? "text-green-500" : "text-gray-300"
          }`}
        />
      </div>
    );
  };

  const TaskColumn = ({ column, columnIndex }) => {
    const [, drop] = useDrop({
      accept: ItemTypes.TASK,
      drop: (item) => {
        if (item.columnIndex !== columnIndex) {
          dispatch({
            type: "tasks/addTaskToColumn",
            payload: { columnIndex, task: item.task },
          });
          dispatch({
            type: "tasks/removeTaskFromColumn",
            payload: {
              columnIndex: item.columnIndex,
              taskIndex: item.taskIndex,
            },
          });
        }
      },
    });

    return (
      <div
        ref={drop}
        key={columnIndex}
        className="bg-transparent rounded-lg p-2"
      >
        <div className="flex justify-between items-center mb-2 px-2">
          <h3 className="font-semibold text-gray-700">
            {column.title}{" "}
            <span className="text-gray-500 text-sm">{column.tasks.length}</span>
          </h3>
          <button
            className="text-gray-400 hover:text-gray-600 text-lg"
            onClick={() => handleOpenPopup(columnIndex)}
          >
            +
          </button>
        </div>

        <div className="bg-gray-100 rounded-md p-2 min-h-[150px]">
          {column.tasks.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-6">
              + Add task
            </div>
          ) : (
            <div className="space-y-2">
              {column.tasks.map((task, taskIndex) => (
                <TaskCard
                  key={taskIndex}
                  task={task}
                  columnIndex={columnIndex}
                  taskIndex={taskIndex}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 bg-white w-full min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Tasks</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => handleOpenPopup(0)}
          >
            + Add task
          </button>
        </div>

        {showPopup && (
          <div
            ref={popupRef}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm bg-white p-4 rounded shadow-md"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Create Task</h3>
              <FontAwesomeIcon
                icon={faTimes}
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
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
                // icon={['fas', 'user']}
                icon={faUser}
                onClick={() => setShowAssigneeList((prev) => !prev)}
                className="cursor-pointer h-4 w-4 hover:text-gray-800"
                title="Assign task"
              />

              {/* Show selected name if available */}
              {assignee && (
                <span className="text-xs text-gray-700">
                  Assigned to: {assignee.name}
                </span>
              )}

              {/* Dropdown */}
              {showAssigneeList && (
                <div className="absolute left-0 top-6 z-50 w-64 max-h-40 overflow-y-auto bg-white shadow border rounded p-2">
                  {assignees.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {taskColumns.map((column, columnIndex) => (
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
