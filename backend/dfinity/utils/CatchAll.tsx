import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { Link } from "react-router-dom";

const token_reg = /access_token/;

// 404 Page, redirects to /sign-up if the URL includes a token parameter
export function CatchAll() {
  const loc = useLocation();
  const history = useHistory();

  useEffect(() => {
    const access_token =
      token_reg.exec(loc.pathname) ?? token_reg.exec(loc.search);

    if (access_token) {
      const params = new URLSearchParams(loc.pathname.slice(1));
      history.replace("/sign-up?" + params.toString());
    }
  }, [loc.pathname]);

  return (
    <div className="404">
      <h1>
        We can't find the page you're looking for 😢. You could try{" "}
        <Link to="/">the home page</Link>.
      </h1>
    </div>
  );
}
