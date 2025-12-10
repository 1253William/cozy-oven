import apiClient from "./apiClient";

// Order item interface
export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

// Checkout request interface
export interface CheckoutRequest {
  items: OrderItem[];
  deliveryFee: number;
  deliveryAddress: string;
  contactNumber: string;
  paymentMethod: string; // "hubtel" or other payment methods
}

// Order interface
export interface Order {
  _id: string;
  orderId: string;
  userId?: string;
  customerId?: string;
  items: Array<{
    productId: string;
    name?: string;
    quantity: number;
    unitPrice: number;
    total?: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  totalAmount?: number;
  total?: number;
  deliveryAddress: string;
  contactNumber: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
}

// Payment initiation response
export interface PaymentInitiationResponse {
  success: boolean;
  message: string;
  data?: {
    authorizationUrl?: string;
    reference?: string;
  };
  authorizationUrl?: string;
  reference?: string;
}

// Payment verification response
export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    paymentStatus: string;
    transactionRef: string;
  };
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  order?: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Admin order statistics
export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  onDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
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
  }): Promise<ApiResponse<Order[]> & { statistics?: OrderStatistics }> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await apiClient.get(
      `/api/v1/dashboard/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return response.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (
    orderId: string,
    status: "pending" | "preparing" | "on-delivery" | "delivered" | "cancelled"
  ): Promise<ApiResponse<Order>> => {
    const response = await apiClient.patch(
      `/api/v1/dashboard/admin/orders/${orderId}`,
      { status }
    );
    return response.data;
  },

  // Admin: Delete order
  deleteOrder: async (orderId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/api/v1/dashboard/admin/orders/${orderId}`);
    return response.data;
  },
};

export default orderService;
