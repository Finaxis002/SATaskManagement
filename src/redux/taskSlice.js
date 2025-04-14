// src/redux/taskSlice.js
import { createSlice } from "@reduxjs/toolkit";

const savedTasks = localStorage.getItem("taskColumn");

const initialState = {
  taskColumns: savedTasks
    ? JSON.parse(savedTasks)
    : [
        {
          title: "Recently assigned",
          tasks: [
            { name: "Nexa Report", due: "Monday", completed: false },
            { name: "New Task", due: "Today", completed: false },
            {
              name: "Schedule kickoff meeting",
              due: "Today – Apr 14",
              completed: false,
            },
          ],
        },
        { title: "Do today", tasks: [] },
        { title: "Do next week", tasks: [] },
        { title: "Do later", tasks: [] },
      ],

  // taskColumns: [
  //   {
  //     title: 'Recently assigned',
  //     tasks: [
  //       { name: 'Nexa Report', due: 'Monday' , completed: false },
  //       { name: 'New Task', due: 'Today' ,completed: false },
  //       { name: 'Schedule kickoff meeting', due: 'Today – Apr 14' , completed: false },
  //     ],
  //   },
  //   { title: 'Do today', tasks: [] },
  //   { title: 'Do next week', tasks: [] },
  //   { title: 'Do later', tasks: [] },
  // ],
};

const saveToLocalStorage = (state) => {
  localStorage.setItem("taskColumns", JSON.stringify(state.taskColumns));
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTaskToColumn: (state, action) => {
      const { columnIndex, task } = action.payload;
      state.taskColumns[columnIndex].tasks.push(task);
      saveToLocalStorage(state); // ✅ Save after update
    },

    toggleTaskCompletion: (state, action) => {
      const { columnIndex, taskIndex } = action.payload;
      const task = state.taskColumns[columnIndex].tasks[taskIndex];
      task.completed = !task.completed;
      saveToLocalStorage(state); // ✅ Save after update
    },

    removeTaskFromColumn: (state, action) => {
      const { columnIndex, taskIndex } = action.payload;
      state.taskColumns[columnIndex].tasks.splice(taskIndex, 1);
      saveToLocalStorage(state); // ✅ Save after update
    },

    moveTaskToColumn: (state, action) => {
      const { fromColumnIndex, toColumnIndex, taskIndex, task } =
        action.payload;

      // Remove task from old column
      state.taskColumns[fromColumnIndex].tasks.splice(taskIndex, 1);

      // Add task to new column
      state.taskColumns[toColumnIndex].tasks.push(task);

      saveToLocalStorage(state); // ✅ Save after move
    },
  },
});

export const {
  addTaskToColumn,
  toggleTaskCompletion,
  removeTaskFromColumn,
  moveTaskToColumn,
} = taskSlice.actions;
export default taskSlice.reducer;
