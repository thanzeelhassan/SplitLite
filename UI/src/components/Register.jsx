import React from "react";
import Banner from "./Banner";
import { toast } from "react-toastify";
import ToastContainerComponent from "./Toasts";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const baseUrl = import.meta.env.VITE_API_URL;
//console.log(`API Base URL ${baseUrl}`);

function Register() {
  const navigate = useNavigate();
  const [regDetails, setRegDetails] = React.useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    phone: "",
  });
  const [error, setError] = React.useState("");
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  function handleChange(event) {
    const { name, value } = event.target;
    setRegDetails((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }
  React.useEffect(() => {
    if (
      regDetails.password.trim() !== "" &&
      regDetails.confirmPassword.trim() !== "" &&
      regDetails.password !== regDetails.confirmPassword
    ) {
      setError("Passwords do not match!");
    } else {
      setError("");
    }
  }, [regDetails]);

  async function handleSubmit(event) {
    console.log(regDetails);
    event.preventDefault();
    setButtonDisabled(true);
    try {
      const response = await fetch(`${baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(regDetails),
      });
      console.log(`Response: ${response}`);
      if (response.ok) {
        const data = await response.json();
        toast.success("Signed up successfully!");

        // Navigate to another route after a short delay
        setTimeout(() => {
          navigate("/");
        }, 1000); // 1-second delay
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.message || "Something went wrong. Please try again."
        );
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
    setButtonDisabled(false);
  }
  return (
    <div className="login-container">
      <Banner />
      <motion.div
        className="login-form register-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        //exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={regDetails.username}
            required
            onChange={handleChange}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={regDetails.email}
            required
            onChange={handleChange}
          />
          <input
            name="phone"
            type="tel"
            placeholder="Phone"
            value={regDetails.phone}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={regDetails.password}
            required
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={regDetails.confirmPassword}
            required
            onChange={handleChange}
          />
          {error && <p style={{ color: "red", fontSize: "0.8rem" }}>{error}</p>}
          <button disabled={buttonDisabled} type="submit">
            Sign up
          </button>
          <hr />
          <p>
            Have an account? <a href="/">Login</a>
          </p>
        </form>
      </motion.div>
      <ToastContainerComponent />
    </div>
  );
}

export default Register;
