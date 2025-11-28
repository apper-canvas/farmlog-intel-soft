import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "default",
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary/20 shadow-sm hover:shadow-md",
    secondary: "bg-white text-primary border border-primary hover:bg-primary/5 focus:ring-primary/20",
    outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary/20",
    ghost: "text-gray-600 hover:text-primary hover:bg-primary/5 focus:ring-primary/20"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm rounded-lg",
    default: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-xl"
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;