import React, { useState } from "react";
import TaskFormModal from "../Components/Tasks/TaskFormModal";
import TaskList from "../Components/Tasks/TaskList";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setHideCompletedTrue } from "../redux/taskSlice";
import Swal from 'sweetalert2'


const AllTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);

const dispatch = useDispatch();


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

const handleRemoveCompletedTasks = async () => {
  try {
    const response = await fetch(
      "https://sataskmanagementbackend.onrender.com/api/tasks/hide-completed",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to remove completed tasks");
    }
    Swal.fire({
      icon: "success",
      title: "Completed Tasks Removed",
      timer: 1500,
      showConfirmButton: false,
    });

    // Toggle refreshTrigger to tell TaskList to refetch
    setRefreshTrigger(prev => !prev);

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.message || "Something went wrong",
    });
  }
};



  return (
    <>
      <div className="p-6  w-[202vh]  overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold"
          style={{ fontFamily: "Poppins, sans-serif" }}
          >Task Manager</h2>
          <div className="flex gap-4">
            <button
              onClick={handleCreateClick}
              className="bg-[#d1d6ff] hover:bg-[#b7caf5] text-sm  text-blue-700 font-semibold px-4 py-2 rounded-full shadow"
            style={{ fontFamily: "Poppins, sans-serif" }}
            >
              + Create Task
            </button>
            {role === "admin" && (
              <button
                onClick={handleRemoveCompletedTasks} // ✅ This saves to localStorage and updates UI
                className="bg-[#fbd9d9] hover:bg-[#f1c7c7] text-sm  text-red-700 font-semibold px-4 py-2 rounded-full shadow"
               
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
      {/* <div className="flex flex-col h-full w-full">
   
        <div className="flex justify-between items-center p-4 md:p-6">
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
                onClick={handleRemoveCompletedTasks}
                className="bg-[#fbd9d9] hover:bg-[#f1c7c7] text-sm text-red-700 font-semibold px-4 py-2 rounded-full shadow"
              >
                Remove Completed
              </button>
            )}
          </div>
        </div>

        
        <div className="flex-1 min-h-0">
          <TaskList
            refreshTrigger={refreshTrigger}
            onEdit={handleEdit}
            setTaskListExternally={setTasks}
            tasksOverride={tasks}
            hideCompleted={hideCompleted}
          />
        </div>

        {showForm && (
          <TaskFormModal
            onClose={() => setShowForm(false)}
            onSave={handleSaveTask}
            initialData={editingTask}
          />
        )}
      
    </div> */}
    </>
  );
};

// Tasks.jsx
export default AllTasks;
