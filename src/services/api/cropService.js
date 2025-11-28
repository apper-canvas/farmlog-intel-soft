import cropsData from "@/services/mockData/crops.json";

class CropService {
  constructor() {
    this.storageKey = "farmlog_crops";
    this.initializeData();
  }

  initializeData() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(cropsData));
    }
  }

  async delay() {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll() {
    await this.delay();
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  async getById(id) {
    await this.delay();
    const crops = await this.getAll();
    return crops.find(crop => crop.Id === id) || null;
  }

  async getByFarmId(farmId) {
    await this.delay();
    const crops = await this.getAll();
    return crops.filter(crop => crop.farmId === farmId);
  }

  async create(cropData) {
    await this.delay();
    const crops = await this.getAll();
    const maxId = crops.length > 0 ? Math.max(...crops.map(c => c.Id)) : 0;
    
    const newCrop = {
      Id: maxId + 1,
      ...cropData,
      status: "planted"
    };

    const updatedCrops = [...crops, newCrop];
    localStorage.setItem(this.storageKey, JSON.stringify(updatedCrops));
    return newCrop;
  }

  async update(id, cropData) {
    await this.delay();
    const crops = await this.getAll();
    const cropIndex = crops.findIndex(crop => crop.Id === id);
    
    if (cropIndex === -1) {
      throw new Error("Crop not found");
    }

    const updatedCrop = {
      ...crops[cropIndex],
      ...cropData,
      Id: id
    };

    const updatedCrops = [...crops];
    updatedCrops[cropIndex] = updatedCrop;
    
    localStorage.setItem(this.storageKey, JSON.stringify(updatedCrops));
    return updatedCrop;
  }

  async delete(id) {
    await this.delay();
    const crops = await this.getAll();
    const updatedCrops = crops.filter(crop => crop.Id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(updatedCrops));
    return true;
  }
}

export default new CropService();