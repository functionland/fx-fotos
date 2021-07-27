import React from "react";
import { CSSTransition } from "react-transition-group";
import { getUserFromCanister } from "../utils";
import { Feed } from "../views/Feed";
import { Discover } from "../views/Discover";
import { Upload } from "./Upload";
import { Rewards } from "../views/Rewards";
import { Profile } from "../views/Profile";
import { DropDayNotification } from "./DropDayNotification";
import { RewardShowerNotification } from "./RewardShowerNotification";
import { MainNav } from "./MainNav";
import { Redirect, Route, Switch } from "react-router-dom";

function wrapPrivateRouteWithSlide(render) {
  return ({ match }) => (
    <CSSTransition
      in={match != null}
      timeout={250}
      classNames="page-slide"
      unmountOnExit
    >
      <div className="page-slide">{render({ match })}</div>
    </CSSTransition>
  );
}

export function PrivateRoutes({
  location,
  user,
  isAuthenticated,
  setUser,
  logOut,
}) {
  function refreshProfileInfo() {
    getUserFromCanister(user?.userName!).then((user) => {
      if (user) {
        setUser(user);
      }
    });
  }

  const privateRoutes = [
    {
      path: "/feed",
      render: () => (
        <Feed profileInfo={user} onRefreshUser={refreshProfileInfo} />
      ),
    },
    { path: "/discover", render: () => <Discover profileInfo={user} /> },
    {
      path: "/upload",
      render: () => <Upload onUpload={refreshProfileInfo} user={user} />,
    },
    { path: "/rewards", render: () => <Rewards /> },
    {
      path: "/profile",
      render: () => <Profile currentUser={user} onLogOut={logOut} />,
    },
    {
      path: "/profiles/:userId",
      render: ({ match }) => (
        <Profile key={match?.params.userId} currentUser={user} />
      ),
    },
  ];
  const privatePaths = privateRoutes.map(({ path }) => path);

  return (
    <Route path={privatePaths}>
      {isAuthenticated && user ? (
        <>
          <DropDayNotification />
          <RewardShowerNotification currentUser={user} />
          <MainNav paths={privatePaths} />

          <Switch location={location}>
            {privateRoutes.map(({ path, render }) => (
              <Route key={path} path={path}>
                {wrapPrivateRouteWithSlide(render)}
              </Route>
            ))}
          </Switch>
        </>
      ) : (
        <Redirect to={{ pathname: "/" }} />
      )}
    </Route>
  );
}
