import React from "react";
import { motion } from "framer-motion";

function ExpensesList({ expenses, participants }) {
  return (
    <motion.div className="group-detail-view">
      <h2>Expenses</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <li
              key={expense.expense_id}
              style={{
                marginBottom: "20px", // Add spacing between expenses
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <div style={{ marginBottom: "10px" }}>
                {expense.amount} paid by {expense.name} | Description:{" "}
                {expense.description}
              </div>
              <div>
                <strong>Participants:</strong>
                <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                  {participants[expense.expense_id] &&
                  participants[expense.expense_id].length > 0 ? (
                    participants[expense.expense_id].map((participant) => (
                      <li
                        key={participant.expense_participant_id}
                        style={{
                          marginBottom: "5px", // Add spacing between participants
                        }}
                      >
                        {participant.participant_name} owes{" "}
                        {participant.amount_owed} to {participant.paid_by_name}
                      </li>
                    ))
                  ) : (
                    <li style={{ color: "#777" }}>
                      No participants found for this expense.
                    </li>
                  )}
                </ul>
              </div>
            </li>
          ))
        ) : (
          <p>No expenses found.</p>
        )}
      </ul>
    </motion.div>
  );
}

export default ExpensesList;
