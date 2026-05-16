import AuthScreen from "@/components/auth/Index";
import Head from "next/head";

export default function SignupPage() {
  return (
    <>
      <Head>
        <title>Sign Up - CareerOps</title>
        <meta
          name="description"
          content="Create a CareerOps account to track job applications, interviews, follow-ups, and offers in one dashboard."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AuthScreen initialMode="signup" />
    </>
  );
}
