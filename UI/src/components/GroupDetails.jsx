import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GroupService from "./GroupService";

function GroupDetails({ group, onBackClick }) {
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [participants, setParticipants] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals and input state
  const [showAddMember, setShowAddMember] = useState(false);
  const [email, setEmail] = useState("");
  const [addError, setAddError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseDetails, setExpenseDetails] = useState({
    paid_by_email: "",
    amount: "",
    description: "",
  });

  const [showAddSettlement, setShowAddSettlement] = useState(false);
  const [settlementDetails, setSettlementDetails] = useState({
    payer_email: "",
    payee_email: "",
    amount: "",
  });

  useEffect(() => {
    async function fetchGroupDetails() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("authToken");

        const members = await GroupService.fetchMembers(group.group_id, token);
        const expenses = await GroupService.fetchExpenses(
          group.group_id,
          token
        );
        const settlements = await GroupService.fetchSettlements(
          group.group_id,
          token
        );

        const expenseParticipants = await GroupService.fetchExpenseParticipants(
          group.group_id,
          token
        );

        console.log("expenseParticipants :", expenseParticipants);

        // Group participants by expense_id
        const participantsByExpense = expenseParticipants.reduce(
          (acc, participant) => {
            if (!acc[participant.expense_id]) {
              acc[participant.expense_id] = [];
            }
            acc[participant.expense_id].push(participant);
            return acc;
          },
          {}
        );
        console.log("participantsByExpense :", participantsByExpense);

        setMembers(members);
        setExpenses(expenses);
        setSettlements(settlements);
        setParticipants(participantsByExpense);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGroupDetails();
  }, [group.group_id]);

  const handleAddMember = async () => {
    try {
      setIsAdding(true);
      setAddError(null);
      const token = localStorage.getItem("authToken");
      const userId = await GroupService.getUserIdByEmail(email, token);
      await GroupService.addMember(group.group_id, userId, token);

      const updatedMembers = await GroupService.fetchMembers(
        group.group_id,
        token
      );
      setMembers(updatedMembers);
      setShowAddMember(false);
      setEmail("");
    } catch (err) {
      setAddError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddExpense = async () => {
    try {
      setIsAdding(true);
      setAddError(null);
      const token = localStorage.getItem("authToken");

      // Resolve email to user ID
      const paidById = await GroupService.getUserIdByEmail(
        expenseDetails.paid_by_email,
        token
      );

      const expensePayload = {
        paid_by: paidById,
        amount: expenseDetails.amount,
        description: expenseDetails.description,
      };

      await GroupService.addExpense(group.group_id, expensePayload, token);

      const updatedExpenses = await GroupService.fetchExpenses(
        group.group_id,
        token
      );
      setExpenses(updatedExpenses);
      setShowAddExpense(false);
      setExpenseDetails({ paid_by_email: "", amount: "", description: "" });
    } catch (err) {
      setAddError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddSettlement = async () => {
    try {
      setIsAdding(true);
      setAddError(null);
      const token = localStorage.getItem("authToken");

      // Resolve payer and payee emails to user IDs
      const payerId = await GroupService.getUserIdByEmail(
        settlementDetails.payer_email,
        token
      );
      const payeeId = await GroupService.getUserIdByEmail(
        settlementDetails.payee_email,
        token
      );

      const settlementPayload = {
        payer_id: payerId,
        payee_id: payeeId,
        amount: settlementDetails.amount,
      };

      await GroupService.addSettlement(
        group.group_id,
        settlementPayload,
        token
      );

      const updatedSettlements = await GroupService.fetchSettlements(
        group.group_id,
        token
      );
      setSettlements(updatedSettlements);
      setShowAddSettlement(false);
      setSettlementDetails({ payer_email: "", payee_email: "", amount: "" });
    } catch (err) {
      setAddError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <motion.div>Loading...</motion.div>;
  if (error) return <motion.div>Error: {error}</motion.div>;

  console.log("participants : ", participants);
  console.log("expenses : ", expenses);
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
            <li key={expense.expense_id}>
              <div>
                {expense.amount} paid by {expense.name} | Description:{" "}
                {expense.description}
              </div>
              <div>
                <strong>Participants:</strong>
                <ul>
                  {participants[expense.expense_id] &&
                  participants[expense.expense_id].length > 0 ? (
                    participants[expense.expense_id].map((participant) => (
                      <li key={participant.expense_participant_id}>
                        {participant.participant_name} owes{" "}
                        {participant.amount_owed} to {participant.paid_by_name}
                      </li>
                    ))
                  ) : (
                    <li>No participants found for this expense.</li>
                  )}
                </ul>
              </div>
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
              {settlement.name_payer} paid {settlement.name_payee} -{" "}
              {settlement.amount}{" "}
            </li>
          ))
        ) : (
          <p>No settlements found.</p>
        )}
      </ul>

      {/* Buttons to Add Member, Expense, Settlement */}
      <button onClick={() => setShowAddMember(true)}>Add Member</button>
      <button onClick={() => setShowAddExpense(true)}>Add Expense</button>
      <button onClick={() => setShowAddSettlement(true)}>Add Settlement</button>

      {/* Modal for Adding Member */}
      {showAddMember && (
        <div className="modal">
          <h3>Add Member</h3>
          <input
            type="email"
            placeholder="Enter member email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleAddMember} disabled={isAdding}>
            {isAdding ? "Adding..." : "Add Member"}
          </button>
          <button onClick={() => setShowAddMember(false)}>Cancel</button>
          {addError && <p className="error">{addError}</p>}
        </div>
      )}

      {/* Modal for Adding Expense */}
      {showAddExpense && (
        <div className="modal">
          <h3>Add Expense</h3>
          <input
            type="email"
            placeholder="Paid By (User Email)"
            value={expenseDetails.paid_by_email}
            onChange={(e) =>
              setExpenseDetails({
                ...expenseDetails,
                paid_by_email: e.target.value,
              })
            }
          />
          <input
            type="number"
            placeholder="Amount"
            value={expenseDetails.amount}
            onChange={(e) =>
              setExpenseDetails({ ...expenseDetails, amount: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Description"
            value={expenseDetails.description}
            onChange={(e) =>
              setExpenseDetails({
                ...expenseDetails,
                description: e.target.value,
              })
            }
          />
          <button onClick={handleAddExpense} disabled={isAdding}>
            {isAdding ? "Adding..." : "Add Expense"}
          </button>
          <button onClick={() => setShowAddExpense(false)}>Cancel</button>
          {addError && <p className="error">{addError}</p>}
        </div>
      )}

      {/* Modal for Adding Settlement */}
      {showAddSettlement && (
        <div className="modal">
          <h3>Add Settlement</h3>
          <input
            type="email"
            placeholder="Payer Email"
            value={settlementDetails.payer_email}
            onChange={(e) =>
              setSettlementDetails({
                ...settlementDetails,
                payer_email: e.target.value,
              })
            }
          />
          <input
            type="email"
            placeholder="Payee Email"
            value={settlementDetails.payee_email}
            onChange={(e) =>
              setSettlementDetails({
                ...settlementDetails,
                payee_email: e.target.value,
              })
            }
          />
          <input
            type="number"
            placeholder="Amount"
            value={settlementDetails.amount}
            onChange={(e) =>
              setSettlementDetails({
                ...settlementDetails,
                amount: e.target.value,
              })
            }
          />
          <button onClick={handleAddSettlement} disabled={isAdding}>
            {isAdding ? "Adding..." : "Add Settlement"}
          </button>
          <button onClick={() => setShowAddSettlement(false)}>Cancel</button>
          {addError && <p className="error">{addError}</p>}
        </div>
      )}
    </motion.div>
  );
}

export default GroupDetails;
