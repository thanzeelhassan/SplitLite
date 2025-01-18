import React, { useState } from "react";
import { motion } from "framer-motion";
import GroupDetails from "./GroupDetails"; // Import GroupDetails component
//import '../../public/styles.css';

function Groups({ groupsDetails }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [hover, setHover] = useState(false);

  const handleCardClick = (group) => {
    setSelectedGroup(group);
  };

  const handleBackClick = () => {
    setSelectedGroup(null);
  };
  function createGroupCard(group) {
    const customStyle = {
      color: "#e14343",
    };
    let balanceDetails = "You owe " + Math.abs(group.balance);
    if (group.balance > 0) {
      customStyle.color = "#2ba10e";
      balanceDetails = "You are owed " + group.balance;
    } else if (group.balance == 0) {
      customStyle.color = "#333333";
      balanceDetails = "You are all settled up!";
    }
    return (
      <div
        key={group.group_id}
        className="group-card"
        onClick={() => handleCardClick(group)}
      >
        <h3>{group.name}</h3>
        <p className="date">{new Date(group.created_at).toLocaleString()}</p>
        <p>Created By: {group.created_by || "N/A"}</p>
        <p className="balance" style={customStyle}>
          {balanceDetails}
        </p>
      </div>
    );
  }
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
          <h2>Groups</h2>
          {groupsDetails && groupsDetails.length > 0 ? (
            <div className="groups-grid">
              {groupsDetails.map(createGroupCard)}
            </div>
          ) : (
            <p>No groups available.</p>
          )}
          <button
            className="custom-button"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <div className="icon">{hover ? null : "+"}</div>
            <div className="text">{hover ? "Add Group" : null}</div>
          </button>
        </>
      )}
    </motion.div>
  );
}

export default Groups;
