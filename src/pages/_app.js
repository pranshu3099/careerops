import { refreshAccessToken } from "@/lib/api";
import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const initAuth = async () => {
      await refreshAccessToken();
      setLoading(false);
    };

    initAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <>
      <Toaster position="top-center" />
      <Component {...pageProps} />
    </>
  );
}
