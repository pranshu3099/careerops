import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import {
  getFollowupAlertSettings,
  updateFollowupAlertSettings,
} from "@/lib/settings";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const ALERT_DAY_OPTIONS = [
  { label: "Same day", value: 0 },
  { label: "1 day before", value: 1 },
  { label: "2 days before", value: 2 },
];

const DEFAULT_SETTINGS = {
  followUpAlertsEnabled: true,
  followUpAlertDays: 1,
};

export default function SettingsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const isMountedRef = useRef(false);
  const savedTimeoutRef = useRef(null);

  const showSavedMessage = useCallback(() => {
    setSavedMessage("Settings saved");

    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
    }

    savedTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setSavedMessage("");
      }
    }, 1800);
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const result = await getFollowupAlertSettings();

      if (!isMountedRef.current) return;

      setSettings(result);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err?.message || "Failed to load settings");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadSettings();

    return () => {
      isMountedRef.current = false;
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, [loadSettings]);

  const saveSettings = async (nextSettings) => {
    const previousSettings = settings;
    setSettings(nextSettings);
    setIsSaving(true);
    setError("");
    setSavedMessage("");

    try {
      const result = await updateFollowupAlertSettings(nextSettings);

      if (!isMountedRef.current) return;

      setSettings(result);
      showSavedMessage();
    } catch (err) {
      if (isMountedRef.current) {
        setSettings(previousSettings);
        setError(err?.message || "Failed to save settings");
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  const handleToggleAlerts = () => {
    saveSettings({
      ...settings,
      followUpAlertsEnabled: !settings.followUpAlertsEnabled,
    });
  };

  const handleTimingChange = (days) => {
    if (!settings.followUpAlertsEnabled) return;
    if (settings.followUpAlertDays === days) return;

    saveSettings({
      ...settings,
      followUpAlertDays: days,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 space-y-6 overflow-auto p-5 md:ml-[72px] md:p-7 lg:ml-60">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Settings
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Manage dashboard preferences
            </p>
          </div>

          <section className="max-w-3xl rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Follow-up Alerts
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Control when due-soon follow-up alerts appear.
                  </p>
                </div>
              </div>

              <div className="min-h-5 text-xs font-medium">
                {isSaving && (
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving
                  </span>
                )}
                {!isSaving && savedMessage && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {savedMessage}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            <div className="space-y-6 px-5 py-5">
              {isLoading ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Loading settings...
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <label
                        htmlFor="follow-up-alerts-toggle"
                        className="text-sm font-medium text-slate-800"
                      >
                        Show follow-up alerts
                      </label>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        Display due-soon follow-up alerts on the dashboard.
                      </p>
                    </div>

                    <button
                      id="follow-up-alerts-toggle"
                      type="button"
                      role="switch"
                      aria-checked={settings.followUpAlertsEnabled}
                      disabled={isSaving}
                      onClick={handleToggleAlerts}
                      className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        settings.followUpAlertsEnabled
                          ? "bg-indigo-600"
                          : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          settings.followUpAlertsEnabled
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div
                    className={`space-y-3 transition-opacity ${
                      settings.followUpAlertsEnabled
                        ? "opacity-100"
                        : "opacity-50"
                    }`}
                  >
                    <div>
                      <label className="text-sm font-medium text-slate-800">
                        Alert timing
                      </label>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        Choose how early the dashboard should show follow-up
                        alerts.
                      </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      {ALERT_DAY_OPTIONS.map((option) => {
                        const isSelected =
                          settings.followUpAlertDays === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            disabled={
                              !settings.followUpAlertsEnabled || isSaving
                            }
                            onClick={() => handleTimingChange(option.value)}
                            className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                              isSelected
                                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
