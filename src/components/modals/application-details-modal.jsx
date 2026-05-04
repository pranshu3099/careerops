"use client";

import Badge from "@/components/dashboard/badge";
import StatusTransitionMenu, { getNextStatuses } from "@/components/dashboard/statustransition";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const formatDateTime = (value, fallback = "Not added") => {
  if (!value) return fallback;

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function ApplicationDetailsModal({
  isOpen,
  application,
  mode = "view",
  onClose,
  onStatusUpdated,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 280);
  }, [onClose]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setIsVisible(false);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });

    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  if (!isMounted || !isOpen || !application) return null;

  const normalizedApplication = {
    id: application.id,
    company: application.company || "Unknown company",
    role: application.role || "Unknown role",
    location: application.location,
    currentStatus: application.status || application.currentStatus,
    appliedAt: application.appliedAt,
  };
  const isUpdateMode = mode === "update";
  const nextStatuses = getNextStatuses(normalizedApplication.currentStatus);
  const hasFollowupDetails = application.scheduledAt || application.followupMessage;

  return createPortal(
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm transition-opacity duration-280 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={handleClose}
    >
      <div
        className={`w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 transition-all duration-280 ease-out ${
          isVisible ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-500">
              {isUpdateMode ? "Update Status" : "Application Details"}
            </p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">
              {normalizedApplication.role} at {normalizedApplication.company}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Company
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {normalizedApplication.company}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Role
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {normalizedApplication.role}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Location
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {normalizedApplication.location || "Not added"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Current Status
              </p>
              <div className="mt-1">
                <Badge variant={normalizedApplication.currentStatus}>
                  {normalizedApplication.currentStatus || "Not added"}
                </Badge>
              </div>
            </div>
            {application.scheduledAt && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Scheduled
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatDateTime(application.scheduledAt, "Not scheduled")}
                </p>
              </div>
            )}
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Applied
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {formatDateTime(normalizedApplication.appliedAt)}
              </p>
            </div>
          </div>

          {hasFollowupDetails && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Follow-up Message
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {application.followupMessage || "No message available."}
              </p>
            </div>
          )}

          {isUpdateMode && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
              <p className="text-xs font-semibold text-slate-800">Next valid status</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {nextStatuses.length > 0 ? (
                  <StatusTransitionMenu
                    application={normalizedApplication}
                    onStatusUpdated={onStatusUpdated}
                  />
                ) : (
                  <p className="text-sm text-slate-500">
                    This application has no next status available.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          <button
            onClick={handleClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
