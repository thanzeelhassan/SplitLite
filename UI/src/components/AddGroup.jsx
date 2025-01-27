import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ToastContainerComponent from "./Toasts";

const baseUrl = import.meta.env.VITE_API_URL;

function AddGroup(props) {
  const [groupDetails, setGroupDetails] = useState({
    name: "",
    description: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  function handleChange(event) {
    const { name, value } = event.target;
    setGroupDetails((prev) => {
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
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(groupDetails),
      });
      console.log(`Response status: ${response.status}`);
      if (response.ok) {
        toast.success("Group created successfully!");
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
    <motion.div
      className="groups-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <button onClick={() => props.onClick()}>Back to Groups</button>
      <h2>Add Group</h2>
      <form className="add-group-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={groupDetails.name}
          required
          onChange={handleChange}
        />
        <textarea
          type="text"
          name="description"
          placeholder="Description"
          value={groupDetails.description}
          onChange={handleChange}
        />
        <button type="submit" disabled={buttonDisabled}>
          Submit
        </button>
      </form>
      <ToastContainerComponent />
    </motion.div>
  );
}

export default AddGroup;
