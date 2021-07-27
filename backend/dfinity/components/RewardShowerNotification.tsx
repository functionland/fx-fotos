import React, { useEffect, useState } from "react";

import { ProfileInfoPlus, Message } from "../utils/canister/typings";
import { getMessages, REWARDS_CHECK_INTERVAL } from "../utils";
import LottieAnimation from "./LottieAnimation";
import RewardPointAnim from "../assets/animations/RewardPointShower.json";
import "./RewardShowerNotification.scss";

const KEY_LOCALSTORAGE_READ_MESSAGES_TIME = "ic-can-can-read_messages";

interface RewardShowerProps {
  currentUser: ProfileInfoPlus;
}

// Count up all the reward points from a message
function rewardPointsReducer(acc: number, message: Message) {
  const { event } = message;
  let reward = 0;

  if (!event) return acc;
  // @ts-ignore
  if (event.uploadReward) reward = Number(event.uploadReward.rewards);
  // @ts-ignore
  if (event.superlikerReward) reward = Number(event.superlikerReward.rewards);
  // @ts-ignore
  if (event.transferReward) reward = Number(event.transferReward.rewards);
  return acc + reward;
}

// Filter messages based on the last date they were read, stored in localStorage
function unreadMessagesFilter(message: Message) {
  const lastReadTime = localStorage.getItem(
    KEY_LOCALSTORAGE_READ_MESSAGES_TIME
  );
  if (!lastReadTime) return true;
  return message.time > BigInt(lastReadTime);
}

export function RewardShowerNotification(props: RewardShowerProps) {
  const [currentRewards, setRewards] = useState(0);
  const [isDismissed, setDismissed] = useState(false);

  // Checks the user's events and pulls out any reward points for unread messages
  function checkForNewMessages() {
    getMessages(props.currentUser.userName).then((messages) => {
      const unreadMessages = messages.filter(unreadMessagesFilter);
      if (unreadMessages.length === 0) return;
      const rewardPoints = unreadMessages.reduce(rewardPointsReducer, 0);
      if (rewardPoints > 0) {
        setRewards(rewardPoints);
        // Clear the animation after 5 seconds, the duration of the animation
        setTimeout(clearMessages, 5000);
      }
      if (unreadMessages) {
        setDismissed(false);
        localStorage.setItem(
          KEY_LOCALSTORAGE_READ_MESSAGES_TIME,
          (Date.now() * 1000 * 1000).toString()
        );
      }
    });
  }

  // Clear the reward point shower notification
  function clearMessages() {
    setDismissed(true);
    setRewards(0);
  }

  // Check the user messages for reward messages, every minute.
  useEffect(() => {
    checkForNewMessages();
    const interval = setInterval(checkForNewMessages, REWARDS_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="RewardShowerContainer">
      {currentRewards > 0 && !isDismissed && (
        <div className="RewardShowerAnimationContainer" onClick={clearMessages}>
          <LottieAnimation height={660} animation={RewardPointAnim} />
        </div>
      )}
    </div>
  );
}
