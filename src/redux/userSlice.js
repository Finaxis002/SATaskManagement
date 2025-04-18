import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk to fetch users from API
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("https://sataskmanagementbackend.onrender.com/api/employees");
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch users");
    }
  }
);

// Thunk to delete user
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`https://sataskmanagementbackend.onrender.com/api/employees/${id}`);
      return id; // Return ID to remove it from the list
    } catch (error) {
      return rejectWithValue("Failed to delete user");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    loading: false,
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteUser
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
