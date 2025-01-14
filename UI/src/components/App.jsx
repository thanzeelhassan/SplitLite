import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import AnimatedRoutes from "./AnimatedRoutes";

const baseUrl = import.meta.env.VITE_API_URL;
console.log(`API Base URL ${baseUrl}`);

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
