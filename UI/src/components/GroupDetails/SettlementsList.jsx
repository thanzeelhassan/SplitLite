import React from "react";
import { motion } from "framer-motion";

function SettlementsList({ settlements }) {
  return (
    <motion.div className="group-detail-view">
      <h2>Settlements</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {settlements.length > 0 ? (
          settlements.map((settlement) => (
            <li
              key={settlement.id}
              style={{
                marginBottom: "10px",
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              {settlement.name_payer} paid {settlement.name_payee} -{" "}
              {settlement.amount}{" "}
            </li>
          ))
        ) : (
          <p>No settlements found.</p>
        )}
      </ul>
    </motion.div>
  );
}

export default SettlementsList;
