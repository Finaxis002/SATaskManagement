
// // src/redux/taskSlice.js
// import { createSlice } from '@reduxjs/toolkit';
// import axios from 'axios';

// export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async () => {
//   const res = await axios.get("http://localhost:5000/api/tasks");
//   return res.data;
// }); 

// const initialState = {
//   taskColumns: [
//     {
//       title: 'Recently assigned',
//       tasks: [
//         { name: 'Nexa Report', due: 'Monday' , completed: false },
//         { name: 'New Task', due: 'Today' ,completed: false },
//         { name: 'Schedule kickoff meeting', due: 'Today – Apr 14' , completed: false },
//       ],
//     },
//     { title: 'Do today', tasks: [] },
//     { title: 'Do next week', tasks: [] },
//     { title: 'Do later', tasks: [] },
//   ],
// };

// const taskSlice = createSlice({
//   name: 'tasks',
//   initialState,
//   reducers: {
//     addTaskToColumn: (state, action) => {
//       const { columnIndex, task } = action.payload;
//       state.taskColumns[columnIndex].tasks.push(task);
//     },
//     toggleTaskCompletion: (state, action) => {
//       const { columnIndex, taskIndex } = action.payload;
//       const task = state.taskColumns[columnIndex].tasks[taskIndex];
//       task.completed = !task.completed;
//     },
//     removeTaskFromColumn: (state, action) => {
//       const { columnIndex, taskIndex } = action.payload;
//       state.taskColumns[columnIndex].tasks.splice(taskIndex, 1);
//     }
    
//   },
// });

// export const { addTaskToColumn , toggleTaskCompletion, removeTaskFromColumn} = taskSlice.actions;
// export default taskSlice.reducer;



//////////////////////////////////////////////////////////////////////////////////////////////

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 🔁 Fetch tasks from backend
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async () => {
  const res = await axios.get("http://localhost:5000/api/tasks");
  return res.data;
});

// 🔁 Fetch assignees (employees) from backend
export const fetchAssignees = createAsyncThunk("tasks/fetchAssignees", async () => {
  const res = await axios.get("http://localhost:5000/api/employees");
  return res.data;
});

const initialState = {
  taskColumns: [
    {
      title: 'Recently assigned',
      tasks: [
        { name: 'Nexa Report', due: 'Monday', completed: false },
        { name: 'New Task', due: 'Today', completed: false },
        { name: 'Schedule kickoff meeting', due: 'Today – Apr 14', completed: false },
      ],
    },
    { title: 'Do today', tasks: [] },
    { title: 'Do next week', tasks: [] },
    { title: 'Do later', tasks: [] },
  ],
  assignees: [],        // ✅ Store employee list
  selectedAssignee: {}, // optional: store currently selected assignee
  loading: false,

};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Add a task to a column
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

    // Remove a task from a column
    removeTaskFromColumn: (state, action) => {
      const { columnIndex, taskIndex } = action.payload;
      state.taskColumns[columnIndex].tasks.splice(taskIndex, 1);
    },

    // Optional: Set selected assignee globally
    setSelectedAssignee: (state, action) => {
      state.selectedAssignee = action.payload;
    }

  },

  extraReducers: (builder) => {
    builder

      // 📥 Fetching Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;

        const newColumns = [
          { title: 'Recently assigned', tasks: [] },
          { title: 'Do today', tasks: [] },
          { title: 'Do next week', tasks: [] },
          { title: 'Do later', tasks: [] },
        ];

        action.payload.forEach(task => {
          const index = newColumns.findIndex(col => col.title === task.column);
          if (index !== -1) {
            newColumns[index].tasks.push(task);
          }
        });

        state.taskColumns = newColumns;
      })

      // 📥 Fetching Assignees
      .addCase(fetchAssignees.fulfilled, (state, action) => {
        state.assignees = action.payload;
      });
  }
});

export const {
  addTaskToColumn,
  toggleTaskCompletion,
  removeTaskFromColumn,

  setSelectedAssignee
} = taskSlice.actions;


export default taskSlice.reducer;
