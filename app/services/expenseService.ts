import apiClient from "./apiClient";

export interface OverheadCategory {
  _id: string;
  name: string;
  subtype: string;
  costClass: "operatingExpense";
}

export interface Expense {
  id: string;
  title: string;
  category?: string;
  categoryId?: string;
  categoryName: string;
  amount: number;
  expenseDate: string;
  notes?: string;
  vendor?: string;
  paymentMethod?: string;
  paymentReference?: string;
  expenseMonth: string;
  expenseYear: string;
}

export interface ExpenseInput {
  title: string;
  categoryId: string;
  amount: number;
  expenseDate: string;
  notes?: string;
  vendor?: string;
  paymentMethod?: string;
  paymentReference?: string;
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
      categories: OverheadCategory[];
      data: Expense[];
    };
  },
  async create(data: ExpenseInput) {
    return (await apiClient.post("/api/v1/dashboard/admin/expenses", data)).data;
  },
  async update(id: string, data: ExpenseInput) {
    return (await apiClient.patch(`/api/v1/dashboard/admin/expenses/${id}`, data)).data;
  },
  async remove(id: string) {
    return (await apiClient.delete(`/api/v1/dashboard/admin/expenses/${id}`)).data;
  },
};

export default expenseService;
