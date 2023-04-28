import type { LoaderFunction } from "@remix-run/cloudflare";
import { initAuthenticator } from "../auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const authenticator = initAuthenticator({
    domain: "passport.rollup.id",
    clientID: CLIENT_ID || "",
    clientSecret: CLIENT_SECRET || "",
    callbackURL: "http://localhost:8787/auth/callback",
  });
  await authenticator.authenticate("rollupid", request, {
    successRedirect: "/",
  });
};
