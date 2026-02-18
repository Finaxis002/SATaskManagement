import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import TaskModal from './Taskmodal';
import RemarkModal from './RemarkModal';

// ✅ FIX: Helper function to decode JWT Token locally
// Agar localStorage me data nahi mila, toh hum isse nikalenge
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

// ─── Notification Bell Component ──────────────────────────────────────────────
const NotificationBell = ({ token, userEmail, userRole, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [isOpen, setIsOpen]               = useState(false);
  const [loading, setLoading]             = useState(false);
  const panelRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        email:  userEmail,
        role:   userRole || 'user',
        userId: userId   || '',
        limit:  20,
        page:   1,
      });
      // ✅ Using Corrected API Route
     const { data } = await axios.get(
  `https://taskbe.sharda.co.in/api/worknotify?${params}`, 
  { headers: { Authorization: `Bearer ${token}` } }
);
      // Backend response structure handle karna (success: true wrapper)
      const notifList = data.notifications || data.data || [];
      const count = data.unreadCount !== undefined ? data.unreadCount : (data.pagination?.unreadCount || 0);

      setNotifications(notifList);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userEmail, userRole, userId, token]);

  // Fetch on mount + every 30 s
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await axios.patch(
        'https://taskbe.sharda.co.in/api/worknotify/mark-all-read',
        { email: userEmail, role: userRole || 'user', userId: userId || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); // Frontend logic updated for isRead
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const markOneRead = async (notif) => {
    if (notif.isRead) return; // Check backend field name (isRead usually)
    try {
      await axios.patch(
        `https://taskbe.sharda.co.in/api/worknotify/${notif._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev =>
        prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60_000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  // Icon colour by action type
  const actionMeta = (action) => {
    switch (action) {
      case 'task_created': case 'task-created':  return { bg: 'bg-blue-100',   text: 'text-blue-600',   icon: '➕' };
      case 'task_updated': case 'task-updated':  return { bg: 'bg-amber-100',  text: 'text-amber-600',  icon: '✏️' };
      case 'status_changed': case 'status-changed':return { bg: 'bg-teal-100',   text: 'text-teal-600',   icon: '🔄' };
      case 'remark_added': case 'remark-added':  return { bg: 'bg-purple-100', text: 'text-purple-600', icon: '💬' };
      default:              return { bg: 'bg-gray-100',   text: 'text-gray-600',   icon: '🔔' };
    }
  };

  return (
    <div className="relative flex-shrink-0" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(o => !o);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 sm:p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
        title="Notifications"
      >
        {/* Bell SVG */}
        <svg
          className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] overflow-hidden">
          
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-100 hover:text-white transition-colors font-medium underline underline-offset-2"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600" />
                <p className="text-xs text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">All caught up!</p>
                <p className="text-xs text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const meta = actionMeta(notif.type || notif.action); // Handle both field names
                const isRead = notif.isRead || notif.read; // Handle both field names
                return (
                  <div
                    key={notif._id}
                    onClick={() => markOneRead(notif)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                      !isRead ? 'bg-blue-50/60' : 'bg-white'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0 text-base`}>
                      {meta.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${!isRead ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                    </div>

                    {/* Unread dot */}
                    {!isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-center">
              <button
                onClick={fetchNotifications}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                ↻ Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// ─── Main TeamWorkload Component ──────────────────────────────────────────────
const TeamWorkload = () => {
  const [myWorks, setMyWorks]                       = useState([]);
  const [allWorks, setAllWorks]                     = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [isTaskModalOpen, setTaskModalOpen]         = useState(false);
  const [taskModalMode, setTaskModalMode]           = useState('add');
  const [isRemarkModalOpen, setRemarkModalOpen]     = useState(false);
  const [selectedWork, setSelectedWork]             = useState(null);
  const [filterStatus, setFilterStatus]             = useState('Pending');
  const [openStatusMenu, setOpenStatusMenu]         = useState(null);
  const [showAssignedUsersModal, setShowAssignedUsersModal] = useState(false);
  const [selectedAssignedUsers, setSelectedAssignedUsers]   = useState([]);

  // ── Auth info logic with Fallback ──────────────────────────────────────────
  const token = localStorage.getItem('authToken');
  
  // Try getting from storage first
  let storedEmail = localStorage.getItem('userEmail');
  let storedRole = localStorage.getItem('userRole');
  let storedUserId = localStorage.getItem('userId');

  // ✅ FIX: Decode token if localStorage is empty
  if (token && (!storedEmail || !storedRole || !storedUserId)) {
    const decoded = parseJwt(token);
    if (decoded) {
        if (!storedEmail) storedEmail = decoded.email;
        if (!storedRole)  storedRole = decoded.role;
        // Backend often sends _id, but frontend might expect userId
        if (!storedUserId) storedUserId = decoded._id || decoded.id;
        
        // Optional: Persist back to localStorage so we don't decode every time
        if(storedEmail) localStorage.setItem('userEmail', storedEmail);
        if(storedRole)  localStorage.setItem('userRole', storedRole);
        if(storedUserId) localStorage.setItem('userId', storedUserId);
    }
  }

  // Final variables to use
  const userEmail = storedEmail || '';
  const userRole = storedRole || 'user';
  const userId = storedUserId || '';

  console.log("Current User Data:", { token, userEmail, userRole, userId });

  const fetchMyWork = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'https://taskbe.sharda.co.in/api/workload/personal',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const allData = response.data;
      setAllWorks(allData);

      let filteredData = allData;
      if (filterStatus === 'Pending') {
        filteredData = allData.filter(t => t.status === 'Pending' || t.status === 'In Progress');
      } else if (filterStatus === 'Completed') {
        filteredData = allData.filter(t => t.status === 'Completed');
      }
      setMyWorks(filteredData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, token]);

  useEffect(() => { fetchMyWork(); }, [fetchMyWork]);

  useEffect(() => {
    const handleClickOutside = () => setOpenStatusMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(
        `https://taskbe.sharda.co.in/api/workload/personal/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyWork();
    } catch (error) {
      console.error('Delete Error:', error);
    }
  };

  // ✅ Frontend Fix: Method PUT karein aur URL ke end mein /status jodein
const handleStatusChange = async (id, newStatus) => {
  try {
    await axios.put(
      `https://taskbe.sharda.co.in/api/workload/personal/${id}/status`, // 👈 /status zaroori hai
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setOpenStatusMenu(null);
    fetchMyWork(); // Refresh list
  } catch (error) {
    console.error('Update Error:', error); // Ab ye 404 nahi dega
  }
};

  const handleEdit   = (work) => { setSelectedWork(work); setTaskModalMode('edit'); setTaskModalOpen(true); };
  const handleRemark = (work) => { setSelectedWork(work); setRemarkModalOpen(true); };

  const toggleStatusMenu = (e, workId) => {
    e.stopPropagation();
    setOpenStatusMenu(openStatusMenu === workId ? null : workId);
  };

  const handleShowAssignedUsers = (e, users) => {
    e.stopPropagation();
    setSelectedAssignedUsers(users);
    setShowAssignedUsersModal(true);
  };

  const getPriorityColor = (status) => {
    switch (status) {
      case 'Completed':  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':return 'bg-amber-50   text-amber-700   border-amber-200';
      default:           return 'bg-blue-50    text-blue-700    border-blue-200';
    }
  };

  const getCreatorName      = (work) => (work.createdBy     && typeof work.createdBy     !== 'string') ? work.createdBy.name     || null : null;
  const getStatusUpdaterName= (work) => (work.statusUpdatedBy && typeof work.statusUpdatedBy !== 'string') ? work.statusUpdatedBy.name || null : null;

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'Pending':    return { icon: '📋', text: 'To Do' };
      case 'In Progress':return { icon: '⏳', text: 'In Progress' };
      case 'Completed':  return { icon: '✅', text: 'Completed' };
      default:           return { icon: '📋', text: 'To Do' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Work Board</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                <span className="hidden xs:inline">Manage and track your team tasks</span>
                <span className="xs:hidden">Team Tasks</span>
              </p>
            </div>

            {/* Right buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

              {/* ── 🔔 Notification Bell ─────────────────────────────────── */}
              <NotificationBell
                token={token}
                userEmail={userEmail}
                userRole={userRole}
                userId={userId}
              />

              {/* New Task button */}
              <button
                onClick={() => { setSelectedWork(null); setTaskModalMode('add'); setTaskModalOpen(true); }}
                className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Task</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-200 shadow-sm w-full sm:w-auto sm:inline-flex">
            {['Pending', 'Completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`relative flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {status}
                {filterStatus === status && (
                  <span className="absolute inset-0 rounded-md ring-2 ring-blue-600 ring-opacity-50" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {[
            { label: 'Total Tasks',  value: allWorks.length,                                    color: 'blue',   icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'In Progress',  value: allWorks.filter(w => w.status === 'In Progress').length, color: 'amber',  icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Completed',    value: allWorks.filter(w => w.status === 'Completed').length,   color: 'emerald',icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', extra: 'sm:col-span-2 lg:col-span-1' },
          ].map(stat => (
            <div key={stat.label} className={`bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${stat.extra || ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-xl sm:text-2xl font-bold mt-1 text-${stat.color}-${stat.color === 'blue' ? '900' : '600'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-gray-200 border-t-blue-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full" />
              </div>
            </div>
            <p className="mt-4 text-xs sm:text-sm text-gray-600 font-medium">Loading tasks...</p>
          </div>
        ) : myWorks.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-3 sm:mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">No tasks found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 px-4">Get started by creating your first task</p>
            <button
              onClick={() => { setSelectedWork(null); setTaskModalMode('add'); setTaskModalOpen(true); }}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create New Task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myWorks.map(work => {
              const creatorName       = getCreatorName(work);
              const statusUpdaterName = getStatusUpdaterName(work);
              const statusInfo        = getStatusDisplay(work.status);

              return (
                <div
                  key={work._id}
                  className="group bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col gap-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                        {/* Avatars */}
                        {work.assignedTo?.length > 0 && (
                          <div
                            className="flex -space-x-1.5 sm:-space-x-2 cursor-pointer"
                            onClick={e => handleShowAssignedUsers(e, work.assignedTo)}
                          >
                            {work.assignedTo.slice(0, 3).map((person, idx) => (
                              <div
                                key={person._id || idx}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold border-2 border-white hover:z-10 transition-transform hover:scale-110 shadow-sm"
                              >
                                {person.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {work.assignedTo.length > 3 && (
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold border-2 border-white hover:z-10 transition-transform hover:scale-110 shadow-sm">
                                +{work.assignedTo.length - 3}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Status badge + dropdown */}
                        <div className="relative">
                          <button
                            onClick={e => toggleStatusMenu(e, work._id)}
                            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-full border whitespace-nowrap cursor-pointer hover:opacity-80 transition-all ${getPriorityColor(work.status)}`}
                          >
                            <span>{statusInfo.icon}</span>
                            <span className="hidden xs:inline">{statusInfo.text}</span>
                            <span className="xs:hidden">{statusInfo.text.split(' ')[0]}</span>
                            <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {openStatusMenu === work._id && (
                            <div className="absolute left-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                              {[
                                { label: 'To Do',       value: 'Pending',     icon: '📋' },
                                { label: 'In Progress', value: 'In Progress', icon: '⏳' },
                                { label: 'Completed',   value: 'Completed',   icon: '✅' },
                              ].map(s => (
                                <button
                                  key={s.value}
                                  onClick={e => { e.stopPropagation(); handleStatusChange(work._id, s.value); }}
                                  className={`flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                    work.status === s.value ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <span>{s.icon}</span>{s.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Remarks count */}
                        {work.remarks?.length > 0 && (
                          <span className="hidden xs:flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            💬 {work.remarks.length}
                          </span>
                        )}
                      </div>

                      {/* Mobile 3-dot menu */}
                      <div className="sm:hidden relative flex-shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); setOpenStatusMenu(openStatusMenu === `${work._id}-menu` ? null : `${work._id}-menu`); }}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        {openStatusMenu === `${work._id}-menu` && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                            {work.status !== 'Completed' && (
                              <button onClick={e => { e.stopPropagation(); handleEdit(work); setOpenStatusMenu(null); }}
                                className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">✏️ Edit</button>
                            )}
                            <button onClick={e => { e.stopPropagation(); handleRemark(work); setOpenStatusMenu(null); }}
                              className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">💬 Remarks</button>
                            <button onClick={e => { e.stopPropagation(); handleDelete(work._id); setOpenStatusMenu(null); }}
                              className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50">🗑️ Delete</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Creator / updater badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {creatorName && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="truncate max-w-[120px]">{creatorName}</span>
                        </span>
                      )}
                      {statusUpdaterName && work.status !== 'Pending' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="truncate max-w-[120px]">{statusUpdaterName}</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={`text-sm sm:text-base md:text-lg font-semibold leading-tight ${
                      work.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'
                    }`}>
                      {work.title}
                    </h3>

                    {/* Description */}
                    {work.description && (
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {work.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-medium text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {work.dueDate
                          ? new Date(work.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                          : 'No due date'}
                      </span>
                      {work.createdAt && (
                        <span className="hidden sm:flex items-center gap-1 text-gray-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(work.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Desktop actions */}
                    <div className="hidden sm:flex items-center gap-2 pt-2 border-t border-gray-100">
                      {work.status !== 'Completed' && (
                        <button onClick={() => handleEdit(work)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit task">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      <button onClick={() => handleRemark(work)}
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="View remarks">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(work._id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete task">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Assigned Users Modal ─────────────────────────────────────────── */}
      {showAssignedUsersModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => setShowAssignedUsersModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in" onClick={e => e.stopPropagation()}>
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Assigned Team</h3>
                <button onClick={() => setShowAssignedUsersModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-white/50 p-1.5 rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-3 sm:py-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {selectedAssignedUsers.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500 text-center py-6 sm:py-8">No users assigned</p>
              ) : (
                <div className="space-y-2">
                  {selectedAssignedUsers.map((user, idx) => (
                    <div key={user._id || idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0 shadow-md">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        {user.email && <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">{user.email}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowAssignedUsersModal(false)}
                className="w-full px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => { setTaskModalOpen(false); setSelectedWork(null); }}
        work={selectedWork}
        mode={taskModalMode}
        refreshData={fetchMyWork}
      />
      <RemarkModal
        isOpen={isRemarkModalOpen}
        onClose={() => setRemarkModalOpen(false)}
        work={selectedWork}
        refreshData={fetchMyWork}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @keyframes slide-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1);    }
        }
        .animate-in { animation: slide-in 0.2s ease-out; }
        @media (min-width: 400px) {
          .xs\\:flex    { display: flex   !important; }
          .xs\\:inline  { display: inline !important; }
          .xs\\:hidden  { display: none   !important; }
        }
      `}</style>
    </div>
  );
};

export default TeamWorkload;