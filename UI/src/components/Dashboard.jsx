import React, { useEffect, useState } from "react";
import ToastContainerComponent from "./Toasts";
import { toast } from "react-toastify";
import "./dashboard.css"; // Import the CSS for styling

const baseUrl = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        console.log("Token:", token);

        const response = await fetch(`${baseUrl}/protected`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(`Response status: ${response.status}`);
        console.log(`Response ok: ${response.ok}`);

        if (response.ok) {
          const data = await response.json();
          console.log("Protected data:", data);
          setUser(data.user); // Set the user object with the decoded user data
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Access denied. Please log in again.");
          setUser(null);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Something went wrong. Please try again.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProtectedData();
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <ToastContainerComponent />
      {user ? (
        <>
          <div className="nav-bar">
            <h1>SplitLite</h1>
            <ul>
              <li>
                <a href="/profile">Profile</a>
              </li>
              <li>
                <a href="/groups">Groups</a>
              </li>
              <li>
                <a href="/logout">Logout</a>
              </li>
            </ul>
          </div>
          <h3>Welcome to the dashboard, {user.name}!</h3>
        </>
      ) : (
        <h1>Access denied</h1>
      )}
    </div>
  );
}

export default Dashboard;
