import React, { useState, useEffect } from "react";
import Banner from "./Banner";
import ToastContainerComponent from "./Toasts";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const baseUrl = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT
        if (decoded.exp * 1000 > Date.now()) {
          console.log("Navigating to dashboard");
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.log("Improper token");
    }
  }, [navigate]);

  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setLoginDetails((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }
  async function handleSubmit(event) {
    event.preventDefault();
    setButtonDisabled(true);
    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginDetails),
      });
      console.log(`Response status: ${response.status}`);
      if (response.ok) {
        var data = await response.json();
        localStorage.setItem("authToken", data.token); // Store token in local storage
        navigate("/dashboard");
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
    setButtonDisabled(false);
  }

  return (
    <div className="login-container">
      <Banner />
      <motion.div
        className="login-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        //exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={loginDetails.email}
            required
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginDetails.password}
            required
            onChange={handleChange}
          />
          <button type="submit" disabled={buttonDisabled}>
            Login
          </button>
          <hr />
          <p>
            Do not have an account? <Link to="/register">Sign up</Link>
          </p>
        </form>
      </motion.div>
      <ToastContainerComponent />
    </div>
  );
}

export default Login;
