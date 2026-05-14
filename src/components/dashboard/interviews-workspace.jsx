import Badge from "@/components/dashboard/badge";
import InterviewFormModal from "@/components/modals/interview-form-modal";
import InterviewResultModal from "@/components/modals/interview-result-modal";
import { useApplications } from "@/context/applications-context";
import useAllApplicationInterviews from "@/hooks/use-all-application-interviews";
import { updateApplicationStatus } from "@/lib/applications";
import { isTerminalApplicationStatus } from "@/lib/application-statuses";
import {
  getAddRoundLabel,
  getLatestInterview,
  getNextRound,
} from "@/lib/interview-rounds";
import { cancelInterview } from "@/lib/interviews";
import { requestNotificationsRefresh } from "@/lib/notifications";
import {
  CalendarClock,
  ChevronDown,
  Edit,
  Plus,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const SORT_OPTIONS = [
  { label: "Soonest first", value: "SOONEST" },
  { label: "Latest scheduled", value: "LATEST" },
  { label: "Company A-Z", value: "COMPANY_ASC" },
];

const STATUS_STYLES = {
  SCHEDULED: "bg-blue-50 text-blue-600 ring-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  CANCELLED: "bg-slate-100 text-slate-500 ring-slate-200",
};

const RESULT_STYLES = {
  PASSED: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  FAILED: "bg-rose-50 text-rose-500 ring-rose-100",
  PENDING: "bg-amber-50 text-amber-600 ring-amber-100",
};

const getTime = (value) => {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const formatDateTime = (value) => {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Not scheduled";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatType = (value) =>
  String(value || "OTHER")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(" ");

const Pill = ({ children, className }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${className}`}
  >
    {children}
  </span>
);

export default function InterviewsWorkspace({ refreshKey = 0 }) {
  const { applications, refetchApplications } = useApplications();
  const { applicationInterviews, isLoading, error, refetchAllInterviews } =
    useAllApplicationInterviews(applications);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("LATEST");
  const [formState, setFormState] = useState({
    open: false,
    mode: "create",
    application: null,
    interview: null,
    round: 1,
  });
  const [resultTarget, setResultTarget] = useState(null);
  const [proceedOpenId, setProceedOpenId] = useState("");
  const handledRefreshKeyRef = useRef(0);

  const refreshAll = useCallback(async ({ refreshNotifications = false } = {}) => {
    await Promise.all([
      refetchAllInterviews(),
      refetchApplications(),
    ]);

    if (refreshNotifications) {
      requestNotificationsRefresh();
    }
  }, [
    refetchAllInterviews,
    refetchApplications,
  ]);

  useEffect(() => {
    if (!refreshKey || handledRefreshKeyRef.current === refreshKey) return;
    handledRefreshKeyRef.current = refreshKey;
    refreshAll();
  }, [refreshAll, refreshKey]);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...applicationInterviews]
      .filter(({ application, interviews }) => {
        const matchesSearch =
          !query ||
          [application?.company, application?.role]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
        return matchesSearch && interviews.length > 0;
      })
      .sort((a, b) => {
        if (sortBy === "COMPANY_ASC") {
          return String(a.application?.company || "").localeCompare(
            String(b.application?.company || ""),
          );
        }

        const aLatest = getLatestInterview(a.interviews);
        const bLatest = getLatestInterview(b.interviews);
        if (sortBy === "LATEST") {
          return getTime(bLatest?.scheduledAt) - getTime(aLatest?.scheduledAt);
        }

        return getTime(aLatest?.scheduledAt) - getTime(bLatest?.scheduledAt);
      });
  }, [applicationInterviews, search, sortBy]);

  const emptyApplicationGroups = useMemo(
    () =>
      applicationInterviews.filter(
        ({ application, interviews }) =>
          String(
            application?.currentStatus || application?.status || "",
          ).toUpperCase() === "INTERVIEWING" && interviews.length === 0,
      ),
    [applicationInterviews],
  );

  const openCreate = (application, round) => {
    setFormState({
      open: true,
      mode: "create",
      application,
      interview: null,
      round,
    });
  };

  const openEdit = (application, interview) => {
    setFormState({
      open: true,
      mode: "edit",
      application,
      interview,
      round: interview?.round || 1,
    });
  };

  const moveApplication = async (application, newStatus) => {
    try {
      await updateApplicationStatus(application.id, newStatus);
      setProceedOpenId("");
      await refreshAll({ refreshNotifications: true });
      toast.success(`Moved to ${newStatus}`);
    } catch (err) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const handleCancelInterview = async (interview) => {
    try {
      await cancelInterview(interview?.id || interview?.interviewId);
      await refreshAll({ refreshNotifications: true });
      toast.success("Interview cancelled");
    } catch (err) {
      toast.error(err?.message || "Failed to cancel interview");
    }
  };

  const renderApplicationActions = (application, interviews) => {
    const status = String(application?.currentStatus).toUpperCase();
    const latest = getLatestInterview(interviews);
    const nextRound = getNextRound(interviews);
    const addRoundLabel = getAddRoundLabel(interviews);
    const canAdd =
      status === "INTERVIEWING" &&
      (!latest ||
        latest.status === "CANCELLED" ||
        (latest.status === "COMPLETED" && latest.result === "PASSED"));
    const canProceed =
      status === "INTERVIEWING" &&
      latest?.status === "COMPLETED" &&
      latest?.result === "PASSED";

    if (!canAdd && !canProceed) return null;

    return (
      <div className="flex flex-wrap items-center gap-2">
        {canAdd && (
          <button
            onClick={() => openCreate(application, nextRound)}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-indigo-50 px-3 text-xs font-semibold leading-none text-indigo-600 ring-1 ring-indigo-100 transition-colors hover:bg-indigo-100"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            {addRoundLabel}
          </button>
        )}

        {canProceed && (
          <span className="relative">
            <button
              onClick={() =>
                setProceedOpenId((current) =>
                  current === application.id ? "" : application.id,
                )
              }
              className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 text-xs font-semibold leading-none text-emerald-600 ring-1 ring-emerald-100 transition-colors hover:bg-emerald-100"
            >
              Proceed further
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            </button>
            {proceedOpenId === application.id && (
              <div className="absolute right-0 top-8 z-40 min-w-36 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl shadow-slate-200/80">
                <button
                  onClick={() => {
                    setProceedOpenId("");
                    openCreate(application, nextRound);
                  }}
                  className="block w-full px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {addRoundLabel}
                </button>
                <button
                  onClick={() => moveApplication(application, "OFFERED")}
                  className="block w-full px-3 py-2 text-left text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                >
                  Offered
                </button>
                <button
                  onClick={() => moveApplication(application, "REJECTED")}
                  className="block w-full px-3 py-2 text-left text-xs font-medium text-rose-500 hover:bg-rose-50"
                >
                  Rejected
                </button>
              </div>
            )}
          </span>
        )}
      </div>
    );
  };

  const hasAnyInterviews = applicationInterviews.some(
    ({ interviews }) => interviews.length > 0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">
          Interviews
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Manage interview rounds and results
        </p>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search company or role"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-indigo-200 focus:bg-white focus:ring-2 focus:ring-indigo-50"
            />
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
          <button
            onClick={refreshAll}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-100 bg-white px-5 py-8 text-sm text-slate-500 shadow-sm">
          Loading interviews...
        </div>
      ) : !hasAnyInterviews && emptyApplicationGroups.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white px-5 py-14 text-center shadow-sm">
          <CalendarClock className="mx-auto h-6 w-6 text-slate-300" />
          <h2 className="mt-4 text-sm font-semibold text-slate-800">
            No interviews scheduled yet.
          </h2>
        </div>
      ) : (
        <div className="space-y-4">
          {emptyApplicationGroups.map(({ application, interviews }) => (
            <section
              key={application.id}
              className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    {application.company} · {application.role}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={application.currentStatus || application.status}
                    >
                      {application.currentStatus}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      No interviews scheduled yet.
                    </span>
                  </div>
                </div>
                {renderApplicationActions(application, interviews)}
              </div>
            </section>
          ))}

          {filteredGroups.map(({ application, interviews }) => (
            <section
              key={application.id}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    {application.company} · {application.role}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={application.currentStatus || application.status}
                    >
                      {application.currentStatus || application.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {application.location || "Location not added"}
                    </span>
                  </div>
                </div>
                {renderApplicationActions(application, interviews)}
              </div>

              <div className="mt-4 space-y-3">
                {interviews.map((interview) => {
                  const interviewId = interview.id || interview.interviewId;
                  const applicationStatus =
                    application?.currentStatus || application?.status;
                  const isTerminalStatus =
                    isTerminalApplicationStatus(applicationStatus);
                  const isCompleted = interview.status === "COMPLETED";
                  const hasFinalResult = [
                    "PASSED",
                    "FAILED",
                    "PENDING",
                  ].includes(interview.result);
                  const canUpdateResult =
                    !isTerminalStatus &&
                    interview.status !== "CANCELLED" &&
                    (!isCompleted || interview.result === "PENDING");
                  const canEdit =
                    !isTerminalStatus &&
                    interview.status !== "CANCELLED" &&
                    interview.result !== "PENDING" &&
                    !(isCompleted && hasFinalResult);
                  const canCancel =
                    !isTerminalStatus &&
                    interview.status === "SCHEDULED" &&
                    interview.result !== "PENDING";

                  return (
                    <article
                      key={interviewId}
                      className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">
                              Round {interview.round}
                            </span>
                            {interview.roundName && (
                              <span className="text-sm text-slate-600">
                                {interview.roundName}
                              </span>
                            )}
                            <Pill className="bg-indigo-50 text-indigo-600 ring-indigo-100">
                              {formatType(interview.type)}
                            </Pill>
                            <Pill
                              className={
                                STATUS_STYLES[interview.status] ||
                                STATUS_STYLES.SCHEDULED
                              }
                            >
                              {interview.status || "SCHEDULED"}
                            </Pill>
                            {interview.result && (
                              <Pill
                                className={
                                  RESULT_STYLES[interview.result] ||
                                  RESULT_STYLES.PENDING
                                }
                              >
                                {interview.result}
                              </Pill>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>{formatDateTime(interview.scheduledAt)}</span>
                            {interview.interviewer && (
                              <span>{interview.interviewer}</span>
                            )}
                          </div>
                          {interview.feedback && (
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                              {interview.feedback}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                          {canEdit && (
                            <button
                              onClick={() => openEdit(application, interview)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-white"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </button>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => handleCancelInterview(interview)}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-500 hover:bg-rose-100"
                            >
                              <XCircle className="h-3 w-3" />
                              Cancel
                            </button>
                          )}
                          {canUpdateResult && (
                            <button
                              onClick={() =>
                                setResultTarget({ application, interview })
                              }
                              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
                            >
                              Update Result
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <InterviewFormModal
        isOpen={formState.open}
        mode={formState.mode}
        applicationId={formState.application?.id}
        defaultRound={formState.round}
        roundLabel={
          formState.mode === "create" && formState.application
            ? getAddRoundLabel(
                applicationInterviews.find(
                  ({ application }) =>
                    application?.id === formState.application?.id,
                )?.interviews || [],
              )
            : undefined
        }
        interview={formState.interview}
        onClose={() =>
          setFormState({
            open: false,
            mode: "create",
            application: null,
            interview: null,
            round: 1,
          })
        }
        onSaved={() => refreshAll({ refreshNotifications: true })}
      />

      <InterviewResultModal
        isOpen={Boolean(resultTarget)}
        interview={resultTarget?.interview}
        onClose={() => setResultTarget(null)}
        onSaved={async (result) => {
          await refreshAll(
            result === "FAILED"
              ? {
                  applicationId: resultTarget?.application?.id,
                  newStatus: "REJECTED",
                }
              : undefined,
          );
        }}
      />
    </div>
  );
}
