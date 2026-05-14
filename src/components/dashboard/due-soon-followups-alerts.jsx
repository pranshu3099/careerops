import Badge from "@/components/dashboard/badge";
import ApplicationDetailsModal from "@/components/modals/application-details-modal";
import { useApplications } from "@/context/applications-context";
import useDueSoonFollowups from "@/hooks/use-due-soon-followups";
import { Bell, Clock3, Eye, RefreshCcw, X } from "lucide-react";
import { useMemo, useState } from "react";

const formatDateTime = (value) => {
  if (!value) return "Not scheduled";

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Not scheduled";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export default function DueSoonFollowupsAlerts({ onFollowupsChanged }) {
  const {
    dueSoonFollowups,
    isLoading,
    error,
    refetchDueSoonFollowups,
  } = useDueSoonFollowups({ autoFetch: true });
  const { refetchApplications } = useApplications();
  const [dismissedIds, setDismissedIds] = useState(() => new Set());
  const [modalState, setModalState] = useState({ mode: "", followup: null });

  const visibleFollowups = useMemo(
    () =>
      dueSoonFollowups.filter(
        (followup) =>
          followup?.followUpId && !dismissedIds.has(followup.followUpId),
      ),
    [dismissedIds, dueSoonFollowups],
  );

  const handleStatusUpdated = async () => {
    await Promise.all([
      refetchApplications(),
      refetchDueSoonFollowups(),
      onFollowupsChanged?.(),
    ]);
    setModalState({ mode: "", followup: null });
  };

  const handleDismiss = (followUpId) => {
    setDismissedIds((current) => {
      const next = new Set(current);
      next.add(followUpId);
      return next;
    });
  };

  const selectedApplication = modalState.followup
    ? {
        id: modalState.followup.applicationId,
        company: modalState.followup.company,
        role: modalState.followup.role,
        location: modalState.followup.location,
        status: modalState.followup.status,
        appliedAt: modalState.followup.appliedAt,
        scheduledAt: modalState.followup.scheduledAt,
        followupMessage:
          modalState.followup.message || modalState.followup.alert?.message,
      }
    : null;

  if (isLoading && dueSoonFollowups.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <RefreshCcw className="h-4 w-4 animate-spin text-indigo-500" />
          Loading due-soon follow-ups
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-rose-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-rose-600">{error}</p>
          <button
            onClick={refetchDueSoonFollowups}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (visibleFollowups.length === 0) return null;

  return (
    <>
      <section className="rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Due-soon follow-ups
              </h2>
              <p className="text-xs text-slate-400">
                Applications that need attention soon
              </p>
            </div>
          </div>
          {isLoading && (
            <RefreshCcw className="h-4 w-4 animate-spin text-slate-300" />
          )}
        </div>

        <div className="divide-y divide-slate-50">
          {visibleFollowups.map((followup) => (
            <article
              key={followup.followUpId}
              className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-slate-800">
                    {followup.role || "Unknown role"} at {followup.company || "Unknown company"}
                  </h3>
                  <Badge variant={followup.status}>{followup.status}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                  <span>{followup.location || "Location not added"}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDateTime(followup.scheduledAt)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {followup.alert?.message || "Follow-up scheduled soon."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <button
                  onClick={() => setModalState({ mode: "update", followup })}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  Update Status
                </button>
                <button
                  onClick={() => setModalState({ mode: "view", followup })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Application
                </button>
                <button
                  onClick={() => handleDismiss(followup.followUpId)}
                  className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
                  aria-label="Dismiss alert"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ApplicationDetailsModal
        isOpen={Boolean(modalState.followup)}
        mode={modalState.mode}
        application={selectedApplication}
        onClose={() => setModalState({ mode: "", followup: null })}
        onStatusUpdated={handleStatusUpdated}
      />
    </>
  );
}
