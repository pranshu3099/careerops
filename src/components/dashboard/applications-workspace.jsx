import Badge from "@/components/dashboard/badge";
import InterviewActions from "@/components/dashboard/interview-actions";
import StatusTransitionMenu from "@/components/dashboard/statustransition";
import ApplicationDetailsModal from "@/components/modals/application-details-modal";
import CancelledFollowupsModal from "@/components/modals/cancelled-followups-modal";
import DeleteApplicationModal from "@/components/modals/delete-application-modal";
import EditApplicationModal from "@/components/modals/edit-application-modal";
import { useApplications } from "@/context/applications-context";
import useApplicationStats from "@/hooks/use-application-stats";
import useDueSoonFollowups from "@/hooks/use-due-soon-followups";
import useUpcomingFollowups from "@/hooks/use-upcoming-follow-up";
import { deleteApplication } from "@/lib/applications";
import { isTerminalApplicationStatus } from "@/lib/application-statuses";
import { useRouter } from "next/router";
import {
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Edit,
  Eye,
  FileText,
  ListChecks,
  Search,
  Trash,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Applied", value: "APPLIED" },
  { label: "Shortlisted", value: "SHORTLISTED" },
  { label: "Interviewing", value: "INTERVIEWING" },
  { label: "Offered", value: "OFFERED" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Offer Declined", value: "OFFER_DECLINED" },
  { label: "Rejected", value: "REJECTED" },
];

const SORT_OPTIONS = [
  { label: "Recently updated", value: "RECENTLY_UPDATED" },
  { label: "Applied date newest", value: "APPLIED_NEWEST" },
  { label: "Applied date oldest", value: "APPLIED_OLDEST" },
  { label: "Company A-Z", value: "COMPANY_ASC" },
];

const getTime = (value) => {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const formatDate = (value) => {
  if (!value) return "Not added";

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Not added";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatSource = (value) => {
  if (!value) return "Not added";

  return String(value)
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(" ");
};

const getLatestFollowup = (application, followUps) => {
  if (application?.latestFollowUp) return application.latestFollowUp;

  return followUps?.find(
    (followup) => followup?.applicationId === application?.id,
  );
};

export default function ApplicationsWorkspace({ refreshKey = 0 }) {
  const router = useRouter();
  const { applications, refetchApplications, isLoading } = useApplications();
  const { followUps, refetchFollowups } = useUpcomingFollowups();
  const { refetchDueSoonFollowups } = useDueSoonFollowups();
  const {
    stats,
    isLoading: isStatsLoading,
    error: statsError,
    refetchApplicationStats,
  } = useApplicationStats();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("RECENTLY_UPDATED");
  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [cancelledFollowupsAlert, setCancelledFollowupsAlert] = useState(null);
  const openedApplicationIdRef = useRef("");
  const nonEditableApplicationStatuses = [
    "OFFERED",
    "ACCEPTED",
    "OFFER_DECLINED",
    "REJECTED",
    "GHOSTED",
  ];

  const handleRefreshAfterMutation = useCallback(async () => {
    await Promise.all([
      refetchApplications(),
      refetchFollowups(),
      refetchDueSoonFollowups(),
      refetchApplicationStats(),
    ]);
  }, [
    refetchApplicationStats,
    refetchApplications,
    refetchDueSoonFollowups,
    refetchFollowups,
  ]);

  const handleStatusUpdated = useCallback(
    async (application, statusChange) => {
      await handleRefreshAfterMutation();

    },
    [handleRefreshAfterMutation],
  );

  useEffect(() => {
    if (!applications?.length) return;
    refetchApplicationStats();
  }, [applications?.length, refetchApplicationStats]);

  useEffect(() => {
    if (!refreshKey) return;
    handleRefreshAfterMutation();
  }, [handleRefreshAfterMutation, refreshKey]);

  useEffect(() => {
    const applicationId = router.query?.applicationId;
    if (!applicationId || typeof applicationId !== "string") return;
    if (openedApplicationIdRef.current === applicationId) return;

    const targetApplication = applications?.find(
      (application) => application?.id === applicationId,
    );

    if (!targetApplication) return;

    openedApplicationIdRef.current = applicationId;
    setViewTarget(targetApplication);
  }, [applications, router.query?.applicationId]);

  const closeViewModal = () => {
    setViewTarget(null);

    if (router.query?.applicationId) {
      openedApplicationIdRef.current = "";
      router.replace("/dashboard/application", undefined, { shallow: true });
    }
  };

  const totalApplications = Object.values(stats || {}).reduce(
    (total, value) => total + (Number(value) || 0),
    0,
  );

  const summaryCards = [
    {
      label: "Total applications",
      value: totalApplications,
      icon: Briefcase,
      tone: "bg-slate-50 text-slate-600 ring-slate-100",
    },
    {
      label: "Applied",
      value: stats?.applied || 0,
      icon: FileText,
      tone: "bg-blue-50 text-blue-600 ring-blue-100",
    },
    {
      label: "Shortlisted",
      value: stats?.shortlisted || 0,
      icon: ListChecks,
      tone: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    },
    {
      label: "Interviewing",
      value: stats?.interviewing || 0,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-600 ring-amber-100",
    },
    {
      label: "Offered",
      value: stats?.offered || 0,
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    },
    {
      label: "Accepted",
      value: stats?.accepted || 0,
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    {
      label: "Offer declined",
      value: stats?.offerDeclined || 0,
      icon: XCircle,
      tone: "bg-orange-50 text-orange-600 ring-orange-100",
    },
    {
      label: "Rejected",
      value: stats?.rejected || 0,
      icon: XCircle,
      tone: "bg-rose-50 text-rose-500 ring-rose-100",
    },
  ];

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...(applications || [])]
      .filter((application) => {
        const status = application?.currentStatus || application?.status;
        const matchesStatus =
          statusFilter === "ALL" || status === statusFilter;
        const matchesSearch =
          !query ||
          [application?.company, application?.role, application?.location]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "APPLIED_NEWEST") {
          return getTime(b?.appliedAt) - getTime(a?.appliedAt);
        }

        if (sortBy === "APPLIED_OLDEST") {
          return getTime(a?.appliedAt) - getTime(b?.appliedAt);
        }

        if (sortBy === "COMPANY_ASC") {
          return String(a?.company || "").localeCompare(String(b?.company || ""));
        }

        return getTime(b?.updatedAt || b?.createdAt) - getTime(a?.updatedAt || a?.createdAt);
      });
  }, [applications, search, sortBy, statusFilter]);

  const handleDeleteApplication = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);
      const result = await deleteApplication(deleteTarget.id);

      if (result?.success) {
        toast.success("Application deleted successfully");
        setCancelledFollowupsAlert({
          company: result?.company || deleteTarget.company,
          role: result?.role || deleteTarget.role,
        });
        setDeleteTarget(null);
        await handleRefreshAfterMutation();
      }
    } catch (error) {
      toast.error(error?.message || "Failed to delete application");
    } finally {
      setDeletingId("");
    }
  };

  const hasApplications = (applications || []).length > 0;
  const isFilteredEmpty = hasApplications && filteredApplications.length === 0;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Applications
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Track and manage all your job applications
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      {card.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                      {isStatsLoading ? "..." : card.value}
                    </p>
                  </div>
                  <div className={`rounded-xl p-2.5 ring-1 ${card.tone}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {statsError && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {statsError}
          </div>
        )}

        <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search company, role, or location"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-200 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        statusFilter === option.value
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-indigo-200 focus:ring-2 focus:ring-indigo-50"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!hasApplications && !isLoading ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-slate-800">
                No applications yet
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Add your first application to start tracking progress.
              </p>
            </div>
          ) : isFilteredEmpty ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-slate-800">
                No applications match your filters
              </h2>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Company
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Role
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Location
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Status
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Applied
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Source
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Latest follow-up
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredApplications.map((application) => {
                    const status = application?.currentStatus || application?.status;
                    const latestFollowup = getLatestFollowup(application, followUps);
                    const isTerminalStatus = isTerminalApplicationStatus(status);

                    return (
                      <tr
                        key={application.id}
                        className="group transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-xs font-bold text-indigo-600">
                              {application?.company?.[0] || "?"}
                            </div>
                            <span className="text-sm font-semibold text-slate-800">
                              {application.company || "Unknown company"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {application.role || "Unknown role"}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {application.location || "Not added"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Badge variant={status}>{status}</Badge>
                            {status !== "INTERVIEWING" && !isTerminalStatus && (
                              <StatusTransitionMenu
                                application={{
                                  ...application,
                                  currentStatus: status,
                                }}
                                onStatusUpdated={(statusChange) =>
                                  handleStatusUpdated(application, statusChange)
                                }
                              />
                            )}
                            {!isTerminalStatus && (
                              <InterviewActions
                                application={{
                                  ...application,
                                  currentStatus: status,
                                }}
                                onChanged={handleRefreshAfterMutation}
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(application.appliedAt)}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatSource(application.source)}
                        </td>
                        <td className="px-5 py-4">
                          {latestFollowup ? (
                            <div className="max-w-[220px]">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                <CalendarClock className="h-3.5 w-3.5 text-amber-500" />
                                {formatDate(latestFollowup.scheduledAt)}
                              </div>
                              <p className="mt-1 truncate text-xs text-slate-400">
                                {latestFollowup.message || latestFollowup.type}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              No follow-up
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewTarget(application)}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            {!nonEditableApplicationStatuses.includes(status) && (
                              <button
                                onClick={() => setEditTarget(application)}
                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              disabled={deletingId === application.id}
                              onClick={() => setDeleteTarget(application)}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ApplicationDetailsModal
        isOpen={Boolean(viewTarget)}
        application={
          viewTarget
            ? {
                id: viewTarget.id,
                company: viewTarget.company,
                role: viewTarget.role,
                location: viewTarget.location,
                status: viewTarget.currentStatus || viewTarget.status,
                appliedAt: viewTarget.appliedAt,
              }
            : null
        }
        mode="view"
        onClose={closeViewModal}
        onStatusUpdated={handleRefreshAfterMutation}
      />

      <EditApplicationModal
        isOpen={Boolean(editTarget)}
        application={editTarget}
        onClose={() => setEditTarget(null)}
        onApplicationUpdated={handleRefreshAfterMutation}
        followUps={followUps}
      />

      <CancelledFollowupsModal
        isOpen={Boolean(cancelledFollowupsAlert)}
        onClose={() => setCancelledFollowupsAlert(null)}
        company={cancelledFollowupsAlert?.company}
        role={cancelledFollowupsAlert?.role}
      />

      <DeleteApplicationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteApplication}
        application={deleteTarget}
        isDeleting={Boolean(deletingId)}
      />
    </>
  );
}
