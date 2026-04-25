export default function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}