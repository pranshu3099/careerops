import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { handleLogout } from "@/lib/auth";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCheck,
  Clock3,
  ExternalLink,
  Loader2,
  LogOut,
  Menu,
  Settings,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import useCurrentUser from "@/hooks/use-current-user";
import useNotifications from "@/hooks/use-notifications";
import AddApplicationModal from "../modals/add-application-modal";
import Link from "next/link";

const NOTIFICATION_TYPE_CONFIG = {
  FOLLOW_UP_DUE: {
    label: "Follow-up",
    icon: Clock3,
    tone: "bg-amber-50 text-amber-600 ring-amber-100",
  },
  INTERVIEW_REMINDER: {
    label: "Interview",
    icon: CalendarClock,
    tone: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  },
  GHOST_STALE_WARNING: {
    label: "Stale",
    icon: AlertTriangle,
    tone: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  APPLICATION_GHOSTED: {
    label: "Ghosted",
    icon: AlertTriangle,
    tone: "bg-slate-100 text-slate-500 ring-slate-200",
  },
};

const formatRelativeTime = (value) => {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "";

  const diffSeconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (diffSeconds < 60) return "Just now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

export default function Navbar({ onMobileMenuClick, onApplicationCreated }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { userName, userEmail } = useCurrentUser();
  const {
    notifications,
    unreadCount,
    isLoading: isNotificationsLoading,
    error: notificationsError,
    hasLoadedNotifications,
    refetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();
  const router = useRouter();

  const unreadBadge = unreadCount > 9 ? "9+" : unreadCount;

  useEffect(() => {
    if (!notificationsOpen || hasLoadedNotifications) return;
    refetchNotifications();
  }, [hasLoadedNotifications, notificationsOpen, refetchNotifications]);

  const openNotifications = () => {
    setNotificationsOpen((current) => !current);
    setDropdownOpen(false);
  };

  const openUserMenu = () => {
    setDropdownOpen((current) => !current);
    setNotificationsOpen(false);
  };

  const openRelatedApplication = async (notification) => {
    if (!notification?.applicationId) return;

    if (!notification?.isRead) {
      await markAsRead(notification.id);
    }

    setNotificationsOpen(false);
    router.push(
      `/dashboard/application?applicationId=${encodeURIComponent(
        notification.applicationId,
      )}`,
    );
  };
 
  async function logoutUser() {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      const res = await handleLogout();

      if (res.ok) {
        router.push("/");
        toast.success("Logged out successfully");
        return;
      }

      toast.error("Failed to logout");
    } catch (error) {
      toast.error(error?.message || "Failed to logout");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <header className="bg-white border-b border-slate-100 px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuClick}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
        </div>
 
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all active:scale-95 shadow-sm shadow-indigo-200"
          >
            <span className="text-base leading-none">+</span>
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add</span>
          </button>
 
          <div className="relative">
            <button
              type="button"
              onClick={openNotifications}
              className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {unreadBadge}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-100 bg-white text-sm shadow-xl z-50">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-800">
                      Notifications
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {unreadCount > 0
                        ? `${unreadCount} unread`
                        : "You're all caught up"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all
                  </button>
                </div>

                {isNotificationsLoading ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading notifications...
                  </div>
                ) : notificationsError ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-rose-500">
                      {notificationsError}
                    </p>
                    <button
                      type="button"
                      onClick={refetchNotifications}
                      className="mt-3 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      Retry
                    </button>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                      <Bell className="h-4 w-4" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No notifications
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      New reminders and updates will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto">
                    {notifications.map((notification) => {
                      const config =
                        NOTIFICATION_TYPE_CONFIG[notification?.type] ||
                        NOTIFICATION_TYPE_CONFIG.GHOST_STALE_WARNING;
                      const Icon = config.icon;

                      return (
                        <div
                          key={notification.id}
                          className={`border-b border-slate-50 px-4 py-3 last:border-b-0 ${
                            notification?.isRead
                              ? "bg-white"
                              : "bg-indigo-50/35"
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ring-1 ${config.tone}`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p
                                      className={`truncate text-sm ${
                                        notification?.isRead
                                          ? "font-medium text-slate-700"
                                          : "font-semibold text-slate-900"
                                      }`}
                                    >
                                      {notification?.title || config.label}
                                    </p>
                                    {!notification?.isRead && (
                                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                                    )}
                                  </div>
                                  <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">
                                    {notification?.message}
                                  </p>
                                </div>
                                <span className="whitespace-nowrap text-[11px] text-slate-400">
                                  {formatRelativeTime(notification?.createdAt)}
                                </span>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                  {config.label}
                                </span>
                                {!notification?.isRead && (
                                  <button
                                    type="button"
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                                  >
                                    Mark read
                                  </button>
                                )}
                                {notification?.applicationId && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openRelatedApplication(notification)
                                    }
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-800"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Open application
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeNotification(notification.id)
                                  }
                                  className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
 
          <div className="relative">
            <button
              onClick={openUserMenu}
              className="flex items-center gap-2.5 hover:bg-slate-50 rounded-xl pr-2 pl-1 py-1 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {userName[0]}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-700 leading-tight">{userName}</p>
                <p className="text-[11px] text-slate-400 leading-tight">{userEmail}</p>
              </div>
              <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
 
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 text-sm z-50">
                <div className="px-4 py-3 border-b border-slate-50">
                  <p className="font-semibold text-slate-800">{userName}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{userEmail}</p>
                </div>
                <Link href="/dashboard/profile" className="flex px-4 py-2.5 hover:bg-slate-50 items-center gap-2.5 text-slate-600 transition-colors">
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link href="/dashboard/settings" className="flex px-4 py-2.5 hover:bg-slate-50 items-center gap-2.5 text-slate-600 transition-colors">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <div className="border-t border-slate-50 my-1" />
                <button
                  onClick={logoutUser}
                  disabled={isLoggingOut}
                  className="flex w-full px-4 py-2.5 text-rose-500 hover:bg-rose-50 items-center gap-2.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
 
      <AddApplicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onApplicationCreated={onApplicationCreated}
      />
    </>
  );
}
