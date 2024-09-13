// src/components/ui/Button.jsx
export function Button({ children, className = '', ...props }) {
    return (
      <button
        className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 ease-in-out ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  