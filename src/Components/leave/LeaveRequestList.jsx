import React, { useEffect, useState, useRef } from "react";

const LeaveRequestList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(new Set());
  const [error, setError] = useState(null);
  const leavesRef = useRef([]);
  const checkIntervalRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Update ref whenever leaves change
  useEffect(() => {
    leavesRef.current = leaves;
  }, [leaves]);

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

  // ===== AUTO-REJECT LOGIC WITH HALF DAY TIME CHECK =====
  const checkAndRejectExpiredLeaves = async (leavesList) => {
    const now = new Date();
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expiredLeaves = [];

    console.log(`\n🔍 [CHECK] Checking ${leavesList.length} leaves at ${now.toLocaleTimeString()}`);

    leavesList.forEach((leave) => {
      if (leave.status === "Pending" && leave.fromDate) {
        let shouldReject = false;
        let rejectionReason = "";

        const leaveDate = new Date(leave.fromDate);
        const leaveDateOnly = new Date(leaveDate.getFullYear(), leaveDate.getMonth(), leaveDate.getDate());
        
        const isHalfDay = leave.leaveDuration === "Half Day" || leave.leaveType === "Half Day Leave";
        
        console.log(`📋 Checking leave ${leave._id}:`, {
          type: leave.leaveType,
          isHalfDay,
          fromDate: leave.fromDate,
          toTime: leave.toTime,
          currentStatus: leave.status
        });

        // ===== HALF DAY LEAVE LOGIC =====
        if (isHalfDay && leave.toTime) {
          // Check if leave is for today
          if (leaveDateOnly.getTime() === todayOnly.getTime()) {
            // Parse toTime and check if it has passed
            const leaveEndTime = new Date(leave.fromDate);
            const [hours, minutes] = leave.toTime.split(':');
            leaveEndTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            console.log(`⏰ Half day timing:`, {
              endTime: leaveEndTime.toLocaleTimeString(),
              currentTime: now.toLocaleTimeString(),
              hasPassed: now > leaveEndTime
            });
            
            if (now > leaveEndTime) {
              shouldReject = true;
              rejectionReason = `Auto-rejected: Half day leave time (${leave.toTime}) has passed`;
              console.log(`❌ SHOULD REJECT: Half day time passed`);
            }
          }
          // If half day leave date is in the past
          else if (leaveDateOnly.getTime() < todayOnly.getTime()) {
            shouldReject = true;
            rejectionReason = `Auto-rejected: Half day leave date (${leaveDateOnly.toLocaleDateString('en-IN')}) has passed`;
            console.log(`❌ SHOULD REJECT: Half day date in past`);
          }
        }
        // ===== FULL DAY LEAVE LOGIC =====
        else {
          // Check if leave date has passed (is before today)
          if (leaveDateOnly.getTime() < todayOnly.getTime()) {
            shouldReject = true;
            rejectionReason = `Auto-rejected: Leave date (${leaveDateOnly.toLocaleDateString('en-IN')}) has passed`;
            console.log(`❌ SHOULD REJECT: Full day date in past`);
          }
        }

        if (shouldReject) {
          expiredLeaves.push({ leave, rejectionReason });
          console.log(`➕ Added to expired list: ${leave._id}`);
        }
      }
    });

    console.log(`\n📊 Found ${expiredLeaves.length} expired leaves\n`);

    // Auto-reject expired leaves
    for (const { leave, rejectionReason } of expiredLeaves) {
      try {
        console.log(`🚀 [REJECT] Starting rejection for ${leave._id}...`);
        
        setProcessing(prev => new Set(prev).add(leave._id));
        
        // First update UI immediately (optimistic update)
        console.log(`💾 [UI] Updating state to Rejected...`);
        setLeaves(prevLeaves => {
          const updated = prevLeaves.map(l => 
            l._id === leave._id 
              ? { 
                  ...l, 
                  status: "Rejected", 
                  rejectionReason: rejectionReason 
                }
              : l
          );
          console.log(`✅ [UI] State updated for ${leave._id}`);
          return updated;
        });
        
        // Then make API call
        console.log(`📡 [API] Calling backend API...`);
        const response = await fetch(`https://taskbe.sharda.co.in/api/leave/${leave._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: "Rejected",
            rejectionReason: rejectionReason
          })
        });

        console.log(`📡 [API] Response status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ [API] Backend confirmed rejection:`, data);
        } else {
          console.error(`❌ [API] Failed with status ${response.status}`);
          // Revert on failure
          setLeaves(prevLeaves => 
            prevLeaves.map(l => 
              l._id === leave._id 
                ? { ...l, status: "Pending" }
                : l
            )
          );
        }
      } catch (error) {
        console.error(`❌ [ERROR] Exception during rejection:`, error);
        // Revert on error
        setLeaves(prevLeaves => 
          prevLeaves.map(l => 
            l._id === leave._id 
              ? { ...l, status: "Pending" }
              : l
          )
        );
      } finally {
        setProcessing(prev => {
          const newSet = new Set(prev);
          newSet.delete(leave._id);
          return newSet;
        });
        console.log(`🏁 [DONE] Finished processing ${leave._id}\n`);
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
      console.log(`🌐 [FETCH] Fetching leaves for user ${userId}...`);
      const response = await fetch('https://taskbe.sharda.co.in/api/leave');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const allLeaves = await response.json();
      const userLeaves = allLeaves.filter(leave => leave.userId === userId);
      
      console.log(`✅ [FETCH] Got ${userLeaves.length} leaves`);
      setLeaves(userLeaves);
      
      // Immediately check after fetch
      if (userLeaves.length > 0) {
        console.log(`🔍 [FETCH] Checking for expired leaves immediately...`);
        await checkAndRejectExpiredLeaves(userLeaves);
      }
      
    } catch (error) {
      console.error("❌ [FETCH] Failed to fetch leaves:", error);
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
  }, [userId]);

  // Auto-check intervals
  useEffect(() => {
    if (!userId) return;
    
    console.log("⚙️ Setting up auto-check intervals...");
    
    // 1. Check for expiry every 2 seconds
    checkIntervalRef.current = setInterval(async () => {
      console.log("⏰ Interval triggered - checking leaves...");
      const currentLeaves = leavesRef.current;
      if (currentLeaves.length > 0) {
        console.log(`📋 Found ${currentLeaves.length} leaves to check`);
        await checkAndRejectExpiredLeaves(currentLeaves);
      } else {
        console.log("⚠️ No leaves to check");
      }
    }, 2000);

    // 2. Background refresh every 5 seconds
    refreshIntervalRef.current = setInterval(() => {
      console.log("🔄 Refresh interval triggered");
      fetchLeaves(false);
    }, 5000); 

    console.log("✅ Intervals set up successfully");

    return () => {
      console.log("🛑 Cleaning up intervals...");
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [userId]);

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

  // ===== TIME STATUS WITH HALF DAY LOGIC =====
  const getTimeStatus = (leave) => {
    if (leave.status !== "Pending" || !leave.fromDate) {
      return null;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const leaveDate = new Date(leave.fromDate);
    const leaveDateOnly = new Date(leaveDate.getFullYear(), leaveDate.getMonth(), leaveDate.getDate());
    
    const isHalfDay = leave.leaveDuration === "Half Day" || leave.leaveType === "Half Day Leave";

    // ===== HALF DAY LEAVE STATUS =====
    if (isHalfDay && leave.toTime) {
      // If half day is for today
      if (leaveDateOnly.getTime() === today.getTime()) {
        const leaveEndTime = new Date(leave.fromDate);
        const [hours, minutes] = leave.toTime.split(':');
        leaveEndTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const diffMs = leaveEndTime - now;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffMs <= 0) {
          return { type: "expired", text: "❌ Half day time has passed - Auto-rejecting" };
        } else if (diffMins <= 30) {
          return { type: "urgent", text: `⚠️ Ends in ${diffMins} min` };
        } else if (diffHours < 2) {
          return { type: "warning", text: `⏰ Ends in ${diffHours}h ${diffMins % 60}m` };
        } else {
          return { type: "valid", text: `✅ Valid until ${leave.toTime}` };
        }
      }
      else if (leaveDateOnly.getTime() < today.getTime()) {
        return { type: "expired", text: "❌ Half day date has passed" };
      }
      else {
        const diffDays = Math.floor((leaveDateOnly - today) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          return { type: "upcoming", text: `📅 Half day tomorrow (${leave.fromTime} - ${leave.toTime})` };
        } else {
          return { type: "upcoming", text: `📅 Half day in ${diffDays} days` };
        }
      }
    }

    // ===== FULL DAY LEAVE STATUS =====
    if (leaveDateOnly.getTime() < today.getTime()) {
      return { type: "expired", text: "❌ Leave date has passed" };
    }
    
    if (leaveDateOnly.getTime() === today.getTime()) {
      const hoursLeft = 24 - now.getHours();
      return { type: "valid", text: `✅ Valid today (${hoursLeft}h remaining)` };
    }
    
    const diffMs = leaveDateOnly - today;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return { type: "upcoming", text: "📅 Leave starts tomorrow" };
    } else if (diffDays <= 7) {
      return { type: "upcoming", text: `📅 Leave starts in ${diffDays} days` };
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
                  timeStatus?.type === "valid" ? "border-green-400 bg-green-50" :
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
                        timeStatus.type === "valid" ? "text-green-600" :
                        "text-blue-600"
                      }`}>
                        {(timeStatus.type === "urgent" || timeStatus.type === "warning") && (
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
                          leave.status === "Rejected" ? "bg-red-500" :
                          leave.status === "Approved" ? "bg-green-500" :
                          leave.status === "Pending" ? "bg-yellow-500" :
                          "bg-gray-500"
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