import React from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Register from "./Register";
import Profile from "./Profile";
import Home from "./Home";
import RouteProtection from "./RouteProtection";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Groups from "./Groups";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <RouteProtection>
              <Profile />
            </RouteProtection>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RouteProtection>
              <Dashboard />
            </RouteProtection>
          }
        />
        <Route
          path="/group"
          element={
            <RouteProtection>
              <Groups />
            </RouteProtection>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
