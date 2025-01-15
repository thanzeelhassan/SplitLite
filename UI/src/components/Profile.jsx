import React from "react";
import { motion } from "framer-motion";

function Profile(props) {
  return (
    <motion.div
      className="profile-details"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Profile Details</h2>
      <p>
        <strong>Name:</strong> {props.profileDetails.userName}
      </p>
      <p>
        <strong>Email:</strong> {props.profileDetails.email}
      </p>
      <p>
        <strong>Phone:</strong> {props.profileDetails.phone}
      </p>
    </motion.div>
  );
}

export default Profile;
