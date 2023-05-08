import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const gqlDoc = `mutation registerSessionKeyMutation(
  $sessionPublicKey: String!,
  $smartContractWalletAddress: String!) {

    sessionKey: registerSessionKey(
      sessionPublicKey: $sessionPublicKey,
      smartContractWalletAddress: $smartContractWalletAddress)

}`;

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  // console.debug({ session });

  const { address } = req.query;

  if (session && req.method === "POST") {
    const sessionPublicKey = req.body.sessionPublicKey;
    console.debug({ accessToken: session.accessToken, sessionPublicKey });
    await fetch(process.env.ROLLUP_GALAXY_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
        "X-GALAXY-KEY": process.env.ROLLUP_GALAXY_API_KEY!,
      },
      body: JSON.stringify({
        query: gqlDoc,
        variables: {
          accountUrn: session.profile.sub, //users' accountURN
          smartContractWalletAddress: address, //users' smart contract wallet address
          sessionPublicKey, //public key for which to issue session key
        },
      }),
    })
      .then(async (keyRes) => {
        if (keyRes.ok) res.status(201).json((await keyRes.json()).data);
        else throw new Error(`${keyRes.status} ${keyRes.statusText}`);
      })
      .catch((error) => {
        console.error({ error });
        res.status(500).json({ error });
      });
  }
}
