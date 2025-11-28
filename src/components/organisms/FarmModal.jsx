import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";

const FarmModal = ({ isOpen, onClose, onSave, farm }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    size: "",
    unit: "acres"
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (farm) {
      setFormData({
        name: farm.name || "",
        location: farm.location || "",
        size: farm.size?.toString() || "",
        unit: farm.unit || "acres"
      });
    } else {
      setFormData({
        name: "",
        location: "",
        size: "",
        unit: "acres"
      });
    }
    setErrors({});
  }, [farm, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Farm name is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.size || isNaN(formData.size) || parseFloat(formData.size) <= 0) {
      newErrors.size = "Valid size is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const farmData = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      size: parseFloat(formData.size),
      unit: formData.unit
    };

    onSave(farmData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                {farm ? "Edit Farm" : "Add New Farm"}
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
                label="Farm Name"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={errors.name}
                placeholder="e.g., Green Valley Farm"
              />

              <Input
                label="Location"
                required
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                error={errors.location}
                placeholder="e.g., Riverside County, CA"
              />

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input
                    label="Size"
                    type="number"
                    required
                    value={formData.size}
                    onChange={(e) => handleInputChange("size", e.target.value)}
                    error={errors.size}
                    placeholder="25.5"
                    min="0"
                    step="0.1"
                  />
                </div>
                <Select
                  label="Unit"
                  required
                  value={formData.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="sq ft">Sq Ft</option>
                  <option value="sq m">Sq M</option>
                </Select>
              </div>
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
                {farm ? "Update Farm" : "Add Farm"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FarmModal;