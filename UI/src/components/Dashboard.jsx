import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ToastContainerComponent from "./Toasts";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [activeNavItem, setActiveNavItem] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const activeNavItemStyling = {
    backgroundColor: "#079a98",
    color: "white",
  };

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
          toast.error(
            errorData.message || "Access denied. Please log in again."
          );
          setUser(null);
          navigate("/"); // Navigate to login page
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Something went wrong. Please try again.");
        setUser(null);
        navigate("/"); // Navigate to login page
      } finally {
        setLoading(false);
      }
    };

    fetchProtectedData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${baseUrl}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Logged out successfully!");
        localStorage.removeItem("authToken"); // Clear the token
        setUser(null); // Reset user to null
        navigate("/"); // Navigate to login page after logout
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to log out.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleNavItemClick = (item) => {
    if (item === "logout") {
      handleLogout();
    } else {
      setActiveNavItem(item);
    }
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <ToastContainerComponent />
      {user ? (
        <div>
          <div className="nav-bar">
            <h1>SplitLite</h1>
            <ul>
              {["profile", "groups", "logout"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item}`}
                    onClick={() => handleNavItemClick(item)}
                    style={activeNavItem === item ? activeNavItemStyling : {}}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <h3 className="greeting">Welcome back, {user.name}!</h3>
        </div>
      ) : (
        // Redirect to login page if user is null
        navigate("/")
      )}
    </div>
  );
}

export default Dashboard;
