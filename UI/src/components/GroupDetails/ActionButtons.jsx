// GroupDetails/ActionButtons.jsx
import React from "react";
import { motion } from "framer-motion";

export const ActionButtons = ({ openModal }) => (
  <motion.div className="action-buttons">
    <button onClick={() => openModal("addMember")}>Add Member</button>
    <button onClick={() => openModal("addExpense")}>Add Expense</button>
    <button onClick={() => openModal("addSettlement")}>Add Settlement</button>
  </motion.div>
);
