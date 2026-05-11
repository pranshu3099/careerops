import {
  getAccessToken,
  getCurrentUserId,
  refreshAccessToken,
  syncCurrentUser,
} from "@/lib/api";
import { ApplicationsProvider } from "@/context/applications-context";
import "@/styles/globals.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import DashboardSkeleton from "@/Dashboardskeleton";

let authInitPromise = null;

const isProtectedRoute = (pathname) => pathname.startsWith("/dashboard");

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
  const isLoginRoute = router.pathname === "/";
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
        pathname: "/",
        query: {
          next: router.asPath,
        },
      });
      return;
    }

    if (isLoginRoute && isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [
    isAuthenticated,
    isLoginRoute,
    isRouteProtected,
    loading,
    redirectTarget,
    router,
  ]);

  if (loading) return <DashboardSkeleton/>;
  if (isRouteProtected && !isAuthenticated) return <DashboardSkeleton />;
  if (isLoginRoute && isAuthenticated) return <DashboardSkeleton />;

  return (
    <>
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
