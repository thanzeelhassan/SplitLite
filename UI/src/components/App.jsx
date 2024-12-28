import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { toast } from "react-toastify";
import ToastContainerComponent from "./Toasts";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Register from "./Register";

// function App(){
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         // Fetch data from the API
//         fetch("http://localhost:3000/name")
//             .then((response) => {
//                 if (!response.ok) {
//                     throw new Error("Network response was not ok");
//                 }
//                 return response.json(); // Parse JSON response
//             })
//             .then((data) => {
//                 console.log(data);
//                 setData(data); // Save data to state
//                 setLoading(false);
//             })
//             .catch((error) => {
//                 console.log(error);
//                 setError(error.message);
//                 setLoading(false);
//             });
//     }, []); // Empty dependency array ensures this runs only once

//     if (loading) return <div>Loading...</div>;
//     if (error){
//         console.log("Couldn't get API response")
//         toast.error('Error fetching data. Please try again later.',{
//             style: {
//                 backgroundColor: "#c80815",
//                 color: "white",
//             }
//         });
//     }

//     return (
//         <div className="container">
//             <h1>Hello {data.name}</h1>
//             <ToastContainerComponent />
//         </div>
//     );
// }

const baseUrl = import.meta.env.VITE_API_URL;
console.log(`API Base URL ${baseUrl}`);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function handleLogin(props) {
    console.log(props);
    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(props),
      });
      console.log(`Response status: ${response.status}`);
      console.log(`Response: ${response.ok}`);
      if (response.ok) {
        // const data = await response.json();
        // console.log(`Data: ${data}`);
        setIsAuthenticated(true);
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.message || "Something went wrong. Please try again."
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
          }
        />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
