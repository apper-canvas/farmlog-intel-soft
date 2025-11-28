import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import FarmModal from "@/components/organisms/FarmModal";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";

const FarmGrid = () => {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [cropCounts, setCropCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [farmsData, cropsData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll()
      ]);

      setFarms(farmsData);

      // Calculate crop counts per farm
      const counts = {};
      farmsData.forEach(farm => {
        counts[farm.Id] = cropsData.filter(crop => crop.farmId === farm.Id).length;
      });
      setCropCounts(counts);
    } catch (err) {
      setError("Failed to load farms");
      console.error("Farm loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = () => {
    setEditingFarm(null);
    setIsModalOpen(true);
  };

  const handleEditFarm = (farm) => {
    setEditingFarm(farm);
    setIsModalOpen(true);
  };

  const handleDeleteFarm = async (farmId) => {
    if (!window.confirm("Are you sure you want to delete this farm? This action cannot be undone.")) {
      return;
    }

    try {
      await farmService.delete(farmId);
      await loadData();
      toast.success("Farm deleted successfully");
    } catch (error) {
      toast.error("Failed to delete farm");
      console.error("Delete farm error:", error);
    }
  };

  const handleSaveFarm = async (farmData) => {
    try {
      if (editingFarm) {
        await farmService.update(editingFarm.Id, farmData);
        toast.success("Farm updated successfully");
      } else {
        await farmService.create(farmData);
        toast.success("Farm created successfully");
      }
      await loadData();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save farm");
      console.error("Save farm error:", error);
    }
  };

  const handleViewCrops = (farmId) => {
    navigate(`/crops?farm=${farmId}`);
  };

  if (loading) return <Loading text="Loading farms..." />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;

  if (farms.length === 0) {
    return (
      <Empty
        icon="MapPin"
        title="No farms yet"
        message="Start by adding your first farm to begin tracking crops, tasks, and expenses."
        actionLabel="Add Farm"
        onAction={handleCreateFarm}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Your Farms</h2>
          <p className="text-gray-600">Manage and monitor all your farming locations</p>
        </div>
        <Button onClick={handleCreateFarm} className="flex items-center gap-2">
          <ApperIcon name="Plus" className="w-4 h-4" />
          Add Farm
        </Button>
      </div>

      {/* Farm Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm) => (
          <div
            key={farm.Id}
            className="card card-hover border border-gray-200"
          >
            <div className="space-y-4">
              {/* Farm Info */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-semibold text-gray-900 mb-1">
                      {farm.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <ApperIcon name="MapPin" className="w-4 h-4" />
                      {farm.location}
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{farm.size}</div>
                      <div className="text-xs text-gray-500">{farm.unit}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 py-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <ApperIcon name="Sprout" className="w-4 h-4 text-success" />
                  <span className="text-sm text-gray-600">
                    {cropCounts[farm.Id] || 0} crops
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewCrops(farm.Id)}
                  className="flex-1 justify-center"
                >
                  <ApperIcon name="Eye" className="w-4 h-4" />
                  View Crops
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditFarm(farm)}
                  className="px-3"
                >
                  <ApperIcon name="Edit2" className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFarm(farm.Id)}
                  className="px-3 text-error hover:text-error hover:bg-error/5"
                >
                  <ApperIcon name="Trash2" className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Farm Modal */}
      <FarmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFarm}
        farm={editingFarm}
      />
    </div>
  );
};

export default FarmGrid;