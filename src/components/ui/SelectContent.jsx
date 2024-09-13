// src/components/ui/SelectContent.jsx
export function SelectContent({ isOpen, children, className = '', ...props }) {
    return (
      isOpen && (
        <div
          className={`absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg ${className}`}
          {...props}
        >
          <ul>{children}</ul>
        </div>
      )
    );
  }
  