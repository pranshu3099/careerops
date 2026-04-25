export default function Badge({ children, variant }) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide';
 
  const variantClasses = {
    APPLIED: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100',
    INTERVIEW: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
    OFFER: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
    REJECTED: 'bg-rose-50 text-rose-500 ring-1 ring-rose-100',
  }[variant];
 
  return <span className={`${baseClasses} ${variantClasses}`}>{children}</span>;
}