// Modals/AddMemberModal.jsx
import React, { useState } from "react";
import GroupService from "./GroupService";

export const AddMemberModal = ({ groupId, onSuccess, closeModal }) => {
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);

  const handleAddMember = async () => {
    try {
      setIsAdding(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      const userId = await GroupService.getUserIdByEmail(email, token);
      await GroupService.addMember(groupId, userId, token);
      onSuccess(); // Trigger parent to refresh data
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
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
      <button onClick={closeModal}>Cancel</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};
