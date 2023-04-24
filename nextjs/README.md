This is a reference app using [Next.js](https://nextjs.org/) with [`NextAuth.js`](https://next-auth.js.org/).

## Getting Started

### Prerequisites

1. Setup a Rollup ID app by visiting [https://console.rollup.id](https://console.rollup.id) (see guide: [https://docs.rollup.id/getting-started/create-an-application](https://docs.rollup.id/getting-started/create-an-application))

2. Copy the `.env.local.example` => `.env.local`

3. Copy the client id and client and client secret into a `.env.local` file in the root of this project.

### Running app

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Click the sign in button to be redirected you your apps login page where you will see the Login with Rollup button. Click this button to be redirected to the Rollup Authorization flow.

For more on how to use NextAuth.js see the [documentation](https://next-auth.js.org/configuration/providers/oauth#using-a-custom-provider).
