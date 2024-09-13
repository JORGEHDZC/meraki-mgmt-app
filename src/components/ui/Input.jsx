// src/components/ui/Input.jsx
export function Input({ type = "text", placeholder, className = '', ...props }) {
    return (
      <input
        type={type}
        placeholder={placeholder}
        className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        {...props}
      />
    );
  }
  