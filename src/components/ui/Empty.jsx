import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  className, 
  icon = "Seedling",
  title = "No data found", 
  message = "Get started by adding your first item.",
  actionLabel = "Add Item",
  onAction 
}) => {
  return (
    <div className={cn("flex items-center justify-center py-16 px-6", className)}>
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <ApperIcon name={icon} className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-display font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>
        {onAction && (
          <button
            onClick={onAction}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ApperIcon name="Plus" className="w-4 h-4" />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default Empty;