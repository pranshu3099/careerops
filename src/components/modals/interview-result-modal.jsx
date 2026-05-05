"use client";

import { updateInterviewResult } from "@/lib/interviews";
import { CheckCircle2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

const RESULT_OPTIONS = ["PASSED", "FAILED", "PENDING"];

export default function InterviewResultModal({
  isOpen,
  interview,
  onClose,
  onSaved,
}) {
  const [result, setResult] = useState("PASSED");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setResult(interview?.result || "PASSED");
    setFeedback(interview?.feedback || "");
  }, [interview, isOpen]);

  useEffect(() => {
    if (isOpen && interview) {
      setShouldRender(true);
      setIsVisible(false);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });

      return () => cancelAnimationFrame(raf);
    }

    setIsVisible(false);
    const timeoutId = setTimeout(() => {
      setShouldRender(false);
    }, 260);

    return () => clearTimeout(timeoutId);
  }, [interview, isOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 260);
  }, [onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      await updateInterviewResult(interview?.id || interview?.interviewId, {
        result,
        feedback: feedback.trim() || undefined,
      });
      toast.success("Interview result updated");
      await onSaved?.(result);
      handleClose();
    } catch (error) {
      toast.error(error?.message || "Failed to update result");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted || !shouldRender || !interview) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[12000] flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm transition-opacity duration-250 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={handleClose}
    >
      <div
        className={`w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/20 transition-all duration-250 ease-out ${
          isVisible ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Update Result</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Round {interview.round} · {interview.type?.replaceAll("_", " ")}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Result
            </label>
            <div className="grid grid-cols-3 gap-2">
              {RESULT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setResult(option)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    result === option
                      ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              rows={4}
              className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-200 focus:ring-2 focus:ring-indigo-50"
              placeholder="Optional interview feedback"
            />
          </div>

          {result === "FAILED" && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-600">
              Failed result will move the application to rejected after backend processing.
            </div>
          )}

          <div className="flex gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isSubmitting ? "Saving..." : "Save Result"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
