import NextAuth, { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt/types";

export const authOptions = {
  // Configure one or more authentication providers

  providers: [
    {
      id: "rollup",
      name: "Rollup ID",
      type: "oauth",
      client: {
        client_id: process.env.ROLLUP_CLIENT_ID,
        client_secret: process.env.ROLLUP_CLIENT_SECRET,
        authorization_signed_response_alg: "ES256",
        id_token_signed_response_alg: "ES256",
      },
      authorization: {
        params: { scope: "openid email profile connected_accounts" },
      },
      idToken: true,
      checks: ["state"],
      token: "https://passport-dev.rollup.id/token",
      userinfo: "https://passport-dev.rollup.id/userinfo",
      wellKnown:
        "https://passport-dev.rollup.id/.well-known/openid-configuration",
      profile(profile: User) {
        console.debug({ profile });
        return {
          id: profile.sub,
          ...profile,
        };
      },
    },
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token }: { token: JWT }) {
      // Persist the OAuth access_token to the token right after signin
      console.debug({ token });
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.debug({ session, token });
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

// @ts-ignore
export default NextAuth(authOptions);
