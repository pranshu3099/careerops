'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateApplicationStatus } from '@/lib/applications';
import { useApplications } from '@/context/applications-context';

// ── Transition map ──────────────────────────────────────────────────────────
const TRANSITIONS = {
  APPLIED:      ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED:  ['INTERVIEWING'],
  INTERVIEWING: ['OFFERED', 'REJECTED'],
  OFFERED:      ['ACCEPTED', 'OFFER_DECLINED'],
};

export function getNextStatuses(currentStatus) {
  return TRANSITIONS[currentStatus] ?? [];
}

export function isValidTransition(oldStatus, newStatus) {
  return TRANSITIONS[oldStatus]?.includes(newStatus) ?? false;
}

// ── Per-status style config ─────────────────────────────────────────────────
const STATUS_STYLES = {
  SHORTLISTED: {
    btn: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 ring-1 ring-indigo-100',
    dot: 'bg-indigo-400',
    label: 'Shortlist',
  },
  INTERVIEWING: {
    btn: 'bg-amber-50 text-amber-600 hover:bg-amber-100 ring-1 ring-amber-100',
    dot: 'bg-amber-400',
    label: 'Interview',
  },
  OFFERED: {
    btn: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 ring-1 ring-emerald-100',
    dot: 'bg-emerald-400',
    label: 'Offer',
  },
  ACCEPTED: {
    btn: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-100',
    dot: 'bg-emerald-500',
    label: 'Accepted',
  },
  OFFER_DECLINED: {
    btn: 'bg-orange-50 text-orange-600 hover:bg-orange-100 ring-1 ring-orange-100',
    dot: 'bg-orange-400',
    label: 'Offer Declined',
  },
  REJECTED: {
    btn: 'bg-rose-50 text-rose-500 hover:bg-rose-100 ring-1 ring-rose-100',
    dot: 'bg-rose-400',
    label: 'Reject',
  },
};

const SUCCESS_MESSAGES = {
  ACCEPTED: 'Application marked as accepted',
  OFFER_DECLINED: 'Offer marked as declined',
};

// ── Single action button (one next status) ──────────────────────────────────
function SingleAction({ next, onSelect, loading }) {
  const style = STATUS_STYLES[next];
  return (
    <button
      disabled={loading}
      onClick={() => onSelect(next)}
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium
        transition-all disabled:opacity-40 disabled:cursor-not-allowed
        ${style.btn}
      `}
    >
      {loading ? (
        <Loader2 className="w-2.5 h-2.5 animate-spin" />
      ) : (
        <ArrowRight className="w-2.5 h-2.5" />
      )}
      {style.label}
    </button>
  );
}

// ── Dropdown (two next statuses) ────────────────────────────────────────────
function DropdownMenu({ nexts, onSelect, loading }) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMenuPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    setMenuPosition({
      top: rect.bottom + 6,
      left: rect.left,
      minWidth: Math.max(rect.width, 120),
    });
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      const clickedButton = buttonRef.current?.contains(e.target);
      const clickedMenu = menuRef.current?.contains(e.target);
      if (!clickedButton && !clickedMenu) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);

    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [open]);

  return (
    <div className="inline-flex">
      <button
        ref={buttonRef}
        disabled={loading}
        onClick={() => {
          updateMenuPosition();
          setOpen((v) => !v);
        }}
        className={`
          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium
          bg-slate-100 text-slate-600 hover:bg-slate-200 ring-1 ring-slate-200
          transition-all disabled:opacity-40 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
        ) : (
          <>
            Move to
            <ChevronDown
              className={`w-2.5 h-2.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>

      {mounted && open && menuPosition && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: menuPosition.top,
            left: menuPosition.left,
            minWidth: menuPosition.minWidth,
          }}
          className="
            z-[11000]
            bg-white border border-slate-100 rounded-xl
            shadow-xl shadow-slate-200/80
            py-1
            animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150
          "
        >
          {nexts.map((next) => {
            const style = STATUS_STYLES[next];
            return (
              <button
                key={next}
                onClick={() => { setOpen(false); onSelect(next); }}
                className="
                  w-full flex items-center gap-2 px-3 py-1.5
                  text-[11px] font-medium text-left
                  hover:bg-slate-50 transition-colors
                "
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                <span className={next === 'REJECTED' ? 'text-rose-500' : 'text-slate-700'}>
                  {style.label}
                </span>
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────
export default function StatusTransitionMenu({ application, onStatusUpdated }) {
  const { refetchApplications } = useApplications();
  const [loading, setLoading] = useState(false);
  const nexts = getNextStatuses(application.currentStatus);
  if (nexts.length === 0) return null; // terminal status — render nothing

  const handleSelect = async (newStatus) => {
    if (!isValidTransition(application.currentStatus, newStatus)) return;

    try {
      setLoading(true);
      const result = await updateApplicationStatus(application.id, newStatus);
      await Promise.all([
        refetchApplications(),
      ]);
      await onStatusUpdated?.({
        previousStatus: application.currentStatus,
        newStatus,
        result,
      });
      toast.success(
        SUCCESS_MESSAGES[newStatus] ||
          `Moved to ${STATUS_STYLES[newStatus]?.label ?? newStatus}`,
      );
    } catch (err) {
      toast.error(err?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (nexts.length === 1) {
    return <SingleAction next={nexts[0]} onSelect={handleSelect} loading={loading} />;
  }

  return <DropdownMenu nexts={nexts} onSelect={handleSelect} loading={loading} />;
}
