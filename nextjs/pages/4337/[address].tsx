import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Contract, Signer, ethers } from "ethers";
import { useState } from "react";
import { ZeroDevSigner, createSessionKeySigner } from "@zerodevapp/sdk";
import { SessionSigner } from "@zerodevapp/sdk/dist/src/session/SessionSigner";

export default function Address() {
  const router = useRouter();
  const { isReady, query } = router;
  const { data: session, status } = useSession();

  const [sessionKey, setSessionKey] = useState<{
    privateSigner: Signer;
    sessionJWT: string;
    signerJson: string;
  }>();
  const [txnHash, setTxnHash] = useState<string>();
  const [sessionError, setSessionError] = useState<Error>();

  return (
    <div>
      <h3>Smart Contract Wallet: {query.address}</h3>
      <button
        onClick={async () => {
          const privateSigner = ethers.Wallet.createRandom();
          const address = await privateSigner.getAddress();

          await fetch(`/api/4337/${query.address}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionPublicKey: address,
            }),
          })
            .then(async (res) => {
              if (!res.ok) {
                throw "Failed to create session key";
              }
              setSessionError(undefined);

              const json = await res.json();
              const signerJson = await privateSigner.encrypt("password");
              console.debug({
                publicKey: address,
                sessionKey: json,
                signerJson,
              });
              setSessionKey({
                privateSigner,
                sessionJWT: json.sessionKey,
                signerJson,
              });
            })
            .catch((err) => {
              console.error(err);
              setSessionError(err);
            });
        }}
      >
        Create Session Key
      </button>

      {sessionError && <p>{sessionError.message}</p>}

      {sessionKey && (
        <>
          <div>
            <p>Session Key:</p>
            <p>{sessionKey.sessionJWT}</p>
          </div>
          <div>
            <button
              onClick={async () => {
                console.debug("json again", sessionKey.signerJson);
                const privateSigner = await ethers.Wallet.fromEncryptedJson(
                  sessionKey.signerJson,
                  "password"
                );
                const sessionKeySigner = await createSessionKeySigner({
                  sessionKeyData: sessionKey.sessionJWT,
                  privateSigner: privateSigner,
                  projectId: "147f57a1-ae4f-47a0-b815-95225468f657",
                });
                const contractAddress =
                  "0x34bE7f35132E97915633BC1fc020364EA5134863";
                const contractABI = [
                  "function mint(address _to) public",
                  "function balanceOf(address owner) external view returns (uint256 balance)",
                ];
                const nftContract = new Contract(
                  contractAddress,
                  contractABI,
                  sessionKeySigner
                );
                const receipt = await nftContract.mint(query.address);
                await receipt.wait();
                setTxnHash(receipt.hash);
                console.log(
                  `NFT balance: ${await nftContract.balanceOf(query.address)}`,
                  receipt
                );
              }}
            >
              Mint NFT to Wallet
            </button>
            {txnHash && (
              <p>
                Transaction Hash:{" "}
                <a
                  target="_blank"
                  href={`https://www.jiffyscan.xyz/userOpHash/${txnHash}`}
                >
                  {txnHash}
                </a>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
