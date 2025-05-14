import React from "react"; // ✅ This fixes the 'React is not defined' error
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux"; // ✅ Correct provider import
import { store } from "./redux/store.js";
import TaskReminderToasts from "./Components/TaskReminderToasts.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <TaskReminderToasts />

      <App />
    </Provider>
  </React.StrictMode>
);
