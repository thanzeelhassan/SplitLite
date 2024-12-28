import React, { useState } from "react";
import Banner from "./Banner";
import ToastContainerComponent from "./Toasts";

function Login({ onLogin }) {
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
  function handleSubmit(event) {
    event.preventDefault();
    setButtonDisabled(true);
    onLogin(loginDetails);
    setButtonDisabled(false);
  }

  return (
    <div className="login-container">
      <Banner />
      <div className="login-form">
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
            Do not have an account? <a href="/register">Sign up</a>
          </p>
        </form>
      </div>
      <ToastContainerComponent />
    </div>
  );
}

export default Login;
