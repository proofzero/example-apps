import { useSession } from "next-auth/react";

export default function AccessToken() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>Start the demo by signing in.</p>;
  }

  return (
    <div>
      <p className="text-sm my-2">
        Hi {session.user.name || "Unknown"}. This is your profile based on the
        consented claims you approved.
      </p>

      <h3 className="text-2xl my-1 mt-4">System Identifier</h3>
      <i className="text-sm">Your unique digital identifier</i>
      <p>{session.profile.sub || "No system identifier claim found"}</p>

      <h3 className="text-2xl my-1 mt-4">Email Address</h3>
      <i className="text-sm">The email address you shared with this app</i>
      <p>{session.profile.email || "No email claim found"}</p>

      <h3 className="text-2xl my-1 mt-4">Connected Accounts</h3>
      <i className="text-sm">
        These are the accounts you connected to your profile:
      </i>
      {session.profile.connected_accounts ? (
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Account Type
              </th>
              <th
                scope="col"
                className=" py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Account Identifier
              </th>
            </tr>
          </thead>
          <tbody>
            {session.profile.connected_accounts?.map((account, key) => (
              <tr key={key}>
                <td className="whitespace-nowrap py-4 text-sm text-gray-500">
                  {account.type}
                </td>{" "}
                <td className="whitespace-nowrap py-4 text-sm text-gray-500">
                  {account.identifier}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No connected accounts found</p>
      )}

      <h3 className="text-2xl my-1 mt-4">Smart Contract Wallets</h3>
      <p>
        <i className="text-sm">
          Click any of the listed accounts to try out signless transactions.
        </i>
      </p>
      {session.profile.erc_4337 ? (
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3 text-left text-sm font-semibold text-gray-900"
              >
                Account Nickname
              </th>
              <th
                scope="col"
                className=" py-3 text-left text-sm font-semibold text-gray-900"
              >
                Account Address
              </th>
            </tr>
          </thead>
          <tbody>
            {session.profile.erc_4337?.map((account, key) => (
              <tr key={key}>
                <td
                  scope="col"
                  className="py-3 text-left text-sm font-semibold text-gray-900"
                >
                  {account.nickname}
                </td>
                <td
                  scope="col"
                  className="py-3 text-left text-sm font-semibold text-gray-900 underline underline-offset-auto"
                >
                  <a href={`/4337/${account.address}`}>{account.address}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No smart contract wallets found</p>
      )}
    </div>
  );
}
