import React from "react";
import { motion } from "framer-motion";
import "../../public/styles.css"; // Add custom CSS for styling

function Groups({ groupsDetails }) {
  const handleCardClick = (groupId) => {
    // Navigate to a new page (replace with your routing logic)
    window.location.href = `/groups/${groupId}`;
  };

  return (
    <motion.div
      className="groups-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Group Details</h2>

      {groupsDetails && groupsDetails.length > 0 ? (
        <div className="groups-grid">
          {groupsDetails.map((group) => (
            <div
              key={group.group_id}
              className="group-card"
              onClick={() => handleCardClick(group.group_id)}
            >
              <h3>{group.name}</h3>
              <p>
                <strong>Description:</strong> {group.description}
              </p>
              <p>
                <strong>Created By:</strong> {group.created_by || "N/A"}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(group.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No groups available.</p>
      )}
    </motion.div>
  );
}

export default Groups;
