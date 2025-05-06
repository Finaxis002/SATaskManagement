import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  const loginExpiry = localStorage.getItem("loginExpiry");
  const isSessionExpired = loginExpiry && Date.now() > parseInt(loginExpiry, 10);
  // If there's no token, redirect to the login page
  // if (!token) {
  //   return <Navigate to="/login" />;
  // }
  if (!token || isSessionExpired) {
    localStorage.clear();
    return <Navigate to="/login" />;
  }

  return children; // Render children if token exists
};

export default ProtectedRoute;
