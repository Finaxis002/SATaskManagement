import React, { useState } from "react";
import TaskFormModal from "../Components/Tasks/TaskFormModal";
import TaskList from "../Components/Tasks/TaskList";

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);


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

  return (
    <div className="p-6 w-full min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Task Manager</h2>
        <button
          onClick={handleCreateClick}
          className="bg-green-600 text-white px-4 py-2 rounded-4xl hover:bg-green-700"
        >
          + Create Task
        </button>
      </div>

      <TaskList refreshTrigger={refreshTrigger} onEdit={handleEdit} />


      {showForm && (
        <TaskFormModal
          onClose={() => setShowForm(false)}
          onSave={handleSaveTask}
          initialData={editingTask}
        />
      )}
    </div>
  );
};

// Tasks.jsx
export default AllTasks;

