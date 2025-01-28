// Modals/AddSettlementModal.jsx
import React from "react";

export const AddSettlementModal = ({
  settlementDetails,
  setSettlementDetails,
  isAdding,
  addError,
  handleAddSettlement,
  closeModal,
}) => (
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
        setSettlementDetails({ ...settlementDetails, amount: e.target.value })
      }
    />
    <button onClick={handleAddSettlement} disabled={isAdding}>
      {isAdding ? "Adding..." : "Add Settlement"}
    </button>
    <button onClick={closeModal}>Cancel</button>
    {addError && <p className="error">{addError}</p>}
  </div>
);
