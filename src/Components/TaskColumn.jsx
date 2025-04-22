import React from "react";
import TaskCard from "./TaskCard";

const TaskColumn = ({ column, columnIndex }) => {
  return (
    <>
      {column.tasks.map((task, taskIndex) => (
        <TaskCard
          key={task._id}
          task={task}
          columnIndex={columnIndex}
          taskIndex={taskIndex}
        />
      ))}
    </>
  );
};

export default TaskColumn;
