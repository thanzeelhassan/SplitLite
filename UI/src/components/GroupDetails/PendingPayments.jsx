import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

function PendingPayments(props) {
  const pendingPayments = props.pendingPayments;
  return (
    <motion.div className="group-detail-view">
      {/* Pending Payments section */}
      <h2>Pending Payments</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {pendingPayments.length > 0 ? (
          pendingPayments.map((pendingPayment) => (
            <li
              key={pendingPayment.id}
              style={{
                marginBottom: "10px",
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              {pendingPayment.name_payer} paid {pendingPayment.name_payee} -{" "}
              {pendingPayment.amount}{" "}
            </li>
          ))
        ) : (
          <p>No pending Payments found.</p>
        )}
      </ul>
    </motion.div>
  );
}

export default PendingPayments;
