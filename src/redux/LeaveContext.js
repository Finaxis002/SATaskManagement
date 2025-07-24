// LeaveContext.js
import { createContext, useContext, useState, useCallback , useEffect } from "react";
export const LeaveContext = createContext();
export const useLeave = () => useContext(LeaveContext);

export function LeaveProvider({ children }) {
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  const fetchPendingLeaveCount = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:1100/api/leave/pending");
      setPendingLeaveCount(res.data.length || 0);
    } catch (err) {
      setPendingLeaveCount(0);
    }
  }, []);

  

  return (
    <LeaveContext.Provider value={{ pendingLeaveCount, fetchPendingLeaveCount }}>
      {children}
    </LeaveContext.Provider>
  );
}
