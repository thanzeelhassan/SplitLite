import React from "react";

function GroupInfo({ group, onBackClick }) {
  return (
    <div
      style={{
        marginTop: "30px",
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
  );
}

export default GroupInfo;
