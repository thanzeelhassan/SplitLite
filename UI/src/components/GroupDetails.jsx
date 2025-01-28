import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GroupService from "./GroupService";
import { AddExpenseModal } from "./GroupDetails/Modals/AddExpenseModal";
import { AddMemberModal } from "./GroupDetails/Modals/AddMemberModal";
import { AddSettlementModal } from "./GroupDetails/Modals/AddSettlementModal";
import { ActionButtons } from "./GroupDetails/ActionButtons";
import PendingPayments from "./GroupDetails/PendingPayments";
import SettlementsList from "./GroupDetails/SettlementsList";
import ExpensesList from "./GroupDetails/ExpensesList";
import MembersList from "./GroupDetails/MembersList";
import GroupInfo from "./GroupDetails/GroupInfo";

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

  return (
    <motion.div className="group-detail-view">
      <GroupInfo group={group} onBackClick={onBackClick} />
      <MembersList members={members} />
      <ExpensesList expenses={expenses} participants={participants} />
      <SettlementsList settlements={settlements} />
      <PendingPayments settlements={settlements} />

      <ActionButtons openModal={openModal} />

      {showAddMember && (
        <AddMemberModal
          email={email}
          setEmail={setEmail}
          isAdding={isAdding}
          addError={addError}
          handleAddMember={handleAddMember}
          closeModal={closeAllModals}
        />
      )}

      {showAddExpense && (
        <AddExpenseModal
          expenseDetails={expenseDetails}
          setExpenseDetails={setExpenseDetails}
          isAdding={isAdding}
          addError={addError}
          handleAddExpense={handleAddExpense}
          closeModal={closeAllModals}
        />
      )}

      {showAddSettlement && (
        <AddSettlementModal
          settlementDetails={settlementDetails}
          setSettlementDetails={setSettlementDetails}
          isAdding={isAdding}
          addError={addError}
          handleAddSettlement={handleAddSettlement}
          closeModal={closeAllModals}
        />
      )}
    </motion.div>
  );
}

export default GroupDetails;
