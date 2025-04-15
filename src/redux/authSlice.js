import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: localStorage.getItem("name") || "",
  role: localStorage.getItem("role") || "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.name = action.payload.name;
      state.role = action.payload.role;
    },
    logout: (state) => {
      state.name = "";
      state.role = "";
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
