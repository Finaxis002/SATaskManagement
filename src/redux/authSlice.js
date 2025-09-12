import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: localStorage.getItem("name") || "",
  role: localStorage.getItem("role") || "",
  userId: localStorage.getItem("userId") || "",  // ✅ initialize
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.name = action.payload.name;
      state.role = action.payload.role;
      state.userId = action.payload.userId;

      localStorage.setItem("name", action.payload.name);
      localStorage.setItem("role", action.payload.role);
      localStorage.setItem("userId", action.payload.userId); // ✅ store it!
    },
    logout: (state) => {
      state.name = "";
      state.role = "";
      state.userId = "";
      localStorage.clear();
    },
  },
});


export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
