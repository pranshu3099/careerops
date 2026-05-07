"use client";

import { createInterview, updateInterview } from "@/lib/interviews";
import { CalendarClock, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

const INTERVIEW_TYPES = [
  "DSA",
  "TECHNICAL",
  "SYSTEM_DESIGN",
  "HR",
  "MANAGERIAL",
  "BEHAVIORAL",
  "TAKE_HOME",
  "OTHER",
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-200 focus:ring-2 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50";

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
};

const toIsoString = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
};

export default function InterviewFormModal({
  isOpen,
  mode = "create",
  applicationId,
  defaultRound = 1,
  roundLabel,
  interview,
  onClose,
  onSaved,
}) {
  const isEditMode = mode === "edit";
  const [formData, setFormData] = useState({
    roundName: "",
    type: "TECHNICAL",
    interviewer: "",
    scheduledAt: "",
    feedback: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const title = useMemo(
    () => (isEditMode ? "Edit Interview" : "Schedule Interview"),
    [isEditMode],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setErrors({});
    setFormData({
      roundName: interview?.roundName || "",
      type: interview?.type || "TECHNICAL",
      interviewer: interview?.interviewer || "",
      scheduledAt: toDateTimeLocal(interview?.scheduledAt),
      feedback: interview?.feedback || "",
    });
  }, [interview, isOpen]);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 260);
  }, [onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!isEditMode && !applicationId) nextErrors.applicationId = "Required";
    if (!formData.type) nextErrors.type = "Required";
    if (!formData.scheduledAt) nextErrors.scheduledAt = "Required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        roundName: formData.roundName.trim() || undefined,
        type: formData.type,
        interviewer: formData.interviewer.trim() || undefined,
        scheduledAt: toIsoString(formData.scheduledAt),
      };

      if (isEditMode) {
        await updateInterview(interview?.id || interview?.interviewId, {
          ...payload,
          feedback: formData.feedback.trim() || undefined,
        });
        toast.success("Interview updated");
      } else {
        await createInterview({
          ...payload,
          applicationId,
        });
        toast.success("Interview scheduled");
      }

      await onSaved?.();
      handleClose();
    } catch (error) {
      toast.error(error?.message || "Failed to save interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted || !shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[12000] flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm transition-opacity duration-250 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={handleClose}
    >
      <div
        className={`w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/20 transition-all duration-250 ease-out ${
          isVisible ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {isEditMode
                  ? `Update ${interview?.round ? `Round ${interview.round}` : "round"} details`
                  : roundLabel || `Add Round ${defaultRound}`}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type <span className="text-rose-400">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={inputClass}
              >
                {INTERVIEW_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Round Name
              </label>
              <input
                name="roundName"
                value={formData.roundName}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Frontend deep dive"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Interviewer
              </label>
              <input
                name="interviewer"
                value={formData.interviewer}
                onChange={handleChange}
                className={inputClass}
                placeholder="Name"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Scheduled At <span className="text-rose-400">*</span>
              </label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleChange}
                className={inputClass}
              />
              {errors.scheduledAt && (
                <p className="mt-1 text-xs text-rose-500">{errors.scheduledAt}</p>
              )}
            </div>
            {isEditMode && (
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Feedback
                </label>
                <textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputClass} resize-y`}
                  placeholder="Notes or feedback"
                />
              </div>
            )}
          </div>

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
              {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Schedule Interview"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
