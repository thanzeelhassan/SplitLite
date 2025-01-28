import React from "react";
import { motion } from "framer-motion";

function Home(props) {
  return (
    <motion.div
      className="profile-details"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Home</h2>
    </motion.div>
  );
}

export default Home;
