import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../utils/secureAxios"; // Assuming this is your custom axios instance for secure requests

// 🔁 Thunk to fetch clients
export const fetchClients = createAsyncThunk(
  "clients/fetchClients",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/clients"); // Assuming this is the correct API endpoint
      const data = res.data;

      // Format data before returning it
      const formattedClients = Array.isArray(data)
        ? data.map((client) => ({
            id: client._id,
            name: client.name,
            contactPerson: client.contactPerson || "-",
            businessName: client.businessName || "-",
          }))
        : [];

      return formattedClients;
    } catch (err) {
      console.error("Failed to fetch clients", err);
      // Use rejectWithValue to return a custom error message
      return rejectWithValue("Failed to load clients. Please try again.");
    }
  }
);

const clientSlice = createSlice({
  name: "clients",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload; // Set the fetched clients
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set the error from rejectWithValue
      });
  },
});

export default clientSlice.reducer;
