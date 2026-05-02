import {
  CalendarClock,
  X,
  Building2,
  Briefcase,
  Calendar,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";

const STATUS_STYLES = {
  applied: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    ring: "ring-blue-100",
    dot: "bg-blue-400",
    label: "Applied",
  },
  shortlisted: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    ring: "ring-emerald-100",
    dot: "bg-emerald-400",
    label: "Shortlisted",
  },
  interviewing: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    ring: "ring-violet-100",
    dot: "bg-violet-400",
    label: "Interview Feedback",
  },
  offered: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    ring: "ring-amber-100",
    dot: "bg-amber-400",
    label: "Offer Follow-up",
  },
};

export default function FollowUpModal({ app, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  const detail = app;
  const status = STATUS_STYLES[detail?.status?.toLowerCase()];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ transition: "opacity 220ms ease" }}
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          style={{
            transition:
              "opacity 220ms ease, transform 240ms cubic-bezier(0.34, 1.45, 0.64, 1)",
          }}
          className={`
            pointer-events-auto
            w-full max-w-sm
            bg-white rounded-2xl
            border border-slate-100
            shadow-xl shadow-slate-200/60
            ${
              visible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-3 scale-95"
            }
          `}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 flex items-start justify-between border-b border-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-50">
                <CalendarClock className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 leading-tight">
                  Follow-up details
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Scheduled reminder
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            {/* Company + Role */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {detail.company}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{detail.role}</p>
                <p className="text-xs text-slate-500 mt-0.5">{detail?.location}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Status</span>
              </div>
              <span
                className={`
                  flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
                  ring-1 ${status.bg} ${status.text} ${status.ring}
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>

            {/* Applied Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Applied on</span>
              </div>
              <span className="text-xs font-medium text-slate-700">
                {" "}
                {new Date(detail.appliedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Scheduled Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Follow-up on</span>
              </div>
              <span className="text-xs font-medium text-slate-700">
                {new Date(detail.scheduledAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-50" />

            {/* Message */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Follow-up message</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                {detail.message}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5">
            <button
              onClick={handleClose}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}