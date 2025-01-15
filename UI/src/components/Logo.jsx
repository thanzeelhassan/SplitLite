import React from "react";
import logo from "../assets/images/logo.png";

function Logo(props) {
  return (
    <div className="loading-screen">
      <img
        src={logo}
        alt="Logo"
        className="logo-round-image"
        height="250px"
        width="250px"
      />
    </div>
  );
}

export default Logo;
