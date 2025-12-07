
// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";

// export default function ProtectedRoute() {
//   // simple auth check: token in localStorage
//   const token = localStorage.getItem("token");

//   // if no token -> go to login
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   // if token exists -> allow child routes
//   return <Outlet />;
// }

//  add expire token
// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";
//  import { isTokenExpired } from "../../lib/utlis";

// export default function ProtectedRoute() {
//   const token = localStorage.getItem("token");

//   // no token -> go to login
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   // token exists BUT expired
//   if (isTokenExpired(token)) {
//     // clear old data
//     localStorage.removeItem("token");
//     localStorage.removeItem("userData");

//     // you can also show a toast later, for now just redirect
//     alert("Session expired, please login again.");

//     return <Navigate to="/login" replace />;
//   }

//   // token valid -> allow access
//   return <Outlet />;
// }


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

