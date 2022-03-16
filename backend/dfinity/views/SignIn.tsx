import React, { PropsWithChildren, useEffect } from "react";
import { useHistory } from "react-router-dom";
import logo from "../assets/images/cancan-logo.png";
import { useAuth } from "../utils";

/*
 * The sign-in process for when a user has not yet authenticated with the
 * Internet Identity Service.
 */
export function SignIn(props: PropsWithChildren<{}>) {
  const { children = "Authorize" } = props;
  const auth = useAuth();
  const history = useHistory();

  // If the auth provider has a user (which could be from local storage) and
  // the user is properly authenticated with the identity provider service then
  // send the user to their feed, as they are correctly signed in.
  useEffect(() => {
    if (auth.user && !auth.identity?.getPrincipal().isAnonymous()) {
      history.replace("/feed");
    }
  }, [auth.identity, auth.user, history]);

  // Initiates the login flow with the identity provider service, sending the
  // user to a new tab
  const handleLogin = async () => {
    await auth.logIn();
    history.push("/sign-up");
  };

  return (
    <div id="form-container">
      <img alt="cancan logo" src={logo} style={{ width: "24.2rem" }} />
      <button onClick={handleLogin} id="sign-in" className="primary medium">
        {children}
      </button>
    </div>
  );
}
