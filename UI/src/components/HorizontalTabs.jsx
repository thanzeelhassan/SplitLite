import React from "react";

function HorizontalTabs(props) {
  return (
    <div className="horizontal-tabs">
      <button
        className="active-horizontal-tab"
        onClick={() => props.handleClick("activities")}
      >
        Activities
      </button>
      <button onClick={() => props.handleClick("balances")}>Balances</button>
      <button onClick={() => props.handleClick("memberlist")}>Members</button>
      <button onClick={() => props.handleClick("totals")}>Totals</button>
    </div>
  );
}

export default HorizontalTabs;
