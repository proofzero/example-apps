import NextAuth, { Profile, Session, TokenSet, User } from "next-auth";
import { JWT } from "next-auth/jwt/types";
import jwt_decode from "jwt-decode";

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
        params: {
          scope: "openid profile erc_4337 connected_accounts",
          prompt: "consent", // always ask for authorization
        },
      },
      httpOptions: {
        timeout: 10000,
      },
      idToken: true,
      checks: ["state"],
      token: `${process.env.ROLLUP_DOMAIN}/token`,
      userinfo: {
        url: `${process.env.ROLLUP_DOMAIN}/userinfo`,
        // The result of this method will be the input to the `profile` callback.
        async request(context: {
          userinfo: any;
          provider: { userinfo: { url: RequestInfo | URL } };
          tokens: { access_token: string };
        }) {
          // context contains useful properties to help you make the request.
          const profileRes = await fetch(context.provider.userinfo.url, {
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
            },
          });
          const profile = await profileRes.json();
          return profile;
        },
      },
      wellKnown: `${process.env.ROLLUP_DOMAIN}/.well-known/openid-configuration`,
      profile(user: User, tokens: TokenSet) {
        return {
          id: user.sub,
          image: user.picture,
          name: user.name,
          email: user.email,
          connected_accounts: user.connected_accounts,
          erc_4337: user.erc_4337,
        };
      },
    },
    // ...add more providers here
  ],
  callbacks: {
    async jwt({
      token,
      account,
      user,
      profile,
    }: {
      token: JWT;
      account: {
        access_token: string;
        refresh_token: string;
        id_token: string;
      };
      user: User;
      profile: Profile;
    }) {
      // Persist the OAuth access_token to the token right after signin
      // we are authorizing with rollup we will have the encoded tokens
      console.log({ token });
      if (account) {
        return {
          access_token: account.access_token,
          expires_at: token.exp,
          refresh_token: account.refresh_token,
          name: token.name,
          picture: token.picture,
          email: token.email,
          id: token.sub,
          token,
          user,
        };
      } else if (Date.now() < token.exp * 1000) {
        // If the access token has not expired yet, return it
        return token;
      }
      // If the access token has expired, try to refresh it
      try {
        const response = await fetch(`${process.env.ROLLUP_DOMAIN}/token`, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.ROLLUP_CLIENT_ID!,
            client_secret: process.env.ROLLUP_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refresh_token,
          }),
          method: "POST",
        });

        const tokens: TokenSet = await response.json();

        if (!response.ok) throw tokens;

        return {
          ...token, // Keep the previous token properties
          access_token: tokens.access_token,
          expires_at: new Date().setMinutes(new Date().getMinutes() + 60),
          // Fall back to old refresh token, but note that
          // many providers may only allow using a refresh token once.
          refresh_token: tokens.refresh_token ?? token.refresh_token,
        };
      } catch (error) {
        console.error("Error refreshing access token: ", error);
        return { ...token, error: "RefreshAccessTokenError" as const };
      }
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send propertaies to the client, like an access_token from a provider.
      session.accessToken = token.access_token;
      session.user = token.user;
      session.error = token.error as string;
      return session;
    },
  },
};

// @ts-ignore
export default NextAuth(authOptions);
