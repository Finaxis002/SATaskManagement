import { useState, useEffect } from "react";
import bgImage from "../assets/bg.png"; // adjust path as needed

const AdminDashboard = () => {
  const adminTasks = [
    { title: "Assign tasks to users", date: "Today" },
    { title: "Review user performance", date: "Tomorrow" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
      </div>
      <div className="divide-y">
        {adminTasks.map((task, index) => (
          <div
            key={index}
            className="flex justify-between items-center px-6 py-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <input type="checkbox" className="accent-blue-600" />
              <span className="text-gray-800">{task.title}</span>
            </div>
            <span className="text-gray-500 text-sm">{task.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
