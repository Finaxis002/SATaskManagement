import React, { useState } from 'react';
import axios from 'axios';

const AddWorkModal = ({ isOpen, onClose, refreshData }) => {
  // ✅ FIXED: Hooks MUST be called at the top, unconditionally
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    date: '',
    priority: 'Medium'
  });

  // Early return AFTER hooks
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      
      // ✅ API Call to Backend
      await axios.post(
        'https://taskbe.sharda.co.in/api/workload/personal', 
        taskData, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Success
      alert("Task Added Successfully!");
      
      // List ko refresh karein (agar parent ne function diya hai)
      if (refreshData) {
        refreshData();
      }

      onClose(); // Modal band karein
      
      // Form reset karein
      setTaskData({
        title: '',
        description: '',
        date: '',
        priority: 'Medium'
      });

    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 relative animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Add New Personal Task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input 
              type="text" 
              required
              placeholder="What work do you have?"
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={taskData.title}
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
            />
          </div>

          {/* Date & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input 
                type="date" 
                required
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={taskData.date}
                onChange={(e) => setTaskData({...taskData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-lg outline-none bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={taskData.priority}
                onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea 
              rows="3"
              placeholder="Add details..."
              className="w-full p-2 border border-gray-300 rounded-lg outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={taskData.description}
              onChange={(e) => setTaskData({...taskData, description: e.target.value})}
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-6 py-2 text-white rounded-lg transition shadow-md flex items-center gap-2
                ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Add Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkModal;