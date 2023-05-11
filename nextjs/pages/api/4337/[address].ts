import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  // console.debug({ session });

  const { address } = req.query; // smart contract wallet address

  if (session && req.method === "POST") {
    const sessionPublicKey = req.body.sessionPublicKey; // session public key
    console.debug({ accessToken: session.accessToken, sessionPublicKey });
    await fetch(`${process.env.ROLLUP_GALAXY_URL}/register-session-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
        "X-GALAXY-KEY": process.env.ROLLUP_GALAXY_API_KEY!,
      },
      body: JSON.stringify({
        smartContractWalletAddress: address, //users' smart contract wallet address
        sessionPublicKey, //public key for which to issue session key
      }),
    })
      .then(async (keyRes) => {
        console.debug({
          keyRes,
          url: `${process.env.ROLLUP_GALAXY_URL}/register-session-key`,
        });
        if (keyRes.ok) res.status(201).json(await keyRes.json());
        else throw new Error(`${keyRes.status} ${keyRes.statusText}`);
      })
      .catch((error) => {
        console.error({ error });
        res.status(500).json({ error });
      });
  }
}
