import React from "react";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const StatusBadge = ({ status, type = "crop" }) => {
  const getStatusConfig = () => {
    if (type === "crop") {
      switch (status) {
        case "planted":
          return { variant: "info", icon: "Seed", text: "Planted" };
        case "growing":
          return { variant: "primary", icon: "Sprout", text: "Growing" };
        case "harvested":
          return { variant: "success", icon: "ShoppingBasket", text: "Harvested" };
        default:
          return { variant: "default", icon: "HelpCircle", text: status };
      }
    }
    
    if (type === "task") {
      switch (status) {
        case "completed":
          return { variant: "success", icon: "CheckCircle", text: "Completed" };
        case "overdue":
          return { variant: "error", icon: "AlertTriangle", text: "Overdue" };
        case "due-soon":
          return { variant: "warning", icon: "Clock", text: "Due Soon" };
        default:
          return { variant: "default", icon: "Circle", text: "Pending" };
      }
    }

    return { variant: "default", icon: "HelpCircle", text: status };
  };

  const { variant, icon, text } = getStatusConfig();

  return (
    <Badge variant={variant}>
      <ApperIcon name={icon} className="w-3.5 h-3.5" />
      {text}
    </Badge>
  );
};

export default StatusBadge;