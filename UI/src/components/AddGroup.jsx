import React, { useState } from "react";
import { motion } from "framer-motion";

function AddGroup(props) {
  const [groupDetails, setGroupDetails] = useState({
    groupName: "",
    groupDesc: "",
  });
  function handleChange(event) {
    const { name, value } = event.target;
    setGroupDetails((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }
  function handleSubmit() {}
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
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="groupName"
          placeholder="Name"
          value={groupDetails.groupName}
          required
          onChange={handleChange}
        />
        <input
          type="text"
          name="groupDesc"
          placeholder="Description"
          value={groupDetails.groupDesc}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
    </motion.div>
  );
}

export default AddGroup;
