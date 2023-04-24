import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken: string;
    user: {
      connected_accounts?: [
        {
          type: string;
          identifier: string;
        }
      ];
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    name: string;
    picture: string;
    email?: string;
    connected_accounts?: [
      {
        type: string;
        identifier: string;
      }
    ];
    sub: string;
    iss: string;
    aud: [string];
    iat: number;
    exp: number;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    name: string;
    email?: string;
    sub: string;
    accessToken: string;
    iat: number;
    exp: number;
    jti: string;
  }
}
