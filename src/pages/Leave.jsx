import {useEffect} from 'react'
import LeaveRequestForm from '../Components/leave/LeaveRequestForm';
import LeaveRequestList from '../Components/leave/LeaveRequestList' ;
import LeaveSummary from '../Components/leave/LeaveSummary';
import socket from "../socket";

const Leave = () => {

    const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    
  useEffect(() => {
  const email = localStorage.getItem("userId");
  const name = localStorage.getItem("name");

  if (email && name) {
    socket.emit("register", email, name);
    console.log("📡 User registered on socket:", email);
  }

  socket.on("leave-status-updated", (data) => {
    

    if (Notification.permission === "granted") {
      new Notification(`📢 Leave ${data.status}`, {
        body: `Your ${data.leaveType} leave from ${formatDate(data.fromDate)} to ${formatDate(data.toDate)} was ${data.status}`,
      });
      localStorage.setItem("showLeaveAlert", "true");
    }
  });

  return () => {
    socket.off("leave-status-updated");
  };
}, []);

useEffect(() => {
  localStorage.setItem("showLeaveAlert", "false");
}, []);

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-100 text-gray-900 p-6">
  <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 h-full overflow-y-auto">
    {/* Left: Leave Request Form */}
     <div className="overflow-y-auto h-auto pr-2">
  <LeaveRequestForm />
</div>
    

    {/* Right: Leave Requests + Summary */}
    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto h-auto pl-2 custom-scrollbar">
  <LeaveRequestList />
  <LeaveSummary />
</div>
  </div>
</div>

  )
}

export default Leave