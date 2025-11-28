import React from "react";
import { useOffline } from "@/hooks/useOffline";
import { formatDate } from "@/utils/dateHelpers";
import ApperIcon from "@/components/ApperIcon";
import { motion, AnimatePresence } from "framer-motion";

const OfflineIndicator = () => {
  const { isOffline, lastSync } = useOffline();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-warning text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <ApperIcon name="WifiOff" className="w-4 h-4" />
            <span className="text-sm font-medium">Working Offline</span>
          </div>
        </motion.div>
      )}
      
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className={`w-2 h-2 rounded-full ${isOffline ? "bg-warning" : "bg-success"}`}></div>
        <span>
          {isOffline ? "Offline" : "Online"} • Last sync: {formatDate(lastSync, "MMM dd, h:mm a")}
        </span>
      </div>
    </AnimatePresence>
  );
};

export default OfflineIndicator;