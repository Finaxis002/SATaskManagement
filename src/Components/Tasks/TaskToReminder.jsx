import React, { useEffect } from "react";
import { parseISO, isToday, isBefore, isTomorrow } from "date-fns";

// Function to map tasks to reminders
const TaskToReminder = ({ tasks, setReminders }) => {
  useEffect(() => {
    // Categorize tasks into Today, Later, or Overdue
    const categorizedReminders = {
      today: [],
      later: [],
      overdue: [],
    };

    tasks.forEach((task) => {
      const parsedDate = parseISO(task.dueDate);
      if (isToday(parsedDate)) {
        categorizedReminders.today.push(task);
      } else if (isBefore(parsedDate, new Date())) {
        categorizedReminders.overdue.push(task);
      } else if (isTomorrow(parsedDate) || isBefore(parsedDate, new Date())) {
        categorizedReminders.later.push(task);
      }
    });

    // Set reminders based on categorized tasks
    setReminders(categorizedReminders);
  }, [tasks, setReminders]);

  return null; // This component doesn't render anything itself.
};

export default TaskToReminder;
