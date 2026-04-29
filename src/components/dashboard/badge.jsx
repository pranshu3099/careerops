// badge.jsx — extended to cover all statuses used in transitions
export default function Badge({ children, variant }) {
  const baseClasses =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide';

  const variantClasses = {
    APPLIED:      'bg-blue-50 text-blue-600 ring-1 ring-blue-100',
    SHORTLISTED:  'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100',
    INTERVIEWING: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
    OFFERED:      'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
    REJECTED:     'bg-rose-50 text-rose-500 ring-1 ring-rose-100',
    // legacy keys kept for backward compat
    INTERVIEW:    'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
    OFFER:        'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
  }[variant] ?? 'bg-slate-100 text-slate-500 ring-1 ring-slate-200';

  const LABELS = {
    APPLIED:      'Applied',
    SHORTLISTED:  'Shortlisted',
    INTERVIEWING: 'Interviewing',
    OFFERED:      'Offered',
    REJECTED:     'Rejected',
  };

  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {LABELS[variant] ?? children}
    </span>
  );
}