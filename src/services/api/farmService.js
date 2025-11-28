import farmsData from "@/services/mockData/farms.json";

class FarmService {
  constructor() {
    this.storageKey = "farmlog_farms";
    this.initializeData();
  }

  initializeData() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(farmsData));
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
    const farms = await this.getAll();
    return farms.find(farm => farm.Id === id) || null;
  }

  async create(farmData) {
    await this.delay();
    const farms = await this.getAll();
    const maxId = farms.length > 0 ? Math.max(...farms.map(f => f.Id)) : 0;
    
    const newFarm = {
      Id: maxId + 1,
      ...farmData,
      createdAt: new Date().toISOString()
    };

    const updatedFarms = [...farms, newFarm];
    localStorage.setItem(this.storageKey, JSON.stringify(updatedFarms));
    return newFarm;
  }

  async update(id, farmData) {
    await this.delay();
    const farms = await this.getAll();
    const farmIndex = farms.findIndex(farm => farm.Id === id);
    
    if (farmIndex === -1) {
      throw new Error("Farm not found");
    }

    const updatedFarm = {
      ...farms[farmIndex],
      ...farmData,
      Id: id
    };

    const updatedFarms = [...farms];
    updatedFarms[farmIndex] = updatedFarm;
    
    localStorage.setItem(this.storageKey, JSON.stringify(updatedFarms));
    return updatedFarm;
  }

  async delete(id) {
    await this.delay();
    const farms = await this.getAll();
    const updatedFarms = farms.filter(farm => farm.Id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(updatedFarms));
    return true;
  }
}

export default new FarmService();