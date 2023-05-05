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
    console.debug({ accessToken: session.accessToken });
    const sessionKeyRegistrationRes = await fetch(
      process.env.ROLLUP_GALAXY_URL!,
      {
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
            sessionPublicKey, //your(devs') public key for which to issue session key
          },
        }),
      }
    );
    console.debug({
      sessionKeyRegistrationRes: (await sessionKeyRegistrationRes.json())
        .errors,
    });
  }

  // Found the name.
  // Sends a HTTP success code
  res.status(200); //.json({ data: `${body.first} ${body.last}` });
}
