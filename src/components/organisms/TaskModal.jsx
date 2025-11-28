import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";

const TaskModal = ({ isOpen, onClose, onSave, task, farms, crops }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    farmId: "",
    cropId: "",
    priority: "medium"
  });
  const [errors, setErrors] = useState({});
  const [filteredCrops, setFilteredCrops] = useState([]);

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
    setErrors({});
  }, [task, isOpen]);

  useEffect(() => {
if (formData.farmId && crops) {
      const filtered = crops.filter(crop => 
        crop.farm_id_c?.Id === parseInt(formData.farmId) || crop.farm_id_c === parseInt(formData.farmId)
      );
      setFilteredCrops(filtered);
    } else {
      setFilteredCrops([]);
    }
  }, [formData.farmId, crops]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    if (!formData.farmId) {
      newErrors.farmId = "Farm is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate,
      farmId: parseInt(formData.farmId),
      cropId: formData.cropId ? parseInt(formData.cropId) : null,
      priority: formData.priority
    };

    onSave(taskData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear crop selection when farm changes
    if (field === "farmId") {
      setFormData(prev => ({ ...prev, cropId: "" }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-semibold text-gray-900">
                {task ? "Edit Task" : "Add New Task"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <Input
                label="Task Title"
                required
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                error={errors.title}
                placeholder="e.g., Water tomatoes, Apply fertilizer"
              />

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Additional details about this task..."
                rows={3}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Due Date"
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  error={errors.dueDate}
                />

                <Select
                  label="Priority"
                  required
                  value={formData.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>

              <Select
                label="Farm"
                required
                value={formData.farmId}
                onChange={(e) => handleInputChange("farmId", e.target.value)}
                error={errors.farmId}
              >
                <option value="">Select a farm</option>
{farms.map((farm) => (
                  <option key={farm.Id} value={farm.Id}>
                    {farm.Name}
                  </option>
                ))}
              </Select>

              <Select
                label="Related Crop (Optional)"
                value={formData.cropId}
                onChange={(e) => handleInputChange("cropId", e.target.value)}
                disabled={!formData.farmId}
              >
                <option value="">No specific crop</option>
{filteredCrops.map((crop) => (
                  <option key={crop.Id} value={crop.Id}>
                    {crop.variety_c} ({crop.field_c})
                  </option>
                ))}
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {task ? "Update Task" : "Add Task"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskModal;