// Modals/AddExpenseModal.jsx
import React, { useState } from "react";
import GroupService from "./GroupService";

export const AddExpenseModal = ({ groupId, onSuccess, closeModal }) => {
  const [expenseDetails, setExpenseDetails] = useState({
    paid_by_email: "",
    amount: "",
    description: "",
    participants: [],
  });
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);

  const handleAddExpense = async () => {
    try {
      setIsAdding(true);
      setError(null);
      const token = localStorage.getItem("authToken");

      const paidById = await GroupService.getUserIdByEmail(
        expenseDetails.paid_by_email,
        token
      );

      const participantsWithIds = await Promise.all(
        expenseDetails.participants.map(async (participant) => {
          const participantId = await GroupService.getUserIdByEmail(
            participant.email,
            token
          );
          return { user_id: participantId, amount: participant.amount };
        })
      );

      await GroupService.addExpense(
        groupId,
        {
          paid_by: paidById,
          amount: expenseDetails.amount,
          description: expenseDetails.description,
          participants: participantsWithIds,
        },
        token
      );

      onSuccess();
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
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
          setExpenseDetails({ ...expenseDetails, description: e.target.value })
        }
      />

      <h4>Participants</h4>
      <ul>
        {expenseDetails.participants?.map((participant, index) => (
          <li key={index}>
            <input
              type="email"
              placeholder="Participant Email"
              value={participant.email}
              onChange={(e) => {
                const updated = [...expenseDetails.participants];
                updated[index].email = e.target.value;
                setExpenseDetails({ ...expenseDetails, participants: updated });
              }}
            />
            <input
              type="number"
              placeholder="Amount"
              value={participant.amount}
              onChange={(e) => {
                const updated = [...expenseDetails.participants];
                updated[index].amount = e.target.value;
                setExpenseDetails({ ...expenseDetails, participants: updated });
              }}
            />
            <button
              onClick={() =>
                setExpenseDetails({
                  ...expenseDetails,
                  participants: expenseDetails.participants.filter(
                    (_, i) => i !== index
                  ),
                })
              }
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() =>
          setExpenseDetails({
            ...expenseDetails,
            participants: [
              ...expenseDetails.participants,
              { email: "", amount: "" },
            ],
          })
        }
      >
        Add Participant
      </button>

      <button onClick={handleAddExpense} disabled={isAdding}>
        {isAdding ? "Adding..." : "Add Expense"}
      </button>
      <button onClick={closeModal}>Cancel</button>
      {addError && <p className="error">{addError}</p>}
    </div>
  );
};
