import React, { useEffect, useState } from "react";
import ToastContainerComponent from "./Toasts";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [activeNavItem, setActiveNavItem] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  function handleNavItemClick(item) {
    setActiveNavItem(item);
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
                <li>
                  <a
                    key={item}
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
        <h1>Access denied</h1>
      )}
    </div>
  );
}

export default Dashboard;
