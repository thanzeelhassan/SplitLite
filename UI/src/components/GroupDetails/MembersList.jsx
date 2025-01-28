import React from "react";
import { motion } from "framer-motion";

function MembersList({ members }) {
  return (
    <motion.div className="group-detail-view">
      <h2>Members</h2>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
        }}
      >
        {members.length > 0 ? (
          members.map((member) => (
            <li
              key={member.id}
              style={{
                marginBottom: "10px",
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              Name : {member.name}
              <br />
              Email : ({member.email})
            </li>
          ))
        ) : (
          <p>No members found.</p>
        )}
      </ul>
    </motion.div>
  );
}

export default MembersList;
