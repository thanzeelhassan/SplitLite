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
    participants: [],
  });

  const [showAddSettlement, setShowAddSettlement] = useState(false);
  const [settlementDetails, setSettlementDetails] = useState({
    payer_email: "",
    payee_email: "",
    amount: "",
  });

  // Function to manage modals
  const openModal = (modalName) => {
    setShowAddMember(false);
    setShowAddExpense(false);
    setShowAddSettlement(false);

    switch (modalName) {
      case "addMember":
        setShowAddMember(true);
        break;
      case "addExpense":
        setShowAddExpense(true);
        break;
      case "addSettlement":
        setShowAddSettlement(true);
        break;
      default:
        break;
    }
  };

  // Function to close all modals
  const closeAllModals = () => {
    setShowAddMember(false);
    setShowAddExpense(false);
    setShowAddSettlement(false);
  };

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

      // Resolve email to user ID for the person who paid
      const paidById = await GroupService.getUserIdByEmail(
        expenseDetails.paid_by_email,
        token
      );

      // Resolve email to user IDs for each participant
      const participantsWithIds = await Promise.all(
        (expenseDetails.participants || []).map(async (participant) => {
          const participantId = await GroupService.getUserIdByEmail(
            participant.email,
            token
          );
          return {
            user_id: participantId,
            amount: participant.amount,
          };
        })
      );

      // Prepare the expense payload
      const expensePayload = {
        paid_by: paidById,
        amount: expenseDetails.amount,
        description: expenseDetails.description,
        participants: participantsWithIds, // Include participants in the payload
      };

      // Add expense using GroupService
      await GroupService.addExpense(group.group_id, expensePayload, token);

      // Fetch updated expenses
      const updatedExpenses = await GroupService.fetchExpenses(
        group.group_id,
        token
      );
      setExpenses(updatedExpenses);

      // Fetch updated expense participants
      const updatedExpenseParticipants =
        await GroupService.fetchExpenseParticipants(group.group_id, token);
      setParticipants(updatedExpenseParticipants);

      // Reset the form and close modal
      setShowAddExpense(false);
      setExpenseDetails({
        paid_by_email: "",
        amount: "",
        description: "",
        participants: [], // Reset participants
      });
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
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
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
      </div>

      <h2>Members</h2>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
        }}
      >
        {members.length > 0 ? (
          members.map((member) => (
            <li
              key={member.id}
              style={{
                marginBottom: "10px",
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              Name : <strong>{member.name} </strong>
              <br></br>
              Email : <strong>({member.email})</strong>
            </li>
          ))
        ) : (
          <p>No members found.</p>
        )}
      </ul>

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
                <strong>{expense.amount}</strong> paid by{" "}
                <strong>{expense.name}</strong> | Description:{" "}
                <strong>{expense.description}</strong>
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
                        <strong>{participant.amount_owed}</strong> to{" "}
                        <strong>{participant.paid_by_name}</strong>
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

      {/* Buttons to Add Member, Expense, Settlement */}
      <button onClick={() => openModal("addMember")}>Add Member</button>
      <button onClick={() => openModal("addExpense")}>Add Expense</button>
      <button onClick={() => openModal("addSettlement")}>Add Settlement</button>

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
          <button onClick={closeAllModals}>Cancel</button>
          {addError && <p className="error">{addError}</p>}
        </div>
      )}

      {/* Modal for Adding Expense */}
      {showAddExpense && (
        <div className="modal">
          <h3>Add Expense</h3>
          {/* Expense Details */}
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

          {/* Participants Subform */}
          <h4>Participants</h4>
          <ul>
            {expenseDetails.participants &&
              expenseDetails.participants.map((participant, index) => (
                <li key={index}>
                  <input
                    type="email"
                    placeholder="Participant Email"
                    value={participant.email}
                    onChange={(e) => {
                      const updatedParticipants = [
                        ...expenseDetails.participants,
                      ];
                      updatedParticipants[index].email = e.target.value;
                      setExpenseDetails({
                        ...expenseDetails,
                        participants: updatedParticipants,
                      });
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={participant.amount}
                    onChange={(e) => {
                      const updatedParticipants = [
                        ...expenseDetails.participants,
                      ];
                      updatedParticipants[index].amount = e.target.value;
                      setExpenseDetails({
                        ...expenseDetails,
                        participants: updatedParticipants,
                      });
                    }}
                  />
                  <button
                    onClick={() => {
                      const updatedParticipants =
                        expenseDetails.participants.filter(
                          (_, i) => i !== index
                        );
                      setExpenseDetails({
                        ...expenseDetails,
                        participants: updatedParticipants,
                      });
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
          </ul>

          {/* Button to Add New Participant */}
          <button
            onClick={() =>
              setExpenseDetails({
                ...expenseDetails,
                participants: [
                  ...(expenseDetails.participants || []),
                  { email: "", amount: "" },
                ],
              })
            }
          >
            Add Participant
          </button>

          {/* Add Expense Button */}
          <button onClick={handleAddExpense} disabled={isAdding}>
            {isAdding ? "Adding..." : "Add Expense"}
          </button>
          <button onClick={closeAllModals}>Cancel</button>
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
          <button onClick={closeAllModals}>Cancel</button>
          {addError && <p className="error">{addError}</p>}
        </div>
      )}
    </motion.div>
  );
}

export default GroupDetails;
