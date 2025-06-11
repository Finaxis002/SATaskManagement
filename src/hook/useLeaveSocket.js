import { useEffect } from 'react';

const useLeaveSocket = (setLeaveAlert) => {
  useEffect(() => {
    const socket = window.socket; // Assuming you have socket globally
    
    if (!socket) return;

    const handleLeaveAlert = (data) => {
      setLeaveAlert(true);
      localStorage.setItem("showLeaveAlert", "true");
    };

    socket.on("leave-alert", handleLeaveAlert);

    return () => {
      socket.off("leave-alert", handleLeaveAlert);
    };
  }, [setLeaveAlert]);
};

export default useLeaveSocket;