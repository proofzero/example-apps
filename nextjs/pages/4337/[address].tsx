import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import {
  createPublicClient,
  http,
  parseAbi,
  type PrivateKeyAccount,
} from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { polygonMumbai as chain } from 'viem/chains'
import { type KernelSmartAccount } from '@zerodev/sdk'
import { deserializeSessionKeyAccount } from '@zerodev/session-key'
import { createEcdsaKernelAccountClient } from '@zerodev/presets/zerodev'

import LoginButton from '../../components/login-btn'

const projectId = '147f57a1-ae4f-47a0-b815-95225468f657'

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Address() {
  const router = useRouter()
  const { isReady, query, push } = router
  const { data: session, status } = useSession()
  const [sessionError, setSessionError] = useState<Error>()
  const [isSubmittingSessionKey, setIsSubmittingSessionKey] = useState(false)
  const [isMinting, setIsMinting] = useState(false)

  const [sessionKeySigner, setSessionKeySigner] = useState<PrivateKeyAccount>()

  const [sessionKeyAccount, setSessionKeyAccount] =
    useState<KernelSmartAccount>()

  const [txnHash, setTxnHash] = useState<string>()

  useEffect(() => {
    if (status === 'loading' || !isReady) return
    if (
      status === 'unauthenticated' ||
      !session?.user ||
      (!session?.user.erc_4337 &&
        !session?.user.erc_4337?.filter((scw) => scw.address === query.address)
          .length)
    ) {
      push('/')
    }
  }, [session, push, query.address, status, isReady])

  return (
    <>
      <LoginButton />
      <div>
        <button className="text-2xl" onClick={() => push('/')}>
          {'< '} Back
        </button>
        <h1 className="text-4xl my-8">Smart Contract Wallet Demo</h1>
        <h3 className="my-4">
          <b>Your selected smart contract wallet:</b> {query.address}
        </h3>
        <p className="my-2">
          <i>Click the button to create a session key.</i>
        </p>
        <button
          type="button"
          disabled={isSubmittingSessionKey}
          className={classNames(
            `inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50`,
            isSubmittingSessionKey && 'cursor-not-allowed opacity-50',
          )}
          onClick={async () => {
            setIsSubmittingSessionKey(true)
            const sessionPrivateKey = generatePrivateKey()
            const sessionKeySigner = privateKeyToAccount(sessionPrivateKey)
            const sessionKeyAddress = sessionKeySigner.address

            await fetch(`/api/4337/${query.address}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ sessionKeyAddress }),
            })
              .then(async (res) => {
                if (!res.ok) {
                  throw 'Failed to create session key'
                }
                setSessionError(undefined)

                const serializedSessionKey = await res.json()

                const publicClient = createPublicClient({
                  chain,
                  transport: http(),
                })

                const sessionKeyAccount = await deserializeSessionKeyAccount(
                  publicClient,
                  serializedSessionKey,
                  sessionKeySigner,
                )

                setSessionKeyAccount(sessionKeyAccount)
                setSessionKeySigner(sessionKeySigner)
              })
              .catch((err) => {
                setSessionError(err)
              })
              .finally(() => {
                setIsSubmittingSessionKey(false)
              })
          }}
        >
          <svg
            className={classNames(
              'h-5 w-5 mr-3',
              isSubmittingSessionKey ? 'animate-spin inline-block' : 'hidden',
            )}
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Create Session Key
        </button>

        {sessionError && <p>{sessionError.message}</p>}

        {sessionKeyAccount && (
          <>
            <div>
              <h3 className="my-4">
                <b>Generated Encoded Session Key: </b>
                <span>{sessionKeyAccount.address}</span>
              </h3>
            </div>
            <div>
              <button
                type="button"
                disabled={isSubmittingSessionKey}
                className={classNames(
                  `inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50`,
                  isMinting && 'cursor-not-allowed opacity-50',
                )}
                onClick={async () => {
                  setIsMinting(true)

                  const publicClient = createPublicClient({
                    chain,
                    transport: http(),
                  })

                  const kernelClient = await createEcdsaKernelAccountClient({
                    chain,
                    projectId,
                    signer: sessionKeyAccount,
                  })

                  const { request } = await publicClient.simulateContract({
                    account: sessionKeyAccount,
                    address: '0x34bE7f35132E97915633BC1fc020364EA5134863',
                    abi: parseAbi([
                      'function mint(address _to) public',
                      'function balanceOf(address owner) external view returns (uint256 balance)',
                    ]),
                    functionName: 'mint',
                    args: [query.address as `0x${string}`],
                  })

                  const hash = await kernelClient.writeContract(request)
                  await publicClient.waitForTransactionReceipt({
                    hash,
                  })

                  setTxnHash(hash)
                  setIsMinting(false)
                }}
              >
                <svg
                  className={classNames(
                    'h-5 w-5 mr-3',
                    isMinting ? 'animate-spin inline-block' : 'hidden',
                  )}
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Mint NFT to Wallet
              </button>
              {txnHash && (
                <h3 className="my-4">
                  <b>Transaction Hash:</b>{' '}
                  <a
                    className="underline"
                    target="_blank"
                    href={`https://www.jiffyscan.xyz/userOpHash/${txnHash}`}
                  >
                    {txnHash}
                  </a>
                </h3>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
