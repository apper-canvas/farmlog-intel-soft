import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import StatusBadge from "@/components/molecules/StatusBadge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import CropModal from "@/components/organisms/CropModal";
import { formatDate } from "@/utils/dateHelpers";
import cropService from "@/services/api/cropService";
import farmService from "@/services/api/farmService";

const CropList = () => {
  const [searchParams] = useSearchParams();
  const selectedFarmId = searchParams.get("farm");

  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [filters, setFilters] = useState({
    farm: selectedFarmId || "",
    status: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedFarmId) {
      setFilters(prev => ({ ...prev, farm: selectedFarmId }));
    }
  }, [selectedFarmId]);

  useEffect(() => {
    applyFilters();
  }, [crops, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [cropsData, farmsData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ]);

      setCrops(cropsData);
      setFarms(farmsData);
    } catch (err) {
      setError("Failed to load crops");
      console.error("Crop loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...crops];

    if (filters.farm) {
      filtered = filtered.filter(crop => crop.farmId === parseInt(filters.farm));
    }

    if (filters.status) {
      filtered = filtered.filter(crop => crop.status === filters.status);
    }

    setFilteredCrops(filtered);
  };

  const handleCreateCrop = () => {
    setEditingCrop(null);
    setIsModalOpen(true);
  };

  const handleEditCrop = (crop) => {
    setEditingCrop(crop);
    setIsModalOpen(true);
  };

  const handleDeleteCrop = async (cropId) => {
    if (!window.confirm("Are you sure you want to delete this crop? This action cannot be undone.")) {
      return;
    }

    try {
      await cropService.delete(cropId);
      await loadData();
      toast.success("Crop deleted successfully");
    } catch (error) {
      toast.error("Failed to delete crop");
      console.error("Delete crop error:", error);
    }
  };

  const handleSaveCrop = async (cropData) => {
    try {
      if (editingCrop) {
        await cropService.update(editingCrop.Id, cropData);
        toast.success("Crop updated successfully");
      } else {
        await cropService.create(cropData);
        toast.success("Crop created successfully");
      }
      await loadData();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save crop");
      console.error("Save crop error:", error);
    }
  };

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.name : "Unknown Farm";
  };

  if (loading) return <Loading text="Loading crops..." />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Crop Management</h2>
          <p className="text-gray-600">Track planting, growth, and harvest schedules</p>
        </div>
        <Button onClick={handleCreateCrop} className="flex items-center gap-2">
          <ApperIcon name="Plus" className="w-4 h-4" />
          Add Crop
        </Button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <option value="planted">Planted</option>
            <option value="growing">Growing</option>
            <option value="harvested">Harvested</option>
          </Select>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFilters({ farm: "", status: "" })}
              className="w-full"
            >
              <ApperIcon name="X" className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Crops List */}
      {filteredCrops.length === 0 ? (
        <Empty
          icon="Sprout"
          title="No crops found"
          message={filters.farm || filters.status 
            ? "No crops match your current filters. Try adjusting your search criteria."
            : "Start by adding your first crop to begin tracking growth and harvest schedules."
          }
          actionLabel="Add Crop"
          onAction={handleCreateCrop}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <div
              key={crop.Id}
              className="card card-hover border border-gray-200"
            >
              <div className="space-y-4">
                {/* Crop Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-semibold text-gray-900 mb-1">
                      {crop.variety}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <ApperIcon name="MapPin" className="w-4 h-4" />
                      {getFarmName(crop.farmId)}
                    </p>
                  </div>
                  <StatusBadge status={crop.status} type="crop" />
                </div>

                {/* Crop Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Calendar" className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Planted: {formatDate(crop.plantingDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ApperIcon name="CalendarDays" className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Harvest: {formatDate(crop.expectedHarvest)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ApperIcon name="Square" className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Field: {crop.field}
                    </span>
                  </div>

                  {crop.notes && (
                    <div className="flex items-start gap-2">
                      <ApperIcon name="FileText" className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600 line-clamp-2">
                        {crop.notes}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCrop(crop)}
                    className="flex-1 justify-center"
                  >
                    <ApperIcon name="Edit2" className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCrop(crop.Id)}
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

      {/* Crop Modal */}
      <CropModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCrop}
        crop={editingCrop}
        farms={farms}
      />
    </div>
  );
};

export default CropList;