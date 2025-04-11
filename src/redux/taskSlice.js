// src/redux/taskSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  taskColumns: [
    {
      title: 'Recently assigned',
      tasks: [
        { name: 'Nexa Report', due: 'Monday' , completed: false },
        { name: 'New Task', due: 'Today' ,completed: false },
        { name: 'Schedule kickoff meeting', due: 'Today – Apr 14' , completed: false },
      ],
    },
    { title: 'Do today', tasks: [] },
    { title: 'Do next week', tasks: [] },
    { title: 'Do later', tasks: [] },
  ],
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTaskToColumn: (state, action) => {
      const { columnIndex, task } = action.payload;
      state.taskColumns[columnIndex].tasks.push(task);
    },
    toggleTaskCompletion: (state, action) => {
      const { columnIndex, taskIndex } = action.payload;
      const task = state.taskColumns[columnIndex].tasks[taskIndex];
      task.completed = !task.completed;
    },
    removeTaskFromColumn: (state, action) => {
      const { columnIndex, taskIndex } = action.payload;
      state.taskColumns[columnIndex].tasks.splice(taskIndex, 1);
    }
    
  },
});

export const { addTaskToColumn , toggleTaskCompletion, removeTaskFromColumn} = taskSlice.actions;
export default taskSlice.reducer;
