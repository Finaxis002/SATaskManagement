// import React, { useState } from "react";
// import TaskFormModal from "../Components/Tasks/TaskFormModal";
// import TaskList from "../Components/Tasks/TaskList";
// import { useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import Swal from "sweetalert2";
// import { FaTrashAlt } from "react-icons/fa";

// const AllTasks = () => {
//   const [tasks, setTasks] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [editingTask, setEditingTask] = useState(null);
//   const [refreshTrigger, setRefreshTrigger] = useState(false);
//   const [hideCompleted, setHideCompleted] = useState(false);

//   const dispatch = useDispatch();

//   const role = localStorage.getItem("role") || "user"; // Default to 'user' if not set

//   const navigate = useNavigate();

//   const handleCreateClick = () => {
//     setEditingTask(null);
//     setShowForm(true);
//   };

//   const handleSaveTask = (taskData) => {
//     setShowForm(false);
//     setRefreshTrigger((prev) => !prev); // ✅ This will tell TaskList to refetch
//   };

//   const handleEdit = (task) => {
//     setEditingTask(task);
//     setShowForm(true);
//   };

//   const handleRemoveCompletedTasks = async () => {
//     try {
//       const response = await fetch(
//         "https://taskbe.sharda.co.in/api/tasks/hide-completed",
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       if (!response.ok) {
//         throw new Error("Failed to remove completed tasks");
//       }
//       Swal.fire({
//         icon: "success",
//         title: "Completed Tasks Removed",
//         timer: 1500,
//         showConfirmButton: false,
//       });

//       // Toggle refreshTrigger to tell TaskList to refetch
//       setRefreshTrigger((prev) => !prev);
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.message || "Something went wrong",
//       });
//     }
//   };

//   const handleRemoveObsoleteTasks = async () => {
//     try {
//       const response = await fetch(
//         "https://taskbe.sharda.co.in/api/tasks/hide-obsolete",
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       if (!response.ok) {
//         throw new Error("Failed to remove obsolete tasks");
//       }
//       Swal.fire({
//         icon: "success",
//         title: "Obsolete Tasks Removed",
//         timer: 1500,
//         showConfirmButton: false,
//       });

//       setRefreshTrigger((prev) => !prev);
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.message || "Something went wrong",
//       });
//     }
//   };

//   return (
//     <>
//       <div className="px-4 py-6  overflow-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2
//             className="text-xl font-semibold"
//             style={{ fontFamily: "Poppins, sans-serif" }}
//           >
//             Task Manager
//           </h2>
//           <div className="flex gap-3">
//             {/* Create Task Button */}
//             <button
//               onClick={handleCreateClick}
//               className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 text-sm font-medium px-4 py-1 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-100 hover:border-blue-200"
//               style={{ fontFamily: "Poppins, sans-serif" }}
//             >
//               <span className="text-blue-600 text-lg font-bold">+</span>
//               Create Task
//             </button>

//             {role === "admin" && (
//               <>
//                 {/* Remove Completed Button */}
//                 <button
//                   onClick={handleRemoveCompletedTasks}
//                   className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 text-sm font-medium px-4 py-1 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-red-100 hover:border-red-200"
//                 >
//                   <FaTrashAlt className="text-red-500 text-sm" />
//                   Remove Completed
//                 </button>

//                 {/* Remove Obsolete Button */}
//                 <button
//                   onClick={handleRemoveObsoleteTasks}
//                   className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-700 text-sm font-medium px-4 py-1 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-amber-100 hover:border-amber-200"
//                 >
//                   <FaTrashAlt className="text-amber-500 text-sm" />
//                   Remove Obsolete
//                 </button>
//               </>
//             )}
//           </div>
//         </div>

//         <TaskList
//           refreshTrigger={refreshTrigger}
//           onEdit={handleEdit}
//           setTaskListExternally={setTasks}
//           tasksOverride={tasks}
//           hideCompleted={hideCompleted}
//           hideObsolete={true}
//         />

//         <div className="flex items-center justify-center">
//           {showForm && (
//           <TaskFormModal
//             onClose={() => setShowForm(false)}
//             onSave={handleSaveTask}
//             initialData={editingTask}
//           />
//         )}
//         </div>
//       </div>
    
//     </>
//   );
// };

// // Tasks.jsx
// export default AllTasks;

import React, { useState, useEffect } from "react";
import TaskFormModal from "../Components/Tasks/TaskFormModal";
import TaskList from "../Components/Tasks/TaskList";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);

  const dispatch = useDispatch();
  const role = localStorage.getItem("role") || "user"; // Default to 'user' if not set
  const navigate = useNavigate();

  // Create Task Click Handler
  const handleCreateClick = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  // Save Task Handler
  const handleSaveTask = (taskData) => {
    setShowForm(false);
    setRefreshTrigger((prev) => !prev); // ✅ This will tell TaskList to refetch
  };

  // Edit Task Handler
  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Remove Completed Tasks Handler
  const handleRemoveCompletedTasks = async () => {
    try {
      const response = await fetch(
        "https://taskbe.sharda.co.in/api/tasks/hide-completed",
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
      setRefreshTrigger((prev) => !prev);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Something went wrong",
      });
    }
  };

  // Remove Obsolete Tasks Handler
  const handleRemoveObsoleteTasks = async () => {
    try {
      const response = await fetch(
        "https://taskbe.sharda.co.in/api/tasks/hide-obsolete",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to remove obsolete tasks");
      }
      Swal.fire({
        icon: "success",
        title: "Obsolete Tasks Removed",
        timer: 1500,
        showConfirmButton: false,
      });
      setRefreshTrigger((prev) => !prev);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Something went wrong",
      });
    }
  };

  // Added keydown event listener for Alt + N shortcut to trigger task creation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check for Alt + T (both lowercase and uppercase)
      if (e.altKey && (e.key === "t" || e.key === "T")) {
        e.preventDefault(); // Prevent default behavior for Alt + T
        handleCreateClick(); // Trigger the task creation form
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    // Cleanup the event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []); // Empty dependency array to run the effect only once

  return (
    <div className="w-full min-h-screen bg-white font-inter">
      {/* Header Section */}
      <div className="w-full   px-4 sm:px-6  pt-4 pb-2 border-none bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            Task Manager
          </h1>

          <div className="flex items-center gap-3">
            {/* Create Task Button with Tooltip */}
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-cyan-500/50"
              title="Shortcut: Alt + T" // Tooltip showing the shortcut key
            >
              <span className="text-white text-lg">＋</span>
              Create Task
            </button>

            {role === "admin" && (
              <>
                {/* Remove Completed Button */}
                <button
                  onClick={handleRemoveCompletedTasks}
                  className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50"
                >
                  <FaTrashAlt className="text-red-500 text-sm" />
                  Remove Completed
                </button>

                {/* Remove Obsolete Button */}
                <button
                  onClick={handleRemoveObsoleteTasks}
                  className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-amber-600 border border-amber-200 hover:bg-amber-50"
                >
                  <FaTrashAlt className="text-amber-500 text-sm" />
                  Remove Obsolete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full px-4 sm:px-6    bg-white">
        <div className="w-full ">
          <TaskList
            refreshTrigger={refreshTrigger}
            onEdit={handleEdit}
            setTaskListExternally={setTasks}
            tasksOverride={tasks}
            hideCompleted={hideCompleted}
            hideObsolete={true}
          />
        
          
        </div>

        {/* Modal Form for Task */}
        <div className="flex items-center justify-center">
          {showForm && (
            <TaskFormModal
              onClose={() => setShowForm(false)}
              onSave={handleSaveTask}
              initialData={editingTask}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTasks;