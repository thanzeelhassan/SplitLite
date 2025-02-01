import React, { useState } from "react";

function BackButton(props) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      class="back-button"
      onClick={props.onClick}
    >
      &#11148; Back
    </button>
  );
}

export default BackButton;
