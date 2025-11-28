import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";

const CropModal = ({ isOpen, onClose, onSave, crop, farms }) => {
  const [formData, setFormData] = useState({
    farmId: "",
    variety: "",
    plantingDate: "",
    expectedHarvest: "",
    field: "",
    notes: ""
  });
  const [errors, setErrors] = useState({});

  const cropVarieties = [
    "Tomatoes", "Corn", "Wheat", "Soybeans", "Rice", "Potatoes", "Carrots", 
    "Onions", "Lettuce", "Spinach", "Bell Peppers", "Strawberries", "Apples", 
    "Oranges", "Grapes", "Watermelon", "Squash", "Beans", "Peas", "Broccoli",
    "Cabbage", "Cauliflower", "Other"
  ];

  useEffect(() => {
    if (crop) {
      setFormData({
        farmId: crop.farmId?.toString() || "",
        variety: crop.variety || "",
        plantingDate: crop.plantingDate || "",
        expectedHarvest: crop.expectedHarvest || "",
        field: crop.field || "",
        notes: crop.notes || ""
      });
    } else {
      setFormData({
        farmId: "",
        variety: "",
        plantingDate: "",
        expectedHarvest: "",
        field: "",
        notes: ""
      });
    }
    setErrors({});
  }, [crop, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.farmId) {
      newErrors.farmId = "Farm is required";
    }

    if (!formData.variety.trim()) {
      newErrors.variety = "Crop variety is required";
    }

    if (!formData.plantingDate) {
      newErrors.plantingDate = "Planting date is required";
    }

    if (!formData.expectedHarvest) {
      newErrors.expectedHarvest = "Expected harvest date is required";
    } else if (new Date(formData.expectedHarvest) <= new Date(formData.plantingDate)) {
      newErrors.expectedHarvest = "Harvest date must be after planting date";
    }

    if (!formData.field.trim()) {
      newErrors.field = "Field location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const cropData = {
      farmId: parseInt(formData.farmId),
      variety: formData.variety.trim(),
      plantingDate: formData.plantingDate,
      expectedHarvest: formData.expectedHarvest,
      field: formData.field.trim(),
      notes: formData.notes.trim()
    };

    onSave(cropData);
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
                {crop ? "Edit Crop" : "Add New Crop"}
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
                    {farm.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Crop Variety"
                required
                value={formData.variety}
                onChange={(e) => handleInputChange("variety", e.target.value)}
                error={errors.variety}
              >
                <option value="">Select crop variety</option>
                {cropVarieties.map((variety) => (
                  <option key={variety} value={variety}>
                    {variety}
                  </option>
                ))}
              </Select>

              <Input
                label="Field Location"
                required
                value={formData.field}
                onChange={(e) => handleInputChange("field", e.target.value)}
                error={errors.field}
                placeholder="e.g., North Field A, Greenhouse 1"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Planting Date"
                  type="date"
                  required
                  value={formData.plantingDate}
                  onChange={(e) => handleInputChange("plantingDate", e.target.value)}
                  error={errors.plantingDate}
                />

                <Input
                  label="Expected Harvest"
                  type="date"
                  required
                  value={formData.expectedHarvest}
                  onChange={(e) => handleInputChange("expectedHarvest", e.target.value)}
                  error={errors.expectedHarvest}
                />
              </div>

              <Textarea
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Variety details, special care instructions, etc."
                rows={3}
              />
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
                {crop ? "Update Crop" : "Add Crop"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CropModal;