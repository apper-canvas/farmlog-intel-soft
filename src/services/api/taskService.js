import tasksData from "@/services/mockData/tasks.json";

class TaskService {
  constructor() {
    this.storageKey = "farmlog_tasks";
    this.initializeData();
  }

  initializeData() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(tasksData));
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
    const tasks = await this.getAll();
    return tasks.find(task => task.Id === id) || null;
  }

  async getByFarmId(farmId) {
    await this.delay();
    const tasks = await this.getAll();
    return tasks.filter(task => task.farmId === farmId);
  }

  async getUpcoming(days = 7) {
    await this.delay();
    const tasks = await this.getAll();
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return tasks.filter(task => {
      if (task.completed) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= futureDate;
    });
  }

  async create(taskData) {
    await this.delay();
    const tasks = await this.getAll();
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.Id)) : 0;
    
    const newTask = {
      Id: maxId + 1,
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, newTask];
    localStorage.setItem(this.storageKey, JSON.stringify(updatedTasks));
    return newTask;
  }

  async update(id, taskData) {
    await this.delay();
    const tasks = await this.getAll();
    const taskIndex = tasks.findIndex(task => task.Id === id);
    
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...taskData,
      Id: id
    };

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    localStorage.setItem(this.storageKey, JSON.stringify(updatedTasks));
    return updatedTask;
  }

  async complete(id) {
    return await this.update(id, { completed: true });
  }

  async delete(id) {
    await this.delay();
    const tasks = await this.getAll();
    const updatedTasks = tasks.filter(task => task.Id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(updatedTasks));
    return true;
  }
}

export default new TaskService();