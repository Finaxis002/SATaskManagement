import React, { useEffect, useState, useRef } from "react";

const LeaveRequestList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(new Set());
  const [error, setError] = useState(null);
  const checkIntervalRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Get userId from localStorage
  const getUserId = () => {
    try {
      return typeof window !== 'undefined' && window.localStorage 
        ? window.localStorage.getItem("userId") 
        : null;
    } catch {
      return null;
    }
  };

  const userId = getUserId();

  // Auto-reject logic
  const checkAndRejectExpiredLeaves = async (leavesList) => {
    const now = new Date();
    const expiredLeaves = [];

    leavesList.forEach((leave) => {
      if (leave.status === "Pending") {
        const isHalfDay = leave.leaveDuration === "Half Day" || leave.leaveType === "Half Day Leave";
        const isFullDay = leave.leaveDuration === "Full Day" || !isHalfDay;

        if (isHalfDay && leave.fromTime) {
          const leaveDateTime = new Date(leave.fromDate);
          const [hours, minutes] = leave.fromTime.split(':');
          leaveDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          if (now >= leaveDateTime) {
            expiredLeaves.push(leave);
          }
        }
        
        if (isFullDay) {
          const leaveStartDate = new Date(leave.fromDate);
          leaveStartDate.setHours(9, 0, 0, 0);
          
          if (now >= leaveStartDate) {
            expiredLeaves.push(leave);
          }
        }
      }
    });

    // Auto-reject expired leaves
    for (const leave of expiredLeaves) {
      try {
        setProcessing(prev => new Set(prev).add(leave._id));
        
        const response = await fetch(`https://taskbe.sharda.co.in/api/leave/${leave._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: "Rejected",
            rejectionReason: "Auto-rejected: Leave time expired without approval"
          })
        });

        if (response.ok) {
          console.log(`✅ Auto-rejected expired leave: ${leave._id}`);
          
          // Instant UI update
          setLeaves(prevLeaves => 
            prevLeaves.map(l => 
              l._id === leave._id 
                ? { ...l, status: "Rejected", rejectionReason: "Auto-rejected: Leave time expired without approval" }
                : l
            )
          );
        }
      } catch (error) {
        console.error(`❌ Failed to auto-reject leave ${leave._id}:`, error);
      } finally {
        setProcessing(prev => {
          const newSet = new Set(prev);
          newSet.delete(leave._id);
          return newSet;
        });
      }
    }

    return expiredLeaves.length > 0;
  };

  const fetchLeaves = async (showLoader = true) => {
    if (!userId) {
      setError("User ID not found. Please log in.");
      setLoading(false);
      return;
    }

    if (showLoader) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const response = await fetch('https://taskbe.sharda.co.in/api/leave');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const allLeaves = await response.json();
      const userLeaves = allLeaves.filter(leave => leave.userId === userId);
      
      setLeaves(userLeaves);
      
      // Check for expired leaves immediately
      await checkAndRejectExpiredLeaves(userLeaves);
      
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
      setError("Failed to load leave requests. Please try again.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLeaves();
  }, [userId]);

  // Auto-check intervals
  useEffect(() => {
    // Check every 30 seconds
    checkIntervalRef.current = setInterval(() => {
      if (leaves.length > 0) {
        checkAndRejectExpiredLeaves(leaves);
      }
    }, 30000);

    // Background refresh every 2 minutes
    refreshIntervalRef.current = setInterval(() => {
      fetchLeaves(false);
    }, 120000);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [leaves]);

  // Storage event listener
  useEffect(() => {
    const handleStorageChange = () => {
      fetchLeaves(false);
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Helper function to check if leave is expiring soon
  const getTimeStatus = (leave) => {
    if (leave.status !== "Pending") {
      return null;
    }

    const isHalfDay = leave.leaveDuration === "Half Day" || leave.leaveType === "Half Day Leave";
    const isFullDay = leave.leaveDuration === "Full Day" || !isHalfDay;
    const now = new Date();

    if (isHalfDay && leave.fromTime) {
      const leaveDateTime = new Date(leave.fromDate);
      const [hours, minutes] = leave.fromTime.split(':');
      leaveDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const diffMs = leaveDateTime - now;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMs <= 0) {
        return { type: "expired", text: "Expired - Auto-rejecting" };
      } else if (diffMins <= 30) {
        return { type: "urgent", text: `⚠️ Expires in ${diffMins} min` };
      } else if (diffMins <= 120) {
        return { type: "warning", text: `Expires in ${Math.floor(diffMins / 60)}h ${diffMins % 60}m` };
      }
    }

    if (isFullDay) {
      const leaveStartDate = new Date(leave.fromDate);
      leaveStartDate.setHours(9, 0, 0, 0);
      
      const diffMs = leaveStartDate - now;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMs <= 0) {
        return { type: "expired", text: "Expired - Auto-rejecting (9 AM passed)" };
      } else if (diffHours <= 2) {
        return { type: "urgent", text: `⚠️ Expires in ${diffHours}h (9 AM deadline)` };
      } else if (diffHours <= 12) {
        return { type: "warning", text: `Expires in ${diffHours}h (9 AM deadline)` };
      } else if (diffDays === 1) {
        return { type: "warning", text: "Leave starts tomorrow (9 AM deadline)" };
      }
    }

    return null;
  };

  if (!userId) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
        <div className="text-center py-8 text-red-500">
          <p className="text-lg">⚠️ User ID not found</p>
          <p className="text-sm mt-2">Please log in to view your leave requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition max-h-[calc(102vh-180px)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Your Leave Requests</h2>
        <button
          onClick={() => fetchLeaves(true)}
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
          title="Refresh"
        >
          {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg> */}
        </button>
      </div>
      <div className="border-b border-gray-300 mb-4"></div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600">Loading leave requests...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 text-lg">{error}</p>
          <button 
            onClick={() => fetchLeaves(true)}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">📋 No leave requests found.</p>
          <p className="text-sm mt-2">You haven't submitted any leave requests yet.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600 flex items-center justify-between">
            <span>Showing {leaves.length} request{leaves.length !== 1 ? 's' : ''}</span>
            {/* <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live updates
            </span> */}
          </div>
          {leaves.map((leave) => {
            const timeStatus = getTimeStatus(leave);
            const isProcessing = processing.has(leave._id);
            const isHalfDay = leave.leaveDuration === "Half Day" || leave.leaveType === "Half Day Leave";

            return (
              <div
                key={leave._id}
                className={`bg-white border rounded-md p-4 mb-3 shadow-sm hover:shadow-md transition ${
                  timeStatus?.type === "expired" ? "border-red-400 bg-red-50" :
                  timeStatus?.type === "urgent" ? "border-orange-400 bg-orange-50" :
                  timeStatus?.type === "warning" ? "border-yellow-400 bg-yellow-50" :
                  "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                      {leave.leaveType}
                      {isHalfDay && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Half Day
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      📅 {new Date(leave.fromDate).toLocaleDateString('en-IN')} →{" "}
                      {new Date(leave.toDate).toLocaleDateString('en-IN')}
                    </div>
                    
                    {(leave.fromTime || leave.toTime) && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Time: </span>
                        {leave.fromTime || "--:--"} → {leave.toTime || "--:--"}
                      </div>
                    )}

                    {leave.comments && (
                      <div className="text-xs text-gray-500 mt-1">
                        💬 {leave.comments}
                      </div>
                    )}

                    {timeStatus && (
                      <div className={`text-xs mt-2 flex items-center gap-1 font-semibold ${
                        timeStatus.type === "expired" ? "text-red-600" :
                        timeStatus.type === "urgent" ? "text-orange-600" :
                        "text-yellow-600"
                      }`}>
                        {timeStatus.type !== "expired" && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                        {timeStatus.text}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {isProcessing ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <span
                        className={`text-sm font-semibold px-3 py-1 rounded-md text-white whitespace-nowrap ${
                          leave.status === "Pending" ? "bg-yellow-500" :
                          leave.status === "Approved" ? "bg-green-500" :
                          "bg-red-500"
                        }`}
                      >
                        {leave.status}
                      </span>
                    )}
                  </div>
                </div>

                {leave.status === "Rejected" && leave.rejectionReason && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    <span className="font-semibold">Reason: </span>
                    {leave.rejectionReason}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default LeaveRequestList;