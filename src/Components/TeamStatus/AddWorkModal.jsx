import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AddWorkModal = ({ isOpen, onClose, refreshData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itEmployees, setItEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  // UI States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Form State
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assignTo: [] 
  });

  // Click Outside to Close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Data
  useEffect(() => {
    if (isOpen) {
      fetchITEmployees();
    }
  }, [isOpen]);

  const fetchITEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const { data } = await axios.get("https://taskbe.sharda.co.in/api/employees");
      
      const filtered = data.filter((user) => {
        if (!user.department) return false;
        const deptToCheck = user.department;
        
        const isIT = (val) => {
           if (!val) return false;
           const cleanVal = val.toString().trim().toLowerCase();
           return cleanVal === 'it' || 
                  cleanVal === 'it/software' || 
                  cleanVal === 'information technology' || 
                  cleanVal.includes('software') || 
                  cleanVal.includes('developer');
        };

        if (Array.isArray(deptToCheck)) {
          return deptToCheck.some(d => isIT(d));
        }
        return isIT(deptToCheck);
      });

      setItEmployees(filtered);

    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  if (!isOpen) return null;

  // Filter Logic
  const filteredList = itEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ FIXED SUBMIT - EK HI TASK BANEGA
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (taskData.assignTo.length === 0) {
        alert("Please assign the task to at least one person.");
        return;
    }
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      
      // ✅ Single API Call - backend multiple assignees handle karega
      await axios.post(
        'https://taskbe.sharda.co.in/api/workload/personal', 
        taskData, // { title, description, assignTo: ['Rahul', 'Amit', 'Priya'] }
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Task Assigned Successfully!");
      if (refreshData) refreshData();
      onClose();
      setTaskData({ title: '', description: '', assignTo: [] });
      setSearchTerm("");

    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Select / Deselect Handler
  const toggleEmployee = (name) => {
      setTaskData(prev => {
          const currentAssignees = prev.assignTo;
          if (currentAssignees.includes(name)) {
              return { ...prev, assignTo: currentAssignees.filter(emp => emp !== name) };
          } else {
              setSearchTerm(""); 
              return { ...prev, assignTo: [...currentAssignees, name] };
          }
      });
      inputRef.current.focus();
  };

  const removeTag = (name) => {
      setTaskData(prev => ({
          ...prev,
          assignTo: prev.assignTo.filter(emp => emp !== name)
      }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && searchTerm === '' && taskData.assignTo.length > 0) {
        const lastPerson = taskData.assignTo[taskData.assignTo.length - 1];
        removeTag(lastPerson);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-xl relative">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Add New Task</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          
          {/* Task Title */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              placeholder="Enter task title"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={taskData.title}
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
            />
          </div>

          {/* SMART COMBOBOX */}
          <div className="mb-5 relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To <span className="text-red-500">*</span>
            </label>
            
            {/* Main Input Container */}
            <div 
                className={`w-full px-2 py-2 min-h-[46px] border rounded-md cursor-text flex flex-wrap gap-2 items-center bg-white ${
                    isDropdownOpen ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-300'
                }`}
                onClick={() => {
                    inputRef.current.focus();
                    setIsDropdownOpen(true);
                }}
            >
                {/* Selected Tags */}
                {taskData.assignTo.map(name => (
                    <span key={name} className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-md flex items-center gap-1">
                        {name}
                        <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); removeTag(name); }}
                            className="text-blue-600 hover:text-blue-900 focus:outline-none hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center"
                        >
                            ×
                        </button>
                    </span>
                ))}

                {/* Search Input */}
                <input 
                    ref={inputRef}
                    type="text"
                    className="flex-1 min-w-[120px] outline-none text-gray-700 bg-transparent py-1"
                    placeholder={taskData.assignTo.length === 0 ? "Search & Select..." : ""}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onKeyDown={handleKeyDown}
                />
                
                {/* Arrow Icon */}
                <div className="text-gray-400 pr-1">
                   <svg className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Dropdown List */}
            {isDropdownOpen && !loadingEmployees && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                    {filteredList.length > 0 ? (
                        filteredList.map((emp) => {
                            const isSelected = taskData.assignTo.includes(emp.name);
                            return (
                                <div 
                                    key={emp._id} 
                                    onMouseDown={(e) => {
                                        e.preventDefault(); 
                                        toggleEmployee(emp.name);
                                    }}
                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-3 ${
                                        isSelected ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={isSelected} 
                                        readOnly 
                                        className="h-4 w-4 text-blue-600 rounded border-gray-300 pointer-events-none"
                                    />
                                    <div className="flex-1 flex justify-between">
                                        <span className={isSelected ? 'font-medium text-blue-700' : ''}>{emp.name}</span>
                                        <span className="text-xs text-gray-400">({emp.userId})</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            {searchTerm ? "No match found" : "No IT Employees Found"}
                        </div>
                    )}
                </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea 
              rows="4"
              placeholder="Add task details..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={taskData.description}
              onChange={(e) => setTaskData({...taskData, description: e.target.value})}
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-md font-medium transition-colors ${
                isSubmitting 
                  ? 'bg-blue-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkModal;