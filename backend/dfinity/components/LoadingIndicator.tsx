import React from "react";
import { CSSTransition } from "react-transition-group";
import "./LoadingIndicator.scss";

interface LoadingIndicatorProps {
  loadingMessage?: string;
  completedMessage?: string;
  isLoading?: boolean;
}

export function LoadingIndicator({
  loadingMessage = "Loading...",
  completedMessage,
  isLoading = true,
}: LoadingIndicatorProps) {
  // Adding the `.completed-message` class will delay the fade-out for 1s to
  // allow the user to see the updated message before it disappears.
  const showCompletedMessage = completedMessage ? "completed-message " : "";
  const timeout = completedMessage ? 2000 : 1000;

  return (
    <CSSTransition
      in={isLoading}
      timeout={timeout}
      classNames="LoadingContainer"
      unmountOnExit
    >
      <div className={`${showCompletedMessage}LoadingContainer`}>
        <div className="LoadingContainerContent">
          <h2>
            {isLoading ? loadingMessage : completedMessage ?? loadingMessage}
          </h2>
        </div>
      </div>
    </CSSTransition>
  );
}
