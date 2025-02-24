// GroupDetails.jsx
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import GroupService from "./GroupDetails/GroupService";
import AddExpenseModal from "./GroupDetails/Modals/AddExpenseModal";
import AddMemberModal from "./GroupDetails/Modals/AddMemberModal";
import AddSettlementModal from "./GroupDetails/Modals/AddSettlementModal";
import { ActionButtons } from "./GroupDetails/ActionButtons";
import PendingPayments from "./GroupDetails/PendingPayments";
import SettlementsList from "./GroupDetails/SettlementsList";
import ExpensesList from "./GroupDetails/ExpensesList";
import MembersList from "./GroupDetails/MembersList";
import GroupInfo from "./GroupDetails/GroupInfo";
import HorizontalTabs from "./HorizontalTabs";

function GroupDetails({ group, onBackClick }) {
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [participants, setParticipants] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState("activities");

  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");

      const [
        members,
        expenses,
        settlements,
        expenseParticipants,
        pendingPayments,
      ] = await Promise.all([
        GroupService.fetchMembers(group.group_id, token),
        GroupService.fetchExpenses(group.group_id, token),
        GroupService.fetchSettlements(group.group_id, token),
        GroupService.fetchExpenseParticipants(group.group_id, token),
        GroupService.fetchPendingPayments(group.group_id, token),
      ]);

      const participantsByExpense = expenseParticipants.reduce(
        (acc, participant) => {
          acc[participant.expense_id] = acc[participant.expense_id] || [];
          acc[participant.expense_id].push(participant);
          return acc;
        },
        {}
      );

      setMembers(members);
      setExpenses(expenses);
      setSettlements(settlements);
      setParticipants(participantsByExpense);
      setPendingPayments(pendingPayments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [group.group_id]);

  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails]);
  function handleTabClick(tabName) {
    setActiveTab(tabName);
  }
  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  if (loading) return <motion.div>Loading...</motion.div>;
  if (error) return <motion.div>Error: {error}</motion.div>;

  return (
    <motion.div className="group-detail-view">
      <GroupInfo group={group} onBackClick={onBackClick} />
      <div className="group-content">
        <HorizontalTabs handleClick={handleTabClick} activeTab={activeTab} />
        {activeTab === "members" && <MembersList members={members} />}
        {activeTab === "activities" && (
          <div>
            <ExpensesList expenses={expenses} participants={participants} />
            <SettlementsList settlements={settlements} />
          </div>
        )}

        {activeTab === "balances" && (
          <PendingPayments pendingPayments={pendingPayments} />
        )}
        <ActionButtons openModal={openModal} />

        {activeModal === "addMember" && (
          <AddMemberModal
            groupId={group.group_id}
            onSuccess={fetchGroupDetails}
            closeModal={closeModal}
          />
        )}

        {activeModal === "addExpense" && (
          <AddExpenseModal
            groupId={group.group_id}
            onSuccess={fetchGroupDetails}
            closeModal={closeModal}
          />
        )}

        {activeModal === "addSettlement" && (
          <AddSettlementModal
            groupId={group.group_id}
            onSuccess={fetchGroupDetails}
            closeModal={closeModal}
          />
        )}
      </div>
    </motion.div>
  );
}

export default GroupDetails;
