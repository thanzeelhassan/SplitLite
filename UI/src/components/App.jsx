import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";
import Register from "./Register";
import RouteProtection from "./RouteProtection";

const baseUrl = import.meta.env.VITE_API_URL;
console.log(`API Base URL ${baseUrl}`);

function App() {
  return (
    <Router>
      <Routes>
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
    </Router>
  );
}

export default App;
