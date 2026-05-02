"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarX2, X } from "lucide-react";

export default function CancelledFollowupsModal({
  isOpen,
  onClose,
  company,
  role,
}) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 280);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    setIsVisible(false);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });

    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-6 transition-opacity duration-280 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/20 transition-all duration-280 ease-out ${
          isVisible ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
      >
        <div className="flex items-start justify-between border-b border-slate-50 px-5 pb-3.5 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50">
              <CalendarX2 className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-slate-800">
                Follow-ups Cancelled
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Application removed
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="mt-0.5 flex-shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-sm font-bold text-indigo-600">
              {company?.[0] ?? "?"}
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-slate-800">
                {company}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{role}</p>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-600">
            All followups for the application{" "}
            <span className="font-semibold text-slate-800">{company}</span>,{" "}
            <span className="font-semibold text-slate-800">{role}</span> has
            been cancelled.
          </p>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={handleClose}
            className="w-full rounded-xl bg-rose-500 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-100 transition-colors hover:bg-rose-600"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
