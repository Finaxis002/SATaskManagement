import React, { useState } from "react";
import TaskFormModal from "../Components/Tasks/TaskFormModal";
import TaskList from "../Components/Tasks/TaskList";
import { useNavigate } from "react-router-dom";

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);

  const role = localStorage.getItem("role") || "user"; // Default to 'user' if not set

  const navigate = useNavigate();

  const handleCreateClick = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleSaveTask = (taskData) => {
    setShowForm(false);
    setRefreshTrigger((prev) => !prev); // ✅ This will tell TaskList to refetch
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleRemoveCompletedFromUI = () => {
    setTasks((prev) => prev.filter((task) => task.status !== "Completed"));
  };

  const handleRemoveCompletedTasks = () => {
    const existing = JSON.parse(
      localStorage.getItem("hiddenCompletedTasks") || "[]"
    );

    const newHidden = tasks
      .filter((task) => task.status === "Completed")
      .map((task) => task._id);

    const combined = [...new Set([...existing, ...newHidden])];

    localStorage.setItem("hiddenCompletedTasks", JSON.stringify(combined));

    // Now update UI
    setTasks((prev) => prev.filter((task) => task.status !== "Completed"));
  };

  return (
    <>
       <div className="p-6  w-[180vh]  overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Task Manager</h2>
          <div className="flex gap-4">
            <button
              onClick={handleCreateClick}
              className="bg-green-600 text-white px-4 py-2 rounded-4xl hover:bg-green-700"
            >
              + Create Task
            </button>
            {role === "admin" && (
              <button
              onClick={handleRemoveCompletedTasks} // ✅ This saves to localStorage and updates UI
              className="bg-red-100 text-sm hover:bg-red-200 text-red-700 font-semibold px-4 py-2 rounded-full shadow"
            >
              Remove Completed
            </button>
            )}
           
          </div>
        </div>

        <TaskList
          refreshTrigger={refreshTrigger}
          onEdit={handleEdit}
          setTaskListExternally={setTasks}
          tasksOverride={tasks}
          hideCompleted={hideCompleted}
        />

        {showForm && (
          <TaskFormModal
            onClose={() => setShowForm(false)}
            onSave={handleSaveTask}
            initialData={editingTask}
          />
        )}
      </div>
    </>
  );
};

// Tasks.jsx
export default AllTasks;
