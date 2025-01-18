import React, { useState } from "react";
import { motion } from "framer-motion";
import GroupDetails from "./GroupDetails"; // Import GroupDetails component
//import '../../public/styles.css';

function Groups({ groupsDetails }) {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleCardClick = (group) => {
    setSelectedGroup(group);
  };

  const handleBackClick = () => {
    setSelectedGroup(null);
  };

  return (
    <motion.div
      className="groups-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {selectedGroup ? (
        <GroupDetails group={selectedGroup} onBackClick={handleBackClick} />
      ) : (
        <>
          <h2>Group Details</h2>
          {groupsDetails && groupsDetails.length > 0 ? (
            <div className="groups-grid">
              {groupsDetails.map((group) => (
                <div
                  key={group.group_id}
                  className="group-card"
                  onClick={() => handleCardClick(group)}
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
        </>
      )}
    </motion.div>
  );
}

export default Groups;
