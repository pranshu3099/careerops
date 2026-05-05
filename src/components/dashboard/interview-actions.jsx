import InterviewFormModal from "@/components/modals/interview-form-modal";
import InterviewResultModal from "@/components/modals/interview-result-modal";
import { useApplications } from "@/context/applications-context";
import useInterviews from "@/hooks/use-interviews";
import useUpcomingFollowups from "@/hooks/use-upcoming-follow-up";
import { updateApplicationStatus } from "@/lib/applications";
import { ChevronDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const isCompletedResult = (interview) =>
  interview?.status === "COMPLETED" &&
  ["PASSED", "FAILED"].includes(interview?.result);

export default function InterviewActions({
  application,
  onChanged,
}) {
  const status = String(application?.currentStatus || application?.status || "").toUpperCase();
  const isInterviewing = status === "INTERVIEWING";
  const { refetchApplications } = useApplications();
  const { refetchFollowups } = useUpcomingFollowups();
  const {
    interviews,
    nextRound,
    refetchInterviews,
  } = useInterviews(application?.id, isInterviewing);
  const [formState, setFormState] = useState({ open: false, round: 1 });
  const [resultTarget, setResultTarget] = useState(null);
  const [proceedOpen, setProceedOpen] = useState(false);
  const latestInterview = useMemo(
    () => interviews[interviews.length - 1] || null,
    [interviews],
  );

  const refreshAll = async (statusChange) => {
    await Promise.all([
      refetchInterviews(),
      refetchApplications(),
      refetchFollowups(),
      onChanged?.(statusChange),
    ]);
  };

  if (!isInterviewing) return null;

  const openCreate = (round = nextRound) => {
    setFormState({ open: true, round });
  };

  const showCreate = interviews.length === 0;
  const showResult =
    latestInterview &&
    latestInterview.status !== "CANCELLED" &&
    !isCompletedResult(latestInterview);
  const showProceed =
    latestInterview?.status === "COMPLETED" &&
    latestInterview?.result === "PASSED";
  const showPendingBadge = latestInterview?.result === "PENDING";

  const moveApplication = async (newStatus) => {
    try {
      await updateApplicationStatus(application.id, newStatus);
      setProceedOpen(false);
      await refreshAll({ previousStatus: "INTERVIEWING", newStatus });
      toast.success(`Moved to ${newStatus}`);
    } catch (error) {
      toast.error(error?.message || "Failed to update status");
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      {showCreate && (
        <button
          onClick={() => openCreate(nextRound)}
          className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 ring-1 ring-indigo-100 hover:bg-indigo-100"
        >
          <Plus className="h-3 w-3" />
          Add next round
        </button>
      )}

      {showResult && (
        <button
          onClick={() => setResultTarget(latestInterview)}
          className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
        >
          Update result
        </button>
      )}

      {showPendingBadge && (
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600 ring-1 ring-amber-100">
          Pending
        </span>
      )}

      {showProceed && (
        <span className="relative inline-flex">
          <button
            onClick={() => setProceedOpen((current) => !current)}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-100 hover:bg-emerald-100"
          >
            Proceed further
            <ChevronDown className="h-3 w-3" />
          </button>
          {proceedOpen && (
            <div className="absolute right-0 top-7 z-[80] min-w-36 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 text-left shadow-xl shadow-slate-200/80">
              <button
                onClick={() => {
                  setProceedOpen(false);
                  openCreate(nextRound);
                }}
                className="block w-full px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Add next round
              </button>
              <button
                onClick={() => moveApplication("OFFERED")}
                className="block w-full px-3 py-2 text-left text-xs font-medium text-emerald-600 hover:bg-emerald-50"
              >
                Offered
              </button>
              <button
                onClick={() => moveApplication("REJECTED")}
                className="block w-full px-3 py-2 text-left text-xs font-medium text-rose-500 hover:bg-rose-50"
              >
                Rejected
              </button>
            </div>
          )}
        </span>
      )}

      <InterviewFormModal
        isOpen={formState.open}
        applicationId={application?.id}
        defaultRound={formState.round}
        onClose={() => setFormState({ open: false, round: nextRound })}
        onSaved={refreshAll}
      />

      <InterviewResultModal
        isOpen={Boolean(resultTarget)}
        interview={resultTarget}
        onClose={() => setResultTarget(null)}
        onSaved={async (result) => {
          await refreshAll(result === "FAILED" ? { newStatus: "REJECTED" } : undefined);
        }}
      />
    </span>
  );
}
