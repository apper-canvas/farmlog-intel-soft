import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import MetricCard from "@/components/molecules/MetricCard";
import WeatherCard from "@/components/molecules/WeatherCard";
import StatusBadge from "@/components/molecules/StatusBadge";
import PriorityBadge from "@/components/molecules/PriorityBadge";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { formatRelativeDate, isOverdue, isDueSoon } from "@/utils/dateHelpers";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";
import taskService from "@/services/api/taskService";
import expenseService from "@/services/api/expenseService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    farms: [],
    crops: [],
    upcomingTasks: [],
    monthlyExpenses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [farms, crops, upcomingTasks, allExpenses] = await Promise.all([
        farmService.getAll(),
        cropService.getAll(),
        taskService.getUpcoming(7),
        expenseService.getAll()
      ]);

      // Calculate monthly expenses
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const monthlyExpenses = allExpenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() + 1 === currentMonth && expenseDate.getFullYear() === currentYear;
        })
        .reduce((total, expense) => total + expense.amount, 0);

      setDashboardData({
        farms,
        crops,
        upcomingTasks,
        monthlyExpenses
      });
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTaskStatus = (task) => {
    if (task.completed) return "completed";
    if (isOverdue(task.dueDate)) return "overdue";
    if (isDueSoon(task.dueDate)) return "due-soon";
    return "pending";
  };

  const getActiveCropsCount = () => {
    return dashboardData.crops.filter(crop => crop.status !== "harvested").length;
  };

  const getFarmName = (farmId) => {
    const farm = dashboardData.farms.find(f => f.Id === farmId);
    return farm ? farm.name : "Unknown Farm";
  };

  const getCropName = (cropId) => {
    if (!cropId) return null;
    const crop = dashboardData.crops.find(c => c.Id === cropId);
    return crop ? crop.variety : "Unknown Crop";
  };

  if (loading) return <Loading text="Loading dashboard..." />;
  if (error) return <ErrorView message={error} onRetry={loadDashboardData} />;

  const { farms, crops, upcomingTasks, monthlyExpenses } = dashboardData;

  // Show empty state if no farms exist yet
  if (farms.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Welcome to FarmLog</h1>
          <p className="text-gray-600">Your complete agriculture management solution</p>
        </div>
        
        <Empty
          icon="Sprout"
          title="Get started with your first farm"
          message="Begin your agricultural journey by adding your first farm. Track crops, manage tasks, and monitor expenses all in one place."
          actionLabel="Add Your First Farm"
          onAction={() => navigate("/farms")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Farm Dashboard</h1>
        <p className="text-gray-600">Overview of your agricultural operations</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Farms"
          value={farms.length}
          icon="MapPin"
          color="primary"
          onClick={() => navigate("/farms")}
        />
        
        <MetricCard
          title="Active Crops"
          value={getActiveCropsCount()}
          icon="Sprout"
          color="success"
          onClick={() => navigate("/crops")}
        />
        
        <MetricCard
          title="Upcoming Tasks"
          value={upcomingTasks.length}
          icon="CheckSquare"
          color="warning"
          onClick={() => navigate("/tasks")}
        />
        
        <MetricCard
          title="Monthly Expenses"
          value={`$${monthlyExpenses.toLocaleString()}`}
          icon="Receipt"
          color="info"
          onClick={() => navigate("/expenses")}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-semibold text-gray-900">
                Upcoming Tasks
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/tasks")}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Plus" className="w-4 h-4" />
                Add Task
              </Button>
            </div>

            {upcomingTasks.length === 0 ? (
              <Empty
                className="py-8"
                icon="CheckSquare"
                title="No upcoming tasks"
                message="All caught up! Add new tasks to keep your farm operations organized."
                actionLabel="Add Task"
                onAction={() => navigate("/tasks")}
              />
            ) : (
              <div className="space-y-3">
                {upcomingTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.Id}
                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                        <StatusBadge status={getTaskStatus(task)} type="task" />
                        <PriorityBadge priority={task.priority} />
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <ApperIcon name="Calendar" className="w-3.5 h-3.5" />
                          {formatRelativeDate(task.dueDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ApperIcon name="MapPin" className="w-3.5 h-3.5" />
                          {getFarmName(task.farmId)}
                        </span>
                        {task.cropId && (
                          <span className="flex items-center gap-1">
                            <ApperIcon name="Sprout" className="w-3.5 h-3.5" />
                            {getCropName(task.cropId)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {upcomingTasks.length > 5 && (
                  <div className="pt-3 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/tasks")}
                      className="w-full"
                    >
                      View all {upcomingTasks.length} tasks
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Weather Card */}
        <div>
          <WeatherCard />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/farms")}
            className="flex flex-col items-center gap-2 h-20"
          >
            <ApperIcon name="MapPin" className="w-6 h-6 text-primary" />
            <span className="text-sm">Add Farm</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/crops")}
            className="flex flex-col items-center gap-2 h-20"
          >
            <ApperIcon name="Sprout" className="w-6 h-6 text-success" />
            <span className="text-sm">Log Crop</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/tasks")}
            className="flex flex-col items-center gap-2 h-20"
          >
            <ApperIcon name="CheckSquare" className="w-6 h-6 text-warning" />
            <span className="text-sm">Add Task</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/expenses")}
            className="flex flex-col items-center gap-2 h-20"
          >
            <ApperIcon name="Receipt" className="w-6 h-6 text-info" />
            <span className="text-sm">Log Expense</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;