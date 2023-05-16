import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Profile {
    sub: string;
    name: string;
    picture: string;
    email?: string;
  }

  interface User {
    sub: string;
    name: string;
    picture: string;
    email?: string;
    connected_accounts?: [
      {
        type: string;
        identifier: string;
      }
    ];
    erc_4337?: [
      {
        nickname: string;
        address: string;
      }
    ];
  }

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken: string;
    user: User;
    profile: Profile;
    error: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    name: string;
    picture: string;
    email?: string;
    sub: string;
    aud: [string];
    iat: number;
    exp: number;
    jti: string;
    iss: string;
    access_token: string;
    refresh_token: string;
    profile: Profile;
    user: User;
  }
}
