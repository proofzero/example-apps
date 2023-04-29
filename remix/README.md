# Rollup Remix Example App

- [Remix Docs](https://remix.run/docs)
- [Rollup Docs](https://docs.rollup.id)

## Setup Rollup Auth

### Prerequisites

1. Setup a Rollup ID app by visiting [https://console.rollup.id](https://console.rollup.id) (see guide: [https://docs.rollup.id/getting-started/create-an-application](https://docs.rollup.id/getting-started/create-an-application))

2. Copy the `.env.example` => `.env`

3. Copy the client id and client and client secret into a `.env` file in the root of this project.

## Development

You will be running two processes during development:

- The Miniflare server (miniflare is a local environment for Cloudflare Workers)
- The Remix development server

Both are started with one command:

```sh
npm run dev
```

Open up [http://127.0.0.1:8787](http://127.0.0.1:8787) and you should be ready to go!

If you want to check the production build, you can stop the dev server and run following commands:

```sh
npm run build
npm start
```

Then refresh the same URL in your browser (no live reload for production builds).

## Deployment

If you don't already have an account, then [create a cloudflare account here](https://dash.cloudflare.com/sign-up) and after verifying your email address with Cloudflare, go to your dashboard and set up your free custom Cloudflare Workers subdomain.

Once that's done, you should be able to deploy your app:

```sh
npm run deploy
```
