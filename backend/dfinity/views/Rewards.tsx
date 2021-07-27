import React from "react";
import rewardsView from "../assets/images/rewards-view.png";

/*
 * Stand-in for eventual Rewards View
 */
export function Rewards() {
  return (
    <img
      style={{ position: "absolute", height: "100%", width: "100%" }}
      src={rewardsView}
      alt="Rewards view"
    />
  );
}
