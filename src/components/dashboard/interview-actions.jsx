import InterviewFormModal from "@/components/modals/interview-form-modal";
import InterviewResultModal from "@/components/modals/interview-result-modal";
import { useApplications } from "@/context/applications-context";
import useInterviews from "@/hooks/use-interviews";
import { updateApplicationStatus } from "@/lib/applications";
import { getAddRoundLabel, getLatestInterview } from "@/lib/interview-rounds";
import { cancelInterview } from "@/lib/interviews";
import { requestNotificationsRefresh } from "@/lib/notifications";
import { ChevronDown, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

const PROCEED_MENU_WIDTH = 152;
const PROCEED_MENU_HEIGHT = 124;

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
  const {
    interviews,
    nextRound,
    refetchInterviews,
  } = useInterviews(application?.id, isInterviewing);
  const [formState, setFormState] = useState({ open: false, round: 1 });
  const [resultTarget, setResultTarget] = useState(null);
  const [proceedOpen, setProceedOpen] = useState(false);
  const [proceedMenuPosition, setProceedMenuPosition] = useState(null);
  const [mounted, setMounted] = useState(false);
  const proceedButtonRef = useRef(null);
  const proceedMenuRef = useRef(null);
  const latestInterview = useMemo(
    () => getLatestInterview(interviews),
    [interviews],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateProceedMenuPosition = useCallback(() => {
    const rect = proceedButtonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const belowTop = rect.bottom + 6;
    const hasRoomBelow =
      window.innerHeight - belowTop >= PROCEED_MENU_HEIGHT;
    const top = hasRoomBelow
      ? belowTop
      : Math.max(8, rect.top - PROCEED_MENU_HEIGHT - 6);
    const left = Math.max(
      8,
      Math.min(
        rect.right - PROCEED_MENU_WIDTH,
        window.innerWidth - PROCEED_MENU_WIDTH - 8,
      ),
    );

    setProceedMenuPosition({
      top,
      left,
      width: PROCEED_MENU_WIDTH,
    });
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedButton = proceedButtonRef.current?.contains(event.target);
      const clickedMenu = proceedMenuRef.current?.contains(event.target);

      if (!clickedButton && !clickedMenu) {
        setProceedOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!proceedOpen) return;

    updateProceedMenuPosition();
    window.addEventListener("scroll", updateProceedMenuPosition, true);
    window.addEventListener("resize", updateProceedMenuPosition);

    return () => {
      window.removeEventListener("scroll", updateProceedMenuPosition, true);
      window.removeEventListener("resize", updateProceedMenuPosition);
    };
  }, [proceedOpen, updateProceedMenuPosition]);

  const refreshAll = async (statusChange, { refreshNotifications = false } = {}) => {
    await Promise.all([
      refetchInterviews(),
      refetchApplications(),
      onChanged?.(statusChange),
    ]);

    if (refreshNotifications) {
      requestNotificationsRefresh();
    }
  };

  if (!isInterviewing) return null;

  const openCreate = (round = nextRound) => {
    setFormState({ open: true, round });
  };

  const showCreate = interviews.length === 0;
  const showCancelledRetry = latestInterview?.status === "CANCELLED";
  const showResult =
    latestInterview &&
    latestInterview.status !== "CANCELLED" &&
    !isCompletedResult(latestInterview);
  const showProceed =
    latestInterview?.status === "COMPLETED" &&
    latestInterview?.result === "PASSED";
  const showPendingBadge = latestInterview?.result === "PENDING";
  const addRoundLabel = getAddRoundLabel(interviews);

  const moveApplication = async (newStatus) => {
    try {
      await updateApplicationStatus(application.id, newStatus);
      setProceedOpen(false);
      await refreshAll(
        { previousStatus: "INTERVIEWING", newStatus },
        { refreshNotifications: true },
      );
      toast.success(`Moved to ${newStatus}`);
    } catch (error) {
      toast.error(error?.message || "Failed to update status");
    }
  };

  const handleCancelInterview = async () => {
    try {
      await cancelInterview(latestInterview?.id || latestInterview?.interviewId);
      await refreshAll(undefined, { refreshNotifications: true });
      toast.success("Interview cancelled");
    } catch (error) {
      toast.error(error?.message || "Failed to cancel interview");
    }
  };

  return (
    <span className="inline-flex flex-nowrap items-center gap-1.5">
      {(showCreate || showCancelledRetry) && (
        <button
          onClick={() => openCreate(nextRound)}
          className="inline-flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-indigo-50 px-3 text-[11px] font-semibold leading-none text-indigo-600 ring-1 ring-indigo-100 transition-colors hover:bg-indigo-100"
        >
          <Plus className="h-3 w-3 shrink-0" />
          {addRoundLabel}
        </button>
      )}

      {latestInterview?.status === "SCHEDULED" && (
        <button
          onClick={handleCancelInterview}
          className="inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-full bg-rose-50 px-3 text-[11px] font-semibold leading-none text-rose-500 ring-1 ring-rose-100 transition-colors hover:bg-rose-100"
        >
          Cancel
        </button>
      )}

      {showResult && (
        <button
          onClick={() => setResultTarget(latestInterview)}
          className="inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-full bg-slate-100 px-3 text-[11px] font-semibold leading-none text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-200"
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
        <span className="inline-flex">
          <button
            ref={proceedButtonRef}
            onClick={() => {
              updateProceedMenuPosition();
              setProceedOpen((current) => !current);
            }}
            className="inline-flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-emerald-50 px-3 text-[11px] font-semibold leading-none text-emerald-600 ring-1 ring-emerald-100 transition-colors hover:bg-emerald-100"
          >
            Proceed further
            <ChevronDown className="h-3 w-3 shrink-0" />
          </button>
          {mounted && proceedOpen && proceedMenuPosition && createPortal(
            <div
              ref={proceedMenuRef}
              style={{
                position: "fixed",
                top: proceedMenuPosition.top,
                left: proceedMenuPosition.left,
                width: proceedMenuPosition.width,
              }}
              className="z-[11000] overflow-hidden rounded-xl border border-slate-100 bg-white py-1 text-left shadow-xl shadow-slate-200/80"
            >
              <button
                onClick={() => {
                  setProceedOpen(false);
                  openCreate(nextRound);
                }}
                className="block w-full px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                {addRoundLabel}
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
            </div>,
            document.body,
          )}
        </span>
      )}

      <InterviewFormModal
        isOpen={formState.open}
        applicationId={application?.id}
        defaultRound={formState.round}
        roundLabel={addRoundLabel}
        onClose={() => setFormState({ open: false, round: nextRound })}
        onSaved={() => refreshAll(undefined, { refreshNotifications: true })}
      />

      <InterviewResultModal
        isOpen={Boolean(resultTarget)}
        interview={resultTarget}
        onClose={() => setResultTarget(null)}
        onSaved={async (result) => {
          await refreshAll(
            result === "FAILED" ? { newStatus: "REJECTED" } : undefined,
            { refreshNotifications: true },
          );
        }}
      />
    </span>
  );
}
