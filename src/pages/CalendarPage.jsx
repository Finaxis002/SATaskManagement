import React, { useEffect, useState } from "react";
import { FaCalendar, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetch("https://sataskmanagementbackend.onrender.com/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        const userEmail = localStorage.getItem("userId");
        const userRole = localStorage.getItem("role");

        const visibleTasks = userRole === "admin"
          ? data
          : data.filter(task =>
              task.assignees.some(a => a.email === userEmail) ||
              task.assignedBy?.email === userEmail
            );

        setTasks(generateRepetitiveTasks(visibleTasks));
      });
  }, []);

  // Generate repetitive dates (e.g., monthly)
  const generateRepetitiveTasks = (taskList) => {
    const extendedTasks = [];
    const current = new Date();
    const futureMonths = 6;
    const futureDays = 30; // for daily repetition
  
    taskList.forEach(task => {
      const baseDate = new Date(task.assignedDate);
  
      if (task.isRepetitive) {
        switch (task.repeatType) {
          case "Daily":
            for (let i = 0; i < futureDays; i++) {
              const nextDate = new Date(baseDate);
              nextDate.setDate(nextDate.getDate() + i);
              extendedTasks.push({
                ...task,
                dueDate: nextDate.toISOString(),
              });
            }
            break;
  
          case "Monthly":
            for (let i = 0; i < futureMonths; i++) {
              const repeatDay = task.repeatDay || baseDate.getDate();
              const nextDate = new Date(baseDate);
              nextDate.setMonth(nextDate.getMonth() + i);
              nextDate.setDate(repeatDay);
  
              // Prevent invalid dates (e.g., Feb 30)
              if (nextDate.getMonth() === (baseDate.getMonth() + i) % 12) {
                extendedTasks.push({
                  ...task,
                  dueDate: nextDate.toISOString(),
                });
              }
            }
            break;
  
          case "Quarterly":
            for (let i = 0; i < futureMonths; i += 3) {
              const repeatDay = task.repeatDay || baseDate.getDate();
              const nextDate = new Date(baseDate);
              nextDate.setMonth(nextDate.getMonth() + i);
              nextDate.setDate(repeatDay);
  
              if (nextDate.getMonth() === (baseDate.getMonth() + i) % 12) {
                extendedTasks.push({
                  ...task,
                  dueDate: nextDate.toISOString(),
                });
              }
            }
            break;
  
          case "Every 6 Months":
            for (let i = 0; i <= 6; i += 6) {
              const repeatDay = task.repeatDay || baseDate.getDate();
              const nextDate = new Date(baseDate);
              nextDate.setMonth(nextDate.getMonth() + i);
              nextDate.setDate(repeatDay);
  
              if (nextDate.getMonth() === (baseDate.getMonth() + i) % 12) {
                extendedTasks.push({
                  ...task,
                  dueDate: nextDate.toISOString(),
                });
              }
            }
            break;
  
          case "Annually":
            const repeatDay = task.repeatDay || baseDate.getDate();
            const repeatMonth = task.repeatMonth || (baseDate.getMonth() + 1); // 1-based
            const nextDate = new Date(current.getFullYear(), repeatMonth - 1, repeatDay);
            extendedTasks.push({
              ...task,
              dueDate: nextDate.toISOString(),
            });
            break;
  
          default:
            extendedTasks.push(task);
        }
      } else {
        extendedTasks.push(task);
      }
    });
  
    return extendedTasks;
  };
  

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getTasksForDay = (day) => {
    const date = new Date(currentMonth);
    date.setDate(day);
    const dateString = date.toDateString();
    
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate).toDateString();
      return taskDate === dateString;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    const today = new Date();

    // Create array of day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Create array of days to render (including empty cells for days before the 1st)
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null); // Empty cells for days before the 1st
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div className="bg-white rounded-lg shadow ">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-2 bg-purple-500 text-white">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-full hover:bg-indigo-700"
          >
            <FaChevronLeft />
          </button>
          <h2 className="text-lg font-semibold">{monthName}</h2>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 rounded-full hover:bg-blue-700"
          >
            <FaChevronRight />
          </button>
        </div>
        <div className="overflow-auto h-[70vh]">
        

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 ">
          {dayNames.map(day => (
            <div key={day} className="bg-gray-100 py-2 text-center font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 ">
          {days.map((day, index) => {
            const isToday = day === today.getDate() && 
                           currentMonth.getMonth() === today.getMonth() && 
                           currentMonth.getFullYear() === today.getFullYear();
            const dayTasks = day ? getTasksForDay(day) : [];
            
            return (
              <div 
                key={index} 
                className={`min-h-24 bg-white p-1 ${isToday ? 'border-2 border-blue-500' : ''}`}
              >
                {day ? (
                  <>
                    <div className={`text-right p-1 rounded-full w-6 h-6 flex items-center justify-center ml-auto ${
                      isToday ? 'bg-blue-500 text-white' : ''
                    }`}>
                      {day}
                    </div>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-20">
                      {dayTasks.slice(0, 3).map((task, idx) => (
                        <div 
                          key={idx} 
                          className={`text-xs p-1 rounded truncate ${
                            task.status === 'Completed' ? 'bg-green-100' :
                            task.status === 'In Progress' ? 'bg-yellow-100' :
                            'bg-red-100'
                          }`}
                          title={`${task.taskName} (${task.status})`}
                        >
                          {task.taskName}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
        </div>
      </div>
    );
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Calendar */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <FaCalendar className="text-blue-600" /> Task Calendar
          </h2>
          {renderCalendar()}
        </div>

        {/* Sidebar */}
        {/* <div className="w-full lg:w-64 space-y-6">
          <div>
            <h3 className="font-semibold mb-3 text-lg">My Calendars</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Tasks</span>
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Finaxis</span>
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span>Birthdays</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-lg">Other Calendars</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Holidays</span>
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span>Events</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-sm text-gray-500">
            <p>Today: {new Date().toLocaleDateString()}</p>
            <p className="mt-2">Terms • Privacy</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default CalendarPage;