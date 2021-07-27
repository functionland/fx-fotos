import React from "react";
import { textToColor } from "../utils";

export function ProfilePic({ name, profilePic }) {
  const profileColor = textToColor(name);

  return (
    <div className="profile-pic">
      {profilePic ? (
        <img alt={name} src={`${profilePic}`} />
      ) : (
        <div
          className="placeholder-profile-pic"
          style={{ backgroundColor: profileColor }}
          title={name}
        >
          <span className="left-eye" />
          <span className="right-eye" />
          <span className="smile" />
          <span className="mouth" />
          <span className="tongue" />
        </div>
      )}
    </div>
  );
}
