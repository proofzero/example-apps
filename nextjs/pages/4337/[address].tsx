import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { useState } from "react";

export default function Address() {
  const router = useRouter();
  const { isReady, query } = router;
  const { data: session, status } = useSession();

  const sessionKeys = useState<{ private: string; public: string }>();

  return (
    <div>
      <h3>Smart Contract Wallet: {query.address}</h3>
      <button
        onClick={async () => {
          const wallet = ethers.Wallet.createRandom();
          await fetch(`/api/4337/${query.address}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionPublicKey: wallet.publicKey,
            }),
          })
            .then((res) => res.status)
            .then((status) => {})
            .catch((err) => {});
        }}
      >
        Create Session Key
      </button>
    </div>
  );
}
