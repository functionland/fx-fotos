import React from "react";
import { Link, NavLink } from "react-router-dom";
import homeIcon from "../assets/images/icon-home.png";
import discoverIcon from "../assets/images/icon-discover.png";
import uploadIcon from "../assets/images/icon-upload.png";
import rewardsIcon from "../assets/images/icon-rewards.png";
import profileIcon from "../assets/images/icon-profile.png";

import "./MainNav.scss";

function getPathRoot(path) {
  return path.split("/")[1];
}

export function MainNav({ paths }) {
  function setDestination(destination) {
    const index = paths.findIndex(
      (path) => getPathRoot(path) === getPathRoot(destination)
    );
    const currentIndex = paths.findIndex(
      (path) => getPathRoot(path) === getPathRoot(window.location.pathname)
    );

    function onClick() {
      const destinationIndex = index < 0 ? paths.length : index;
      const value = currentIndex > destinationIndex ? -100 : 100;
      document.getElementById(
        "slide-direction"
      )!.innerHTML = `.page-slide { --inDirection: ${value}%; }`;
    }

    return { to: destination, onClick };
  }

  return (
    <nav id="main-nav">
      <style id="slide-direction" />
      <div className="nav-item">
        <NavLink {...setDestination("/feed")}>
          <img
            aria-label="Home"
            src={homeIcon}
            alt="Home"
            role="button"
            width={20}
          />
        </NavLink>
      </div>
      <div className="nav-item">
        <NavLink {...setDestination("/discover")}>
          <img
            aria-label="Discover"
            src={discoverIcon}
            alt="Discover"
            role="button"
            width={20}
          />
        </NavLink>
      </div>
      <div className="nav-item">
        <Link {...setDestination("/upload")}>
          <img
            aria-label="Upload"
            alt="Upload"
            src={uploadIcon}
            role="button"
            width={36}
          />
        </Link>
      </div>
      <div className="nav-item">
        <NavLink {...setDestination("/rewards")}>
          <img
            aria-label="Rewards"
            src={rewardsIcon}
            alt="Rewards"
            role="button"
            width={20}
          />
        </NavLink>
      </div>
      <div className="nav-item">
        <NavLink {...setDestination("/profile")}>
          <img
            aria-label="Profile"
            src={profileIcon}
            alt="Profile"
            role="button"
            width={20}
          />
        </NavLink>
      </div>
    </nav>
  );
}
