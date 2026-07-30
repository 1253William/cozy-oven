import apiClient from "./apiClient";
import type { PaymentBreakdown } from "../utils/paymentBreakdown";

// Order item interface
export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  packageSelections?: {
    label: string;
    quantity: number;
    groupLabel?: string;
    groupId?: string;
    type?: "fixed" | "selection";
  }[];
}

// Checkout request interface
export interface CheckoutRequest {
  items: OrderItem[];
  deliveryFee: number;
  deliveryAddress: string;
  city?: string;
  specialInstruction?: string;
  contactNumber: string;
  paymentMethod: string;
  paymentReference?: string;
  customerId?: string;
  discountAmount?: number;
  transactionDate?: string;
  fullName?: string;
  email?: string;
  orderDetails?: {
    pickUpDetails?: {
      pickupDate: string;
      specialInstructions?: string;
    };
  };
}

// Order interface
export interface Order {
  _id?: string;
  orderId: string;

  // New fields from your response
  customer?: string;
  email?: string;
  items?: string;         
  total?: string;
  amount?: string;        
  date?: string;
  paidAt?: string;
  paidAtIso?: string;
  transactionDateIso?: string;
  paymentBreakdown?: PaymentBreakdown;
  source?: string;
  invoice?: {
    invoiceId?: string;
    status?: "unpaid" | "paid";
    currency?: "GHS";
    paymentLink?: string;
    paidAt?: string;
  };

  // Existing fields
  userId?: string;
  customerId?: string;
  title?: string;
  subtotal?: number;
  discountAmount?: number;
  deliveryFee?: number;
  chargedAmount?: string;
  price?: number;
  deliveryAddress?: string;
  contactNumber?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;

  // Pagination (embedded in same interface)
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Statistics (also embedded)
  statistics?: {
    totalOrders: number;
    pending: number;
    preparing: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
  };
}


// Payment initiation response
export interface PaymentInitiationResponse {
  success: boolean;
  message: string;
  data?: {
    authorizationUrl?: string;
    checkoutUrl?: string;
    reference?: string;
    paymentBreakdown?: PaymentBreakdown;
  };
  authorizationUrl?: string;
  checkoutUrl?: string;
  reference?: string;
  paymentBreakdown?: PaymentBreakdown;
}

export interface ResumeCheckoutResponse extends PaymentInitiationResponse {
  order?: Order;
}

// Payment verification response
export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    paymentStatus: string;
    transactionRef: string;
    paymentBreakdown?: PaymentBreakdown;
  };
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  order?: T;
  checkoutResumeToken?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateInvoiceResponse {
  success: boolean;
  message: string;
  order?: Order;
  data?: {
    orderId: string;
    invoiceId: string;
    paymentLink: string;
    pdfUrl: string;
  };
}

// Admin order statistics
export interface OrderStatistics {
  totalOrders: number;
  pending: number;
  preparing: number;
  delivered: number;
  cancelled?: number;
  pendingVerification?: number;
  awaitingPayment?: number;
  totalRevenue?: number;
}

// Admin get all orders response
export interface GetAllOrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    statistics?: OrderStatistics;
  };
}

export const orderService = {
  // Customer: Create a new order (checkout)
  checkout: async (data: CheckoutRequest): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post("/api/v1/store/customer/orders/checkout/", data);
    return response.data;
  },

  // Customer: Initiate payment for an order
  initiatePayment: async (orderId: string): Promise<PaymentInitiationResponse> => {
    const response = await apiClient.post(
      `/api/v1/store/customer/orders/${orderId}/initiate-payment`
    );
    return response.data;
  },

  resumeCheckout: async (resumeToken: string): Promise<ResumeCheckoutResponse> => {
    const response = await apiClient.get(
      `/api/v1/store/customer/orders/resume-checkout/${encodeURIComponent(resumeToken)}`
    );
    return response.data;
  },

  // Customer: Verify payment
  verifyPayment: async (reference: string): Promise<PaymentVerificationResponse> => {
    const response = await apiClient.get(
      `/api/v1/store/customer/payment/verify?reference=${encodeURIComponent(reference)}`
    );
    return response.data;
  },

  // Customer: Get order history
  getOrderHistory: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get("/api/v1/store/customer/order-history");
    return response.data;
  },

  // Admin: Get all orders with pagination
  getAllOrders: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentMethod?: string;
  }): Promise<GetAllOrdersResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.paymentMethod) queryParams.append("paymentMethod", params.paymentMethod);

    const response = await apiClient.get(
      `/api/v1/dashboard/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return response.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (
    orderId: string,
    status: string
  ): Promise<ApiResponse<Order>> => {
    const response = await apiClient.patch(
      `/api/v1/dashboard/admin/orders/status/${orderId}/${status}`
    );
    return response.data;
  },

  // Admin: Delete order
  deleteOrder: async (orderId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/api/v1/dashboard/admin/orders/${orderId}`);
    return response.data;
  },

  // Admin: Create a new order (checkout) - allows admins to checkout
  // Tries admin endpoint first, falls back to customer endpoint if admin endpoint doesn't exist
  adminCheckout: async (data: CheckoutRequest): Promise<ApiResponse<Order>> => {
    try {
      // Try admin-specific endpoint first
      const response = await apiClient.post("/api/v1/dashboard/admin/orders/checkout", data);
      return response.data;
    } catch (error: any) {
      // If admin endpoint doesn't exist (404), try customer endpoint
      // Note: Backend may need to allow admins on customer endpoint or provide admin endpoint
      if (error.response?.status === 404 || error.response?.status === 403) {
        // Fallback to customer endpoint (same as AddOrderModal uses)
        const response = await apiClient.post("/api/v1/store/customer/orders/checkout/", data);
        return response.data;
      }
      throw error;
    }
  },

  createOfflineSale: async (data: CheckoutRequest): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post("/api/v1/dashboard/admin/orders/offline", data);
    return response.data;
  },

  createInvoice: async (data: CheckoutRequest): Promise<CreateInvoiceResponse> => {
    const response = await apiClient.post("/api/v1/dashboard/admin/invoices", data);
    return response.data;
  },

  markInvoicePaid: async (
    orderId: string,
    transactionRef?: string
  ): Promise<ApiResponse<Order>> => {
    const response = await apiClient.patch(
      `/api/v1/dashboard/admin/invoices/${orderId}/mark-paid`,
      { transactionRef }
    );
    return response.data;
  },

  downloadInvoicePdf: async (orderId: string): Promise<void> => {
    const response = await apiClient.get(`/api/v1/dashboard/admin/invoices/${orderId}/pdf`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${orderId}-invoice.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Admin: Get single order details by orderId
  getOrderById: async (orderId: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/api/v1/dashboard/admin/orders/${orderId}`);
    return response.data;
  },
};

export default orderService;
