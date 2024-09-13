// src/components/ui/SelectItem.jsx
export function SelectItem({ value, onClick, children, className = '', ...props }) {
    return (
      <li
        className={`cursor-pointer px-4 py-2 hover:bg-blue-100 ${className}`}
        onClick={() => onClick(value)}
        {...props}
      >
        {children}
      </li>
    );
  }
  