// frontend/src/utils/cacheManager.js
class CacheManager {
  static VERSION_KEY = 'app_cache_version';
  static BUILD_TIME_KEY = 'app_build_time';

  // Initialize cache version
  static init() {
    // FIXED: Use window.APP_VERSION instead of __APP_VERSION__
    const currentVersion = window.APP_VERSION || 'v' + Date.now();
    const storedVersion = localStorage.getItem(this.VERSION_KEY);
    
    if (storedVersion !== currentVersion) {
      console.log(`🔄 New version detected: ${currentVersion}`);
      this.clearAllCaches();
      localStorage.setItem(this.VERSION_KEY, currentVersion);
      localStorage.setItem(this.BUILD_TIME_KEY, window.BUILD_TIMESTAMP || new Date().toISOString());
      
      // Optional: Show notification to user
      if (storedVersion) {
        this.showUpdateNotification();
      }
    }
  }

  // Clear all caches
  static async clearAllCaches() {
    try {
      // Clear Service Worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Clear localStorage (optional)
      // localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear IndexedDB (if used)
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        databases.forEach(db => {
          if (db.name) indexedDB.deleteDatabase(db.name);
        });
      }

      console.log('✅ All caches cleared for new version');
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
    }
  }

  // Show update notification
  static showUpdateNotification() {
    if (window.showUpdateNotification) {
      window.showUpdateNotification();
    } else {
      // Fallback: console message
      console.log('🔄 A new version is available. Page will reload.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  // Force refresh for users
  static forceRefresh() {
    // Clear caches and reload
    this.clearAllCaches().then(() => {
      window.location.href = window.location.href + '?v=' + Date.now();
    });
  }

  // Check version from server
  static async checkServerVersion() {
    try {
      const response = await fetch('/version', { cache: 'no-store' });
      const serverVersion = await response.text();
      const localVersion = localStorage.getItem(this.VERSION_KEY);
      
      if (serverVersion && localVersion && serverVersion !== localVersion) {
        console.log('🔄 Server has newer version:', serverVersion);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

export default CacheManager;