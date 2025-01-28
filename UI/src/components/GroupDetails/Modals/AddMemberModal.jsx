// Modals/AddMemberModal.jsx
import React from "react";

export const AddMemberModal = ({
  email,
  setEmail,
  isAdding,
  addError,
  handleAddMember,
  closeModal,
}) => (
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
    {addError && <p className="error">{addError}</p>}
  </div>
);
