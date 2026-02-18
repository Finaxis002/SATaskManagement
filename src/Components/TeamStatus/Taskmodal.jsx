import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TaskModal = ({ isOpen, onClose, work, refreshData, mode = 'add' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignTo: []
  });
  const [errors, setErrors] = useState({});
  const [itEmployees, setItEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const dropdownRef = useRef(null);

  const isEditMode = mode === 'edit' && work;

  // Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setTaskData({
          title: work.title || '',
          description: work.description || '',
          dueDate: work.dueDate ? new Date(work.dueDate).toISOString().split('T')[0] : '',
          // ✅ Backend se aane wale assigned users ko pre-fill kar rahe hain
          assignTo: work.assignedTo?.map(u => u.name) || []
        });
      } else {
        setTaskData({
          title: '',
          description: '',
          dueDate: '',
          assignTo: []
        });
      }
      setErrors({});
      setSearchTerm('');
      
      // ✅ CHANGE 1: Edit mode me bhi employees fetch hone chahiye taaki dropdown chal sake
      fetchITEmployees();
    }
  }, [isOpen, isEditMode, work]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!taskData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (taskData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (taskData.description && taskData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // ✅ CHANGE 2: Validation ab dono modes ke liye check karega
    if (taskData.assignTo.length === 0) {
      newErrors.assignTo = 'Please assign the task to at least one person';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      
      if (isEditMode) {
        // ✅ CHANGE 3: PUT request me bhi 'assignTo' bhejna padega
        await axios.put(
          `https://taskbe.sharda.co.in/api/workload/personal/${work._id}`, 
          {
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate,
            assignTo: taskData.assignTo // <-- Added this
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'https://taskbe.sharda.co.in/api/workload/personal', 
          taskData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      toast.success(
        <div className="flex items-center gap-2">
           <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span className="font-semibold text-gray-700">
            {isEditMode ? 'Task updated successfully!' : 'Task created successfully!'}
          </span>
        </div>
      );

      if (refreshData) refreshData();
      onClose();

    } catch (error) {
      console.error("Error:", error);
      
      toast.error(
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Failed. Please try again.</span>
        </div>
      );
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  const filteredList = itEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  };

  const removeTag = (name) => {
    setTaskData(prev => ({
      ...prev,
      assignTo: prev.assignTo.filter(emp => emp !== name)
    }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-3 sm:p-4 animate-fade-in">
        <div className="bg-white w-full max-w-2xl h-[80vh] flex flex-col rounded-xl sm:rounded-2xl shadow-2xl relative animate-slide-up my-auto">
          
          {/* Header */}
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isEditMode ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                      {isEditMode ? 'Edit Task' : 'Add New Task'}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                      {isEditMode ? 'Update your task details' : 'Create a new task for your team'}
                    </p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleClose} 
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 hover:bg-white/50 p-1.5 sm:p-2 rounded-lg transition-all disabled:opacity-50 flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex-1 overflow-y-auto">
            
            {/* Task Title */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g., Complete project documentation"
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.title 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                }`}
                value={taskData.title}
                onChange={(e) => {
                  setTaskData({...taskData, title: e.target.value});
                  if (errors.title) setErrors({...errors, title: ''});
                }}
              />
              {errors.title && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.title}
                </p>
              )}
              <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
                {taskData.title.length}/100 characters
              </p>
            </div>

            {/* ✅ CHANGE 4: Removed {!isEditMode} condition so it shows in both modes */}
            <div className="mb-4 sm:mb-5 md:mb-6" ref={dropdownRef}>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Assign To <span className="text-red-500">*</span>
              </label>
              
              <div 
                className={`w-full px-2 py-2 min-h-[46px] border-2 rounded-lg cursor-text flex flex-wrap gap-2 items-center bg-white ${
                  isDropdownOpen ? 'ring-2 ring-blue-500 border-transparent' : errors.assignTo ? 'border-red-300' : 'border-gray-200'
                }`}
                onClick={() => setIsDropdownOpen(true)}
              >
                {taskData.assignTo.map(name => (
                  <span key={name} className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-2 py-1 rounded-md flex items-center gap-1">
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

                <input 
                  type="text"
                  className="flex-1 min-w-[120px] outline-none text-sm sm:text-base bg-transparent py-1"
                  placeholder={taskData.assignTo.length === 0 ? "Search & Select..." : ""}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                />
                
                <div className="text-gray-400 pr-1">
                  <svg className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {errors.assignTo && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.assignTo}
                </p>
              )}

              {isDropdownOpen && !loadingEmployees && (
                <div className="relative mt-1">
                  <div className="absolute top-0 left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
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
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Description
              </label>
              <textarea 
                rows="4"
                placeholder="Add detailed information about the task..."
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl resize-none focus:outline-none focus:ring-2 transition-all ${
                  errors.description 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                }`}
                value={taskData.description}
                onChange={(e) => {
                  setTaskData({...taskData, description: e.target.value});
                  if (errors.description) setErrors({...errors, description: ''});
                }}
              ></textarea>
              {errors.description && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.description}
                </p>
              )}
              <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
                {taskData.description.length}/500 characters
              </p>
            </div>

            {/* Due Date */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Due Date
              </label>
              <input 
                type="date"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={taskData.dueDate}
                onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
              />
            </div>

            {/* Info Box */}
            <div className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
              <div className="flex gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-blue-900">Quick Tip</p>
                  <p className="text-[10px] sm:text-xs text-blue-700 mt-0.5 sm:mt-1">
                    {isEditMode 
                      ? 'Changes will be saved immediately and all team members will be notified.'
                      : 'Assign the task to one or more team members to get started.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-5 md:pt-6 border-t border-gray-200 mt-auto">
              <button 
                type="button" 
                onClick={handleClose} 
                className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base ${
                  isSubmitting 
                    ? 'bg-blue-400 text-white cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isEditMode ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
                    </svg>
                    <span className="hidden sm:inline">{isEditMode ? 'Update Task' : 'Add Task'}</span>
                    <span className="sm:hidden">{isEditMode ? 'Update' : 'Add'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @media (max-width: 640px) {
          ::-webkit-scrollbar {
            width: 4px;
          }
          ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 2px;
          }
        }
      `}</style>
    </>
  );
};

export default TaskModal;