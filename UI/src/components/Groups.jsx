import React from "react";
import { motion } from "framer-motion";

function Groups({ groupsDetails }) {
  return (
    <motion.div
      className="profile-details"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Group Details</h2>

      {groupsDetails && groupsDetails.length > 0 ? (
        groupsDetails.map((group, index) => (
          <div key={group.group_id || index} className="group-item">
            <p>
              <strong>Group ID:</strong> {group.group_id}
            </p>
            <p>
              <strong>Name:</strong> {group.name}
            </p>
            <p>
              <strong>Description:</strong> {group.description}
            </p>
            <p>
              <strong>Created By:</strong> {group.created_by || "N/A"}
            </p>
            <p>
              <strong>Created At:</strong> {new Date(group.created_at).toLocaleString()}
            </p>
            <hr />
          </div>
        ))
      ) : (
        <p>No groups available.</p>
      )}
    </motion.div>
  );
}

export default Groups;
