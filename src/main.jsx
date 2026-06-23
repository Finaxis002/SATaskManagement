import React, { useEffect } from "react"; // ✅ This fixes the 'React is not defined' error
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './css/font.css'
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux"; // ✅ Correct provider import
import { store } from "./redux/store.js";
import TaskReminderToasts from "./Components/TaskReminderToasts.jsx";
import CacheManager from "./utils/cacheManager.js";
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

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// Register only outside iOS. iOS had app launch issues with the previous service worker setup,
// and the Android share target is the only flow that needs this right now.
if (!isIOS && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js", { updateViaCache: "none" })
      .then((registration) => {
        registration.update();
      })
      .catch((error) => {
        console.error("Service Worker registration failed: ", error);
      });
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

// Initialize cache manager with current version
const initializeApp = () => {
  try {
    // Use window variable set by index.html, fallback to build-time variable
    // const currentVersion = window.APP_VERSION || import.meta.env.VITE_APP_VERSION || Date.now().toString();
    
    // Initialize CacheManager
    CacheManager.init();
    
    console.log(`🚀 Task Management ${window.APP_VERSION || 'v' + Date.now()}`);
    
    // Optional: Check server version periodically
    setInterval(() => {
      CacheManager.checkServerVersion().then(hasNewVersion => {
        if (hasNewVersion) {
          console.log('🔄 Server has newer version');
            CacheManager.forceRefresh();
        }
      });
    }, 5 * 60 * 1000);
    
  } catch (error) {
    console.error('❌ Error initializing app:', error);
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Add cache clear shortcut (Ctrl+Shift+C)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    if (confirm('Clear cache and reload application?')) {
      CacheManager.forceRefresh();
    }
  }
});

// createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <Provider store={store}>
//       {!isIOS && <TaskReminderToasts />}
//       <App />
//     </Provider>
//   </React.StrictMode>
// );

// Create root and render app
const root = createRoot(document.getElementById("root"));

try {
  root.render(
    <StrictMode>
      <Provider store={store}>
        {!isIOS && <TaskReminderToasts />}
        <App />
      </Provider>
    </StrictMode>
  );
} catch (error) {
  console.error('❌ Failed to render app:', error);
  
  // Show error to user
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center; color: #dc2626;">
      <h2>Application Error</h2>
      <p>Failed to load the application. Please refresh the page.</p>
      <button onclick="window.location.reload(true)" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Refresh Page
      </button>
      <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
        Version: ${__APP_VERSION__ || 'unknown'}
      </p>
    </div>
  `;
}
