import React from "react";

function Profile(props) {
  return (
    <div className="profile-details">
      <h2>Profile Details</h2>
      <p>
        <strong>Name:</strong> {props.profileDetails.userName}
      </p>
      <p>
        <strong>Email:</strong> {props.profileDetails.email}
      </p>
      <p>
        <strong>Phone:</strong> {props.profileDetails.phone}
      </p>
    </div>
  );
}

export default Profile;
