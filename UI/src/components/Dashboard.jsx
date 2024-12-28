import React, { useState } from "react";
import ToastContainerComponent from "./Toasts";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_API_URL;

async function Dashboard() {
  try {
    const response = await fetch(`${baseUrl}/protected`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    console.log(`Response status: ${response.status}`);
    console.log(`Response: ${response.ok}`);
    if (response.ok) {
      console.log("Access granted");
      return <h1>Welcome to the Dashboard</h1>;
    } else {
      //const errorData = await response.json();
      toast.error(
        errorData.message || "Something went wrong. Please try again."
      );
      return <h1>Access denied</h1>;
    }
  } catch (error) {
    console.log(error);
    toast.error("Something went wrong. Please try again.");
    return <h1>Access denied</h1>;
  }
}

export default Dashboard;
