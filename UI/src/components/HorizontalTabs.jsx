import React from "react";

function HorizontalTabs(props) {
  return (
    <div className="horizontal-tabs">
      {["activities", "balances", "members", "totals"].map((item) => (
        <button
          key={item}
          className={props.activeTab === item ? "active-horizontal-tab" : ""}
          onClick={() => props.handleClick(item)}
        >
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default HorizontalTabs;
