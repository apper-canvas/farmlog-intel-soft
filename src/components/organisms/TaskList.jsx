import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import StatusBadge from "@/components/molecules/StatusBadge";
import PriorityBadge from "@/components/molecules/PriorityBadge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import TaskModal from "@/components/organisms/TaskModal";
import { formatRelativeDate, isOverdue, isDueSoon } from "@/utils/dateHelpers";
import taskService from "@/services/api/taskService";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    farm: "",
    status: "",
    priority: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tasksData, farmsData, cropsData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ]);

      setTasks(tasksData);
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError("Failed to load tasks");
      console.error("Task loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (filters.farm) {
filtered = filtered.filter(task => 
        task.farm_id_c?.Id === parseInt(filters.farm) || task.farm_id_c === parseInt(filters.farm)
      );
    }

if (filters.status) {
      if (filters.status === "Open") {
        filtered = filtered.filter(task => task.status_c === "Open");
      } else if (filters.status === "InProgress") {
        filtered = filtered.filter(task => task.status_c === "InProgress");
      } else if (filters.status === "Completed") {
        filtered = filtered.filter(task => task.status_c === "Completed");
      } else if (filters.status === "Blocked") {
        filtered = filtered.filter(task => task.status_c === "Blocked");
      } else if (filters.status === "overdue") {
        filtered = filtered.filter(task => task.status_c !== "Completed" && isOverdue(task.due_date_c));
      } else if (filters.status === "due-soon") {
        filtered = filtered.filter(task => !task.completed_c && isDueSoon(task.due_date_c));
      }
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Sort by due date (overdue first, then upcoming)
filtered.sort((a, b) => {
      if (a.completed_c && !b.completed_c) return 1;
      if (!a.completed_c && b.completed_c) return -1;
      if (isOverdue(a.due_date_c) && !isOverdue(b.due_date_c)) return -1;
      if (!isOverdue(a.due_date_c) && isOverdue(b.due_date_c)) return 1;
      return new Date(a.due_date_c) - new Date(b.due_date_c);
    });

    setFilteredTasks(filtered);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    try {
      await taskService.delete(taskId);
      await loadData();
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
      console.error("Delete task error:", error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.complete(taskId);
      await loadData();
      toast.success("Task completed!");
    } catch (error) {
      toast.error("Failed to complete task");
      console.error("Complete task error:", error);
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await taskService.update(editingTask.Id, taskData);
        toast.success("Task updated successfully");
      } else {
        await taskService.create(taskData);
        toast.success("Task created successfully");
      }
      await loadData();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save task");
      console.error("Save task error:", error);
    }
  };

const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.Name : "Unknown Farm";
  };

  const getCropName = (cropId) => {
if (!cropId) return null;
    const crop = crops.find(c => c.Id === cropId);
    return crop ? crop.variety_c : "Unknown Crop";
  };

const getTaskStatus = (task) => {
    // Use the actual status_c field from database
    if (task.status_c) {
      return task.status_c.toLowerCase();
    }
    // Fallback logic for backward compatibility
    if (task.completed_c) return "completed";
    if (isOverdue(task.due_date_c)) return "overdue";
    if (isDueSoon(task.due_date_c)) return "due-soon";
    return "open";
  };

  if (loading) return <Loading text="Loading tasks..." />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Task Management</h2>
          <p className="text-gray-600">Schedule and track farming activities</p>
        </div>
        <Button onClick={handleCreateTask} className="flex items-center gap-2">
          <ApperIcon name="Plus" className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Filter by Farm"
            value={filters.farm}
            onChange={(e) => setFilters(prev => ({ ...prev, farm: e.target.value }))}
          >
            <option value="">All Farms</option>
            {farms.map((farm) => (
<option key={farm.Id} value={farm.Id}>
                {farm.Name}
              </option>
            ))}
          </Select>

<Select
            label="Filter by Status"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Blocked">Blocked</option>
            <option value="overdue">Overdue</option>
            <option value="due-soon">Due Soon</option>
          </Select>

          <Select
            label="Filter by Priority"
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFilters({ farm: "", status: "", priority: "" })}
              className="w-full"
            >
              <ApperIcon name="X" className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Empty
          icon="CheckSquare"
          title="No tasks found"
          message={filters.farm || filters.status || filters.priority
            ? "No tasks match your current filters. Try adjusting your search criteria."
            : "Start by adding your first task to begin organizing your farm activities."
          }
          actionLabel="Add Task"
          onAction={handleCreateTask}
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
key={task.Id}
              className={`card border border-gray-200 ${
                task.completed_c ? "bg-gray-50" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => !task.completed_c && handleCompleteTask(task.Id)}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    task.completed_c
                      ? "bg-success border-success text-white"
                      : "border-gray-300 hover:border-primary hover:bg-primary/5"
                  }`}
                  disabled={task.completed_c}
                >
                  {task.completed_c && <ApperIcon name="Check" className="w-4 h-4" />}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className={`text-lg font-display font-semibold mb-1 ${
                        task.completed_c ? "text-gray-500 line-through" : "text-gray-900"
                      }`}>
                        {task.title_c}
                      </h3>
                      {task.description_c && (
                        <p className={`text-sm mb-2 ${
                          task.completed_c ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {task.description_c}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <StatusBadge status={getTaskStatus(task)} type="task" />
                      <PriorityBadge priority={task.priority_c} />
                    </div>
                  </div>

{/* Task Name */}
                  {task.Name && (
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Name:</span> {task.Name}
                    </div>
                  )}

                  {/* Task Details */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ApperIcon name="Calendar" className="w-4 h-4" />
                      {formatRelativeDate(task.due_date_c)}
                    </div>
                    <div className="flex items-center gap-1">
                      <ApperIcon name="MapPin" className="w-4 h-4" />
                      {getFarmName(task.farm_id_c?.Id || task.farm_id_c)}
                    </div>
                    {task.crop_id_c && (
                      <div className="flex items-center gap-1">
                        <ApperIcon name="Sprout" className="w-4 h-4" />
                        {getCropName(task.crop_id_c?.Id || task.crop_id_c)}
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
                      {task.CreatedOn && (
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Plus" className="w-3 h-3" />
                          <span>Created: {formatRelativeDate(task.CreatedOn)}</span>
                          {task.CreatedBy?.Name && (
                            <span className="text-gray-400">by {task.CreatedBy.Name}</span>
                          )}
                        </div>
                      )}
                      {task.ModifiedOn && (
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Edit2" className="w-3 h-3" />
                          <span>Updated: {formatRelativeDate(task.ModifiedOn)}</span>
                          {task.ModifiedBy?.Name && (
                            <span className="text-gray-400">by {task.ModifiedBy.Name}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTask(task)}
                    className="px-3"
                  >
                    <ApperIcon name="Edit2" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.Id)}
                    className="px-3 text-error hover:text-error hover:bg-error/5"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        farms={farms}
        crops={crops}
      />
    </div>
  );
};

export default TaskList;