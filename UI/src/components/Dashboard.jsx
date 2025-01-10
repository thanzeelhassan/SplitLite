import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ToastContainerComponent from "./Toasts";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [activeNavItem, setActiveNavItem] = useState("profile");
  const [user, setUser] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null);
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

        const response = await fetch(`${baseUrl}/protected`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // Set the user object with the decoded user data
          toast.success(`Welcome back, ${data.user.name}!`); // Show welcome message as a toast
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

  const fetchProfileDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${baseUrl}/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileDetails(data.user);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to load profile details.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

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
      if (item === "profile") {
        fetchProfileDetails(); // Fetch profile details when "Profile" is clicked
      }
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

          <div className="content">
            {activeNavItem === "profile" && profileDetails && (
              <div className="profile-details">
                <h2>Profile Details</h2>
                <p>
                  <strong>Name:</strong> {profileDetails.name}
                </p>
                <p>
                  <strong>Email:</strong> {profileDetails.email}
                </p>
                <p>
                  <strong>User ID:</strong> {profileDetails.user_id}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        navigate("/")
      )}
    </div>
  );
}

export default Dashboard;
