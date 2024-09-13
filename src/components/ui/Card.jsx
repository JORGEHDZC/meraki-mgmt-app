// src/components/ui/Card.jsx
export function Card({ children, className = '' }) {
    return (
      <div className={`bg-white shadow-lg rounded-lg p-6 ${className}`}>
        {children}
      </div>
    );
  }
  
  export function CardHeader({ children, className = '' }) {
    return <div className={`border-b pb-2 mb-4 ${className}`}>{children}</div>;
  }
  
  export function CardTitle({ children, className = '' }) {
    return <h2 className={`text-2xl font-bold ${className}`}>{children}</h2>;
  }
  
  export function CardContent({ children, className = '' }) {
    return <div className={className}>{children}</div>;
  }
  
  export function CardFooter({ children, className = '' }) {
    return <div className={`border-t pt-2 mt-4 ${className}`}>{children}</div>;
  }
  
  export function CardDescription({ children, className = '' }) {
    return <p className={`text-gray-500 ${className}`}>{children}</p>;
  }
  