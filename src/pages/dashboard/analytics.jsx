import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Timer,
  TrendingUp,
  UserCheck,
  XCircle,
} from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import useAnalytics from "@/hooks/use-analytics";

const RANGE_OPTIONS = [
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "180d", value: "180d" },
  { label: "1y", value: "1y" },
];

const BUCKET_OPTIONS = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

const FUNNEL_LABELS = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  INTERVIEWING: "Interviewing",
  OFFERED: "Offered",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  GHOSTED: "Ghosted",
  OFFER_DECLINED: "Offer Declined",
};

const FUNNEL_STAGE_ORDER = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEWING",
  "OFFERED",
  "ACCEPTED",
];

const TERMINAL_STATUS_CLASSES = {
  ACCEPTED: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    marker: "bg-emerald-500 border-emerald-500",
    text: "text-emerald-700",
  },
  REJECTED: {
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    marker: "bg-rose-500 border-rose-500",
    text: "text-rose-700",
  },
  GHOSTED: {
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    marker: "bg-slate-400 border-slate-400",
    text: "text-slate-600",
  },
  OFFER_DECLINED: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    marker: "bg-amber-500 border-amber-500",
    text: "text-amber-700",
  },
};

const SOURCE_LABELS = {
  LINKEDIN: "LinkedIn",
  REFERRAL: "Referral",
  CAREER_PAGE: "Career Page",
  NAUKRI: "Naukri",
  OTHER: "Other",
};

const formatLabel = (value) => {
  if (!value) return "Unknown";
  const key = String(value).toUpperCase();
  if (FUNNEL_LABELS[key]) return FUNNEL_LABELS[key];
  if (SOURCE_LABELS[key]) return SOURCE_LABELS[key];

  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatNumber = (value) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  );

const formatPercent = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0%";
  return `${number.toFixed(number % 1 === 0 ? 0 : 1)}%`;
};

const formatDays = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "0 days";
  return `${number.toFixed(number % 1 === 0 ? 0 : 1)} days`;
};

const getNestedValue = (object, path) =>
  path.split(".").reduce((current, key) => current?.[key], object);

const getFirstNumber = (object, paths) => {
  for (const path of paths) {
    const value = getNestedValue(object, path);
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }

  return 0;
};

const getSourceRows = (sources) => {
  if (Array.isArray(sources)) return sources;
  if (sources && typeof sources === "object") {
    return Object.entries(sources).map(([source, values]) => ({
      source,
      ...(values && typeof values === "object" ? values : { applications: values }),
    }));
  }

  return [];
};

const getObjectRows = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value).map(([name, count]) => ({ name, count }));
};

const getFunnelStageDescription = (step) => {
  const stage = String(step?.stage || "").toUpperCase();

  if (stage === "APPLIED") {
    return `${formatNumber(step?.count)} total applications`;
  }

  const labels = [];

  if (step?.fromAppliedRate !== undefined) {
    labels.push(`${formatPercent(step.fromAppliedRate)} of all applications`);
  }

  if (step?.fromPreviousRate !== undefined) {
    labels.push(
      `${formatPercent(step.fromPreviousRate)} from previous stage`,
    );
  }

  return labels.join(", ");
};

const getJourneyStatusConfig = (status, isTerminal = false) => {
  const normalizedStatus = String(status || "").toUpperCase();

  if (TERMINAL_STATUS_CLASSES[normalizedStatus]) {
    return TERMINAL_STATUS_CLASSES[normalizedStatus];
  }

  if (isTerminal) {
    return {
      badge: "bg-slate-100 text-slate-600 border-slate-200",
      marker: "bg-slate-400 border-slate-400",
      text: "text-slate-600",
    };
  }

  return {
    badge: "bg-indigo-50 text-indigo-700 border-indigo-100",
    marker: "bg-indigo-500 border-indigo-500",
    text: "text-indigo-700",
  };
};

const getJourneyPath = (journey) => {
  if (Array.isArray(journey?.path) && journey.path.length > 0) {
    return journey.path;
  }

  if (Array.isArray(journey?.reachedStages) && journey.reachedStages.length > 0) {
    return journey.reachedStages.map((status) => ({ status }));
  }

  return [];
};

const StatCard = ({ label, value, icon: Icon, accent = "indigo" }) => {
  const accentClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentClasses[accent]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-800">
        {typeof value === "string" ? value : formatNumber(value)}
      </p>
    </div>
  );
};

const SectionHeader = ({ title, description, action }) => (
  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      {description && (
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      )}
    </div>
    {action}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
    {message}
  </div>
);

const LoadingBlock = ({ className = "h-40" }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs shadow-lg">
      <p className="mb-2 font-semibold text-slate-700">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-500">{item.name}:</span>
            <span className="font-semibold text-slate-700">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [range, setRange] = useState("90d");
  const [bucket, setBucket] = useState("week");
  const {
    overview,
    funnel,
    timeline,
    sources,
    interviews,
    timeMetrics,
    isLoading,
    isRefetching,
    isTimelineLoading,
    error,
    timelineError,
    refetchAnalytics,
    refetchTimeline,
  } = useAnalytics(range, bucket);

  const pipeline = overview?.pipeline || overview || {};
  const funnelSteps = useMemo(() => {
    const steps = Array.isArray(funnel?.steps) ? funnel.steps : [];
    return [...steps].sort((a, b) => {
      const aIndex = FUNNEL_STAGE_ORDER.indexOf(
        String(a?.stage || "").toUpperCase(),
      );
      const bIndex = FUNNEL_STAGE_ORDER.indexOf(
        String(b?.stage || "").toUpperCase(),
      );

      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });
  }, [funnel]);
  const funnelJourneys = Array.isArray(funnel?.journeys)
    ? funnel.journeys
    : [];
  const sourceRows = useMemo(() => getSourceRows(sources), [sources]);
  const interviewTypeRows = useMemo(
    () => getObjectRows(interviews?.byType || interviews?.types),
    [interviews],
  );

  const timelineData = useMemo(
    () =>
      (Array.isArray(timeline) ? timeline : []).map((item) => ({
        period: item?.period,
        applicationsAdded: Number(item?.applicationsAdded) || 0,
        statusChanges: Number(item?.statusChanges) || 0,
        interviewsScheduled: Number(item?.interviewsScheduled) || 0,
        followUpsCompleted: Number(item?.followUpsCompleted) || 0,
      })),
    [timeline],
  );

  const interviewCounts = {
    scheduled: getFirstNumber(interviews, [
      "scheduled",
      "scheduledInterviews",
      "status.SCHEDULED",
      "statuses.SCHEDULED",
    ]),
    completed: getFirstNumber(interviews, [
      "completed",
      "completedInterviews",
      "status.COMPLETED",
      "statuses.COMPLETED",
    ]),
    cancelled: getFirstNumber(interviews, [
      "cancelled",
      "cancelledInterviews",
      "cancelledInterviewsCount",
      "status.CANCELLED",
      "statuses.CANCELLED",
    ]),
    passed: getFirstNumber(interviews, ["results.PASSED", "passed"]),
    failed: getFirstNumber(interviews, ["results.FAILED", "failed"]),
    pending: getFirstNumber(interviews, ["results.PENDING", "pending"]),
    avgRoundsBeforeOffer: getFirstNumber(interviews, [
      "avgRoundsBeforeOffer",
      "averageRoundsBeforeOffer",
    ]),
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                Analytics
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Job search performance and metrics.
              </p>
            </div>
            <button
              type="button"
              onClick={refetchAnalytics}
              disabled={isLoading || isRefetching}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {error && (
            <div className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={refetchAnalytics}
                className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm"
              >
                Retry
              </button>
            </div>
          )}

          <section>
            <SectionHeader
              title="Pipeline Overview"
              description="Current application pipeline snapshot"
            />
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
                {Array.from({ length: 7 }).map((_, index) => (
                  <LoadingBlock key={index} className="h-28" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
                <StatCard
                  label="Total applications"
                  value={pipeline.totalApplications}
                  icon={BriefcaseBusiness}
                />
                <StatCard
                  label="Active"
                  value={pipeline.activeApplications}
                  icon={Activity}
                  accent="emerald"
                />
                <StatCard
                  label="Interviews"
                  value={pipeline.interviews}
                  icon={CalendarDays}
                  accent="amber"
                />
                <StatCard
                  label="Offers"
                  value={pipeline.offers}
                  icon={TrendingUp}
                  accent="emerald"
                />
                <StatCard
                  label="Accepted"
                  value={pipeline.accepted}
                  icon={CheckCircle2}
                  accent="emerald"
                />
                <StatCard
                  label="Rejected"
                  value={pipeline.rejected}
                  icon={XCircle}
                  accent="rose"
                />
                <StatCard
                  label="Ghosted"
                  value={pipeline.ghosted}
                  icon={Clock3}
                  accent="slate"
                />
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <section className="xl:col-span-7">
              <SectionHeader
                title="Funnel"
                description="Conversion from applied through accepted"
              />
              {isLoading ? (
                <LoadingBlock className="h-80" />
              ) : funnelSteps.length === 0 ? (
                <EmptyState message="No funnel metrics available yet." />
              ) : (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Aggregate conversion summary
                      </p>
                    </div>
                    <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">
                      {funnelSteps.map((step) => (
                        <div key={step?.stage} className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {formatLabel(step?.stage)}
                          </p>
                          <p className="mt-1 text-2xl font-bold text-slate-800">
                            {formatNumber(step?.count)}
                          </p>
                          <p
                            className="mt-1 text-xs leading-5 text-slate-500"
                            title={
                              String(step?.stage || "").toUpperCase() ===
                              "APPLIED"
                                ? "This is the starting stage for the funnel."
                                : "Of all applications means the percentage of total applied applications that reached this stage. From previous stage means the percentage of applications from the previous funnel stage that reached this stage."
                            }
                          >
                            {getFunnelStageDescription(step)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Application journey progress
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          How each application moved through the hiring path
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {formatNumber(funnelJourneys.length)} tracked
                      </span>
                    </div>

                    {funnelJourneys.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-400">
                        No application journeys available yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {funnelJourneys.map((journey) => {
                          const status =
                            journey?.outcomeStatus || journey?.currentStatus;
                          const statusConfig = getJourneyStatusConfig(
                            status,
                            journey?.isTerminal,
                          );
                          const path = getJourneyPath(journey);
                          const progressRate = Math.max(
                            0,
                            Math.min(100, Number(journey?.progressRate) || 0),
                          );

                          return (
                            <div
                              key={journey?.applicationId}
                              className="px-4 py-4"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {journey?.company || "Unknown company"}
                                  </p>
                                  <p className="mt-0.5 truncate text-xs text-slate-400">
                                    {journey?.role || "Role not specified"}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {!journey?.isTerminal && (
                                    <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                      In progress
                                    </span>
                                  )}
                                  <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.badge}`}
                                  >
                                    {formatLabel(status)}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-4">
                                <div className="mb-2 flex items-center justify-between text-xs">
                                  <span className="font-medium text-slate-500">
                                    {formatPercent(progressRate)} complete
                                  </span>
                                  {journey?.isTerminal && (
                                    <span className={statusConfig.text}>
                                      Final outcome
                                    </span>
                                  )}
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className={`h-full rounded-full ${
                                      journey?.isTerminal
                                        ? statusConfig.marker.split(" ")[0]
                                        : "bg-indigo-500"
                                    }`}
                                    style={{ width: `${progressRate}%` }}
                                  />
                                </div>
                              </div>

                              {path.length > 0 && (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                  {path.map((item, index) => {
                                    const itemStatus = String(
                                      item?.status || "",
                                    ).toUpperCase();
                                    const isLast = index === path.length - 1;
                                    const itemConfig = getJourneyStatusConfig(
                                      itemStatus,
                                      journey?.isTerminal && isLast,
                                    );

                                    return (
                                      <div
                                        key={`${journey?.applicationId}-${itemStatus}-${index}`}
                                        className="flex items-center gap-2"
                                      >
                                        <span
                                          className={`h-2.5 w-2.5 rounded-full border-2 ${
                                            isLast
                                              ? itemConfig.marker
                                              : "border-indigo-500 bg-indigo-500"
                                          }`}
                                        />
                                        <span
                                          className={`text-xs font-medium ${
                                            isLast && journey?.isTerminal
                                              ? itemConfig.text
                                              : "text-slate-500"
                                          }`}
                                        >
                                          {formatLabel(itemStatus)}
                                        </span>
                                        {!isLast && (
                                          <span className="h-px w-5 bg-slate-200" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="xl:col-span-5">
              <SectionHeader
                title="Time Metrics"
                description="Average time between major milestones"
              />
              {isLoading ? (
                <LoadingBlock className="h-80" />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <StatCard
                    label="Avg time to first interview"
                    value={formatDays(
                      timeMetrics?.averageTimeToFirstInterviewDays,
                    )}
                    icon={Timer}
                  />
                  <StatCard
                    label="Avg interview to offer"
                    value={formatDays(
                      timeMetrics?.averageTimeFromInterviewToOfferDays,
                    )}
                    icon={TrendingUp}
                    accent="emerald"
                  />
                  <StatCard
                    label="Avg time to final outcome"
                    value={formatDays(
                      timeMetrics?.averageTimeToFinalOutcomeDays,
                    )}
                    icon={CheckCircle2}
                    accent="amber"
                  />
                </div>
              )}
            </section>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <section className="xl:col-span-7">
              <SectionHeader
                title="Source Performance"
                description="Applications and outcomes grouped by source"
              />
              {isLoading ? (
                <LoadingBlock className="h-80" />
              ) : sourceRows.length === 0 ? (
                <EmptyState message="No source metrics available yet." />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <th className="px-4 py-3">Source</th>
                          <th className="px-4 py-3">Applications</th>
                          <th className="px-4 py-3">Offers</th>
                          <th className="px-4 py-3">Accepted</th>
                          <th className="px-4 py-3">Rejections</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sourceRows.map((row) => (
                          <tr key={row?.source} className="text-slate-600">
                            <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                              {formatLabel(row?.source)}
                            </td>
                            <td className="px-4 py-3">
                              {formatNumber(
                                row?.applications ?? row?.applicationCount,
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {formatNumber(row?.offers ?? row?.offerCount)}
                            </td>
                            <td className="px-4 py-3">
                              {formatNumber(row?.accepted ?? row?.acceptedCount)}
                            </td>
                            <td className="px-4 py-3">
                              {formatNumber(
                                row?.rejections ??
                                  row?.rejected ??
                                  row?.rejectionCount,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            <section className="xl:col-span-5">
              <SectionHeader
                title="Interview Performance"
                description="Interview status, results, and round depth"
              />
              {isLoading ? (
                <LoadingBlock className="h-80" />
              ) : !interviews ? (
                <EmptyState message="No interview metrics available yet." />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard
                      label="Scheduled"
                      value={interviewCounts.scheduled}
                      icon={CalendarDays}
                    />
                    <StatCard
                      label="Completed"
                      value={interviewCounts.completed}
                      icon={CheckCircle2}
                      accent="emerald"
                    />
                    <StatCard
                      label="Cancelled"
                      value={interviewCounts.cancelled}
                      icon={XCircle}
                      accent="rose"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Results
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Passed</span>
                          <span className="font-semibold text-emerald-600">
                            {formatNumber(interviewCounts.passed)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Failed</span>
                          <span className="font-semibold text-rose-600">
                            {formatNumber(interviewCounts.failed)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Pending</span>
                          <span className="font-semibold text-amber-600">
                            {formatNumber(interviewCounts.pending)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Rounds
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <UserCheck className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-2xl font-bold text-slate-800">
                            {Number(interviewCounts.avgRoundsBeforeOffer).toFixed(
                              Number(interviewCounts.avgRoundsBeforeOffer) % 1 ===
                                0
                                ? 0
                                : 1,
                            )}
                          </p>
                          <p className="text-xs text-slate-400">
                            Avg rounds before offer
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {interviewTypeRows.length > 0 && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Interviews by type
                      </p>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={interviewTypeRows.map((row) => ({
                              name: formatLabel(row.name),
                              count: Number(row.count) || 0,
                            }))}
                            margin={{ top: 5, right: 5, left: -20, bottom: 28 }}
                          >
                            <CartesianGrid
                              stroke="#f1f5f9"
                              strokeDasharray="3 3"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="name"
                              interval={0}
                              height={52}
                              tick={{
                                fontSize: 11,
                                fill: "#94a3b8",
                                textAnchor: "end",
                              }}
                              angle={-25}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: 11, fill: "#94a3b8" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar
                              name="Interviews"
                              dataKey="count"
                              fill="#6366f1"
                              radius={[6, 6, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          <section>
            <SectionHeader
              title="Activity Timeline"
              description="Application activity grouped by selected period"
              action={
                <div className="flex flex-wrap gap-2">
                  <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                    {RANGE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRange(option.value)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          range === option.value
                            ? "bg-indigo-600 text-white"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                    {BUCKET_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setBucket(option.value)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          bucket === option.value
                            ? "bg-slate-800 text-white"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              }
            />
            {isLoading || isTimelineLoading ? (
              <LoadingBlock className="h-96" />
            ) : timelineError ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
                <span>{timelineError}</span>
                <button
                  type="button"
                  onClick={refetchTimeline}
                  className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm"
                >
                  Retry
                </button>
              </div>
            ) : timelineData.length === 0 ? (
              <EmptyState message="No timeline activity available for this range." />
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timelineData}
                      margin={{ top: 10, right: 20, left: -18, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke="#f1f5f9"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
                      />
                      <Line
                        name="Applications added"
                        type="monotone"
                        dataKey="applicationsAdded"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        name="Status changes"
                        type="monotone"
                        dataKey="statusChanges"
                        stroke="#0f766e"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        name="Interviews scheduled"
                        type="monotone"
                        dataKey="interviewsScheduled"
                        stroke="#d97706"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        name="Follow-ups completed"
                        type="monotone"
                        dataKey="followUpsCompleted"
                        stroke="#e11d48"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
