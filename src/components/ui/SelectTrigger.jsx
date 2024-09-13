// src/components/ui/SelectTrigger.jsx
import { ChevronDownIcon } from "@heroicons/react/solid";

export function SelectTrigger({ value, onClick, className = '', children, ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      {...props}
    >
      <span>{value || children}</span>
      <ChevronDownIcon className="w-5 h-5 absolute right-3 top-3 text-gray-400" />
    </button>
  );
}
