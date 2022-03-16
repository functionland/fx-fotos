import React, { useEffect } from "react";

const token_reg = /access_token/;

// 404 Page, redirects to /sign-up if the URL includes a token parameter
export function CatchAll() {

  return (
    <div className="404">
      <h1>
        We can't find the page you're looking for 😢. You could try{" "}
      </h1>
    </div>
  );
}
