import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

class ExpenseService {
  constructor() {
    this.tableName = "expense_c";
  }

  async delay() {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll() {
    await this.delay();
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return [];
      }

      const params = {
fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "farm_id_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}}
        ]
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching expenses:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    await this.delay();
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      const params = {
        fields: [
{"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "farm_id_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}}
        ]
      };

      const response = await apperClient.getRecordById(this.tableName, id, params);

      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching expense ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async getByFarmId(farmId) {
    await this.delay();
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return [];
      }

      const params = {
        fields: [
{"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "farm_id_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}}
        ],
        where: [{
          FieldName: "farm_id_c",
          Operator: "EqualTo",
          Values: [parseInt(farmId)],
          Include: true
        }]
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching expenses by farm:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getMonthlyTotal(month = new Date().getMonth() + 1, year = new Date().getFullYear()) {
    await this.delay();
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return 0;
      }

      // Create date range for the month
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

      const params = {
        fields: [
          {"field": {"Name": "amount_c"}}
        ],
        where: [
          {
            FieldName: "date_c",
            Operator: "GreaterThanOrEqualTo",
            Values: [startDate],
            Include: true
          },
          {
            FieldName: "date_c",
            Operator: "LessThanOrEqualTo",
            Values: [endDate],
            Include: true
          }
        ]
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return 0;
      }

      const expenses = response.data || [];
      return expenses.reduce((total, expense) => total + (expense.amount_c || 0), 0);
    } catch (error) {
      console.error("Error fetching monthly expenses:", error?.response?.data?.message || error);
      return 0;
    }
  }

  async create(expenseData) {
    await this.delay();
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          amount_c: expenseData.amount,
          category_c: expenseData.category,
          date_c: expenseData.date,
          farm_id_c: parseInt(expenseData.farmId),
          notes_c: expenseData.notes || ""
        }]
      };

      const response = await apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} expenses:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }

      throw new Error("No successful records created");
    } catch (error) {
      console.error("Error creating expense:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, expenseData) {
    await this.delay();
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: id,
          amount_c: expenseData.amount,
          category_c: expenseData.category,
          date_c: expenseData.date,
          farm_id_c: parseInt(expenseData.farmId),
          notes_c: expenseData.notes || ""
        }]
      };

      const response = await apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} expenses:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }

      throw new Error("No successful records updated");
    } catch (error) {
      console.error("Error updating expense:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async delete(id) {
    await this.delay();
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} expenses:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting expense:", error?.response?.data?.message || error);
      throw error;
    }
  }
}

export default new ExpenseService();