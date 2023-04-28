// We need to import from Remix Auth the type of the strategy verify callback
import { Authenticator } from "remix-auth";
import type { StrategyVerifyCallback } from "remix-auth";
import * as cloudflare from "@remix-run/cloudflare";
// We need to import the OAuth2Strategy, the verify params and the profile interfaces
import type {
  OAuth2Profile,
  OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";
import { OAuth2Strategy } from "remix-auth-oauth2";
import type { JWTPayload } from "jose";
import * as jose from "jose";

// These are the custom options we need from the developer to use the strategy
export interface RollupIDStrategyOptions {
  domain: string;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

// This interface declare what extra params we will get from RollupID on the
// verify callback
export interface RollupIDExtraParams extends Record<string, string | number> {
  id_token: string;
  scope: string;
  expires_in: 86_400;
  token_type: "Bearer";
}

// The RollupIDProfile extends the OAuth2Profile with the extra params and mark
// some of them as required
export interface RollupIDProfile extends OAuth2Profile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  photos: Array<{ value: string }>;
  _json: {
    name: string;
    picture: string;
    email?: string | undefined;
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
  };
}

// And we create our strategy extending the OAuth2Strategy, we also need to
// pass the User as we did on the FormStrategy, we pass the RollupIDProfile and the
// extra params
export class RollupIDStrategy<User> extends OAuth2Strategy<
  User,
  RollupIDProfile,
  RollupIDExtraParams
> {
  // The OAuth2Strategy already has a name but we override it to be specific of
  // the service we are using
  name = "rollupid";

  private userInfoURL: string;

  // We receive our custom options and our verify callback
  constructor(
    options: RollupIDStrategyOptions,
    // Here we type the verify callback as a StrategyVerifyCallback receiving
    // the User type and the OAuth2StrategyVerifyParams with the RollupIDProfile
    // and the RollupIDExtraParams
    // This way, when using the strategy the verify function will receive as
    // params an object with accessToken, refreshToken, extraParams and profile.
    // The latest two matching the types of RollupIDProfile and RollupIDExtraParams.
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<RollupIDProfile, RollupIDExtraParams>
    >
  ) {
    // And we pass the options to the super constructor using our own options
    // to generate them, this was we can ask less configuration to the developer
    // using our strategy
    super(
      {
        authorizationURL: `https://${options.domain}/authorize`,
        tokenURL: `https://${options.domain}/token`,
        clientID: options.clientID,
        clientSecret: options.clientSecret,
        callbackURL: options.callbackURL,
      },
      verify
    );

    this.userInfoURL = `https://${options.domain}/userinfo`;
    this.scope = options.scope || "openid profile email";
    this.audience = options.audience;
  }

  // We override the protected authorizationParams method to return a new
  // URLSearchParams with custom params we want to send to the authorizationURL.
  // Here we add the scope so RollupID can use it, you can pass any extra param
  // you need to send to the authorizationURL here base on your provider.
  protected authorizationParams() {
    const urlSearchParams: Record<string, string> = {
      scope: this.scope,
    };

    if (this.audience) {
      urlSearchParams.audience = this.audience;
    }

    return new URLSearchParams(urlSearchParams);
  }

  // We also override how to use the accessToken to get the profile of the user.
  // Here we fetch a RollupID specific URL, get the profile data, and build the
  // object based on the RollupIDProfile interface.
  protected async userProfile(accessToken: string): Promise<RollupIDProfile> {
    let response = await fetch(this.userInfoURL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let data: RollupIDProfile["_json"] = await response.json();

    let profile: RollupIDProfile = {
      provider: "rollupid",
      displayName: data.name,
      id: data.sub,
      emails: [{ value: data.email || "" }],
      photos: [{ value: data.picture }],
      _json: data,
    };

    return profile;
  }
}

const getProfileSessionStorage = () =>
  cloudflare.createCookieSessionStorage({
    cookie: {
      domain: "localhost:8787",
      httpOnly: true,
      name: "_rollup_remix_example",
      path: "/",
      sameSite: "lax",
      secure: true,
      maxAge: 7776000 /*60 * 60 * 24 * 90*/,
      secrets: ["SUPER SECRET"],
    },
  });

export function parseJwt(token: string): JWTPayload {
  const payload = jose.decodeJwt(token);
  if (!payload) {
    throw new Error("Invalid JWT");
  }
  return payload;
}

export const initAuthenticator = (options: RollupIDStrategyOptions) => {
  const oauthStorage = getProfileSessionStorage();
  const strategy = new RollupIDStrategy(
    options,
    async ({ accessToken, refreshToken, extraParams }) => {
      const parsedId = parseJwt(extraParams.id_token);

      const { sub, name, picture } = parsedId;
      console.log({ sub, name, picture });
      return { accessToken, refreshToken, extraParams };
    }
  );
  const authenticator = new Authenticator<any>(oauthStorage);
  authenticator.use(strategy);
  return authenticator;
};
