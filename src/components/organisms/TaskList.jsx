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
      filtered = filtered.filter(task => task.farmId === parseInt(filters.farm));
    }

    if (filters.status) {
      if (filters.status === "completed") {
        filtered = filtered.filter(task => task.completed);
      } else if (filters.status === "pending") {
        filtered = filtered.filter(task => !task.completed);
      } else if (filters.status === "overdue") {
        filtered = filtered.filter(task => !task.completed && isOverdue(task.dueDate));
      } else if (filters.status === "due-soon") {
        filtered = filtered.filter(task => !task.completed && isDueSoon(task.dueDate));
      }
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Sort by due date (overdue first, then upcoming)
    filtered.sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      if (isOverdue(a.dueDate) && !isOverdue(b.dueDate)) return -1;
      if (!isOverdue(a.dueDate) && isOverdue(b.dueDate)) return 1;
      return new Date(a.dueDate) - new Date(b.dueDate);
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
    return farm ? farm.name : "Unknown Farm";
  };

  const getCropName = (cropId) => {
    if (!cropId) return null;
    const crop = crops.find(c => c.Id === cropId);
    return crop ? crop.variety : "Unknown Crop";
  };

  const getTaskStatus = (task) => {
    if (task.completed) return "completed";
    if (isOverdue(task.dueDate)) return "overdue";
    if (isDueSoon(task.dueDate)) return "due-soon";
    return "pending";
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
                {farm.name}
              </option>
            ))}
          </Select>

          <Select
            label="Filter by Status"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
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
                task.completed ? "bg-gray-50" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => !task.completed && handleCompleteTask(task.Id)}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    task.completed
                      ? "bg-success border-success text-white"
                      : "border-gray-300 hover:border-primary hover:bg-primary/5"
                  }`}
                  disabled={task.completed}
                >
                  {task.completed && <ApperIcon name="Check" className="w-4 h-4" />}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className={`text-lg font-display font-semibold mb-1 ${
                        task.completed ? "text-gray-500 line-through" : "text-gray-900"
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm mb-2 ${
                          task.completed ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <StatusBadge status={getTaskStatus(task)} type="task" />
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ApperIcon name="Calendar" className="w-4 h-4" />
                      {formatRelativeDate(task.dueDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <ApperIcon name="MapPin" className="w-4 h-4" />
                      {getFarmName(task.farmId)}
                    </div>
                    {task.cropId && (
                      <div className="flex items-center gap-1">
                        <ApperIcon name="Sprout" className="w-4 h-4" />
                        {getCropName(task.cropId)}
                      </div>
                    )}
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