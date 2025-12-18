import apiClient from "./apiClient";

// Customer interfaces
export interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface CustomerOverview {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  totalRevenue: number;
}

export interface CustomerDetails {
  customer: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
    createdAt: string;
  };
  orders: Array<{
    totalAmount: number;
    paymentStatus: string;
    createdAt: string;
  }>;
}

export interface GetCustomersResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface GetCustomerOverviewResponse {
  success: boolean;
  data: CustomerOverview;
}

export interface GetCustomerDetailsResponse {
  success: boolean;
  data: CustomerDetails;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export const customerService = {
  // GET /api/v1/dashboard/admin/customers/overview - Get customer overview statistics
  getCustomerOverview: async (): Promise<GetCustomerOverviewResponse> => {
    // Note: The API spec mentions "/customers/over" but it should be "/customers/overview"
    const response = await apiClient.get("/api/v1/dashboard/admin/customers/overview");
    return response.data;
  },

  // GET /api/v1/dashboard/admin/customer - Fetch all customers with pagination
  getAllCustomers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "active" | "inactive";
  }): Promise<GetCustomersResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);

    const response = await apiClient.get(
      `/api/v1/dashboard/admin/customer${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return response.data;
  },

  // GET /api/v1/dashboard/admin/customers/{id} - Get customer details
  getCustomerDetails: async (id: string): Promise<GetCustomerDetailsResponse> => {
    const response = await apiClient.get(`/api/v1/dashboard/admin/customers/${id}`);
    return response.data;
  },

  // DELETE /api/v1/dashboard/admin/customers/{id}/deactivate - Toggle customer active status
  deactivateCustomer: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/api/v1/dashboard/admin/customers/${id}/deactivate`);
    return response.data;
  },
};

export default customerService;
