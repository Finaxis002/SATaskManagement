import React, { useEffect, useState, useRef } from "react";

const LeaveRequestList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const nextCheckTimeRef = useRef(null);
  const timeoutRef = useRef(null);

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

  // Calculate when leave should auto-reject
  const getAutoRejectTime = (leave) => {
    const leaveDate = new Date(leave.fromDate);
    const isHalfDay = leave.leaveDuration === "Half Day" || leave.leaveType === "Half Day Leave";

    if (isHalfDay && leave.fromTime) {
      // Half day: reject at start time (e.g., 1:00 PM)
      const [hours, minutes] = leave.fromTime.split(':');
      const rejectTime = new Date(leaveDate);
      rejectTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return rejectTime;
    } else {
      // Full day: reject at 10:00 AM on leave date
      const rejectTime = new Date(leaveDate);
      rejectTime.setHours(10, 0, 0, 0);
      return rejectTime;
    }
  };

  // Auto-reject expired leaves
  const autoRejectExpiredLeaves = async (leavesToCheck) => {
    const now = new Date();
    let hasRejected = false;
    
    for (const leave of leavesToCheck) {
      if (leave.status !== "Pending") continue;

      const rejectTime = getAutoRejectTime(leave);
      
      if (now >= rejectTime) {
        const isHalfDay = leave.leaveDuration === "Half Day" || leave.leaveType === "Half Day Leave";
        const rejectionReason = isHalfDay 
          ? `Auto-rejected: Half day not approved before start time (${leave.fromTime})`
          : `Auto-rejected: Full day leave not approved before 10:00 AM`;

        try {
          console.log(`🔄 Auto-rejecting expired leave: ${leave._id}`);
          
          const response = await fetch(`https://taskbe.sharda.co.in/api/leave/${leave._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'Rejected',
              rejectionReason: rejectionReason
            })
          });

          if (response.ok) {
            console.log(`✅ Leave ${leave._id} auto-rejected successfully`);
            hasRejected = true;
          }
        } catch (error) {
          console.error(`❌ Failed to auto-reject leave ${leave._id}:`, error);
        }
      }
    }

    return hasRejected;
  };

  // Calculate next check time based on pending leaves
  const calculateNextCheckTime = (pendingLeaves) => {
    if (pendingLeaves.length === 0) return null;

    const now = new Date();
    let earliestRejectTime = null;

    for (const leave of pendingLeaves) {
      const rejectTime = getAutoRejectTime(leave);
      
      // Only consider future reject times
      if (rejectTime > now) {
        if (!earliestRejectTime || rejectTime < earliestRejectTime) {
          earliestRejectTime = rejectTime;
        }
      }
    }

    return earliestRejectTime;
  };

  // Schedule next check
  const scheduleNextCheck = (leaves) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const pendingLeaves = leaves.filter(leave => leave.status === "Pending");
    const nextCheckTime = calculateNextCheckTime(pendingLeaves);

    if (nextCheckTime) {
      const now = new Date();
      const msUntilCheck = nextCheckTime.getTime() - now.getTime();
      
      // Add 1 minute buffer to ensure time has passed
      const msWithBuffer = msUntilCheck + 60000;

      console.log(`⏰ Next auto-check scheduled at: ${nextCheckTime.toLocaleString('en-IN')}`);
      nextCheckTimeRef.current = nextCheckTime;

      timeoutRef.current = setTimeout(async () => {
        console.log(`🔔 Auto-check triggered at ${new Date().toLocaleString('en-IN')}`);
        await fetchLeaves(false);
      }, msWithBuffer);
    } else {
      console.log(`✅ No pending leaves requiring auto-rejection`);
      nextCheckTimeRef.current = null;
    }
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
      
      // Check and auto-reject expired leaves
      const pendingLeaves = userLeaves.filter(leave => leave.status === "Pending");
      const hasRejected = await autoRejectExpiredLeaves(pendingLeaves);
      
      if (hasRejected) {
        // Re-fetch to get updated data
        const updatedResponse = await fetch('https://taskbe.sharda.co.in/api/leave');
        const updatedLeaves = await updatedResponse.json();
        const updatedUserLeaves = updatedLeaves.filter(leave => leave.userId === userId);
        setLeaves(updatedUserLeaves);
        
        // Schedule next check with updated leaves
        scheduleNextCheck(updatedUserLeaves);
      } else {
        setLeaves(userLeaves);
        
        // Schedule next check
        scheduleNextCheck(userLeaves);
      }
      
    } catch (error) {
      console.error("❌ Failed to fetch leaves:", error);
      if (showLoader) {
        setError("Failed to load leave requests. Please try again.");
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchLeaves();
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [userId]);

  // Listen for storage events (from LeaveRequestForm)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Check if leave was just submitted
      const showAlert = localStorage.getItem('showLeaveAlert');
      if (showAlert === 'true') {
        console.log('🔄 New leave submitted - Instant refresh triggered');
        localStorage.removeItem('showLeaveAlert'); // Clear flag
        fetchLeaves(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userId]);

  // Get time status for display
  const getTimeStatus = (leave) => {
    if (leave.status !== "Pending" || !leave.fromDate) {
      return null;
    }

    const now = new Date();
    const rejectTime = getAutoRejectTime(leave);
    const diffMs = rejectTime - now;
    
    if (diffMs <= 0) {
      return { 
        type: "expired", 
        text: "❌ Auto-rejecting now..." 
      };
    }

    const isHalfDay = leave.leaveDuration === "Half Day" || leave.leaveType === "Half Day Leave";
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return { 
        type: "urgent", 
        text: isHalfDay 
          ? `⚠️ Auto-rejects in ${diffMins} min (at ${leave.fromTime})`
          : `⚠️ Auto-rejects in ${diffMins} min (at 10:00 AM)`
      };
    } else if (diffHours < 24) {
      return { 
        type: "warning", 
        text: isHalfDay
          ? `⏰ Valid for ${diffHours}h ${diffMins % 60}m (until ${leave.fromTime})`
          : `⏰ Valid for ${diffHours}h ${diffMins % 60}m (until 10:00 AM)`
      };
    } else if (diffDays === 1) {
      return { 
        type: "upcoming", 
        text: isHalfDay
          ? `📅 Tomorrow - Auto-rejects at ${leave.fromTime}`
          : `📅 Tomorrow - Auto-rejects at 10:00 AM`
      };
    } else {
      return { 
        type: "upcoming", 
        text: isHalfDay
          ? `📅 In ${diffDays} days - Auto-rejects at ${leave.fromTime}`
          : `📅 In ${diffDays} days - Auto-rejects at 10:00 AM`
      };
    }
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

  const hasPendingLeaves = leaves.some(leave => leave.status === "Pending");

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition max-h-[calc(102vh-180px)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Your Leave Requests</h2>
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
            {nextCheckTimeRef.current ? (
              <span className="text-xs text-orange-600 flex items-center gap-1 font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Next check: {nextCheckTimeRef.current.toLocaleString('en-IN', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            ) : hasPendingLeaves ? (
              <span className="text-xs text-gray-400">All pending leaves checked</span>
            ) : (
              <span className="text-xs text-green-600">✓ No pending requests</span>
            )}
          </div>

          

          {leaves.map((leave) => {
            const timeStatus = getTimeStatus(leave);
            const isHalfDay = leave.leaveDuration === "Half Day" || leave.leaveType === "Half Day Leave";

            return (
              <div
                key={leave._id}
                className={`bg-white border rounded-md p-4 mb-3 shadow-sm hover:shadow-md transition ${
                  timeStatus?.type === "expired" ? "border-red-400 bg-red-50" :
                  timeStatus?.type === "urgent" ? "border-orange-400 bg-orange-50" :
                  timeStatus?.type === "warning" ? "border-yellow-400 bg-yellow-50" :
                  timeStatus?.type === "upcoming" ? "border-blue-400 bg-blue-50" :
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
                        timeStatus.type === "warning" ? "text-yellow-600" :
                        "text-blue-600"
                      }`}>
                        {(timeStatus.type === "urgent" || timeStatus.type === "warning" || timeStatus.type === "expired") && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                        {timeStatus.text}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-md text-white whitespace-nowrap ${
                        leave.status === "Rejected" ? "bg-red-500" :
                        leave.status === "Approved" ? "bg-green-500" :
                        leave.status === "Pending" ? "bg-yellow-500" :
                        "bg-gray-500"
                      }`}
                    >
                      {leave.status}
                    </span>
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