import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend,
  trendDirection,
  color = "primary",
  className,
  onClick
}) => {
  const colorClasses = {
    primary: "border-primary/20 bg-primary/5",
    success: "border-success/20 bg-success/5",
    warning: "border-warning/20 bg-warning/5",
    info: "border-info/20 bg-info/5",
  };

  const iconColorClasses = {
    primary: "text-primary",
    success: "text-success", 
    warning: "text-warning",
    info: "text-info",
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-xl p-6 border-l-4 shadow-sm hover:shadow-md transition-all duration-200",
        colorClasses[color],
        onClick && "cursor-pointer card-hover",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-display font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <ApperIcon 
                name={trendDirection === "up" ? "TrendingUp" : "TrendingDown"} 
                className={cn(
                  "w-4 h-4",
                  trendDirection === "up" ? "text-success" : "text-error"
                )} 
              />
              <span className={cn(
                "font-medium",
                trendDirection === "up" ? "text-success" : "text-error"
              )}>
                {trend}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("p-3 rounded-xl bg-white/80", iconColorClasses[color])}>
            <ApperIcon name={icon} className="w-8 h-8" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;