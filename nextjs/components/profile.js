import { useSession } from "next-auth/react";

export default function AccessToken() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>Access Denied</p>;
  }

  return (
    <div>
      <h1>Profile:</h1>

      <h2>Connected Accounts</h2>
      <ul>
        {session.profile.connected_accounts.map((account, key) => (
          <li key={key}>
            {account.type}: {account.identifier}
          </li>
        ))}
      </ul>
      <h2>ERC 4337 Accounts</h2>
      <ul>
        {session.profile.erc_4337.map((account, key) => (
          <li key={key}>
            <a href={`/4337/${account.address}`}>
              {account.nickname}: {account.address}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
