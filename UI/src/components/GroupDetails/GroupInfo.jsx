import React from "react";
import BackButton from "../BackButton";

function GroupInfo({ group, onBackClick }) {
  return (
    <div
      className="group-info"
      style={{
        marginTop: "30px",
        padding: "15px",
        border: "1px solid #ccc",
      }}
    >
      <BackButton onClick={onBackClick} />
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
    </div>
  );
}

export default GroupInfo;
