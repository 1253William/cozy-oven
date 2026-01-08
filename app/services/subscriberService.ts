import apiClient from "./apiClient";

// Subscriber interfaces
export interface Subscriber {
  _id: string;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SubscribersResponse {
  success: boolean;
  message: string;
  data: Subscriber[];
}

export interface AddSubscriberRequest {
  fullName: string;
  email: string;
}

export interface AddSubscriberResponse {
  success: boolean;
  message: string;
  data?: Subscriber;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export const subscriberService = {
  // GET /api/v1/subscribers - Fetch all email subscribers
  getAllSubscribers: async (): Promise<SubscribersResponse> => {
    const response = await apiClient.get("/api/v1/subscribers");
    return response.data;
  },

  // POST /api/v1/subscribers - Add a user to Cozy Oven VIP email list
  addSubscriber: async (data: AddSubscriberRequest): Promise<AddSubscriberResponse> => {
    const response = await apiClient.post("/api/v1/subscribers", data);
    return response.data;
  },
};

export default subscriberService;

