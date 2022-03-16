import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient as authenticationClient } from "./authClient";
import {
  getUserFromCanister,
  getUserFromStorage,
  KEY_LOCALSTORAGE_USER,
} from "./index";

import { actorController } from "./canister/actor";
import { Identity } from "@dfinity/agent";
import { ProfileInfoPlus } from "./canister/typings";

export interface AuthContext {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  hasCanCanAccount: boolean;
  identity?: Identity;
  logIn: () => void;
  logOut: () => void;
  user: ProfileInfoPlus | undefined;
  setUser: (p: ProfileInfoPlus | undefined) => void;
}

// Provider hook that creates auth object and handles state
export function useProvideAuth(authClient:any): AuthContext {
  const [user, setUser] = useState<ProfileInfoPlus | undefined>();
  const [isAuthenticatedLocal, setIsAuthenticatedLocal] = useState<boolean>(
    false
  );
  const [_identity, _setIdentity] = useState<Identity | undefined>();
  const [isAuthClientReady, setAuthClientReady] = useState(false);
  const [urlWithSearch] = useState<string>(globalThis.location.search);

  // Creating the auth client is async and no auth related checks can happen
  // until it's ready so we set a state variable to keep track of it
  if (!authClient.ready) {
    authClient.create().then(() => setAuthClientReady(true));
  }

  // Use the user from local storage if it is set so the flow doesn't have to
  // make an async query.
  const setUserFromLocalStorage = () => {
    const lsUser = getUserFromStorage(localStorage, KEY_LOCALSTORAGE_USER);
    if (lsUser) {
      setUser(lsUser);
      setIsAuthenticatedLocal(true);
      // Check to make sure your local storage user exists on the backend, and
      // log out if it doesn't (this is when you have your user stored in local
      // storage but the user was cleared from the backend)
      getUserFromCanister(lsUser.userName).then((user_) => !user_ && logOut());
      return () => void 0;
    }
  };

  // Once the auth client is initialized, get the identity and check that they
  // are authenticated, then set them to be fully logged in.
  useEffect(() => {
    if (!authClient.ready) return;
    Promise.all([authClient.getIdentity(), authClient.isAuthenticated()]).then(
      ([identity, isAuthenticated]) => {
        setIsAuthenticatedLocal(isAuthenticated || false);
        _setIdentity(identity);
        if (isAuthenticated) {
          setUserFromLocalStorage();
        }
        setAuthClientReady(true);
      }
    );
  }, [isAuthClientReady]);

  // For testing environments only, this bypasses the authentication with an
  // identity provider for testing purposes.
  const DFX_NETWORK = process.env.DFX_NETWORK || "local";
  useEffect(() => {
    if (DFX_NETWORK === "local") {
      const testUserParam = new URLSearchParams(urlWithSearch).get("testUser");
      if (testUserParam) {
        setIsAuthenticatedLocal(true);
        setAuthClientReady(true);
        setUserFromLocalStorage();
        if (!user) {
          getUserFromCanister(testUserParam).then(
            (user_) => !user && user_ && setUser(user_)
          );
        }
      }
    }
  }, [urlWithSearch, user]);

  // When user is set, and is not in local storage yet store the user object
  // from the canister in local storage so the user doesn't need to be fetched
  // every load. Then insure user is correctly logged in with identity service,
  // and set them to not logged in if not.
  useEffect(() => {
    if (user && !getUserFromStorage(localStorage, KEY_LOCALSTORAGE_USER)) {
      localStorage.setItem(
        KEY_LOCALSTORAGE_USER,
        JSON.stringify({ ...user, rewards: user.rewards }, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
      if (!authClient.ready) return;
      (async () => {
        const identity = await authClient.getIdentity();
        if (identity && !identity.getPrincipal().isAnonymous()) {
          _setIdentity(identity);
        }
      })();
    }
  }, [user]);

  useEffect(() => {
    if (_identity && !_identity.getPrincipal().isAnonymous()) {
      // The auth client isn't ready to make requests until it's completed the
      // async authenticate actor method.
      setAuthClientReady(false);
      actorController.authenticateActor(_identity).then(() => {
        setAuthClientReady(true);
      });
    } else {
      actorController.unauthenticateActor();
    }
  }, [_identity]);

  // Just creating variables here so that it's pretty below
  const identity = _identity;
  const isAuthenticated = isAuthenticatedLocal;

  // Login to the identity provider by sending user to Internet Identity
  // and logging them in.
  const logIn = async function (): Promise<void> {
    if (!authClient) return;
    await authClient.login();
    const identity = await authClient.getIdentity();
    if (identity) {
      setIsAuthenticatedLocal(true);
      _setIdentity(identity);
    } else {
      console.error("Could not get identity from internet identity");
    }
  };

  // Clears the authClient of any cached data, and redirects user to root.
  function logOut() {
    setUser(undefined);
    setIsAuthenticatedLocal(false);
    localStorage.removeItem(KEY_LOCALSTORAGE_USER);
    if (!authClient.ready) return;
    authClient.logout();
  }

  return {
    isAuthenticated,
    isAuthReady: isAuthClientReady,
    hasCanCanAccount: user !== undefined,
    logIn,
    logOut,
    user,
    identity,
    setUser,
  };
}

const authContext = createContext<AuthContext>(null!);

export function ProvideAuth({ children }:any) {
  const auth = useProvideAuth(authenticationClient);
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};
