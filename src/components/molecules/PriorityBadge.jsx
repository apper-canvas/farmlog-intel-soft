import React from "react";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const PriorityBadge = ({ priority }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case "high":
        return { variant: "error", icon: "AlertTriangle", text: "High" };
      case "medium":
        return { variant: "warning", icon: "Minus", text: "Medium" };
      case "low":
        return { variant: "info", icon: "ArrowDown", text: "Low" };
      default:
        return { variant: "default", icon: "HelpCircle", text: priority };
    }
  };

  const { variant, icon, text } = getPriorityConfig();

  return (
    <Badge variant={variant}>
      <ApperIcon name={icon} className="w-3.5 h-3.5" />
      {text}
    </Badge>
  );
};

export default PriorityBadge;