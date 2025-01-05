import React from "react";
import { Navigate } from "react-router-dom";

function RouteProtection({ children }) {
  const token = localStorage.getItem("authToken");
  return token ? children : <Navigate to="/login" />;
}

export default RouteProtection;
