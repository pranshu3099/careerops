import { refreshAccessToken, syncCurrentUser } from "@/lib/api";
import { ApplicationsProvider } from "@/context/applications-context";
import "@/styles/globals.css";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import DashboardSkeleton from "@/Dashboardskeleton";

let authInitPromise = null;

const initializeAuth = async () => {
  if (!authInitPromise) {
    authInitPromise = refreshAccessToken().then(async (refreshed) => {
      if (refreshed) {
        await syncCurrentUser();
      }
    });
  }

  return authInitPromise;
};

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const hasInitializedAuth = useRef(false);

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

  if (loading) return <DashboardSkeleton/>;
  return (
    <>
      <Toaster position="top-center" />
      <ApplicationsProvider>
        <Component {...pageProps} />
      </ApplicationsProvider>
    </>
  );
}
