import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import TaskMetadata from "@/components/molecules/TaskMetadata";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";

function TaskModalWithMetadata({ isOpen, onClose, task, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    dueDate: "",
    farmId: "",
    cropId: "",
    priority: "medium"
  });
  
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.Name || "",
        title: task.title_c || "",
        description: task.description_c || "",
        dueDate: task.due_date_c || "",
        farmId: task.farm_id_c?.Id?.toString() || task.farm_id_c?.toString() || "",
        cropId: task.crop_id_c?.Id?.toString() || task.crop_id_c?.toString() || "",
        priority: task.priority_c || "medium"
      });
    } else {
      setFormData({
        name: "",
        title: "",
        description: "",
        dueDate: "",
        farmId: "",
        cropId: "",
        priority: "medium"
      });
    }
  }, [task]);

  useEffect(() => {
    if (isOpen) {
      loadFarms();
      loadCrops();
    }
  }, [isOpen]);

  const loadFarms = async () => {
    try {
      const farmsData = await farmService.getAll();
      setFarms(farmsData);
    } catch (error) {
      console.error("Error loading farms:", error);
    }
  };

  const loadCrops = async () => {
    try {
      const cropsData = await cropService.getAll();
      setCrops(cropsData);
    } catch (error) {
      console.error("Error loading crops:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.dueDate) {
      toast.error("Due date is required");
      return;
    }
    if (!formData.farmId) {
      toast.error("Farm selection is required");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-display font-semibold">
            {task ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter task name (optional)"
            />
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              required
            />
          </div>

          {/* Farm Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm *
            </label>
            <Select
              value={formData.farmId}
              onChange={(e) => handleInputChange("farmId", e.target.value)}
              required
            >
              <option value="">Select a farm</option>
              {farms.map((farm) => (
                <option key={farm.Id} value={farm.Id}>
                  {farm.Name || farm.farm_name_c}
                </option>
              ))}
            </Select>
          </div>

          {/* Crop Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop
            </label>
            <Select
              value={formData.cropId}
              onChange={(e) => handleInputChange("cropId", e.target.value)}
            >
              <option value="">Select a crop (optional)</option>
              {crops.map((crop) => (
                <option key={crop.Id} value={crop.Id}>
                  {crop.Name || crop.crop_name_c}
                </option>
              ))}
            </Select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <Select
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>

          {/* Task Metadata - Only show for existing tasks */}
          {task && <TaskMetadata task={task} />}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                  {task ? "Updating..." : "Creating..."}
                </div>
              ) : (
                task ? "Update Task" : "Create Task"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModalWithMetadata;