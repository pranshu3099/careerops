'use client';

import { useCallback, useEffect, useState } from 'react';
import { X, CalendarClock, MoveRight } from 'lucide-react';

export default function RescheduleAlert({ isOpen, onClose, company, role, oldDate, newDate }) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 280);
  }, [onClose]);

  // Enter animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(false);
      // tiny delay so the enter transition actually plays
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen]);

  const fmt = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[60]
        flex items-center justify-center
        bg-slate-900/40 backdrop-blur-sm
        px-4 py-6
        transition-opacity duration-280 ease-out
        ${isVisible
          ? 'opacity-100'
          : 'opacity-0'
        }
      `}
    >
      <div
        className={`
          bg-white rounded-2xl border border-slate-100
          shadow-2xl shadow-slate-900/20 overflow-hidden
          w-full max-w-md
          transition-all duration-280 ease-out
          ${isVisible
            ? 'translate-y-0 scale-100'
            : 'translate-y-4 scale-95'
          }
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3.5 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                Follow-up Rescheduled
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Action required — please review</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0 mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">

          {/* Company + role pill */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
              {company?.[0] ?? '?'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{company}</p>
              <p className="text-xs text-slate-500 mt-0.5">{role}</p>
            </div>
          </div>

          {/* Message */}
          <p className="text-xs text-slate-600 leading-relaxed">
            Your follow-up for{' '}
            <span className="font-semibold text-slate-800">{company}</span> has been
            rescheduled. Please check the updated schedule and make sure you&apos;re prepared.
          </p>

          {/* Date change row */}
          {(oldDate || newDate) && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
              <div className="text-center">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Previous</p>
                <p className="text-xs font-medium text-slate-500 line-through">{fmt(oldDate)}</p>
              </div>
              <MoveRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mx-1" />
              <div className="text-center">
                <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wide mb-0.5">New Date</p>
                <p className="text-xs font-semibold text-slate-800">{fmt(newDate)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2.5">
          <button
            onClick={handleClose}
            className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm shadow-amber-100"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
}
