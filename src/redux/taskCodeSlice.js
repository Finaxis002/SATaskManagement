// src/redux/taskCodeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ✅ Thunk to fetch task codes
export const fetchTaskCodes = createAsyncThunk(
  "taskCodes/fetchTaskCodes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("https://taskbe.sharda.co.in/api/task-codes");
      if (!res.ok) throw new Error("Failed to fetch task codes");
      const data = await res.json();
      const uniqueCodes = [...new Set(data.map((code) => code.name))];
      return uniqueCodes;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const taskCodeSlice = createSlice({
  name: "taskCodes",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskCodes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskCodes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTaskCodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default taskCodeSlice.reducer;
