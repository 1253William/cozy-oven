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
  city?: string;
  specialInstruction?: string;
  contactNumber: string;
  paymentMethod: string; // "hubtel" or other payment methods
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

  // Existing fields
  userId?: string;
  customerId?: string;
  title?: string;
  subtotal?: number;
  deliveryFee?: number;
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


// Payment initiation response (Hubtel integration)
export interface PaymentInitiationResponse {
  success: boolean;
  message: string;
  data?: {
    authorizationUrl?: string;
    checkoutUrl?: string; // Hubtel checkout URL
    reference?: string;
  };
  authorizationUrl?: string;
  checkoutUrl?: string; // Hubtel checkout URL (can be at top level)
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
  pending: number;
  preparing: number;
  delivered: number;
  cancelled?: number;
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
  }): Promise<GetAllOrdersResponse> => {
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
      `/api/v1/dashboard/admin/orders/status/${orderId}/${status}`
    );
    return response.data;
  },

  // Admin: Delete order
  deleteOrder: async (orderId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/api/v1/dashboard/admin/orders/${orderId}`);
    return response.data;
  },

  // Admin: Get single order details by orderId
  getOrderById: async (orderId: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/api/v1/dashboard/admin/orders/${orderId}`);
    return response.data;
  },
};

export default orderService;
