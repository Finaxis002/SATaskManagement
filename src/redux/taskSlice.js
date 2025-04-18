
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 🔁 Fetch tasks from backend
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async () => {
  const res = await axios.get("https://sa-task-management-backend.vercel.app/api/tasks");
  return res.data;
});

// 🔁 Fetch assignees (employees) from backend
export const fetchAssignees = createAsyncThunk("tasks/fetchAssignees", async () => {
  const res = await axios.get("https://sa-task-management-backend.vercel.app/api/employees");
  return res.data;
});

// export const updateTaskCompletion = createAsyncThunk(
//   "tasks/updateTaskCompletion",
//   async ({ taskId, completed }) => {
//     const res = await axios.patch(`https://sa-task-management-backend.vercel.app/api/tasks/${taskId}`, {
//       completed
//     });
//     return res.data;
//   }
// );
export const updateTaskCompletion = createAsyncThunk(
  "tasks/updateTaskCompletion",
  async ({ taskId, completed }, { rejectWithValue }) => {
    try {
      // Get user data from localStorage using your exact keys
      const userName = localStorage.getItem('name') || 'Unknown';
      const userEmail = localStorage.getItem('userId') || 'unknown@example.com';
      
      const response = await axios.patch(
        `https://sa-task-management-backend.vercel.app/api/tasks/${taskId}`,
        { completed },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'X-User-Name': userName,
            'X-User-Email': userEmail
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

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
  name: 'tasks',
  initialState,
  reducers: {
    // Add a task to a column
    addTaskToColumn: (state, action) => {
      const { columnIndex, task } = action.payload;
      state.taskColumns[columnIndex].tasks.push(task);
    },

    // Toggle completed status
    toggleTaskCompletion: (state, action) => {
      const { columnIndex, taskIndex } = action.payload;
      const task = state.taskColumns[columnIndex].tasks[taskIndex];
      task.completed = !task.completed;
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
      })

      // .addCase(updateTaskCompletion.fulfilled, (state, action) => {
      //   const updatedTask = action.payload;

      //   for (let col of state.taskColumns) {
      //     const idx = col.tasks.findIndex(t => t._id === updatedTask._id);
      //     if (idx !== -1) {
      //       col.tasks[idx].completed = updatedTask.completed;
      //       break;
      //     }
      //   }
      // });
      .addCase(updateTaskCompletion.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTaskCompletion.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload;
        
        for (let col of state.taskColumns) {
          const idx = col.tasks.findIndex(t => t._id === updatedTask._id);
          if (idx !== -1) {
            col.tasks[idx] = updatedTask; // Replace entire task to get all updates
            break;
          }
        }
      })
      .addCase(updateTaskCompletion.rejected, (state, action) => {
        state.loading = false;
        console.error('Task update failed:', action.payload);
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
