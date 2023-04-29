export const seviceBindings = true;

declare global {
  const NODE_ENV: string | undefined;
  const COOKIE_DOMAIN: string;
  const CLIENT_ID: string;
  const CLIENT_SECRET: string;
}
