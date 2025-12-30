import React, { useEffect, useState, useRef } from "react";

const LeaveSummary = () => {
  const [approvedCount, setApprovedCount] = useState(0);
  const [approvedDays, setApprovedDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const checkIntervalRef = useRef(null);

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

  const checkAndRejectExpiredLeaves = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/leave?userId=${userId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const now = new Date(); // Current Client Time
      
      const pendingLeaves = data.filter(
        (leave) => leave.status === "Pending"
      );

      for (const leave of pendingLeaves) {
        let shouldReject = false;
        let rejectionReason = "Auto-rejected: Not approved before 8 AM on leave start date";

        // --- FIXED LOGIC: Emergency Leave 2 Minute Check ---
        if (leave.leaveType === "Emergency Leave") {
          
          // Step 1: Check agar createdAt field exist karta hai
          if (leave.createdAt) {
            const appliedTime = new Date(leave.createdAt);
            const timeDifference = now - appliedTime; // Milliseconds difference
            const minutesPassed = timeDifference / (1000 * 60); // Convert to minutes

            // DEBUGGING LOGS (Console me check karein)
            console.log(`Leave ID: ${leave._id}`);
            console.log(`Applied Time: ${appliedTime.toLocaleTimeString()}`);
            console.log(`Current Time: ${now.toLocaleTimeString()}`);
            console.log(`Minutes Passed: ${minutesPassed.toFixed(2)}`);

            // Step 2: Sirf tab reject karein jab positive value ho aur 2 min se zyada ho
            // (Kabhi kabhi server aur client time me fark hone se negative aa sakta hai, usko reject nahi karna)
            if (minutesPassed > 2) {
              shouldReject = true;
              rejectionReason = "Auto-rejected: Emergency Leave expired (Valid only for 2 minutes)";
            }
          } else {
            console.warn(`Leave ${leave._id} me 'createdAt' field nahi hai. Auto-reject skip kar raha hu.`);
            // Note: Agar backend createdAt nahi bhej raha, to hum reject nahi karenge
            // nahi to ye galti se purani dates (fromDate) utha lega.
          }
        } 
        // --- END FIXED LOGIC ---

        // Baki conditions (Sirf tab check karein agar Emergency wala logic fail na hua ho)
        if (!shouldReject && leave.leaveType !== "Emergency Leave") {
            const isHalfDay = leave.leaveDuration === "Half Day" || leave.leaveType === "Half Day Leave";
            const isFullDay = leave.leaveDuration === "Full Day" || !isHalfDay;
            
            if (isHalfDay && leave.fromTime) {
              const leaveDateTime = new Date(leave.fromDate);
              const [hours, minutes] = leave.fromTime.split(':');
              leaveDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
              if (now >= leaveDateTime) {
                shouldReject = true;
              }
            }
            
            if (isFullDay) {
              const leaveStartDate = new Date(leave.fromDate);
              leaveStartDate.setHours(8, 0, 0, 0);
              
              if (now >= leaveStartDate) {
                shouldReject = true;
              }
            }
        }

        if (shouldReject) {
          try {
            const rejectResponse = await fetch(
              `https://taskbe.sharda.co.in/api/leave/${leave._id}`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  status: "Rejected",
                  rejectionReason: rejectionReason
                })
              }
            );
            
            if (rejectResponse.ok) {
              console.log(`✅ Auto-rejected: ${leave._id} | Reason: ${rejectionReason}`);
            }
          } catch (error) {
            console.error(`❌ Failed to reject ${leave._id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Error checking leaves:", error);
    }
  };

  const fetchApprovedLeaves = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      await checkAndRejectExpiredLeaves();
      const response = await fetch(`https://taskbe.sharda.co.in/api/leave?userId=${userId}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      
      const approved = data.filter((leave) => leave.status === "Approved");
      setApprovedCount(approved.length);

      const totalDays = approved.reduce((acc, leave) => {
        const from = new Date(leave.fromDate);
        const to = new Date(leave.toDate);
        const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
        return acc + days;
      }, 0);
      setApprovedDays(totalDays);
    } catch (error) {
      console.error("Failed to load summary", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchApprovedLeaves();
    checkIntervalRef.current = setInterval(() => {
      checkAndRejectExpiredLeaves();
      fetchApprovedLeaves();
    }, 60000); // 1 Minute Interval

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [userId]);

  if (!userId) return null; // Simplified return for brevity if needed
  if (loading) return <div>Loading...</div>; // Simplified loading

  // ... (Baaki ka JSX same rahega) ...
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
        Your Leave Summary
      </h2>
      <div className="border-b border-gray-300 mb-4"></div>
      
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition">
          <div className="text-sm text-gray-600">Total Approved Days</div>
          <div className="text-2xl font-bold text-gray-800">{approvedDays}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition">
          <div className="text-sm text-gray-600">Approved Requests</div>
          <div className="text-2xl font-bold text-gray-800">{approvedCount}</div>
        </div>
      </div>
    </div>
  );
};

export default LeaveSummary;