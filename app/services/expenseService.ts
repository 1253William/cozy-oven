import apiClient from "./apiClient";

export type ExpenseCategory =
  | "ingredients"
  | "packaging"
  | "rent"
  | "salaries"
  | "utilities"
  | "transport"
  | "marketing"
  | "events"
  | "other";

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  notes?: string;
  expenseMonth: string;
  expenseYear: string;
}

export interface ExpenseInput {
  title: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  notes?: string;
}

const expenseService = {
  async list(month?: string, year?: string | number) {
    const response = await apiClient.get("/api/v1/dashboard/admin/expenses", {
      params: {
        ...(month ? { month } : {}),
        ...(year ? { year: String(year) } : {}),
      },
    });
    return response.data as {
      success: boolean;
      categories: ExpenseCategory[];
      data: Expense[];
    };
  },

  async create(data: ExpenseInput) {
    const response = await apiClient.post("/api/v1/dashboard/admin/expenses", data);
    return response.data;
  },

  async update(id: string, data: ExpenseInput) {
    const response = await apiClient.patch(`/api/v1/dashboard/admin/expenses/${id}`, data);
    return response.data;
  },

  async remove(id: string) {
    const response = await apiClient.delete(`/api/v1/dashboard/admin/expenses/${id}`);
    return response.data;
  },
};

export default expenseService;
