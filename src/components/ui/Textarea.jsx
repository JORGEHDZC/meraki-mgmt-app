// src/components/ui/Textarea.jsx
export function Textarea({ placeholder, className = '', ...props }) {
    return (
      <textarea
        placeholder={placeholder}
        className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        {...props}
      ></textarea>
    );
  }
  