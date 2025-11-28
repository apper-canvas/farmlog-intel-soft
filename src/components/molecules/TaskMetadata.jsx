import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import { formatRelativeDate } from '@/utils/dateHelpers';

function TaskMetadata({ task }) {
  if (!task) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <ApperIcon name="Info" className="w-4 h-4" />
        Task Information
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {task.CreatedOn && (
          <div className="space-y-1">
            <div className="text-gray-600">Created</div>
            <div className="font-medium text-gray-900">
              {formatRelativeDate(task.CreatedOn)}
            </div>
            {task.CreatedBy?.Name && (
              <div className="text-xs text-gray-500">by {task.CreatedBy.Name}</div>
            )}
          </div>
        )}
        
        {task.ModifiedOn && (
          <div className="space-y-1">
            <div className="text-gray-600">Last Modified</div>
            <div className="font-medium text-gray-900">
              {formatRelativeDate(task.ModifiedOn)}
            </div>
            {task.ModifiedBy?.Name && (
              <div className="text-xs text-gray-500">by {task.ModifiedBy.Name}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskMetadata;