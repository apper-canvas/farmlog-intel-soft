import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";

const ExpenseModal = ({ isOpen, onClose, onSave, expense, farms }) => {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: "",
    farmId: "",
    notes: ""
  });
  const [errors, setErrors] = useState({});

  const expenseCategories = ["Seeds", "Fertilizer", "Equipment", "Labor", "Maintenance", "Other"];

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount?.toString() || "",
        category: expense.category || "",
        date: expense.date || "",
        farmId: expense.farmId?.toString() || "",
        notes: expense.notes || ""
      });
    } else {
      setFormData({
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        farmId: "",
        notes: ""
      });
    }
    setErrors({});
  }, [expense, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Valid amount is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
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

    const expenseData = {
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      farmId: parseInt(formData.farmId),
      notes: formData.notes.trim()
    };

    onSave(expenseData);
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
                {expense ? "Edit Expense" : "Add New Expense"}
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
                label="Amount"
                type="number"
                required
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                error={errors.amount}
                placeholder="0.00"
                min="0"
                step="0.01"
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Category"
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  error={errors.category}
                >
                  <option value="">Select category</option>
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  error={errors.date}
                />
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
                    {farm.name}
                  </option>
                ))}
              </Select>

              <Textarea
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional details about this expense..."
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
                {expense ? "Update Expense" : "Add Expense"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExpenseModal;