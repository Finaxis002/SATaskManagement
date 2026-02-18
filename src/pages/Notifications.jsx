
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FaClock } from "react-icons/fa";
import { MdUpdate } from "react-icons/md";
import { BsFillCircleFill } from "react-icons/bs";

// ===== Optimized API Setup =====
// const api = axios.create({
//   baseURL: "https://taskbe.sharda.co.in",
//   withCredentials: true,
// });

// api.interceptors.request.use((config) => {
//   const token =
//     localStorage.getItem("tokenLocal") || localStorage.getItem("authToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// ===== Optimized API Setup =====
const api = axios.create({
  baseURL: "https://taskbe.sharda.co.in",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("tokenLocal") || localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    
    // Try to decode token to get user info
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.name) {
        config.headers['x-user-name'] = payload.name;
      } else if (payload.email) {
        config.headers['x-user-name'] = payload.email.split('@')[0];
      }
    } catch (e) {
      console.log("Could not decode token for user info");
    }
  }
  
  // Also try to get from localStorage user object
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.name && !config.headers['x-user-name']) {
        config.headers['x-user-name'] = user.name;
      } else if (user.email && !config.headers['x-user-name']) {
        config.headers['x-user-name'] = user.email.split('@')[0];
      }
    }
  } catch (e) {
    console.log("Could not parse user from localStorage");
  }
  
  return config;
});

// Initialize socket outside component to prevent recreation
const socket = io("https://taskbe.sharda.co.in", {
  withCredentials: true,
});

// ===== Memoized NotificationItem with performance optimizations =====
// const NotificationItem = React.memo(
//   ({ notification, onMarkAsRead, selectedNotifications, toggleSelectNotification }) => {
//     const isUnread = !notification.read;

//     // Parse updatedBy once and memoize
//     const updaterInfo = useMemo(() => {
//       if (!notification.updatedBy) return null;
//       if (notification.updatedBy === "System") {
//         return { type: "system" };
//       }
//       try {
//         const updater =
//           typeof notification.updatedBy === "string"
//             ? JSON.parse(notification.updatedBy)
//             : notification.updatedBy;
//         return updater?.name ? { type: "user", name: updater.name } : null;
//       } catch {
//         return null;
//       }
//     }, [notification.updatedBy]);

//     // Memoize formatted date
//     const formattedDate = useMemo(() => {
//       return new Date(notification.createdAt).toLocaleString("en-IN", {
//         timeZone: "Asia/Kolkata",
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       });
//     }, [notification.createdAt]);

//     // Memoize details entries
//     const detailsEntries = useMemo(() => {
//       return notification.details && Object.keys(notification.details).length > 0
//         ? Object.entries(notification.details)
//         : null;
//     }, [notification.details]);

//     const handleCheckboxChange = useCallback(() => {
//       toggleSelectNotification(notification._id);
//     }, [toggleSelectNotification, notification._id]);

//     const handleMarkRead = useCallback(() => {
//       onMarkAsRead(notification._id);
//     }, [onMarkAsRead, notification._id]);

//     return (
//       <div
//         className={`relative group bg-white rounded-xl shadow-lg border transition-all hover:shadow-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center ${
//           isUnread ? "border-blue-400" : "border-gray-200"
//         }`}
//       >
//         {/* Checkbox */}
//         <div className="flex items-start sm:items-center">
//           <input
//             type="checkbox"
//             checked={selectedNotifications.includes(notification._id)}
//             onChange={handleCheckboxChange}
//             className="h-5 w-5 accent-blue-600"
//             aria-label="Select notification"
//           />
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 space-y-3">
//           <div className="flex flex-wrap items-center gap-3">
//             {isUnread && (
//               <BsFillCircleFill className="text-green-600 text-sm animate-pulse" aria-label="Unread" />
//             )}
//             <p className="text-lg font-semibold text-gray-800 break-words">
//               {notification.message}
//             </p>
//             {notification.priority && (
//               <span
//                 className={`px-3 py-0.5 text-xs font-semibold rounded-full capitalize ${
//                   notification.priority === "high"
//                     ? "bg-red-100 text-red-800"
//                     : notification.priority === "medium"
//                     ? "bg-yellow-100 text-yellow-800"
//                     : "bg-gray-100 text-gray-700"
//                 }`}
//               >
//                 Status: {notification.status}
//               </span>
//             )}
//           </div>

//           {updaterInfo && (
//             <p className="text-sm text-gray-500 italic flex items-center gap-1">
//               <MdUpdate className="text-gray-400" />
//               {updaterInfo.type === "system" ? "Updated by System" : `Updated by ${updaterInfo.name}`}
//             </p>
//           )}

//           {detailsEntries && (
//             <ul className="text-sm text-gray-700 inline-flex gap-2 flex-wrap">
//               {detailsEntries.map(([key, value]) => (
//                 <li
//                   key={key}
//                   className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-2xl"
//                 >
//                   <span className="font-medium capitalize">{key}:</span>{" "}
//                   {String(value)}
//                 </li>
//               ))}
//             </ul>
//           )}

//           <div className="text-xs text-gray-500 flex items-center gap-1">
//             <FaClock aria-hidden="true" />
//             <time dateTime={notification.createdAt}>{formattedDate}</time>
//           </div>
//         </div>

//         {/* Mark as Read Button */}
//         <div className="self-start sm:self-auto">
//           <button
//             onClick={handleMarkRead}
//             disabled={notification.read}
//             className={`text-sm font-medium px-5 py-2 rounded-lg transition-all border ${
//               notification.read
//                 ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
//                 : "bg-green-600 text-white border-green-600 hover:bg-green-700"
//             }`}
//             aria-label={notification.read ? "Already read" : "Mark as read"}
//           >
//             {notification.read ? "Read" : "Mark as Read"}
//           </button>
//         </div>
//       </div>
//     );
//   },
//   // Custom comparison function for better memoization
//   (prevProps, nextProps) => {
//     return (
//       prevProps.notification._id === nextProps.notification._id &&
//       prevProps.notification.read === nextProps.notification.read &&
//       prevProps.selectedNotifications.includes(prevProps.notification._id) ===
//         nextProps.selectedNotifications.includes(nextProps.notification._id)
//     );
//   }
// );

// ===== Memoized NotificationItem with performance optimizations =====
// ===== Memoized NotificationItem with performance optimizations =====
const NotificationItem = React.memo(
  ({ notification, onMarkAsRead, selectedNotifications, toggleSelectNotification }) => {
    const isUnread = !notification.read;

    // Memoize formatted date
    const formattedDate = useMemo(() => {
      return new Date(notification.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }, [notification.createdAt]);

    // FIX: Parse message with proper styling like in screenshot
    const renderNotificationContent = useMemo(() => {
      if (!notification.message) return null;
      
      const lines = notification.message.split('\n').filter(line => line.trim() !== '');
      
      return (
        <div className="space-y-2">
          {lines.map((line, index) => {
            // First line - Task name with bold
            if (index === 0) {
              return (
                <div key={index} className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-800">
                    {line}
                  </p>
                  {isUnread && (
                    <BsFillCircleFill className="text-green-600 text-xs animate-pulse" />
                  )}
                </div>
              );
            }
            
            // "Updated by" line - italic gray text
            if (line.toLowerCase().includes('updated by')) {
              return (
                <p key={index} className="text-sm text-gray-600 italic flex items-center gap-1">
                  <MdUpdate className="text-gray-400" />
                  {line}
                </p>
              );
            }
            
            // Change lines - blue background badges
            if (line.includes(':')) {
              const [field, value] = line.split(':');
              const fieldName = field.trim();
              const fieldValue = value ? value.trim() : '';
              
              // Special handling for different field types
              let bgColor = "bg-blue-50";
              let textColor = "text-blue-800";
              let borderColor = "border-blue-200";
              
              if (fieldName.includes("Status") || fieldName.includes("status")) {
                bgColor = "bg-green-50";
                textColor = "text-green-800";
                borderColor = "border-green-200";
              } else if (fieldName.includes("Department") || fieldName.includes("department")) {
                bgColor = "bg-purple-50";
                textColor = "text-purple-800";
                borderColor = "border-purple-200";
              } else if (fieldName.includes("Code") || fieldName.includes("code")) {
                bgColor = "bg-indigo-50";
                textColor = "text-indigo-800";
                borderColor = "border-indigo-200";
              }
              
              return (
                <div key={index} className={`inline-flex items-center ${bgColor} ${textColor} border ${borderColor} px-3 py-1.5 rounded-xl mr-2 mb-2`}>
                  <span className="font-medium capitalize mr-1">{fieldName}:</span>
                  <span>{fieldValue}</span>
                </div>
              );
            }
            
            // Default - regular text
            return (
              <p key={index} className="text-gray-700">
                {line}
              </p>
            );
          })}
        </div>
      );
    }, [notification.message, isUnread]);

    const handleCheckboxChange = useCallback(() => {
      toggleSelectNotification(notification._id);
    }, [toggleSelectNotification, notification._id]);

    const handleMarkRead = useCallback(() => {
      onMarkAsRead(notification._id);
    }, [onMarkAsRead, notification._id]);

    return (
      <div
        className={`relative group bg-white rounded-xl shadow-lg border transition-all hover:shadow-xl p-5 flex gap-4 ${
          isUnread ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'
        }`}
      >
        {/* Checkbox */}
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={selectedNotifications.includes(notification._id)}
            onChange={handleCheckboxChange}
            className="h-5 w-5 accent-blue-600 mt-1"
            aria-label="Select notification"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-3">
          {/* Notification Content */}
          {renderNotificationContent}
          
          {/* Date and Time */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <FaClock aria-hidden="true" />
              <time dateTime={notification.createdAt}>{formattedDate}</time>
            </div>
            
            {/* Mark as Read Button */}
            <button
              onClick={handleMarkRead}
              disabled={notification.read}
              className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-all ${
                notification.read
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
              aria-label={notification.read ? "Already read" : "Mark as read"}
            >
              {notification.read ? "✓ Read" : "Mark as Read"}
            </button>
          </div>
        </div>
      </div>
    );
  },
  // Custom comparison function for better memoization
  (prevProps, nextProps) => {
    return (
      prevProps.notification._id === nextProps.notification._id &&
      prevProps.notification.read === nextProps.notification.read &&
      prevProps.selectedNotifications.includes(prevProps.notification._id) ===
        nextProps.selectedNotifications.includes(nextProps.notification._id)
    );
  }
);

NotificationItem.displayName = "NotificationItem";

// ===== Memoized getUserContext outside component =====
const getUserContext = () => {
  const userStr = localStorage.getItem("user");
  let userObj = {};
  try {
    userObj = JSON.parse(userStr || "{}");
  } catch {
    console.error("Error parsing user data");
  }

  const token =
    localStorage.getItem("tokenLocal") || localStorage.getItem("authToken");
  let tokenPayload = {};
  try {
    tokenPayload = JSON.parse(atob((token || "").split(".")[1] || "{}"));
  } catch {
    console.error("Error parsing token");
  }

  const email =
    userObj.email || tokenPayload.email || localStorage.getItem("email");
  const mongoId = userObj._id || localStorage.getItem("userId");
  const shortId = tokenPayload.userId;

  return {
    role: localStorage.getItem("role") || userObj.role || tokenPayload.role,
    email,
    mongoId,
    shortId,
    allKeys: new Set([email, mongoId, shortId].filter(Boolean)),
  };
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [groupBy, setGroupBy] = useState("none");
  const [filters, setFilters] = useState({
    readStatus: "all",
    timeRange: "all",
    notificationType: "all",
    priority: "all",
  });
const [allNotifications, setAllNotifications] = useState([]);
  // Memoize user context - only computed once
  const userContext = useMemo(() => getUserContext(), []);
  const { role: userRole, email, allKeys } = userContext;

  const limit = 20;

  // ===== Optimized Handlers =====
  // const handleMarkAsRead = useCallback(
  //   async (id) => {
  //     try {
  //       await api.patch(`https://taskbe.sharda.co.in/api/notifications/${id}`, { read: true });

  //       setNotifications((prev) =>
  //         prev.map((notif) =>
  //           notif._id === id ? { ...notif, read: true } : notif
  //         )
  //       );

  //       setNotificationCount((prev) => Math.max(prev - 1, 0));
  //       setSelectedNotifications((prev) => prev.filter((item) => item !== id));

  //       socket.emit("notificationCountUpdated", {
  //         email:
  //           userRole === "admin" ? "admin" : localStorage.getItem("userId"),
  //       });
  //     } catch (error) {
  //       console.error("Error marking notification as read", error);
  //     }
  //   },
  //   [userRole]
  // );

//   const handleMarkAsRead = useCallback(
//   async (id) => {
//     try {
//       await api.patch(`http://localhost:1100/api/notifications/${id}`, { read: true });

//       // Update in allNotifications
//       setAllNotifications((prev) =>
//         prev.map((notif) =>
//           notif._id === id ? { ...notif, read: true } : notif
//         )
//       );

//       setNotificationCount((prev) => Math.max(prev - 1, 0));
//       setSelectedNotifications((prev) => prev.filter((item) => item !== id));

//       socket.emit("notificationCountUpdated", {
//         email:
//           userRole === "admin" ? "admin" : localStorage.getItem("userId"),
//       });
//     } catch (error) {
//       console.error("Error marking notification as read", error);
//     }
//   },
//   [userRole]
// );

const handleMarkAsRead = useCallback(
  async (id) => {
    try {
      await api.patch(`https://taskbe.sharda.co.in/api/notifications/${id}`, { read: true });

      // Update local state immediately for better UX
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );

      // Decrement count
      setNotificationCount(prev => Math.max(prev - 1, 0));
      setSelectedNotifications(prev => prev.filter(item => item !== id));

      // Emit socket event
      socket.emit("notificationCountUpdated", {
        email: userRole === "admin" ? "admin" : email,
        role: userRole
      });
    } catch (error) {
      console.error("❌ Error marking notification as read", error);
    }
  },
  [userRole, email]
);

//  const fetchNotifications = useCallback(async (pageNum = 1) => {
//   console.time('API fetch total');
//   setLoading(true);
  
//   try {
//     let response;
//     if (userRole === "admin") {
//       response = await api.get(`http://localhost:1100/api/notifications?page=${pageNum}&limit=10`);
//     } else {
//       if (!email) throw new Error("No email found");
//       response = await api.get(
//         `http://localhost:1100/api/notifications/${encodeURIComponent(email)}?page=${pageNum}&limit=10`
//       );
//     }

//     // DEBUG: Check what the server returns
//     console.log('API Response:', response.data);
    
//     // Extract data - server returns { data: [...], pagination: {...} }
//     let newNotifications = [];
//     if (response.data && response.data.data) {
//       newNotifications = response.data.data; // Array is inside data property
//     } else if (Array.isArray(response.data)) {
//       newNotifications = response.data; // Direct array
//     }
    
//     // Process for correct user
//     const filteredNotifications = newNotifications.filter((n) => {
//       if (userRole === "admin") {
//         return n.type === "admin";
//       }
//       if (userRole === "user") {
//         const recipientKey = n.recipientEmail || n.recipientId || n.recipient || n.userId;
//         return recipientKey && allKeys.has(String(recipientKey));
//       }
//       return false;
//     });
    
//     // Update state - append for pagination
//     setNotifications(prev => 
//       pageNum === 1 ? filteredNotifications : [...prev, ...filteredNotifications]
//     );
    
//     // Update unread count
//     const unreadCount = filteredNotifications.filter((n) => !n.read).length;
//     if (pageNum === 1) {
//       setNotificationCount(unreadCount);
//     } else {
//       setNotificationCount(prev => prev + unreadCount);
//     }
    
//     // Update hasMore based on pagination or array length
//     const pagination = response.data.pagination;
//     if (pagination) {
//       setHasMore(pageNum < pagination.totalPages);
//     } else {
//       setHasMore(filteredNotifications.length === 10);
//     }
    
//     console.timeEnd('API fetch total');
//     console.log(`Fetched ${filteredNotifications.length} notifications, hasMore: ${hasMore}`);
    
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//   } finally {
//     setLoading(false);
//   }
// }, [userRole, email, allKeys]);

// ✅ UPDATE: Fetch notifications with filters (new backend endpoint)
const fetchNotifications = useCallback(async (pageNum = 1, shouldReset = false) => {
  console.time('API fetch total');
  setLoading(true);
  
  try {
    // Build filter params
    const filterParams = {
      readStatus: filters.readStatus,
      timeRange: filters.timeRange,
      notificationType: filters.notificationType,
      priority: filters.priority,
    };
    
    if (searchQuery.trim()) {
      filterParams.search = searchQuery;
    }

    console.log('📡 Fetching notifications:', {
      email,
      role: userRole,
      page: pageNum,
      filters: filterParams
    });

    // ✅ FIX: Send role correctly
    const response = await api.get(`https://taskbe.sharda.co.in/api/notifications`, {
      params: {
        email: email,           // User's email
        role: userRole,          // "admin" or "user"
        page: pageNum,
        limit: 10,
        filters: JSON.stringify(filterParams)
      }
    });

    const newNotifications = response.data.data || [];
    const pagination = response.data.pagination;
    
    console.log('📥 Received:', {
      count: newNotifications.length,
      total: pagination?.total,
      unreadCount: pagination?.unreadCount,
      page: pageNum
    });
    
    // Update state
    if (shouldReset || pageNum === 1) {
      setNotifications(newNotifications);
    } else {
      setNotifications(prev => [...prev, ...newNotifications]);
    }
    
    setNotificationCount(pagination?.unreadCount || 0);
    setHasMore(pageNum < pagination?.totalPages);
    
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
  } finally {
    setLoading(false);
    console.timeEnd('API fetch total');
  }
}, [userRole, email, filters, searchQuery]);

useEffect(() => {
  console.log('🔄 Filters or search changed, resetting...');
  setPage(1);
  setNotifications([]);
  setHasMore(true);
  fetchNotifications(1, true);
}, [filters, searchQuery]);

// ✅ UPDATE: Load more when page changes
useEffect(() => {
  if (page > 1) {
    console.log('📄 Loading page:', page);
    fetchNotifications(page, false);
  }
}, [page]);

  // useEffect(() => {
  //   fetchNotifications(page);
  // }, [fetchNotifications, page]);

  useEffect(() => {
  console.log('🚀 Initial load');
  fetchNotifications(1, true);
}, []);
  // Optimized date normalization
  const normalizeDateString = useCallback((dateString) => {
    return dateString
      .split("/")
      .map((part, idx) => (idx < 2 ? String(parseInt(part, 10)) : part))
      .join("/");
  }, []);


  // SIMPLE WORKING FILTER LOGIC
// const filteredNotifications = useMemo(() => {
//   // Make sure we have data
//   if (!Array.isArray(notifications) || notifications.length === 0) {
//     return { "All Notifications": [] };
//   }

//   console.log('Current filters:', filters);
  
//   // Apply filters
//   let filtered = [...notifications]; // Start with all notifications

//   // 1. Filter by read status
//   if (filters.readStatus !== "all") {
//     filtered = filtered.filter(notif => 
//       filters.readStatus === "read" ? notif.read : !notif.read
//     );
//   }

//   // 2. Filter by notification type (task-created vs task-updated)
//   if (filters.notificationType !== "all") {
//     if (filters.notificationType === "task-created") {
//       filtered = filtered.filter(notif => 
//         notif.action === "task-created" || 
//         (notif.message && notif.message.toLowerCase().includes("created"))
//       );
//     } else if (filters.notificationType === "task-updated") {
//       filtered = filtered.filter(notif => 
//         notif.action === "task-updated" || 
//         (notif.message && notif.message.toLowerCase().includes("updated"))
//       );
//     }
//   }

//   // 3. Filter by time range
//   if (filters.timeRange !== "all") {
//     const now = new Date();
//     filtered = filtered.filter(notif => {
//       const notifDate = new Date(notif.createdAt);
//       const diffDays = Math.floor((now - notifDate) / (1000 * 60 * 60 * 24));
      
//       if (filters.timeRange === "today") return diffDays === 0;
//       if (filters.timeRange === "week") return diffDays <= 7;
//       if (filters.timeRange === "month") return diffDays <= 30;
//       return true;
//     });
//   }

//   // 4. Filter by priority
//   if (filters.priority !== "all") {
//     filtered = filtered.filter(notif => notif.priority === filters.priority);
//   }

//   // 5. Search filter
//   if (searchQuery) {
//     const query = searchQuery.toLowerCase();
//     filtered = filtered.filter(notif => 
//       (notif.message && notif.message.toLowerCase().includes(query)) ||
//       (notif.details && JSON.stringify(notif.details).toLowerCase().includes(query))
//     );
//   }

//   console.log('Filter results:', {
//     total: notifications.length,
//     filtered: filtered.length,
//     actions: filtered.map(n => n.action || 'none')
//   });

//   // Grouping
//   if (groupBy !== "none") {
//     const groups = {};
    
//     filtered.forEach(notif => {
//       let key = "other";
      
//       if (groupBy === "date") {
//         key = new Date(notif.createdAt).toLocaleDateString("en-GB");
//       } else if (groupBy === "type") {
//         key = notif.action || "other";
//       }
      
//       if (!groups[key]) groups[key] = [];
//       groups[key].push(notif);
//     });

//     // Sort date groups (newest first)
//     if (groupBy === "date") {
//       const sortedGroups = {};
//       Object.keys(groups)
//         .sort((a, b) => {
//           const dateA = new Date(a.split('/').reverse().join('-'));
//           const dateB = new Date(b.split('/').reverse().join('-'));
//           return dateB - dateA;
//         })
//         .forEach(key => {
//           sortedGroups[key] = groups[key];
//         });
//       return sortedGroups;
//     }

//     return groups;
//   }

//   return { "All Notifications": filtered };
// }, [notifications, filters, searchQuery, groupBy]);

// SIMPLE WORKING FILTER LOGIC
// ✅ SIMPLIFIED: Just use server-filtered data (no client-side filtering)
const filteredNotifications = useMemo(() => {
  console.log('🔍 Filter memo running. Notifications count:', notifications.length);
  
  // Make sure we have data
  if (!Array.isArray(notifications) || notifications.length === 0) {
    console.log('No notifications to display');
    return { "All Notifications": [] };
  }

  // Just use the notifications from server (already filtered)
  const filtered = [...notifications];

  console.log('Using', filtered.length, 'server-filtered notifications');

  // Only do grouping locally
  if (groupBy !== "none") {
    const groups = {};
    
    filtered.forEach(notif => {
      let key = "other";
      
      if (groupBy === "date") {
        key = new Date(notif.createdAt).toLocaleDateString("en-GB");
      } else if (groupBy === "type") {
        key = notif.action || "other";
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(notif);
    });

    // Sort date groups (newest first)
    if (groupBy === "date") {
      const sortedGroups = {};
      Object.keys(groups)
        .sort((a, b) => {
          const dateA = new Date(a.split('/').reverse().join('-'));
          const dateB = new Date(b.split('/').reverse().join('-'));
          return dateB - dateA;
        })
        .forEach(key => {
          sortedGroups[key] = groups[key];
        });
      return sortedGroups;
    }

    return groups;
  }

  return { "All Notifications": filtered };
}, [notifications, groupBy]); // Only depend on notifications and groupBy


// Update filter change handlers - remove page reset
const handleFilterChange = (filterType, value) => {
  setFilters(prev => ({
    ...prev,
    [filterType]: value
  }));
  // 🔥 REMOVED: setPage(1); - Don't reset page on filter change
};

// Update groupBy handler - remove page reset
const handleGroupByChange = (type) => {
  setGroupBy(type);
  // 🔥 REMOVED: setPage(1); - Don't reset page on group change
};
  // const handleMarkAllAsRead = useCallback(async () => {
  //   try {
  //     const unreadNotifications = notifications.filter((n) => !n.read);
  //     if (unreadNotifications.length === 0) return;

  //     // Batch update - more efficient
  //     await Promise.all(
  //       unreadNotifications.map((notif) =>
  //         api.patch(`http://localhost:1100/api/notifications/${notif._id}`, { read: true })
  //       )
  //     );

  //     setNotifications((prev) =>
  //       prev.map((notif) => ({ ...notif, read: true }))
  //     );
  //     setNotificationCount(0);
  //     setSelectedNotifications([]);

  //     socket.emit("notificationCountUpdated", {
  //       email: userRole === "admin" ? "admin" : localStorage.getItem("userId"),
  //     });
  //   } catch (error) {
  //     console.error("Error marking all notifications as read", error);
  //   }
  // }, [notifications, userRole]);

  // ✅ UPDATE: Mark all as read with filters
const handleMarkAllAsRead = useCallback(async () => {
  try {
    // Build filter object (same as fetch)
    const filterParams = {
      readStatus: "unread", // Only mark unread ones
      timeRange: filters.timeRange,
      notificationType: filters.notificationType,
      priority: filters.priority,
    };
    
    if (searchQuery.trim()) {
      filterParams.search = searchQuery;
    }

    console.log('📤 Mark all as read with filters:', filterParams);

    // Use the new mark-all-read endpoint
    await api.patch(`https://taskbe.sharda.co.in/api/notifications/mark-all-read`, {
      email: userRole === "admin" ? "admin" : email,
      role: userRole,
      filters: filterParams
    });

    // Refetch to update UI
    fetchNotifications(1, true);
    
    // Emit socket event
    socket.emit("notificationCountUpdated", {
      email: userRole === "admin" ? "admin" : email,
      role: userRole
    });
  } catch (error) {
    console.error("❌ Error marking all as read", error);
  }
}, [userRole, email, filters, searchQuery, fetchNotifications]);

  // const handleBulkMarkAsRead = useCallback(async () => {
  //   try {
  //     await Promise.all(
  //       selectedNotifications.map((id) =>
  //         api.patch(`http://localhost:1100/api/notifications/${id}`, { read: true })
  //       )
  //     );

  //     setNotifications((prev) =>
  //       prev.map((notif) =>
  //         selectedNotifications.includes(notif._id)
  //           ? { ...notif, read: true }
  //           : notif
  //       )
  //     );

  //     setNotificationCount((prev) =>
  //       Math.max(prev - selectedNotifications.length, 0)
  //     );
  //     setSelectedNotifications([]);

  //     socket.emit("notificationCountUpdated", {
  //       email: userRole === "admin" ? "admin" : localStorage.getItem("userId"),
  //     });
  //   } catch (error) {
  //     console.error("Error in bulk mark as read", error);
  //   }
  // }, [selectedNotifications, userRole]);

  const handleBulkMarkAsRead = useCallback(async () => {
  try {
    await Promise.all(
      selectedNotifications.map((id) =>
        api.patch(`https://taskbe.sharda.co.in/api/notifications/${id}`, { read: true })
      )
    );

    // Update all notifications
    setAllNotifications(prev =>
      prev.map((notif) =>
        selectedNotifications.includes(notif._id)
          ? { ...notif, read: true }
          : notif
      )
    );

    setNotificationCount(prev =>
      Math.max(prev - selectedNotifications.length, 0)
    );
    setSelectedNotifications([]);

    socket.emit("notificationCountUpdated", {
      email: userRole === "admin" ? "admin" : localStorage.getItem("userId"),
    });
  } catch (error) {
    console.error("Error in bulk mark as read", error);
  }
}, [selectedNotifications, userRole]);


  const toggleSelectNotification = useCallback((id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  // Throttled scroll handler for better performance
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
      if (
        scrollHeight - scrollTop <= clientHeight * 1.2 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    },
    [loading, hasMore]
  );

  // Debounced search input
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <div
      className="p-4 mx-auto h-[90vh] overflow-y-auto"
      onScroll={handleScroll}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          🔔 Notifications{" "}
          {notificationCount > 0 && `(${notificationCount} unread)`}
        </h2>

        <div className="relative w-full sm:w-100">
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 shadow-sm focus:border-blue-100 focus:ring-1 focus:ring-blue-300 focus:outline-none text-sm transition-all duration-300"
            aria-label="Search notifications"
          />
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllAsRead}
            disabled={notifications.every((n) => n.read)}
            className="text-sm font-medium px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Mark all notifications as read"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 mb-5">
        {/* Group By Section */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">Group by:</span>
          {["none", "date", "type"].map((type) => (
            <button
              key={type}
              onClick={() => setGroupBy(type)}
              className={`text-sm px-3 py-1 rounded-full border ${
                groupBy === type
                  ? "bg-blue-100 text-blue-600 border-blue-300"
                  : "bg-gray-100 text-gray-700 border-gray-200"
              } hover:bg-blue-50 transition`}
              aria-pressed={groupBy === type}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.readStatus}
            onChange={(e) =>
              setFilters({ ...filters, readStatus: e.target.value })
            }
            className="text-sm px-3 py-1 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
            aria-label="Filter by read status"
          >
            <option value="all">All Status</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>

          <select
            value={filters.timeRange}
            onChange={(e) =>
              setFilters({ ...filters, timeRange: e.target.value })
            }
            className="text-sm px-3 py-1 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
            aria-label="Filter by time range"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>

          <select
            value={filters.notificationType}
            onChange={(e) =>
              setFilters({ ...filters, notificationType: e.target.value })
            }
            className="text-sm px-3 py-1 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
            aria-label="Filter by notification type"
          >
            <option value="all">All Types</option>
            <option value="task-created">Task Created</option>
            <option value="task-updated">Task Updated</option>
          </select>
        </div>
      </div>

      {selectedNotifications.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {selectedNotifications.length} selected
          </span>
          <button
            onClick={handleBulkMarkAsRead}
            className="text-sm font-medium px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all"
          >
            Mark Selected as Read
          </button>
          <button
            onClick={() => setSelectedNotifications([])}
            className="text-sm font-medium px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* {loading && page === 1 ? (
        <div className="text-center text-sm text-gray-400" role="status" aria-live="polite">
          Loading notifications...
        </div>
      ) : (
        <div className="space-y-4 mb-5">
          {Object.keys(filteredNotifications).length === 0 ? (
            <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
              🎉 No notifications match your filters
            </div>
          ) : (
            Object.entries(filteredNotifications)
              .sort(([a], [b]) => {
                if (groupBy === "none") return 0;
                const toDate = (str) => {
                  const [d, m, y] = (str || "").split("/").map(Number);
                  return new Date(y, m - 1, d).getTime() || 0;
                };
                return toDate(b) - toDate(a);
              })
              .map(([group, groupNotifications]) => (
                <div key={group}>
                  {groupBy !== "none" && (
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 sticky top-0 bg-white py-2 z-10">
                      {group}
                    </h3>
                  )}
                  <div className="space-y-4">
                    {groupNotifications
                      .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      )
                      .map((notification) => (
                        <NotificationItem
                          key={notification._id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          selectedNotifications={selectedNotifications}
                          toggleSelectNotification={toggleSelectNotification}
                        />
                      ))}
                  </div>
                </div>
              ))
          )}
          {loading && page > 1 && (
            <div className="text-center text-sm text-gray-400 py-4" role="status" aria-live="polite">
              Loading more notifications...
            </div>
          )}
        </div>
      )} */}
      {loading && page === 1 ? (
  <div className="text-center text-sm text-gray-400" role="status" aria-live="polite">
    Loading notifications...
  </div>
) : (
  <div className="space-y-4 mb-5">
    {Object.keys(filteredNotifications).length === 0 ? (
      <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
        🎉 No notifications match your filters
      </div>
    ) : (
      Object.entries(filteredNotifications)
        .sort(([a], [b]) => {
          if (groupBy === "none") return 0;
          const toDate = (str) => {
            const [d, m, y] = (str || "").split("/").map(Number);
            return new Date(y, m - 1, d).getTime() || 0;
          };
          return toDate(b) - toDate(a);
        })
        .map(([group, groupNotifications]) => (
          <div key={group}>
            {groupBy !== "none" && (
              <h3 className="text-sm font-semibold text-gray-700 mb-2 sticky top-0 bg-white py-2 z-10">
                {group}
              </h3>
            )}
            <div className="space-y-4">
              {groupNotifications
                .sort(
                  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                )
                .map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    selectedNotifications={selectedNotifications}
                    toggleSelectNotification={toggleSelectNotification}
                  />
                ))}
            </div>
          </div>
        ))
    )}
    
    {/* Load More Section */}
    {/* {hasMore && (
      <div className="text-center pt-6">
        <button
          onClick={() => setPage(prev => prev + 1)}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Loading..." : `Load More (Page ${page + 1})`}
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Showing {notifications.length} notifications
        </p>
      </div>
    )}  */}
   
{hasMore && (
  <div className="text-center pt-6">
    <button
      onClick={() => setPage(prev => prev + 1)}
      disabled={loading}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      {loading ? "Loading..." : `Load More (Page ${page + 1})`}
    </button>
    <p className="text-sm text-gray-500 mt-2">
      Showing {notifications.length} of {Object.keys(filteredNotifications).length > 0 ? 
        (Object.values(filteredNotifications)[0]?.length || 0) : 0} filtered notifications
      {page > 1 && ` • Page ${page}`}
    </p>
  </div>
)}

{!hasMore && allNotifications.length > 0 && (
  <div className="text-center text-sm text-gray-400 py-4">
    All {allNotifications.length} notifications loaded
    {Object.keys(filteredNotifications).length > 0 && 
     Object.values(filteredNotifications)[0] && 
     ` • ${Object.values(filteredNotifications)[0].length} match current filters`}
  </div>
)}
    
    {!hasMore && notifications.length > 0 && (
      <div className="text-center text-sm text-gray-400 py-4">
        All notifications loaded
      </div>
    )}
  </div>
)}
    </div>
  );
};

export default Notifications;
