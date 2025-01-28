import React from "react";
import { Navigate } from "react-router-dom";

function RouteProtection({ children }) {
  try {
    const token = localStorage.getItem("authToken");
    const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT
    if (decoded.exp * 1000 > Date.now()) {
      return children;
    } else {
      return <Navigate to="/" />;
    }
  } catch (error) {
    console.log("Improper token");
    return <Navigate to="/" />;
  }
}

export default RouteProtection;
