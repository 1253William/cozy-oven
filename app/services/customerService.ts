import apiClient from "./apiClient";

export type CustomerKind = "registered" | "guest";

export interface Customer {
  /** Stable row key for React; never sent as a User id unless kind is registered. */
  rowKey: string;
  registeredUserId: string | null;
  customerKey: string;
  kind: CustomerKind;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  /** Recent buyer within 90 days (paid-order activity). */
  isRecent: boolean;
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
  kind: CustomerKind;
  customer: {
    _id: string | null;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
    isActive: boolean;
    isAccountDeleted?: boolean;
    createdAt: string;
  };
  orders: Array<{
    orderId?: string;
    totalAmount: number;
    paymentStatus: string;
    createdAt: string;
    paidAt?: string;
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
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

interface RawCustomer {
  id: string | null;
  customerKey?: string;
  kind?: CustomerKind;
  customer: string | null;
  contact: {
    email: string | null;
    phone: string | null;
  };
  orders: number | null;
  totalSpent: string | null;
  status: "active" | "inactive" | null;
  joined: string | null;
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
  getCustomerOverview: async (): Promise<GetCustomerOverviewResponse> => {
    const response = await apiClient.get(
      "/api/v1/dashboard/admin/customers/overview"
    );
    return response.data;
  },

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
      let totalSpent = 0;
      if (typeof c.totalSpent === "string") {
        const numeric = c.totalSpent.replace("GHS", "").replace(",", "").trim();
        const parsed = parseFloat(numeric);
        if (!Number.isNaN(parsed)) totalSpent = parsed;
      }

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

      const registeredUserId = c.id || null;
      const kind: CustomerKind =
        c.kind || (registeredUserId ? "registered" : "guest");
      const customerKey =
        c.customerKey ||
        registeredUserId ||
        c.contact?.email ||
        c.contact?.phone ||
        `row-${index}`;

      return {
        rowKey: customerKey,
        registeredUserId,
        customerKey,
        kind,
        fullName: c.customer || "Unknown Customer",
        email: c.contact?.email ?? null,
        phoneNumber: c.contact?.phone ?? null,
        isRecent: c.status === "active",
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

  getCustomerProfile: async (params: {
    userId?: string;
    email?: string;
    phone?: string;
  }): Promise<GetCustomerDetailsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.userId) queryParams.set("userId", params.userId);
    if (params.email) queryParams.set("email", params.email);
    if (params.phone) queryParams.set("phone", params.phone);

    const response = await apiClient.get(
      `/api/v1/dashboard/admin/customers/profile?${queryParams.toString()}`
    );
    return response.data;
  },

  deactivateCustomer: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(
      `/api/v1/dashboard/admin/customers/${id}/deactivate`
    );
    return response.data;
  },

  updateCustomerProfile: async (payload: {
    userId?: string;
    lookupEmail?: string;
    lookupPhone?: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  }): Promise<GetCustomerDetailsResponse & { message?: string }> => {
    const response = await apiClient.patch(
      `/api/v1/dashboard/admin/customers/profile`,
      payload
    );
    return response.data;
  },
};

export default customerService;
