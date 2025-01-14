import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ToastContainerComponent from "./Toasts";
import { toast } from "react-toastify";
import Greeting from "./Greeting";
import Profile from "./Profile";
import { motion } from "framer-motion";

const baseUrl = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [activeNavItem, setActiveNavItem] = useState("profile");
  //const [user, setUser] = useState(null);
  const [profileDetails, setProfileDetails] = useState({
    userName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const activeNavItemStyling = {
    backgroundColor: "#079a98",
    color: "white",
  };

  useEffect(() => {
    // Define an async function to fetch data
    const fetchProfileDetails = async () => {
      try {
        setLoading(true); // Start loading
        const token = localStorage.getItem("authToken");

        const response = await fetch(`${baseUrl}/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to load profile details.");
        }
        const data = await response.json();
        console.log(data.user);
        console.log(data.user.name);
        console.log(data.user.email);
        setProfileDetails((prev) => {
          return {
            userName: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
          };
        }); // Save data in state
      } catch (error) {
        console.error("Error:", error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchProfileDetails();
  }, []); // Empty dependency array ensures this runs only once after the first render

  if (loading) return <p>Loading...</p>; // Show a loading message

  // useEffect(() => {
  //   const fetchProtectedData = async () => {
  //     try {
  //       const token = localStorage.getItem("authToken");

  //       const response = await fetch(`${baseUrl}/protected`, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (response.ok) {
  //         const data = await response.json();
  //         setUser(data.user); // Set the user object with the decoded user data
  //         toast.success(`Welcome back, ${data.user.name}!`); // Show welcome message as a toast
  //       } else {
  //         const errorData = await response.json();
  //         toast.error(
  //           errorData.message || "Access denied. Please log in again."
  //         );
  //         setUser(null);
  //         navigate("/"); // Navigate to login page
  //       }
  //     } catch (error) {
  //       console.error("Error:", error);
  //       toast.error("Something went wrong. Please try again.");
  //       setUser(null);
  //       navigate("/"); // Navigate to login page
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProtectedData();
  // }, [navigate]);

  // const fetchProfileDetails = async () => {
  //   try {
  //     const token = localStorage.getItem("authToken");

  //     const response = await fetch(`${baseUrl}/profile`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setProfileDetails(data.user);
  //     } else {
  //       const errorData = await response.json();
  //       toast.error(errorData.message || "Failed to load profile details.");
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     toast.error("Something went wrong. Please try again.");
  //   }
  // };

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
        //setUser(null); // Reset user to null
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
    setActiveNavItem(item);
    if (item === "logout") {
      handleLogout();
    }
    // else {
    //   if (item === "profile") {
    //     fetchProfileDetails(); // Fetch profile details when "Profile" is clicked
    //   }
    // }
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <motion.div
      intial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ToastContainerComponent />
      <Greeting name={profileDetails.userName} />
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
        {activeNavItem === "profile" && (
          <Profile profileDetails={profileDetails} />
        )}
      </div>
    </motion.div>
  );
}

export default Dashboard;
