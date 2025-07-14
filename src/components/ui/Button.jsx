// src/components/ui/Button.jsx
export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-3 bg-[var(--primary)] hover:bg-[#f56c8c] text-white font-semibold rounded-2xl shadow-md transition-all duration-200 ease-in-out flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
