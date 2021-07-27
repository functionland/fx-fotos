import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { isDropDay, REWARDS_CHECK_INTERVAL } from "../utils";
import giftIcon from "../assets/images/icon-rewards.png";
import tokenIcon from "../assets/images/icon-tokens.png";
import chevron from "../assets/images/icon-back.png";
import close from "../assets/images/icon-close.png";

import "./DropDayNotification.scss";

// We track this in localStorage so as not to repeatedly alert the user
const DROP_DAY_LS_KEY = "ic-can-can-dropday-alerted";

function getAlerted(): boolean {
  return localStorage.getItem(DROP_DAY_LS_KEY) === "true";
}
function setAlerted() {
  localStorage.setItem(DROP_DAY_LS_KEY, "true");
}

/*
 * This functions as an alert to let the user know they can convert their earned
 * rewards into tokens or merchandise, and direct them to the /rewards route.
 */
export function DropDayNotification() {
  const [isVisible, setIsVisible] = useState(false);

  function closeAlert() {
    setAlerted();
    setIsVisible(false);
  }

  // We poll the canister periodically to determine if `isDropDay` has changed
  function pollIsDropDay() {
    isDropDay()
      .then((result) => {
        if (result && !getAlerted()) {
          setIsVisible(result);
        }
      })
      .catch((err) => {
        // nothing to do here
        console.error(err);
      });
  }
  const interval = setInterval(pollIsDropDay, REWARDS_CHECK_INTERVAL);

  useEffect(() => {
    pollIsDropDay();
    return () => clearInterval(interval);
  }, []);

  return (
    <CSSTransition
      in={isVisible}
      timeout={750}
      classNames="dropday-alert"
      unmountOnExit
    >
      <div id="dropday-alert" className="dropday-alert">
        <div className="transfer-diagram">
          <img src={giftIcon} alt="Rewards" width={20} />
          <img
            src={chevron}
            alt="into"
            style={{ transform: "rotate(-90deg)" }}
            width={8}
          />
          <img src={tokenIcon} alt="Tokens" width={23} />
        </div>
        <div className="alert-content">
          <div className="alert-header">Today is Drop Day!</div>
          <div className="alert-message">
            Exchange your Reward Points for tokens or prizes.
            <Link className="alert-link" to="/rewards" onClick={closeAlert}>
              View now.
            </Link>
          </div>
        </div>
        <button className="close-dismiss" onClick={closeAlert}>
          <img src={close} alt="Close Alert" />
        </button>
      </div>
    </CSSTransition>
  );
}
