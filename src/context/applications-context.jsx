import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getApplications } from "@/lib/applications";

const ApplicationsContext = createContext(null);

export function ApplicationsProvider({ children }) {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const list = await getApplications();
      setApplications(list);
    } catch (err) {
      setError(err?.message || "Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchApplications();
  }, [refetchApplications]);

  const value = useMemo(
    () => ({
      applications,
      setApplications,
      isLoading,
      error,
      refetchApplications,
    }),
    [applications, isLoading, error, refetchApplications],
  );

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error("useApplications must be used within ApplicationsProvider");
  }
  return context;
}
