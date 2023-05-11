import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: {
  Component: any;
  pageProps: { session: Session; [key: string]: any };
}): JSX.Element {
  console.log("my session", { session });
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-24">
      {/* We've used 3xl here, but feel free to try other max-widths based on your needs */}
      <div className="mx-auto max-w-3xl">
        {/* Content goes here */}
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </div>
    </div>
  );
}
