import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const baseUrl = import.meta.env.VITE_API_URL;

function GroupDetails({ group, onBackClick }) {
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGroupDetails() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("authToken");
        // Replace these URLs with your API endpoints
        const membersResponse = await fetch(
          `${baseUrl}/groups/${group.group_id}/members`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const expensesResponse = await fetch(
          `${baseUrl}/groups/${group.group_id}/expenses`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const settlementsResponse = await fetch(
          `${baseUrl}/groups/${group.group_id}/settlements`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (
          !membersResponse.ok ||
          !expensesResponse.ok ||
          !settlementsResponse.ok
        ) {
          throw new Error("Failed to fetch group details");
        }

        const membersData = await membersResponse.json();
        const expensesData = await expensesResponse.json();
        const settlementsData = await settlementsResponse.json();

        setMembers(membersData.members);
        setExpenses(expensesData.expenses);
        setSettlements(settlementsData.settlements);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGroupDetails();
  }, [group.group_id]);

  if (loading) {
    return <motion.div>Loading...</motion.div>;
  }

  if (error) {
    return <motion.div>Error: {error}</motion.div>;
  }

  return (
    <motion.div className="group-detail-view">
      <button onClick={onBackClick}>Back to Groups</button>
      <h2>{group.name}</h2>
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
      <p>
        <strong>Group Id:</strong> {group.group_id || "N/A"}
      </p>

      <h2>Members</h2>
      <ul>
        {members.length > 0 ? (
          members.map((member) => (
            <li key={member.id}>
              {member.name} ({member.email})
            </li>
          ))
        ) : (
          <p>No members found.</p>
        )}
      </ul>

      <h2>Expenses</h2>
      <ul>
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <li key={expense.id}>
              {expense.description} - {expense.amount} paid by {expense.paid_by}
              
            </li>
          ))
        ) : (
          <p>No expenses found.</p>
        )}
      </ul>

      <h2>Settlements</h2>
      <ul>
        {settlements.length > 0 ? (
          settlements.map((settlement) => (
            <li key={settlement.id}>
              {settlement.payer_id} paid {settlement.payee_id} - {settlement.amount}{" "}
            </li>
          ))
        ) : (
          <p>No settlements found.</p>
        )}
      </ul>
    </motion.div>
  );
}

export default GroupDetails;
