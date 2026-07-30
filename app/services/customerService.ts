import apiClient from "./apiClient";

// Customer interfaces
export interface Customer {
  _id: string | null;
  registeredUserId?: string | null;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
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

// Raw API response shapes from backend
interface RawCustomer {
  id: string | null;
  customer: string | null;
  contact: {
    email: string | null;
    phone: string | null;
  };
  orders: number | null;
  totalSpent: string | null; // e.g. "GHS 65.00"
  status: "active" | "inactive" | null;
  joined: string | null; // e.g. "11/03/2026"
}

interface RawGetCustomersResponse {
  success: boolean;
  message: string;
  data: {
    customers: RawCustomer[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCustomers: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
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
      `/api/v1/dashboard/admin/customers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );

    const raw: RawGetCustomersResponse = response.data;

    const rawCustomers = raw?.data?.customers ?? [];

    const customers: Customer[] = rawCustomers.map((c, index) => {
      // Parse "GHS 65.00" into a number
      let totalSpent = 0;
      if (typeof c.totalSpent === "string") {
        const numeric = c.totalSpent
          .replace("GHS", "")
          .replace(",", "")
          .trim();
        const parsed = parseFloat(numeric);
        if (!Number.isNaN(parsed)) {
          totalSpent = parsed;
        }
      }

      // Convert joined "DD/MM/YYYY" to ISO string for consistent Date parsing
      let createdAt = c.joined || new Date().toISOString();
      const parts = c.joined?.split("/") ?? [];
      if (parts.length === 3) {
        const [dayStr, monthStr, yearStr] = parts;
        const day = Number(dayStr);
        const month = Number(monthStr);
        const year = Number(yearStr);
        if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
          createdAt = new Date(year, month - 1, day).toISOString();
        }
      }

      return {
        _id: c.id || `anon-${index}`, // Fallback for React keys if ID is null
        registeredUserId: c.id,
        fullName: c.customer || "Unknown Customer",
        email: c.contact?.email ?? null,
        phoneNumber: c.contact?.phone ?? null,
        isActive: c.status === "active",
        totalOrders: c.orders ?? 0,
        totalSpent,
        createdAt,
      };
    });

    const pagination = raw?.data?.pagination;

    return {
      success: raw.success,
      data: customers,
      pagination: {
        total: pagination?.totalCustomers ?? customers.length,
        page: pagination?.currentPage ?? (params?.page ?? 1),
        pages: pagination?.totalPages ?? 1,
      },
    };
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
