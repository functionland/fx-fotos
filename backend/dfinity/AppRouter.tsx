import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
} from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { SignIn } from "./views/SignIn";
import { SignUp } from "./components/SignUp";
import { useAuth } from "./utils";
import { PrivateRoutes } from "./components/PrivateRoutes";

function wrapRouteWithFade(Component) {
  return ({ match }) => (
    <CSSTransition
      in={match != null}
      timeout={300}
      classNames="page-fade"
      unmountOnExit
    >
      <Component />
    </CSSTransition>
  );
}

export function AppRouter() {
  const { user, setUser, isAuthenticated, isAuthReady, logOut } = useAuth();

  return (
    <Router>
      <Switch>
        {/* Root route, decides whether to redirect someone to feed, signup,
            or authorize, based on app state, only when auth client is ready */}
        <Route exact path="/">
          {isAuthReady &&
            (isAuthenticated && user ? (
              <Redirect to={{ pathname: "/feed" }} />
            ) : isAuthenticated ? (
              <Redirect to={{ pathname: "/sign-up" }} />
            ) : (
              <Redirect to={{ pathname: "/sign-in" }} />
            ))}
        </Route>

        <Route path="*">
          {({ location }) => (
            <TransitionGroup>
              <Route exact path="/sign-up">
                {wrapRouteWithFade(SignUp)}
              </Route>
              <Route exact path="/sign-in">
                {wrapRouteWithFade(SignIn)}
              </Route>

              <PrivateRoutes
                location={location}
                user={user}
                isAuthenticated={isAuthenticated}
                setUser={setUser}
                logOut={logOut}
              />
            </TransitionGroup>
          )}
        </Route>
      </Switch>
    </Router>
  );
}
