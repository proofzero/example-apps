import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  if (req.method !== 'POST') return

  const session = await getServerSession(req, res, authOptions)
  if (!session) return

  const galaxyResponse = await fetch(
    `${process.env.ROLLUP_GALAXY_URL}/register-session-key`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
        'X-GALAXY-KEY': process.env.ROLLUP_GALAXY_API_KEY!,
      },
      body: JSON.stringify({
        smartContractWalletAddress: req.query.address,
        sessionKeyAddress: req.body.sessionKeyAddress,
      }),
    },
  )

  res.status(galaxyResponse.status).json(await galaxyResponse.json())
}
