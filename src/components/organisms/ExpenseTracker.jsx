import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ExpenseModal from "@/components/organisms/ExpenseModal";
import { formatDate } from "@/utils/dateHelpers";
import expenseService from "@/services/api/expenseService";
import farmService from "@/services/api/farmService";

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [farms, setFarms] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    farm: "",
    category: "",
    month: ""
  });

  const expenseCategories = ["Seeds", "Fertilizer", "Equipment", "Labor", "Maintenance", "Other"];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [expensesData, farmsData] = await Promise.all([
        expenseService.getAll(),
        farmService.getAll()
      ]);

      setExpenses(expensesData);
      setFarms(farmsData);
    } catch (err) {
      setError("Failed to load expenses");
      console.error("Expense loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

if (filters.farm) {
      filtered = filtered.filter(expense => 
        expense.farm_id_c?.Id === parseInt(filters.farm) || expense.farm_id_c === parseInt(filters.farm)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(expense => expense.category_c === filters.category);
    }

    if (filters.month) {
      filtered = filtered.filter(expense => {
        const expenseMonth = new Date(expense.date_c).toISOString().slice(0, 7);
        return expenseMonth === filters.month;
      });
    }

    // Sort by date (newest first)
filtered.sort((a, b) => new Date(b.date_c) - new Date(a.date_c));

    setFilteredExpenses(filtered);
  };

  const handleCreateExpense = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
      return;
    }

    try {
      await expenseService.delete(expenseId);
      await loadData();
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error("Failed to delete expense");
      console.error("Delete expense error:", error);
    }
  };

  const handleSaveExpense = async (expenseData) => {
    try {
      if (editingExpense) {
        await expenseService.update(editingExpense.Id, expenseData);
        toast.success("Expense updated successfully");
      } else {
        await expenseService.create(expenseData);
        toast.success("Expense recorded successfully");
      }
      await loadData();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save expense");
      console.error("Save expense error:", error);
    }
  };

const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.Name : "Unknown Farm";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Seeds": "Seed",
      "Fertilizer": "Droplets",
      "Equipment": "Wrench", 
      "Labor": "Users",
      "Maintenance": "Settings",
      "Other": "FileText"
    };
    return icons[category] || "FileText";
  };

  const getTotalExpenses = () => {
return filteredExpenses.reduce((total, expense) => total + expense.amount_c, 0);
  };

  const getCategoryTotals = () => {
    const totals = {};
filteredExpenses.forEach(expense => {
      totals[expense.category_c] = (totals[expense.category_c] || 0) + expense.amount_c;
    });
    return totals;
  };

  if (loading) return <Loading text="Loading expenses..." />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;

  const categoryTotals = getCategoryTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Expense Tracker</h2>
          <p className="text-gray-600">Monitor and categorize your farming costs</p>
        </div>
        <Button onClick={handleCreateExpense} className="flex items-center gap-2">
          <ApperIcon name="Plus" className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      {filteredExpenses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-display font-bold text-primary">
                  ${getTotalExpenses().toLocaleString()}
                </p>
              </div>
              <ApperIcon name="Receipt" className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="card">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">By Category</p>
              <div className="space-y-1">
                {Object.entries(categoryTotals)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([category, total]) => (
                    <div key={category} className="flex justify-between text-xs">
                      <span className="text-gray-600">{category}</span>
                      <span className="font-medium">${total.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-xl font-display font-bold text-gray-900">
                {filteredExpenses.length}
              </p>
            </div>
          </div>

          <div className="card">
            <div>
              <p className="text-sm font-medium text-gray-600">Average</p>
              <p className="text-xl font-display font-bold text-gray-900">
                ${filteredExpenses.length > 0 ? (getTotalExpenses() / filteredExpenses.length).toFixed(0) : "0"}
              </p>
            </div>
          </div>
        </div>
      )}

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
            label="Filter by Category"
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">All Categories</option>
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>

          <Input
            label="Filter by Month"
            type="month"
            value={filters.month}
            onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
          />

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFilters({ farm: "", category: "", month: "" })}
              className="w-full"
            >
              <ApperIcon name="X" className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <Empty
          icon="Receipt"
          title="No expenses found"
          message={filters.farm || filters.category || filters.month
            ? "No expenses match your current filters. Try adjusting your search criteria."
            : "Start by recording your first farming expense to begin tracking costs."
          }
          actionLabel="Add Expense"
          onAction={handleCreateExpense}
        />
      ) : (
        <div className="card">
          <div className="space-y-4">
{filteredExpenses.map((expense) => (
              <div
                key={expense.Id}
                className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Category Icon */}
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ApperIcon name={getCategoryIcon(expense.category_c)} className="w-5 h-5 text-primary" />
                </div>

                {/* Expense Details */}
                <div className="flex-1 min-w-0">
<div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{expense.Name || expense.category_c}</h4>
                      <p className="text-sm text-gray-600">{expense.category_c}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>{formatDate(expense.date_c)}</span>
                        {expense.CreatedOn && (
                          <span>Created {formatDate(expense.CreatedOn)}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <ApperIcon name="MapPin" className="w-3.5 h-3.5" />
                          {getFarmName(expense.farm_id_c?.Id || expense.farm_id_c)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ${expense.amount_c.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {expense.notes_c && (
                    <p className="text-sm text-gray-600 mt-2">{expense.notes_c}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditExpense(expense)}
                    className="px-3"
                  >
                    <ApperIcon name="Edit2" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExpense(expense.Id)}
                    className="px-3 text-error hover:text-error hover:bg-error/5"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
        expense={editingExpense}
        farms={farms}
      />
    </div>
  );
};

export default ExpenseTracker;