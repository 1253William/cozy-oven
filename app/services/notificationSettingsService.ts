import apiClient from "./apiClient";

export type TemplateId = "hearth" | "editorial" | "market" | "parcel" | "atelier";

export type MessageKey =
  | "order.confirmation"
  | "order.momo_received"
  | "order.momo_rejected"
  | "order.status.pending"
  | "order.status.preparing"
  | "order.status.awaiting-pickup"
  | "order.status.on-delivery"
  | "order.status.delivered"
  | "order.status.cancelled"
  | "auth.welcome"
  | "auth.password_reset_otp"
  | "auth.password_changed"
  | "marketing.campaign_wrapper";

export type MessageCopy = {
  emailSubject: string;
  emailBody: string;
  smsBody?: string;
};

export type MessageOverride = {
  emailSubject?: string;
  emailBody?: string;
  smsBody?: string;
};

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  blurb: string;
  swatch: string[];
};

export type NotificationSettingsData = {
  activeTemplateId: TemplateId;
  logoUrl: string;
  messages: Record<string, MessageOverride>;
  messageKeys: MessageKey[];
  smsMessageKeys: MessageKey[];
  templates: TemplateMeta[];
  defaults: Record<MessageKey, MessageCopy>;
  effective: Record<MessageKey, MessageCopy>;
};

export type RenderedPreview = {
  subject: string;
  text: string;
  html: string;
  smsBody?: string;
};

const notificationSettingsService = {
  get: async (): Promise<{ success: boolean; data: NotificationSettingsData }> => {
    const response = await apiClient.get("/api/v1/dashboard/admin/notification-settings");
    return response.data;
  },

  update: async (payload: {
    activeTemplateId?: TemplateId;
    logoUrl?: string;
    messages?: Record<string, MessageOverride>;
  }) => {
    const response = await apiClient.put("/api/v1/dashboard/admin/notification-settings", payload);
    return response.data;
  },

  preview: async (payload: {
    messageKey: MessageKey;
    templateId?: TemplateId;
    draft?: MessageOverride;
    logoUrl?: string;
  }): Promise<{ success: boolean; data: RenderedPreview }> => {
    const response = await apiClient.post(
      "/api/v1/dashboard/admin/notification-settings/preview",
      payload
    );
    return response.data;
  },

  resetMessage: async (messageKey: MessageKey) => {
    const response = await apiClient.post(
      "/api/v1/dashboard/admin/notification-settings/reset-message",
      { messageKey }
    );
    return response.data;
  },
};

export default notificationSettingsService;

export const messageKeyLabel = (key: MessageKey): string => {
  const labels: Record<MessageKey, string> = {
    "order.confirmation": "Order confirmation (paid)",
    "order.momo_received": "MoMo order received",
    "order.momo_rejected": "MoMo payment rejected",
    "order.status.pending": "Status: Pending",
    "order.status.preparing": "Status: Preparing",
    "order.status.awaiting-pickup": "Status: Awaiting pickup",
    "order.status.on-delivery": "Status: On delivery",
    "order.status.delivered": "Status: Delivered",
    "order.status.cancelled": "Status: Cancelled",
    "auth.welcome": "Welcome email",
    "auth.password_reset_otp": "Password reset OTP",
    "auth.password_changed": "Password changed",
    "marketing.campaign_wrapper": "Marketing campaign wrapper",
  };
  return labels[key] || key;
};
