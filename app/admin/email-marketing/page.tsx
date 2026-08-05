"use client";

import {
  Add01Icon,
  Cancel01Icon,
  CheckmarkSquare02Icon,
  Delete02Icon,
  Loading03Icon,
  Mail01Icon,
  PaintBoardIcon,
  PencilEdit02Icon,
  Refresh01Icon,
  Search01Icon,
  SentIcon,
  SquareIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminLayout from "../components/AdminLayout";
import AdminPageHeader from "../components/AdminPageHeader";
import { useAuth } from "../../context/AuthContext";
import CmsImageField from "../website/CmsImageField";
import marketingService, {
  Campaign,
  CampaignTemplate,
  CampaignTemplateInput,
  MarketingRecipient,
} from "../../services/marketingService";

type RecipientSourceFilter = "all" | "customers" | "subscribers";

const recipientKey = (recipient: MarketingRecipient) => recipient.email.toLowerCase();

const emptyTemplateForm = (): CampaignTemplateInput => ({
  name: "",
  headline: "",
  body: "",
  heroImageUrl: "",
  secondaryImageUrl: "",
  ctaLabel: "",
  ctaUrl: "",
  footerNote: "",
});

const field =
  "w-full rounded-lg border border-[#b9aca2] px-4 py-3 text-sm focus:border-[#5d6043] focus:outline-none focus:ring-2 focus:ring-[#5d6043]/20";

export default function EmailMarketingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [recipients, setRecipients] = useState<MarketingRecipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<MarketingRecipient[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [sourceFilter, setSourceFilter] = useState<RecipientSourceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [manualEmails, setManualEmails] = useState("");
  const [invalidManualEmails, setInvalidManualEmails] = useState<string[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [sending, setSending] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState<CampaignTemplateInput>(emptyTemplateForm());
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoadingTemplates(true);
      const response = await marketingService.getTemplates();
      if (!response.success) throw new Error(response.message || "Failed to fetch templates");
      const rows = response.data || [];
      setTemplates(rows);
      setTemplateId((current) => current || rows[0]?._id || "");
    } catch (err) {
      console.error("Fetch templates error:", err);
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  const fetchRecipients = async () => {
    try {
      setLoadingRecipients(true);
      setError(null);
      const response = await marketingService.getRecipients({ source: sourceFilter });
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch recipients");
      }
      setRecipients(response.data);
    } catch (err) {
      console.error("Fetch recipients error:", err);
      setRecipients([]);
      setError("Failed to fetch recipients");
    } finally {
      setLoadingRecipients(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const response = await marketingService.getCampaigns();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch campaigns");
      }
      setCampaigns(response.data);
    } catch (err) {
      console.error("Fetch campaigns error:", err);
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") {
      fetchRecipients();
      fetchCampaigns();
      fetchTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get("email");
    const name = searchParams.get("name") || "Customer";
    if (!email) return;

    const prefilledRecipient: MarketingRecipient = {
      id: email,
      name,
      email,
      source: "manual",
    };

    setSelectedRecipients((current) => {
      if (current.some((recipient) => recipientKey(recipient) === recipientKey(prefilledRecipient))) {
        return current;
      }
      return [...current, prefilledRecipient];
    });
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") {
      fetchRecipients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilter]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template._id === templateId) || null,
    [templates, templateId]
  );

  useEffect(() => {
    if (!selectedTemplate) return;
    setSubject((current) => current || selectedTemplate.headline);
    setMessage((current) => current || selectedTemplate.body);
  }, [selectedTemplate]);

  useEffect(() => {
    if (!templateId) {
      setPreviewHtml("");
      setPreviewSubject("");
      return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        setPreviewLoading(true);
        const response = await marketingService.previewTemplate({
          templateId,
          subject: subject || selectedTemplate?.headline,
          message: message || selectedTemplate?.body,
          customerName: "Anita",
        });
        if (!active) return;
        if (response.success) {
          setPreviewHtml(response.data.html);
          setPreviewSubject(response.data.subject);
        }
      } catch (err) {
        console.error("Preview error:", err);
      } finally {
        if (active) setPreviewLoading(false);
      }
    }, 400);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [templateId, subject, message, selectedTemplate?.headline, selectedTemplate?.body]);

  const filteredRecipients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return recipients;
    return recipients.filter(
      (recipient) =>
        recipient.name.toLowerCase().includes(query) ||
        recipient.email.toLowerCase().includes(query)
    );
  }, [recipients, searchQuery]);

  const selectedEmailSet = useMemo(
    () => new Set(selectedRecipients.map((recipient) => recipientKey(recipient))),
    [selectedRecipients]
  );

  const allFilteredSelected =
    filteredRecipients.length > 0 &&
    filteredRecipients.every((recipient) => selectedEmailSet.has(recipientKey(recipient)));

  const toggleRecipient = (recipient: MarketingRecipient) => {
    setSelectedRecipients((current) => {
      const key = recipientKey(recipient);
      if (current.some((item) => recipientKey(item) === key)) {
        return current.filter((item) => recipientKey(item) !== key);
      }
      return [...current, recipient];
    });
  };

  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredKeys = new Set(filteredRecipients.map(recipientKey));
      setSelectedRecipients((current) =>
        current.filter((recipient) => !filteredKeys.has(recipientKey(recipient)))
      );
      return;
    }

    setSelectedRecipients((current) => {
      const next = new Map(current.map((recipient) => [recipientKey(recipient), recipient]));
      filteredRecipients.forEach((recipient) => next.set(recipientKey(recipient), recipient));
      return Array.from(next.values());
    });
  };

  const handleAddManualRecipients = () => {
    const entries = manualEmails
      .split(/[\n,;]+/)
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = entries.filter((email) => !emailRegex.test(email));
    const valid = entries.filter((email) => emailRegex.test(email));
    setInvalidManualEmails(Array.from(new Set(invalid)));

    if (valid.length === 0) return;

    setSelectedRecipients((current) => {
      const next = new Map(current.map((recipient) => [recipientKey(recipient), recipient]));
      valid.forEach((email) => {
        if (!next.has(email)) {
          next.set(email, {
            id: email,
            name: email,
            email,
            source: "manual",
          });
        }
      });
      return Array.from(next.values());
    });

    setManualEmails("");
  };

  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setTemplateForm(emptyTemplateForm());
    setShowTemplateForm(false);
  };

  const beginEditTemplate = (template: CampaignTemplate) => {
    setEditingTemplateId(template._id);
    setTemplateForm({
      name: template.name,
      headline: template.headline,
      body: template.body,
      heroImageUrl: template.heroImageUrl || "",
      secondaryImageUrl: template.secondaryImageUrl || "",
      ctaLabel: template.ctaLabel || "",
      ctaUrl: template.ctaUrl || "",
      footerNote: template.footerNote || "",
    });
    setShowTemplateForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.headline.trim() || !templateForm.body.trim()) {
      setError("Template name, headline, and body are required");
      return;
    }
    try {
      setSavingTemplate(true);
      setError(null);
      const payload: CampaignTemplateInput = {
        ...templateForm,
        heroImageUrl: templateForm.heroImageUrl || undefined,
        secondaryImageUrl: templateForm.secondaryImageUrl || undefined,
        ctaLabel: templateForm.ctaLabel || undefined,
        ctaUrl: templateForm.ctaUrl || undefined,
        footerNote: templateForm.footerNote || undefined,
      };
      const response = editingTemplateId
        ? await marketingService.updateTemplate(editingTemplateId, payload)
        : await marketingService.createTemplate(payload);
      if (!response.success) throw new Error(response.message || "Could not save template");
      setSuccess(editingTemplateId ? "Template updated" : "Template created");
      resetTemplateForm();
      await fetchTemplates();
      if (!editingTemplateId && response.data?._id) {
        setTemplateId(response.data._id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Could not save template");
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleArchiveTemplate = async (id: string) => {
    if (!confirm("Archive this template? It will no longer be available for new campaigns.")) return;
    try {
      await marketingService.archiveTemplate(id);
      if (templateId === id) setTemplateId("");
      setSuccess("Template archived");
      await fetchTemplates();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not archive template");
    }
  };

  const handleSendCampaign = async () => {
    if (!templateId) {
      setError("Select a campaign template");
      return;
    }
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (selectedRecipients.length === 0) {
      setError("Select at least one recipient");
      return;
    }

    const confirmed = window.confirm(
      `SentIcon this campaign to ${selectedRecipients.length} recipient${selectedRecipients.length === 1 ? "" : "s"}?`
    );
    if (!confirmed) return;

    try {
      setSending(true);
      setError(null);
      const response = await marketingService.sendCampaign({
        templateId,
        subject,
        message: message.trim() || undefined,
        recipients: selectedRecipients,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to send campaign");
      }

      setSuccess(
        `Campaign sent: ${response.data.sentCount} sent, ${response.data.failedCount} failed`
      );
      setSubject("");
      setMessage("");
      setSelectedRecipients([]);
      fetchCampaigns();
    } catch (err: any) {
      console.error("SentIcon campaign error:", err);
      setError(err?.response?.data?.message || "Failed to send campaign");
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {error && (
          <div className="fixed top-4 right-4 z-50 rounded-lg bg-red-500 px-6 py-3 text-[#faf9f5] shadow-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="fixed top-4 right-4 z-50 rounded-lg bg-green-500 px-6 py-3 text-[#faf9f5] shadow-lg">
            {success}
          </div>
        )}

        <AdminPageHeader
          title="Email Marketing"
          description={
            <p className="text-sm">
              Build image-ready templates, then send campaigns to customers and
              subscribers.
            </p>
          }
          actions={
            <button
              onClick={() => {
                fetchRecipients();
                fetchCampaigns();
                fetchTemplates();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#b9aca2] bg-[#faf9f5] px-4 py-2 text-sm font-semibold text-[#5d6043] hover:bg-[#faf9f5]"
            >
              <AdminIcon icon={Refresh01Icon} size={16} />
              Refresh
            </button>
          }
        />

        <section className="rounded-lg bg-[#faf9f5] p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#222222]">
              <AdminIcon icon={PaintBoardIcon} size={20} />
              Campaign templates
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingTemplateId(null);
                setTemplateForm(emptyTemplateForm());
                setShowTemplateForm(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm font-semibold text-[#faf9f5] hover:bg-[#222222]"
            >
              <AdminIcon icon={Add01Icon} size={16} />
              New template
            </button>
          </div>

          {showTemplateForm && (
            <div className="mb-6 space-y-4 rounded-lg border border-[#b9aca2]/60 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#222222]">
                  {editingTemplateId ? "Edit template" : "Create template"}
                </h3>
                <button type="button" onClick={resetTemplateForm} className="p-1 text-[#5d6043]">
                  <AdminIcon icon={Cancel01Icon} size={20} />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold text-[#5d6043]">
                  Template name
                  <input
                    className={`${field} mt-1`}
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="Weekend special"
                  />
                </label>
                <label className="text-sm font-semibold text-[#5d6043]">
                  Headline
                  <input
                    className={`${field} mt-1`}
                    value={templateForm.headline}
                    onChange={(e) => setTemplateForm({ ...templateForm, headline: e.target.value })}
                    placeholder="Fresh from the oven this weekend"
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold text-[#5d6043]">
                Body
                <textarea
                  className={`${field} mt-1 resize-y`}
                  rows={5}
                  value={templateForm.body}
                  onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                  placeholder={"Hello {{customerName}},\n\nThis weekend we're baking..."}
                />
                <span className="mt-1 block text-xs font-normal">Use {"{{customerName}}"} for personalization.</span>
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <CmsImageField
                  label="Hero image"
                  value={templateForm.heroImageUrl}
                  onChange={(url) => setTemplateForm({ ...templateForm, heroImageUrl: url })}
                />
                <CmsImageField
                  label="Secondary image (optional)"
                  value={templateForm.secondaryImageUrl}
                  onChange={(url) => setTemplateForm({ ...templateForm, secondaryImageUrl: url })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold text-[#5d6043]">
                  CTA label
                  <input
                    className={`${field} mt-1`}
                    value={templateForm.ctaLabel}
                    onChange={(e) => setTemplateForm({ ...templateForm, ctaLabel: e.target.value })}
                    placeholder="Order now"
                  />
                </label>
                <label className="text-sm font-semibold text-[#5d6043]">
                  CTA URL
                  <input
                    className={`${field} mt-1`}
                    value={templateForm.ctaUrl}
                    onChange={(e) => setTemplateForm({ ...templateForm, ctaUrl: e.target.value })}
                    placeholder="https://cozyoven.store"
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold text-[#5d6043]">
                Footer note (optional)
                <input
                  className={`${field} mt-1`}
                  value={templateForm.footerNote}
                  onChange={(e) => setTemplateForm({ ...templateForm, footerNote: e.target.value })}
                  placeholder="Reply to this email with questions."
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={savingTemplate}
                  onClick={handleSaveTemplate}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm font-semibold text-[#faf9f5] disabled:opacity-50"
                >
                  {savingTemplate ? <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" /> : null}
                  {editingTemplateId ? "Save template" : "Create template"}
                </button>
                <button
                  type="button"
                  onClick={resetTemplateForm}
                  className="rounded-lg border border-[#b9aca2] px-4 py-2 text-sm font-semibold text-[#5d6043]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loadingTemplates ? (
            <div className="flex items-center gap-2 text-sm text-[#5d6043]">
              <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" />
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <p className="text-sm text-[#5d6043]">
              No templates yet. Create one with a hero image and headline before sending.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <article
                  key={template._id}
                  className={`overflow-hidden rounded-lg border bg-white ${
                    templateId === template._id ? "border-[#5d6043]" : "border-[#b9aca2]/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateId(template._id);
                      setSubject(template.headline);
                      setMessage(template.body);
                    }}
                    className="block w-full text-left"
                  >
                    <div className="relative h-28 bg-[#b9aca2]/30">
                      {template.heroImageUrl ? (
                        <Image
                          src={template.heroImageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="240px"
                        />
                      ) : null}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-[#222222]">{template.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-[#5d6043]">{template.headline}</p>
                    </div>
                  </button>
                  <div className="flex border-t border-[#b9aca2]/40">
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => beginEditTemplate(template)}
                      className="flex-1 p-2 text-[#5d6043] hover:bg-[#faf9f5]"
                    >
                      <AdminIcon icon={PencilEdit02Icon} size={16} className="mx-auto" />
                    </button>
                    <button
                      type="button"
                      title="Archive"
                      onClick={() => handleArchiveTemplate(template._id)}
                      className="flex-1 p-2 text-red-700 hover:bg-red-50"
                    >
                      <AdminIcon icon={Delete02Icon} size={16} className="mx-auto" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <section className="rounded-lg bg-[#faf9f5] p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#222222]">
                  <AdminIcon icon={UserMultiple02Icon} size={20} />
                  Recipients
                </h2>
                <p className="text-sm text-[#5d6043]">
                  {selectedRecipients.length} selected from {recipients.length} available
                </p>
              </div>
              <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2">
                <select
                  value={sourceFilter}
                  onChange={(event) => setSourceFilter(event.target.value as RecipientSourceFilter)}
                  className="w-full min-w-0 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm focus:border-[#5d6043] focus:outline-none focus:ring-2 focus:ring-[#5d6043]/20"
                >
                  <option value="all">Customers + subscribers</option>
                  <option value="customers">Customers only</option>
                  <option value="subscribers">Subscribers only</option>
                </select>
                <div className="relative min-w-0">
                  <AdminIcon icon={Search01Icon} size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#b9aca2]" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search01Icon recipients..."
                    className="w-full min-w-0 rounded-lg border border-[#b9aca2] py-2 pl-9 pr-3 text-sm focus:border-[#5d6043] focus:outline-none focus:ring-2 focus:ring-[#5d6043]/20"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-3">
              <button
                onClick={toggleAllFiltered}
                disabled={filteredRecipients.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm font-semibold text-[#faf9f5] hover:bg-[#222222] disabled:opacity-50"
              >
                {allFilteredSelected ? <AdminIcon icon={CheckmarkSquare02Icon} size={16} /> : <AdminIcon icon={SquareIcon} size={16} />}
                {allFilteredSelected ? "Unselect visible" : "Select visible"}
              </button>
              <button
                onClick={() => setSelectedRecipients([])}
                disabled={selectedRecipients.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-[#b9aca2] px-4 py-2 text-sm font-semibold text-[#5d6043] hover:bg-[#faf9f5] disabled:opacity-50"
              >
                <AdminIcon icon={Delete02Icon} size={16} />
                Clear selected
              </button>
            </div>

            <div className="max-h-[520px] overflow-y-auto rounded-lg border border-[#b9aca2]/60">
              {loadingRecipients ? (
                <div className="flex items-center justify-center gap-2 p-10 text-[#5d6043]">
                  <AdminIcon icon={Loading03Icon} size={20} className="animate-spin" />
                  Loading recipients...
                </div>
              ) : filteredRecipients.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#5d6043]">No recipients found.</div>
              ) : (
                filteredRecipients.map((recipient) => {
                  const isSelected = selectedEmailSet.has(recipientKey(recipient));
                  return (
                    <button
                      key={`${recipient.source}-${recipient.email}`}
                      onClick={() => toggleRecipient(recipient)}
                      className="flex w-full items-center gap-3 border-b border-[#b9aca2]/40 px-4 py-3 text-left last:border-b-0 hover:bg-[#faf9f5]"
                    >
                      {isSelected ? (
                        <AdminIcon icon={CheckmarkSquare02Icon} size={20} className="text-[#5d6043]" />
                      ) : (
                        <AdminIcon icon={SquareIcon} size={20} className="text-[#b9aca2]" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#222222]">{recipient.name}</p>
                        <p className="truncate text-xs text-[#5d6043]">{recipient.email}</p>
                      </div>
                      <span className="rounded-full bg-[#b9aca2] px-2 py-1 text-xs capitalize text-[#5d6043]">
                        {recipient.source}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-lg bg-[#faf9f5] p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#222222]">
                <AdminIcon icon={Mail01Icon} size={20} />
                Compose Campaign
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#5d6043]">Template</label>
                  <select
                    value={templateId}
                    onChange={(event) => {
                      const nextId = event.target.value;
                      setTemplateId(nextId);
                      const next = templates.find((item) => item._id === nextId);
                      if (next) {
                        setSubject(next.headline);
                        setMessage(next.body);
                      }
                    }}
                    className={field}
                  >
                    <option value="">Select a template</option>
                    {templates.map((template) => (
                      <option key={template._id} value={template._id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-lg border border-[#b9aca2]/60 bg-[#faf9f5] p-4">
                  <label className="mb-2 block text-sm font-semibold text-[#5d6043]">
                    Add manual recipients
                  </label>
                  <textarea
                    value={manualEmails}
                    onChange={(event) => setManualEmails(event.target.value)}
                    rows={3}
                    placeholder="name@example.com, second@example.com"
                    className={`${field} resize-none`}
                  />
                  {invalidManualEmails.length > 0 && (
                    <p className="mt-2 text-xs text-red-600">
                      Invalid: {invalidManualEmails.join(", ")}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleAddManualRecipients}
                    className="mt-3 rounded-lg border border-[#b9aca2] bg-[#faf9f5] px-4 py-2 text-sm font-semibold text-[#5d6043] hover:bg-[#faf9f5]"
                  >
                    Add emails to recipients
                  </button>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#5d6043]">Subject</label>
                  <input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Fresh treats from Cozy Oven"
                    className={field}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#5d6043]">
                    Body override (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={7}
                    placeholder="Leave as template body, or override for this send..."
                    className={`${field} resize-none`}
                  />
                </div>
                <div className="rounded-lg border border-[#b9aca2]/60 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#222222]">Preview</p>
                    {previewLoading ? <AdminIcon icon={Loading03Icon} size={16} className="animate-spin text-[#5d6043]" /> : null}
                  </div>
                  {previewSubject ? (
                    <p className="mb-2 text-xs text-[#5d6043]">Subject: {previewSubject}</p>
                  ) : null}
                  {previewHtml ? (
                    <iframe
                      title="Campaign preview"
                      srcDoc={previewHtml}
                      className="h-72 w-full rounded border border-[#b9aca2]/40 bg-white"
                    />
                  ) : (
                    <p className="text-sm text-[#5d6043]">Select a template to preview.</p>
                  )}
                </div>
                <div className="rounded-lg bg-[#faf9f5] p-4 text-sm text-[#5d6043]">
                  Sending to <span className="font-bold">{selectedRecipients.length}</span> recipient
                  {selectedRecipients.length === 1 ? "" : "s"}.
                </div>
                <button
                  onClick={handleSendCampaign}
                  disabled={sending || selectedRecipients.length === 0 || !templateId}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5d6043] px-4 py-3 font-semibold text-[#faf9f5] hover:bg-[#222222] disabled:opacity-50"
                >
                  {sending ? <AdminIcon icon={Loading03Icon} size={20} className="animate-spin" /> : <AdminIcon icon={SentIcon} size={20} />}
                  {sending ? "Sending..." : "SentIcon Campaign"}
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-[#faf9f5] p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-[#222222]">Campaign History</h2>
              {loadingCampaigns ? (
                <div className="flex items-center gap-2 text-sm text-[#5d6043]">
                  <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" />
                  Loading campaigns...
                </div>
              ) : campaigns.length === 0 ? (
                <p className="text-sm text-[#5d6043]">No campaigns sent yet.</p>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <div key={campaign._id} className="rounded-lg border border-[#b9aca2]/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#222222]">{campaign.subject}</p>
                          <p className="text-xs text-[#5d6043]">
                            {new Date(campaign.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#b9aca2] px-2 py-1 text-xs capitalize text-[#5d6043]">
                          {campaign.status}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded bg-[#faf9f5] p-2">
                          <p className="font-bold text-[#222222]">
                            {campaign.recipientCount ?? campaign.recipients?.length ?? 0}
                          </p>
                          <p className="text-[#5d6043]">Recipients</p>
                        </div>
                        <div className="rounded bg-green-50 p-2">
                          <p className="font-bold text-green-700">{campaign.sentCount}</p>
                          <p className="text-green-700">Sent</p>
                        </div>
                        <div className="rounded bg-red-50 p-2">
                          <p className="font-bold text-red-700">{campaign.failedCount}</p>
                          <p className="text-red-700">Failed</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
