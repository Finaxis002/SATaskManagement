import React from "react";
import TaskCard from "./TaskCard";

const TaskColumn = ({ column, columnIndex , handleOpenPopup}) => {
  return (
    <>
      {column.tasks.map((task, taskIndex) => (
       <TaskCard
       key={task._id}
       task={task}
       columnIndex={columnIndex}
       taskIndex={taskIndex}
       onEdit={handleOpenPopup}
     />     
      ))}
    </>
  );
};

export default TaskColumn;
