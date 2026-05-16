import AuthScreen from "@/components/auth/Index";
import Head from "next/head";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - CareerOps</title>
        <meta
          name="description"
          content="Log in to CareerOps to manage job applications, interviews, follow-ups, and hiring pipeline progress."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AuthScreen initialMode="login" />
    </>
  );
}
