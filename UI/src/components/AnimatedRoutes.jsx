import React from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Register from "./Register";
import RouteProtection from "./RouteProtection";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <RouteProtection>
              <Dashboard />
            </RouteProtection>
          }
        />
        <Route path="/register" element={<Register />} />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
