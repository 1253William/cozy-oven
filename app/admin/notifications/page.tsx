"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import notificationService, { type Notification } from "../../services/notificationService";
import notificationSettingsService, {
  messageKeyLabel,
  type MessageCopy,
  type MessageKey,
  type NotificationSettingsData,
  type TemplateId,
} from "../../services/notificationSettingsService";
import {
  AlertCircle,
  Bell,
  CheckCheck,
  Clock,
  Loader2,
  Mail,
  MessageSquare,
  Package,
  Palette,
  ShoppingCart,
  Trash2,
  TrendingUp,
} from "lucide-react";

type HubTab = "templates" | "email" | "sms" | "inbox";

const field =
  "w-full rounded-md border border-[#b9aca2]/70 bg-white px-3 py-2 text-sm text-[#222]";

export default function NotificationsHubPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<HubTab>("templates");
  const [settings, setSettings] = useState<NotificationSettingsData | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedKey, setSelectedKey] = useState<MessageKey>("order.confirmation");
  const [draft, setDraft] = useState<MessageCopy>({
    emailSubject: "",
    emailBody: "",
    smsBody: "",
  });
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // Inbox state
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  const loadSettings = useCallback(async (preferKey?: MessageKey) => {
    setLoadingSettings(true);
    setError("");
    try {
      const response = await notificationSettingsService.get();
      setSettings(response.data);
      const key =
        preferKey && response.data.messageKeys.includes(preferKey)
          ? preferKey
          : selectedKey && response.data.messageKeys.includes(selectedKey)
            ? selectedKey
            : response.data.messageKeys[0] || "order.confirmation";
      setSelectedKey(key);
      setDraft(response.data.effective[key]);
    } catch {
      setError("Could not load notification settings.");
    } finally {
      setLoadingSettings(false);
    }
  }, [selectedKey]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") {
      loadSettings();
    }
  }, [isAuthenticated, user, loadSettings]);

  const refreshPreview = useCallback(
    async (templateId?: TemplateId, messageKey?: MessageKey, copy?: MessageCopy) => {
      if (!settings) return;
      setPreviewLoading(true);
      try {
        const response = await notificationSettingsService.preview({
          messageKey: messageKey || selectedKey,
          templateId: templateId || settings.activeTemplateId,
          draft: copy || draft,
          logoUrl: settings.logoUrl,
        });
        setPreviewHtml(response.data.html);
        setPreviewSubject(response.data.subject);
      } catch {
        setPreviewHtml("<p>Preview failed.</p>");
      } finally {
        setPreviewLoading(false);
      }
    },
    [settings, selectedKey, draft]
  );

  useEffect(() => {
    if (settings && (tab === "templates" || tab === "email")) {
      refreshPreview();
    }
  }, [settings?.activeTemplateId, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (settings) {
      setDraft(settings.effective[selectedKey]);
    }
  }, [selectedKey, settings]);

  const fetchInbox = useCallback(async () => {
    setLoadingInbox(true);
    try {
      const response = await notificationService.getAllNotifications();
      if (response.success && response.data) {
        const list = (response.data.notifications ?? []).filter(
          (n): n is Notification => n != null && typeof n === "object"
        );
        setAllNotifications(list);
        setTotalCount(response.data.total ?? list.length);
        setUnreadCount(response.data.unread ?? list.filter((n) => !n.isRead).length);
      }
    } catch {
      setAllNotifications([]);
    } finally {
      setLoadingInbox(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "inbox" && isAuthenticated && user?.role === "Admin") {
      fetchInbox();
    }
  }, [tab, isAuthenticated, user, fetchInbox]);

  const activateTemplate = async (id: TemplateId) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await notificationSettingsService.update({ activeTemplateId: id });
      await loadSettings();
      setSuccess(`Using ${id} design for customer emails.`);
      await refreshPreview(id);
    } catch {
      setError("Could not activate template.");
    } finally {
      setSaving(false);
    }
  };

  const saveMessage = async () => {
    if (!settings) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await notificationSettingsService.update({
        messages: {
          [selectedKey]: {
            emailSubject: draft.emailSubject,
            emailBody: draft.emailBody,
            smsBody: draft.smsBody,
          },
        },
      });
      await loadSettings(selectedKey);
      setSuccess("Message saved.");
      await refreshPreview(undefined, selectedKey, draft);
    } catch {
      setError("Could not save message.");
    } finally {
      setSaving(false);
    }
  };

  const resetMessage = async () => {
    setSaving(true);
    try {
      await notificationSettingsService.resetMessage(selectedKey);
      await loadSettings(selectedKey);
      setSuccess("Reset to template defaults.");
    } catch {
      setError("Could not reset message.");
    } finally {
      setSaving(false);
    }
  };

  const PAGE_SIZE = 10;
  const filteredSource = useMemo(() => {
    if (filter === "unread") return allNotifications.filter((n) => !n.isRead);
    return allNotifications;
  }, [filter, allNotifications]);
  const totalPages = Math.max(1, Math.ceil(filteredSource.length / PAGE_SIZE) || 1);
  const safePage = Math.min(currentPage, totalPages);
  const displayedNotifications = useMemo(
    () => filteredSource.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredSource, safePage]
  );

  const getTimeAgo = (timestamp: string) => {
    const time = new Date(timestamp);
    if (Number.isNaN(time.getTime())) return "";
    const diffInMinutes = Math.floor((Date.now() - time.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type?: string) => {
    switch (String(type ?? "")) {
      case "order":
        return ShoppingCart;
      case "inventory":
        return AlertCircle;
      case "package":
        return Package;
      case "sales":
        return TrendingUp;
      default:
        return Bell;
    }
  };

  if (!isAuthenticated || user?.role !== "Admin") return null;

  const tabs: { id: HubTab; label: string; icon: typeof Palette }[] = [
    { id: "templates", label: "Templates", icon: Palette },
    { id: "email", label: "Email", icon: Mail },
    { id: "sms", label: "SMS", icon: MessageSquare },
    { id: "inbox", label: "Inbox", icon: Bell },
  ];

  const smsKeys = settings?.smsMessageKeys || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-[#222222]">Notifications</h1>
          <p className="mt-1 text-[#5d6043]">
            Choose email designs, edit customer email &amp; SMS copy, and review in-app alerts.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 border-b border-[#b9aca2]/50 pb-3">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === item.id
                    ? "bg-[#5d6043] text-[#faf9f5]"
                    : "bg-[#b9aca2]/40 text-[#5d6043] hover:bg-[#b9aca2]/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.id === "inbox" && unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
            );
          })}
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}
        {success && <p className="text-sm text-green-800">{success}</p>}

        {loadingSettings && tab !== "inbox" ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#5d6043]" />
          </div>
        ) : null}

        {!loadingSettings && settings && tab === "templates" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {settings.templates.map((template) => {
                const active = settings.activeTemplateId === template.id;
                return (
                  <div
                    key={template.id}
                    className={`rounded-xl border p-4 ${
                      active ? "border-[#bd6325] bg-[#faf9f5]" : "border-[#b9aca2]/50 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-[#222]">{template.name}</h2>
                        <p className="mt-1 text-sm text-[#5d6043]">{template.blurb}</p>
                        <div className="mt-3 flex gap-2">
                          {template.swatch.map((color) => (
                            <span
                              key={color}
                              className="h-5 w-5 rounded-full border border-black/10"
                              style={{ background: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={saving || active}
                        onClick={() => activateTemplate(template.id)}
                        className="shrink-0 rounded-md bg-[#5d6043] px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {active ? "Active" : "Use this design"}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="mt-3 text-xs font-medium text-[#5d6043] underline"
                      onClick={() => refreshPreview(template.id)}
                    >
                      Preview this design
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="rounded-xl border border-[#b9aca2]/50 bg-white p-3">
              <p className="mb-2 text-xs text-[#5d6043]">Preview · {previewSubject || "—"}</p>
              {previewLoading ? (
                <div className="flex h-[480px] items-center justify-center">
                  <Loader2 className="animate-spin text-[#5d6043]" />
                </div>
              ) : (
                <iframe
                  title="Email preview"
                  className="h-[520px] w-full rounded-md border border-[#b9aca2]/40 bg-[#faf9f5]"
                  srcDoc={previewHtml}
                />
              )}
            </div>
          </div>
        )}

        {!loadingSettings && settings && tab === "email" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-[#222]">
                Message
                <select
                  className={`${field} mt-1`}
                  value={selectedKey}
                  onChange={(event) => setSelectedKey(event.target.value as MessageKey)}
                >
                  {settings.messageKeys.map((key) => (
                    <option key={key} value={key}>
                      {messageKeyLabel(key)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-[#222]">
                Subject
                <input
                  className={`${field} mt-1`}
                  value={draft.emailSubject}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, emailSubject: event.target.value }))
                  }
                />
              </label>
              <label className="block text-sm font-medium text-[#222]">
                Body
                <textarea
                  rows={12}
                  className={`${field} mt-1 font-mono text-xs`}
                  value={draft.emailBody}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, emailBody: event.target.value }))
                  }
                />
              </label>
              <p className="text-xs text-[#5d6043]">
                Placeholders: {"{{customerName}}"}, {"{{orderId}}"}, {"{{total}}"}, {"{{itemList}}"},{" "}
                {"{{otp}}"}, {"{{frontendUrl}}"}, {"{{campaignBody}}"}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveMessage}
                  className="rounded-md bg-[#5d6043] px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  Save email copy
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={resetMessage}
                  className="rounded-md border border-[#b9aca2] px-4 py-2 text-sm"
                >
                  Reset to defaults
                </button>
                <button
                  type="button"
                  onClick={() => refreshPreview(undefined, selectedKey, draft)}
                  className="rounded-md border border-[#b9aca2] px-4 py-2 text-sm"
                >
                  Refresh preview
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-[#b9aca2]/50 bg-white p-3">
              <p className="mb-2 text-xs text-[#5d6043]">
                Active design: {settings.activeTemplateId} · {previewSubject}
              </p>
              {previewLoading ? (
                <div className="flex h-[480px] items-center justify-center">
                  <Loader2 className="animate-spin text-[#5d6043]" />
                </div>
              ) : (
                <iframe
                  title="Email preview"
                  className="h-[520px] w-full rounded-md border border-[#b9aca2]/40 bg-[#faf9f5]"
                  srcDoc={previewHtml}
                />
              )}
            </div>
          </div>
        )}

        {!loadingSettings && settings && tab === "sms" && (
          <div className="mx-auto max-w-2xl space-y-4">
            <label className="block text-sm font-medium text-[#222]">
              Message
              <select
                className={`${field} mt-1`}
                value={smsKeys.includes(selectedKey) ? selectedKey : smsKeys[0]}
                onChange={(event) => setSelectedKey(event.target.value as MessageKey)}
              >
                {smsKeys.map((key) => (
                  <option key={key} value={key}>
                    {messageKeyLabel(key)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-[#222]">
              SMS body
              <textarea
                rows={8}
                className={`${field} mt-1`}
                value={draft.smsBody || ""}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, smsBody: event.target.value }))
                }
              />
            </label>
            <p className="text-xs text-[#5d6043]">
              {(draft.smsBody || "").length} characters · keep SMS short where possible
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={saveMessage}
                className="rounded-md bg-[#5d6043] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                Save SMS copy
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={resetMessage}
                className="rounded-md border border-[#b9aca2] px-4 py-2 text-sm"
              >
                Reset to defaults
              </button>
            </div>
          </div>
        )}

        {tab === "inbox" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFilter("all");
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    filter === "all" ? "bg-[#5d6043] text-[#faf9f5]" : "bg-[#b9aca2]/40 text-[#5d6043]"
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilter("unread");
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    filter === "unread"
                      ? "bg-[#5d6043] text-[#faf9f5]"
                      : "bg-[#b9aca2]/40 text-[#5d6043]"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    await notificationService.markAllAsRead();
                    fetchInbox();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm text-[#faf9f5]"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5]">
              {loadingInbox ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#5d6043]" />
                </div>
              ) : displayedNotifications.length === 0 ? (
                <div className="p-12 text-center text-[#5d6043]">No notifications</div>
              ) : (
                <div className="divide-y divide-[#b9aca2]/40">
                  {displayedNotifications.map((notification, idx) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <div
                        key={notification._id || `n-${idx}`}
                        className={`p-4 ${!notification.isRead ? "bg-blue-50/40" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b9aca2]/40 text-[#5d6043]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-[#222]">
                                {String(notification.type || "system")}
                              </h3>
                              <span className="flex items-center gap-1 text-xs text-[#5d6043]">
                                <Clock className="h-3 w-3" />
                                {getTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-[#5d6043]">{notification.message}</p>
                            <div className="mt-2 flex gap-3 text-xs">
                              {!notification.isRead && (
                                <button
                                  type="button"
                                  className="font-medium text-[#5d6043] underline"
                                  onClick={async () => {
                                    await notificationService.markAsRead(notification._id);
                                    fetchInbox();
                                  }}
                                >
                                  Mark as read
                                </button>
                              )}
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 font-medium text-red-700"
                                onClick={async () => {
                                  await notificationService.deleteNotification(notification._id);
                                  fetchInbox();
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-[#b9aca2] px-4 py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-[#5d6043]">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-[#b9aca2] px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
