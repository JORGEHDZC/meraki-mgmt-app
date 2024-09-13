// src/components/ui/Label.jsx
export function Label({ htmlFor, children, className = '', ...props }) {
    return (
      <label
        htmlFor={htmlFor}
        className={`block text-gray-700 font-medium mb-2 ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
  