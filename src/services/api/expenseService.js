import expensesData from "@/services/mockData/expenses.json";

class ExpenseService {
  constructor() {
    this.storageKey = "farmlog_expenses";
    this.initializeData();
  }

  initializeData() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(expensesData));
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
    const expenses = await this.getAll();
    return expenses.find(expense => expense.Id === id) || null;
  }

  async getByFarmId(farmId) {
    await this.delay();
    const expenses = await this.getAll();
    return expenses.filter(expense => expense.farmId === farmId);
  }

  async getMonthlyTotal(month = new Date().getMonth() + 1, year = new Date().getFullYear()) {
    await this.delay();
    const expenses = await this.getAll();
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === year;
      })
      .reduce((total, expense) => total + expense.amount, 0);
  }

  async create(expenseData) {
    await this.delay();
    const expenses = await this.getAll();
    const maxId = expenses.length > 0 ? Math.max(...expenses.map(e => e.Id)) : 0;
    
    const newExpense = {
      Id: maxId + 1,
      ...expenseData,
      createdAt: new Date().toISOString()
    };

    const updatedExpenses = [...expenses, newExpense];
    localStorage.setItem(this.storageKey, JSON.stringify(updatedExpenses));
    return newExpense;
  }

  async update(id, expenseData) {
    await this.delay();
    const expenses = await this.getAll();
    const expenseIndex = expenses.findIndex(expense => expense.Id === id);
    
    if (expenseIndex === -1) {
      throw new Error("Expense not found");
    }

    const updatedExpense = {
      ...expenses[expenseIndex],
      ...expenseData,
      Id: id
    };

    const updatedExpenses = [...expenses];
    updatedExpenses[expenseIndex] = updatedExpense;
    
    localStorage.setItem(this.storageKey, JSON.stringify(updatedExpenses));
    return updatedExpense;
  }

  async delete(id) {
    await this.delay();
    const expenses = await this.getAll();
    const updatedExpenses = expenses.filter(expense => expense.Id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(updatedExpenses));
    return true;
  }
}

export default new ExpenseService();