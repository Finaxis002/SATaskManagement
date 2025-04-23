import React from "react";

const TaskItem = React.memo(({ task, onEdit, onStatusChange }) => {
  return (
    <tr key={task._id} className="hover:bg-gray-100 transition duration-300 ease-in-out cursor-pointer border-b border-gray-200">
      <td className="py-4 px-6">{task.taskName}</td>
      {/* Render other task details here */}
      <td className="py-4 px-6">
        {/* Handle status rendering logic */}
        <span
          className={`py-1 px-3 rounded-full text-xs font-semibold ${
            task.status === "Completed"
              ? "bg-green-200 text-green-600"
              : task.status === "In Progress"
              ? "bg-yellow-200 text-yellow-600"
              : task.status === "To Do"
              ? "bg-blue-200 text-blue-600"
              : "bg-red-200 text-red-600"
          }`}
          onClick={() => onStatusChange(task._id, "Completed")} // Example
        >
          {task.status}
        </span>
      </td>
      <td className="py-4 px-6">
        <button
          onClick={() => onEdit(task)}
          className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-md focus:outline-none transition duration-300"
        >
          Edit
        </button>
      </td>
    </tr>
  );
});

export default TaskItem;
