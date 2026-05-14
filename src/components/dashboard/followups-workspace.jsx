import Badge from "@/components/dashboard/badge";
import StatusTransitionMenu, { getNextStatuses } from "@/components/dashboard/statustransition";
import ApplicationDetailsModal from "@/components/modals/application-details-modal";
import { useApplications } from "@/context/applications-context";
import useUserFollowups from "@/hooks/use-all-followups";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  ListChecks,
  RefreshCcw,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const STATUS_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Sent", value: "SENT" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const SORT_OPTIONS = [
  { label: "Soonest first", value: "SOONEST" },
  { label: "Latest created", value: "LATEST_CREATED" },
  { label: "Company A-Z", value: "COMPANY_ASC" },
];

const FOLLOWUP_STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-600 ring-amber-100",
  SENT: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  FAILED: "bg-rose-50 text-rose-500 ring-rose-100",
  CANCELLED: "bg-slate-100 text-slate-500 ring-slate-200",
};

const getTime = (value) => {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const isDueSoon = (followup) => {
  if (followup?.status !== "PENDING") return false;

  const scheduledAt = getTime(followup?.scheduledAt);
  if (!scheduledAt) return false;

  const now = Date.now();
  const nextDay = now + 24 * 60 * 60 * 1000;
  return scheduledAt >= now && scheduledAt <= nextDay;
};

const formatDateTime = (value, fallback = "Not added") => {
  if (!value) return fallback;

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatType = (value) => {
  if (!value) return "Unknown type";

  return String(value)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(" ");
};

const FollowupStatusPill = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
      FOLLOWUP_STATUS_STYLES[status] || "bg-slate-100 text-slate-500 ring-slate-200"
    }`}
  >
    {formatType(status)}
  </span>
);

function FollowupCard({ followup, onViewApplication, onStatusUpdated }) {
  const nextStatuses = getNextStatuses(followup?.applicationStatus);
  const application = {
    id: followup.applicationId,
    company: followup.company,
    role: followup.role,
    location: followup.location,
    currentStatus: followup.applicationStatus,
    appliedAt: followup.appliedAt,
  };

  return (
    <article className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm transition-colors hover:border-slate-200">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">
              {followup.company || "Unknown company"} · {followup.role || "Unknown role"}
            </h3>
            <FollowupStatusPill status={followup.status} />
            <Badge variant={followup.applicationStatus}>
              {followup.applicationStatus || "Not added"}
            </Badge>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span>{followup.location || "Location not added"}</span>
            <span>{formatType(followup.type)}</span>
            <span>Sequence {followup.sequence || 1}</span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {followup.message || "No follow-up message available."}
          </p>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 text-amber-500" />
              Scheduled {formatDateTime(followup.scheduledAt, "Not scheduled")}
            </span>
            {followup.executedAt && (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Executed {formatDateTime(followup.executedAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {nextStatuses.length > 0 && (
            <StatusTransitionMenu
              application={application}
              onStatusUpdated={(statusChange) => onStatusUpdated(followup, statusChange)}
            />
          )}
          <button
            onClick={() => onViewApplication(followup)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5" />
            View Application
          </button>
        </div>
      </div>
    </article>
  );
}

function FollowupSection({ title, count, children }) {
  if (!count) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
          {count}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function FollowupsWorkspace({ refreshKey = 0 }) {
  const { followups, isLoading, error, refetchFollowups } = useUserFollowups();
  const { refetchApplications } = useApplications();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("SOONEST");
  const [viewTarget, setViewTarget] = useState(null);

  const handleRefreshAfterMutation = useCallback(async () => {
    await Promise.all([
      refetchFollowups(),
      refetchApplications(),
    ]);
  }, [
    refetchApplications,
    refetchFollowups,
  ]);

  const handleStatusUpdated = useCallback(
    async (followup, statusChange) => {
      await handleRefreshAfterMutation();
    },
    [handleRefreshAfterMutation],
  );

  useEffect(() => {
    if (!refreshKey) return;
    handleRefreshAfterMutation();
  }, [handleRefreshAfterMutation, refreshKey]);

  const typeOptions = useMemo(() => {
    const types = new Set(
      (followups || []).map((followup) => followup?.type).filter(Boolean),
    );

    return [
      { label: "All types", value: "ALL" },
      ...Array.from(types).map((type) => ({
        label: formatType(type),
        value: type,
      })),
    ];
  }, [followups]);

  const summary = useMemo(() => {
    const counts = {
      total: followups.length,
      pending: 0,
      sent: 0,
      failed: 0,
      cancelled: 0,
      dueSoon: 0,
    };

    followups.forEach((followup) => {
      const status = String(followup?.status || "").toLowerCase();
      if (status in counts) counts[status] += 1;
      if (isDueSoon(followup)) counts.dueSoon += 1;
    });

    return counts;
  }, [followups]);

  const filteredFollowups = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...(followups || [])]
      .filter((followup) => {
        const matchesSearch =
          !query ||
          [followup?.company, followup?.role]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
        const matchesStatus =
          statusFilter === "ALL" || followup?.status === statusFilter;
        const matchesType = typeFilter === "ALL" || followup?.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === "LATEST_CREATED") {
          return getTime(b?.createdAt || b?.scheduledAt) - getTime(a?.createdAt || a?.scheduledAt);
        }

        if (sortBy === "COMPANY_ASC") {
          return String(a?.company || "").localeCompare(String(b?.company || ""));
        }

        return getTime(a?.scheduledAt) - getTime(b?.scheduledAt);
      });
  }, [followups, search, sortBy, statusFilter, typeFilter]);

  const groupedFollowups = useMemo(() => {
    const groups = {
      dueSoon: [],
      upcoming: [],
      completed: [],
    };

    filteredFollowups.forEach((followup) => {
      if (isDueSoon(followup)) {
        groups.dueSoon.push(followup);
        return;
      }

      if (followup?.status === "PENDING") {
        groups.upcoming.push(followup);
        return;
      }

      groups.completed.push(followup);
    });

    return groups;
  }, [filteredFollowups]);

  const summaryCards = [
    { label: "Total follow-ups", value: summary.total, icon: ListChecks, tone: "bg-slate-50 text-slate-600 ring-slate-100" },
    { label: "Pending", value: summary.pending, icon: Clock3, tone: "bg-amber-50 text-amber-600 ring-amber-100" },
    { label: "Sent", value: summary.sent, icon: Send, tone: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
    { label: "Failed", value: summary.failed, icon: AlertCircle, tone: "bg-rose-50 text-rose-500 ring-rose-100" },
    { label: "Cancelled", value: summary.cancelled, icon: XCircle, tone: "bg-slate-100 text-slate-500 ring-slate-200" },
    { label: "Due soon", value: summary.dueSoon, icon: CalendarClock, tone: "bg-indigo-50 text-indigo-600 ring-indigo-100" },
  ];

  const hasFollowups = followups.length > 0;
  const isFilteredEmpty = hasFollowups && filteredFollowups.length === 0;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Follow-ups
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Review scheduled and pending follow-ups
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
                      {isLoading ? "..." : card.value}
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

        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search company or role"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-200 focus:bg-white focus:ring-2 focus:ring-indigo-50"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-indigo-200 focus:ring-2 focus:ring-indigo-50"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-indigo-200 focus:ring-2 focus:ring-indigo-50"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

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

              <button
                onClick={handleRefreshAfterMutation}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        {!hasFollowups && !isLoading ? (
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <CalendarClock className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-sm font-semibold text-slate-800">
              No follow-ups scheduled
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Follow-ups will appear here when applications need attention.
            </p>
          </div>
        ) : isFilteredEmpty ? (
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-sm font-semibold text-slate-800">
              No follow-ups match your filters
            </h2>
          </div>
        ) : (
          <div className="space-y-6">
            <FollowupSection title="Due soon" count={groupedFollowups.dueSoon.length}>
              {groupedFollowups.dueSoon.map((followup) => (
                <FollowupCard
                  key={followup.followUpId}
                  followup={followup}
                  onViewApplication={setViewTarget}
                  onStatusUpdated={handleStatusUpdated}
                />
              ))}
            </FollowupSection>

            <FollowupSection title="Upcoming" count={groupedFollowups.upcoming.length}>
              {groupedFollowups.upcoming.map((followup) => (
                <FollowupCard
                  key={followup.followUpId}
                  followup={followup}
                  onViewApplication={setViewTarget}
                  onStatusUpdated={handleStatusUpdated}
                />
              ))}
            </FollowupSection>

            <FollowupSection
              title="Completed / Cancelled"
              count={groupedFollowups.completed.length}
            >
              {groupedFollowups.completed.map((followup) => (
                <FollowupCard
                  key={followup.followUpId}
                  followup={followup}
                  onViewApplication={setViewTarget}
                  onStatusUpdated={handleStatusUpdated}
                />
              ))}
            </FollowupSection>
          </div>
        )}
      </div>

      <ApplicationDetailsModal
        isOpen={Boolean(viewTarget)}
        application={
          viewTarget
            ? {
                id: viewTarget.applicationId,
                company: viewTarget.company,
                role: viewTarget.role,
                location: viewTarget.location,
                status: viewTarget.applicationStatus,
                appliedAt: viewTarget.appliedAt,
                scheduledAt: viewTarget.scheduledAt,
                followupMessage: viewTarget.message,
              }
            : null
        }
        mode="view"
        onClose={() => {
          setViewTarget(null);
        }}
        onStatusUpdated={handleRefreshAfterMutation}
      />
    </>
  );
}
