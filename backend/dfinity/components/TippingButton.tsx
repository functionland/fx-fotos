import React, { useEffect, useState, useRef } from "react";
import debounce from "lodash.debounce";

import { putRewardTransfer } from "../utils";
import tipIcon from "../assets/images/icon-tip-active.png";
import "./TippingButton.scss";

const DEFAULT_TIPPING_AMOUNT = 1;

export default function TippingButton({
  senderId,
  currentRewardPoints,
  recipientId,
  onRefreshUser,
}) {
  const [isDisabled, setDisabled] = useState(false);
  const [activeAnimations, setActiveAnimations] = useState<number[] | []>([]);
  const [animationId, setAnimationId] = useState(0);
  const [localRewardPoints, setRewardPoints] = useState(currentRewardPoints);
  const [tippingPoints, setTippingPoints] = useState(1);

  // The save tipping function gets debounced so it collects tips from the last
  // 5 seconds and applies them all at once. If the amount of tips is over a
  // certain threshold, show the user a confirmation.
  const saveTipping = async (localTippingPoints) => {
    setTippingPoints(1);
    await putRewardTransfer(senderId, recipientId, BigInt(localTippingPoints));
    onRefreshUser();
  };
  const saveTippingDebounced = useRef(debounce(saveTipping, 3000));

  // On click store the accumulated tipping points for multiple clicks and call
  // the debounced tip saving function to save on the backend
  const handleClick = async (ev) => {
    ev.preventDefault();
    if (isDisabled) return;
    setRewardPoints(localRewardPoints - DEFAULT_TIPPING_AMOUNT);
    setTippingPoints(tippingPoints + DEFAULT_TIPPING_AMOUNT);
    saveTippingDebounced.current(tippingPoints);
    setAnimationId((prevId) => prevId + 1);
    const currentId = animationId;
    setActiveAnimations((prev) => [...prev, currentId]);
    setTimeout(() => {
      setActiveAnimations((prev) => prev.filter((id) => id !== currentId));
    }, 4000);
  };

  useEffect(() => {
    setRewardPoints(currentRewardPoints);
    if (currentRewardPoints < DEFAULT_TIPPING_AMOUNT) {
      setDisabled(true);
    }
  }, [currentRewardPoints]);

  useEffect(() => {
    if (senderId === recipientId) setDisabled(true);
  }, []);

  return (
    <span
      className="TippingButton"
      onClick={handleClick}
      style={{
        pointerEvents: isDisabled ? "none" : "all",
        cursor: isDisabled ? "default" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      <img
        src={tipIcon}
        className={activeAnimations.length > 0 ? "active" : "default"}
        alt="icon: video reward points"
      />
      <span>{localRewardPoints}</span>
      <div className="TippingEffect">
        {activeAnimations.map((id) => (
          <div
            className="TippingEnvelopeOuter"
            key={id}
            style={{
              left: `${((id * 1.5) % 20) - 10}px`,
              top: `${((id * 1.5) % 20) + 70}px`,
            }}
          >
            <img className="TippingEnvelope" src={tipIcon} alt="tips" />
          </div>
        ))}
      </div>
    </span>
  );
}
