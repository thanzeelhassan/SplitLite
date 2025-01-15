import React from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const GroupDetails = () => {
  const { groupId } = useParams();

  return (
    <motion.div>
      <h2>Details for Group ID: {groupId}</h2>
      {/* Fetch and display group details using the groupId */}
      {/* Example: */}
      {/* You can use groupId to fetch group data if necessary */}
    </motion.div>
  );
};

export default GroupDetails;
