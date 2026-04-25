import { useEffect, useState } from "react";
import {
  getCurrentUserEmail,
  getCurrentUserId,
  getCurrentUserName,
  syncCurrentUser,
} from "@/lib/api";

export default function useCurrentUser() {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      let id = getCurrentUserId();
      let name = getCurrentUserName();
      let email = getCurrentUserEmail();

      if (!id && !name && !email) {
        await syncCurrentUser();
        id = getCurrentUserId();
        name = getCurrentUserName();
        email = getCurrentUserEmail();
      }

      if (!isMounted) return;

      setUserId(id || "");
      setUserName(name || "");
      setUserEmail(email || "");
      setIsLoading(false);
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return { userId, userName, userEmail, isLoading };
}

// isMounted is a safety flag.

// Simple reason:

// loadUser() is async.
// Component might unmount before async work finishes.
// Without this check, React state updates can run after unmount, causing warnings/bugs.
// So we do:

// Start with isMounted = true.
// In cleanup (return), set isMounted = false.
// Before setState, check if (!isMounted) return;.
// Meaning: “only update state if this component is still on screen.”