// components/ui/card.js
export default function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}