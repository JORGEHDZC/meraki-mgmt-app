// src/components/ui/Alert.jsx
export function Alert({ type = 'info', className = '', children, ...props }) {
    const baseStyles = 'px-4 py-3 rounded-md flex items-start';
  
    let typeStyles = '';
    let iconStyles = '';
    let Icon = InformationCircleIcon;
  
    switch (type) {
      case 'success':
        typeStyles = 'bg-green-100 text-green-800';
        Icon = CheckCircleIcon;
        break;
      case 'error':
        typeStyles = 'bg-red-100 text-red-800';
        Icon = XCircleIcon;
        break;
      case 'warning':
        typeStyles = 'bg-yellow-100 text-yellow-800';
        Icon = ExclamationCircleIcon;
        break;
      case 'info':
      default:
        typeStyles = 'bg-blue-100 text-blue-800';
        Icon = InformationCircleIcon;
    }
  
    return (
      <div className={`${baseStyles} ${typeStyles} ${className}`} {...props}>
        <Icon className="w-6 h-6 mr-3 mt-1" />
        <div>{children}</div>
      </div>
    );
  }
  
  export function AlertTitle({ className = '', children, ...props }) {
    return (
      <h3 className={`text-lg font-semibold ${className}`} {...props}>
        {children}
      </h3>
    );
  }
  
  export function AlertDescription({ className = '', children, ...props }) {
    return (
      <p className={`text-sm ${className}`} {...props}>
        {children}
      </p>
    );
  }
  