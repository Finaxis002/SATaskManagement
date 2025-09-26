import React, {useEffect} from "react"; // ✅ This fixes the 'React is not defined' error
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux"; // ✅ Correct provider import
import { store } from "./redux/store.js";
import TaskReminderToasts from "./Components/TaskReminderToasts.jsx";
// import { registerSW } from 'virtual:pwa-register'
import NotificationInitializer from "./Components/NotificationInitializer.jsx";

// ✅ optional: show update ready prompt
// registerSW({
//   onNeedRefresh() {
//     console.log('🔄 New content available — please refresh!')
//   },
//   onOfflineReady() {
//     console.log('✅ App ready to work offline')
//   },
// })



// // Register the service worker for offline support
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker
//     .register('/service-worker.js')
//     .then((registration) => {
//       console.log('Service Worker registered with scope: ', registration.scope);
//     })
//     .catch((error) => {
//       console.error('Service Worker registration failed: ', error);
//     });
// }



createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <TaskReminderToasts />
      <App />
    </Provider>
  </React.StrictMode>
);
