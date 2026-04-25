import { refreshAccessToken, syncCurrentUser } from "@/lib/api";
import { ApplicationsProvider } from "@/context/applications-context";
import "@/styles/globals.css";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const hasInitializedAuth = useRef(false);

  useEffect(() => {
    if (hasInitializedAuth.current) return;
    hasInitializedAuth.current = true;

    const initAuth = async () => {
      await refreshAccessToken();
      await syncCurrentUser();
      setLoading(false);
    };

    initAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <>
      <Toaster position="top-center" />
      <ApplicationsProvider>
        <Component {...pageProps} />
      </ApplicationsProvider>
    </>
  );
}
