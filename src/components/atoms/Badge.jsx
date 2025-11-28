import React from "react";
import { cn } from "@/utils/cn";

const Badge = ({ 
  children, 
  variant = "default", 
  className,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium";
  
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    info: "bg-info/10 text-info",
    primary: "bg-primary/10 text-primary"
  };

  return (
    <span 
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;