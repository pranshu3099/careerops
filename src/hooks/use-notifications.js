import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_REFRESH_EVENT,
} from "@/lib/notifications";
import { useCallback, useEffect, useRef, useState } from "react";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoadedNotifications, setHasLoadedNotifications] = useState(false);
  const isMountedRef = useRef(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount();
      if (isMountedRef.current) {
        setUnreadCount(count);
      }
      return count;
    } catch (err) {
      return 0;
    }
  }, []);

  const refetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const result = await getNotifications();

      if (!isMountedRef.current) return result;

      setNotifications(result);
      setHasLoadedNotifications(true);
      return result;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err?.message || "Failed to load notifications");
      }
      return [];
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const markAsRead = useCallback(
    async (notificationId) => {
      const previousNotifications = notifications;

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification?.id === notificationId
            ? {
                ...notification,
                isRead: true,
                readAt: notification?.readAt || new Date().toISOString(),
              }
            : notification,
        ),
      );

      try {
        await markNotificationRead(notificationId);
        await refreshUnreadCount();
      } catch (err) {
        if (isMountedRef.current) {
          setNotifications(previousNotifications);
          setError(err?.message || "Failed to mark notification as read");
          await refreshUnreadCount();
        }
      }
    },
    [notifications, refreshUnreadCount],
  );

  const markAllAsRead = useCallback(async () => {
    const previousNotifications = notifications;

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: notification?.readAt || new Date().toISOString(),
      })),
    );
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
      await refreshUnreadCount();
    } catch (err) {
      if (isMountedRef.current) {
        setNotifications(previousNotifications);
        setError(err?.message || "Failed to mark notifications as read");
        await refreshUnreadCount();
      }
    }
  }, [notifications, refreshUnreadCount]);

  const removeNotification = useCallback(
    async (notificationId) => {
      const previousNotifications = notifications;

      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (notification) => notification?.id !== notificationId,
        ),
      );

      try {
        await deleteNotification(notificationId);
        await refreshUnreadCount();
      } catch (err) {
        if (isMountedRef.current) {
          setNotifications(previousNotifications);
          setError(err?.message || "Failed to delete notification");
          await refreshUnreadCount();
        }
      }
    },
    [notifications, refreshUnreadCount],
  );

  useEffect(() => {
    isMountedRef.current = true;
    refreshUnreadCount();

    return () => {
      isMountedRef.current = false;
    };
  }, [refreshUnreadCount]);

  useEffect(() => {
    const handleNotificationsRefresh = async () => {
      await refreshUnreadCount();

      if (hasLoadedNotifications) {
        await refetchNotifications();
      }
    };

    window.addEventListener(
      NOTIFICATIONS_REFRESH_EVENT,
      handleNotificationsRefresh,
    );

    return () => {
      window.removeEventListener(
        NOTIFICATIONS_REFRESH_EVENT,
        handleNotificationsRefresh,
      );
    };
  }, [hasLoadedNotifications, refetchNotifications, refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasLoadedNotifications,
    refreshUnreadCount,
    refetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
}
