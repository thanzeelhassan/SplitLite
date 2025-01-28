// Modals/AddSettlementModal.jsx
import React, { useState } from "react";
import GroupService from "../GroupService";

export const AddSettlementModal = ({ groupId, onSuccess, closeModal }) => {
  const [settlementDetails, setSettlementDetails] = useState({
    payer_email: "",
    payee_email: "",
    amount: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);

  const handleAddSettlement = async () => {
    try {
      setIsAdding(true);
      setError(null);
      const token = localStorage.getItem("authToken");

      const payerId = await GroupService.getUserIdByEmail(
        settlementDetails.payer_email,
        token
      );
      const payeeId = await GroupService.getUserIdByEmail(
        settlementDetails.payee_email,
        token
      );

      await GroupService.addSettlement(
        groupId,
        {
          payer_id: payerId,
          payee_id: payeeId,
          amount: settlementDetails.amount,
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
      {error && <p className="error">{setError}</p>}
    </div>
  );
};

export default AddSettlementModal;
