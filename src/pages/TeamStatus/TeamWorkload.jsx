import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AddWorkModal from './AddWorkModal'; // Make sure ye file same folder me ho

const TeamWorkload = () => {
  const [myWorks, setMyWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Pending'); // 'Pending' or 'Completed'

  // ✅ 1. Data Fetch Function
  const fetchMyWork = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      
      // API call to get personal tasks
      const response = await axios.get(
        `https://taskbe.sharda.co.in/api/workload/personal?status=${filterStatus}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMyWorks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error); // ✅ Fixed: Used 'error' variable
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  // Initial Load
  useEffect(() => {
    fetchMyWork();
  }, [fetchMyWork]);

  // ✅ 2. Delete Task Function
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`https://taskbe.sharda.co.in/api/workload/personal/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh list after delete
      fetchMyWork(); 
    } catch (error) {
      console.error("Delete Error:", error); // ✅ Fixed: Used 'error' variable
      alert("Error deleting task. Please try again.");
    }
  };

  // ✅ 3. Mark as Completed Function
  const handleComplete = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.patch(`https://taskbe.sharda.co.in/api/workload/personal/${id}`, 
        { status: 'Completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh list after update
      fetchMyWork(); 
    } catch (error) {
      console.error("Update Status Error:", error); // ✅ Fixed: Used 'error' variable
      alert("Error updating status. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-8">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Work Board</h1>
          <p className="text-gray-500 mt-1">Manage your daily tasks & descriptions</p>
        </div>
        
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition flex items-center gap-2 transform active:scale-95"
        >
          <span className="text-2xl font-bold leading-none mb-1">+</span> Add New Work
        </button>
      </div>

      {/* --- Filters (Tabs) --- */}
      <div className="flex gap-6 mb-6 border-b border-gray-200">
        <button 
          className={`pb-3 px-2 font-medium transition-colors relative ${
            filterStatus === 'Pending' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setFilterStatus('Pending')}
        >
          Pending Tasks
        </button>
        <button 
          className={`pb-3 px-2 font-medium transition-colors relative ${
            filterStatus === 'Completed' 
              ? 'text-green-600 border-b-2 border-green-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setFilterStatus('Completed')}
        >
          Completed History
        </button>
      </div>

      {/* --- Task List Area --- */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your tasks...</p>
          </div>
        ) : myWorks.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <h3 className="text-xl font-medium text-gray-600">No {filterStatus.toLowerCase()} tasks found</h3>
            <p className="text-gray-400 mt-2">
              {filterStatus === 'Pending' 
                ? 'Time to relax or add some new work!' 
                : 'You haven\'t completed any tasks yet.'}
            </p>
          </div>
        ) : (
          myWorks.map((work) => (
            <div 
              key={work._id} 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                
                {/* Content Left Side */}
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-3 mb-3">
                    <h3 className={`text-xl font-semibold ${work.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {work.title}
                    </h3>
                    
                    {/* Priority Badge */}
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                      work.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                      work.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {work.priority}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                      {work.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-4 text-sm text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>Due: {new Date(work.dueDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                {/* Actions Buttons (Right Side) */}
                <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-2 md:mt-0">
                  {work.status !== 'Completed' && (
                    <button 
                      onClick={() => handleComplete(work._id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 border border-green-200 transition text-sm font-medium"
                    >
                      ✓ Mark Done
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleDelete(work._id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 border border-red-200 transition text-sm font-medium"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- Modal Component --- */}
      <AddWorkModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        refreshData={fetchMyWork} 
      />
    </div>
  );
};

export default TeamWorkload;