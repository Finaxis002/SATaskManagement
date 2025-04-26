import React from "react";
import { useDrag } from "react-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCheckCircle,
  faUser,
  faEdit,
} from "@fortawesome/free-regular-svg-icons";
import { format, isToday, isTomorrow } from "date-fns";
import { useDispatch } from "react-redux";
import { updateTaskCompletion } from "../redux/taskSlice";

const ItemTypes = {
  TASK: "task",
};

const TaskCard = ({ task, columnIndex, taskIndex, onEdit }) => {
  const dispatch = useDispatch();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { columnIndex, taskIndex, task },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getDisplayDate = (due) => {
    if (due === "Today" || due === "Tomorrow") return due;

    const parsedDate = new Date(due);
    if (isNaN(parsedDate.getTime())) return due;

    if (isToday(parsedDate)) return "Today";
    if (isTomorrow(parsedDate)) return "Tomorrow";

    return format(parsedDate, "MMM dd, yyyy");
  };

  return (
    <div
      ref={drag}
      className={`flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50 transition duration-150 ${
        task.completed ? "opacity-60" : ""
      } ${isDragging ? "bg-gray-200" : "bg-white"}`}
    >
      {/* Task Name */}
      <div className="w-1/4 text-sm font-medium text-gray-800 truncate">
        <span
          className={`${
            task.completed ? "line-through text-gray-500" : "text-gray-800"
          }`}
        >
          {task.name}
        </span>
      </div>

      {/* Due Date */}
      <div className="w-1/4 flex items-center text-sm text-gray-700">
        <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4 mr-2" />
        {getDisplayDate(task.due)}
      </div>

      {/* Assignee */}
      <div className="w-1/4 flex items-center text-sm text-gray-700">
        <FontAwesomeIcon icon={faUser} className="h-4 w-4 mr-2" />
        {task.assignee?.name || "Unassigned"}
      </div>

      {/* Action Buttons */}
      <div className="w-1/4 flex justify-end gap-3">
        <FontAwesomeIcon
          icon={faEdit}
          onClick={() => onEdit(columnIndex, task)} // ✅ Pass both
          className="h-5 w-5 cursor-pointer text-blue-500 hover:text-blue-600"
          title="Edit Task"
        />

        <FontAwesomeIcon
          icon={faCheckCircle}
          onClick={() =>
            dispatch(
              updateTaskCompletion({
                taskId: task._id,
                completed: !task.completed,
              })
            )
          }
          className={`h-5 w-5 cursor-pointer transition duration-150 ${
            task.completed
              ? "text-green-500"
              : "text-gray-400 hover:text-green-500"
          }`}
          title="Mark Complete"
        />
      </div>
    </div>
  );
};

export default TaskCard;
