import {
  getAccessToken,
  getCurrentUserId,
  refreshAccessToken,
  syncCurrentUser,
} from "@/lib/api";
import { ApplicationsProvider } from "@/context/applications-context";
import "@/styles/globals.css";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import DashboardSkeleton from "@/Dashboardskeleton";

let authInitPromise = null;
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://careerops.pranshu.dev";

const isProtectedRoute = (pathname) => pathname.startsWith("/dashboard");
const isAuthRoute = (pathname) => pathname === "/login" || pathname === "/signup";

const getSafeRedirectPath = (value) => {
  if (!value || typeof value !== "string") return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  if (value === "/") return "/dashboard";
  return value;
};

const initializeAuth = async () => {
  if (!authInitPromise) {
    authInitPromise = refreshAccessToken().then(async (refreshed) => {
      if (refreshed) {
        const userId = await syncCurrentUser();
        return Boolean(userId || getCurrentUserId());
      }

      return false;
    });
  }

  return authInitPromise;
};

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const hasInitializedAuth = useRef(false);
  const router = useRouter();
  const isAuthenticated = Boolean(getAccessToken());
  const isRouteProtected = isProtectedRoute(router.pathname);
  const isAuthenticationRoute = isAuthRoute(router.pathname);
  const isHomeRoute = router.pathname === "/";
  const redirectTarget = getSafeRedirectPath(router.query?.next);

  useEffect(() => {
    if (hasInitializedAuth.current) return;
    hasInitializedAuth.current = true;

    const initAuth = async () => {
      try {
        await initializeAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (loading || !router.isReady) return;

    if (isRouteProtected && !isAuthenticated) {
      router.replace({
        pathname: "/login",
        query: {
          next: router.asPath,
        },
      });
      return;
    }

    if (isAuthenticationRoute && isAuthenticated) {
      router.replace(redirectTarget);
      return;
    }

    if (isHomeRoute && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [
    isAuthenticated,
    isAuthenticationRoute,
    isHomeRoute,
    isRouteProtected,
    loading,
    redirectTarget,
    router,
  ]);

  if (loading && (isRouteProtected || isAuthenticationRoute)) {
    return <DashboardSkeleton />;
  }

  if (isRouteProtected && !isAuthenticated) return <DashboardSkeleton />;
  if (isAuthenticationRoute && isAuthenticated) return <DashboardSkeleton />;
  if (isHomeRoute && isAuthenticated) return <DashboardSkeleton />;

  return (
    <>
      <Head>
        <title>CareerOps - Job Application Tracker</title>
        <meta
          name="description"
          content="Track job applications, interviews, follow-ups, offers, and hiring pipeline analytics in one organized dashboard."
        />
        <meta property="og:site_name" content="CareerOps" />
        <meta property="og:image" content={`${APP_URL}/og-image.png`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${APP_URL}/og-image.png`} />
        {isRouteProtected && <meta name="robots" content="noindex,nofollow" />}
      </Head>
      <Toaster position="top-center" />
      {isRouteProtected ? (
        <ApplicationsProvider>
          <Component {...pageProps} />
        </ApplicationsProvider>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}
