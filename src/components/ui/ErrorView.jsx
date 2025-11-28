import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const ErrorView = ({ 
  className, 
  title = "Something went wrong", 
  message = "We encountered an error while loading your data. Please try again.",
  onRetry 
}) => {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-red-50", className)}>
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto">
          <ApperIcon name="AlertTriangle" className="w-10 h-10 text-error" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-semibold text-gray-900">{title}</h2>
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ApperIcon name="RefreshCw" className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorView;