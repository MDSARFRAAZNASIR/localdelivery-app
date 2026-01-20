


// add again
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
 import { isTokenExpired } from "../../lib/utlis";


export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  // no token
  if (!token) {
    return <Navigate to="/login"/>;
  }

  // token exists but expired
  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    return <Navigate to="/session-expired"  />;
  }

  // token valid
  return <Outlet />;
}

