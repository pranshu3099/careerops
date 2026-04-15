// components/ui/badge.js
export default function Badge({ children, variant }) {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-2xl text-xs font-semibold transition-colors';

  const variantClasses = {
    Applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    Interview: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    Offer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  }[variant];

  return <span className={`${baseClasses} ${variantClasses}`}>{children}</span>;
}