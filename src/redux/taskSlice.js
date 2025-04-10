// src/redux/taskSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  taskColumns: [
    {
      title: 'Recently assigned',
      tasks: [
        { name: 'Nexa Report', due: 'Monday' },
        { name: 'New Task', due: 'Today' },
        { name: 'Schedule kickoff meeting', due: 'Today – Apr 14' },
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
  },
});

export const { addTaskToColumn } = taskSlice.actions;
export default taskSlice.reducer;
