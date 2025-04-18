import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch messages for a group
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (group) => {
    const response = await axios.get(
      `http://localhost:5000/api/messages/${group}`
    );
    return response.data;
  }
);

// Async thunk to send a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message) => {
    const response = await axios.post(
      `http://localhost:5000/api/messages/${message.group}`,
      message
    );
    return response.data;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    selectedGroup: 'Marketing',
  },
  reducers: {
    setSelectedGroup: (state, action) => {
      state.selectedGroup = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const { setSelectedGroup } = chatSlice.actions;
export default chatSlice.reducer;
