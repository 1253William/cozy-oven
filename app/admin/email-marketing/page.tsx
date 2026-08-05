"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Add01Icon, ArrowLeft01Icon, ArrowRight01Icon, Refresh01Icon } from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";
import AdminLayout from "../components/AdminLayout";
import AdminPageHeader from "../components/AdminPageHeader";
import { useAuth } from "../../context/AuthContext";
import marketingService, {
  Campaign,
  CampaignSkin,
  CampaignTemplate,
  CampaignTemplateInput,
  MarketingRecipient,
} from "../../services/marketingService";
import AudiencePanel from "./AudiencePanel";
import CampaignHistoryPanel from "./CampaignHistoryPanel";
import ComposeCampaignPanel from "./ComposeCampaignPanel";
import ComposeStepIndicator from "./ComposeStepIndicator";
import MarketingTabs from "./MarketingTabs";
import SkinSelectStep from "./SkinSelectStep";
import TemplateEditorForm from "./TemplateEditorForm";
import TemplateLibraryPanel from "./TemplateLibraryPanel";
import TemplateSelectStep from "./TemplateSelectStep";
import {
  DEFAULT_SKIN_ID,
  emptyTemplateForm,
  parseComposeStep,
  parseMarketingTab,
  recipientKey,
  validateCtaPair,
  type ComposeStep,
  type MarketingTab,
  type RecipientSourceFilter,
} from "./emailMarketingUtils";

export default function EmailMarketingPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout>
          <div className="text-sm text-[#5d6043]">Loading email marketing...</div>
        </AdminLayout>
      }
    >
      <EmailMarketingPageInner />
    </Suspense>
  );
}

function EmailMarketingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const tab: MarketingTab = parseMarketingTab(searchParams.get("tab"));
  const step: ComposeStep = parseComposeStep(searchParams.get("step"));

  const [recipients, setRecipients] = useState<MarketingRecipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<MarketingRecipient[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [skins, setSkins] = useState<CampaignSkin[]>([]);
  const [skinId, setSkinId] = useState(DEFAULT_SKIN_ID);
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
  const [loadingSkins, setLoadingSkins] = useState(true);
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

  const setTab = useCallback(
    (nextTab: MarketingTab, nextStep?: ComposeStep) => {
      const params = new URLSearchParams();
      params.set("tab", nextTab);
      if (nextTab === "compose") {
        params.set("step", nextStep || (nextTab === tab ? step : "audience"));
      }
      router.push(`/admin/email-marketing?${params.toString()}`);
    },
    [router, tab, step]
  );

  const setStep = useCallback(
    (nextStep: ComposeStep) => {
      const params = new URLSearchParams();
      params.set("tab", "compose");
      params.set("step", nextStep);
      router.push(`/admin/email-marketing?${params.toString()}`);
    },
    [router]
  );

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

  const fetchRecipients = useCallback(async () => {
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
  }, [sourceFilter]);

  const fetchCampaigns = useCallback(async () => {
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
  }, []);

  const fetchSkins = useCallback(async () => {
    try {
      setLoadingSkins(true);
      const response = await marketingService.getSkins();
      if (!response.success) throw new Error(response.message || "Failed to fetch skins");
      setSkins(response.data || []);
      setSkinId((current) => current || response.defaultSkinId || DEFAULT_SKIN_ID);
    } catch (err) {
      console.error("Fetch skins error:", err);
      setSkins([]);
    } finally {
      setLoadingSkins(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") {
      fetchRecipients();
      fetchCampaigns();
      fetchTemplates();
      fetchSkins();
    }
  }, [isAuthenticated, user, fetchRecipients, fetchCampaigns, fetchTemplates, fetchSkins]);

  useEffect(() => {
    if (typeof window === "undefined") return;
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
  }, [searchParams]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

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
    if (tab !== "compose" || step !== "compose" || !templateId) {
      if (!templateId) {
        setPreviewHtml("");
        setPreviewSubject("");
      }
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
          skinId,
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
  }, [tab, step, templateId, skinId, subject, message, selectedTemplate?.headline, selectedTemplate?.body]);

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

  const beginCreateTemplate = () => {
    setEditingTemplateId(null);
    setTemplateForm(emptyTemplateForm());
    setShowTemplateForm(true);
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
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.headline.trim() || !templateForm.body.trim()) {
      setError("Template name, headline, and body are required");
      return;
    }
    const ctaError = validateCtaPair(templateForm.ctaLabel, templateForm.ctaUrl);
    if (ctaError) {
      setError(ctaError);
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
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } }; message?: string }).response?.data
              ?.message || (err as { message?: string }).message
          : err instanceof Error
            ? err.message
            : "Could not save template";
      setError(message || "Could not save template");
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleArchiveTemplate = async (id: string) => {
    if (!confirm("Archive this template? It will no longer be available for new campaigns.")) {
      return;
    }
    try {
      await marketingService.archiveTemplate(id);
      if (templateId === id) setTemplateId("");
      setSuccess("Template archived");
      await fetchTemplates();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || "Could not archive template");
    }
  };

  const handleUseInCompose = (template: CampaignTemplate) => {
    setTemplateId(template._id);
    setSubject(template.headline);
    setMessage(template.body);
    setTab("compose", "template");
  };

  const handleSelectTemplateForCompose = (id: string) => {
    setTemplateId(id);
    const next = templates.find((item) => item._id === id);
    if (next) {
      setSubject(next.headline);
      setMessage(next.body);
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
      `Send this campaign to ${selectedRecipients.length} recipient${
        selectedRecipients.length === 1 ? "" : "s"
      }?`
    );
    if (!confirmed) return;

    try {
      setSending(true);
      setError(null);
      const response = await marketingService.sendCampaign({
        templateId,
        subject,
        message: message.trim() || undefined,
        skinId,
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
      setTab("history");
    } catch (err: unknown) {
      console.error("Send campaign error:", err);
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || "Failed to send campaign");
    } finally {
      setSending(false);
    }
  };

  const canGoAudienceNext = selectedRecipients.length > 0;
  const canGoTemplateNext = Boolean(templateId);
  const canGoSkinNext = Boolean(skinId);

  const skinNameById = useMemo(() => {
    const map = new Map<string, string>();
    skins.forEach((skin) => map.set(skin.id, skin.name));
    return map;
  }, [skins]);

  const headerActions =
    tab === "templates" ? (
      <button
        type="button"
        onClick={beginCreateTemplate}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm font-semibold text-[#faf9f5] hover:bg-[#222222]"
      >
        <AdminIcon icon={Add01Icon} size={16} />
        New template
      </button>
    ) : (
      <button
        type="button"
        onClick={() => {
          fetchRecipients();
          fetchCampaigns();
          fetchTemplates();
          fetchSkins();
        }}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#b9aca2] bg-[#faf9f5] px-4 py-2 text-sm font-semibold text-[#5d6043] hover:bg-[#eeeae0]"
      >
        <AdminIcon icon={Refresh01Icon} size={16} />
        Refresh
      </button>
    );

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
              {tab === "compose"
                ? "Audience → content template → skin → compose and send."
                : tab === "templates"
                  ? "Build image-ready campaign templates with live preview."
                  : "Review past campaign sends and delivery counts."}
            </p>
          }
          actions={headerActions}
        />

        <MarketingTabs active={tab} />

        {tab === "compose" ? (
          <div className="space-y-4">
            <ComposeStepIndicator active={step} />

            {step === "audience" ? (
              <AudiencePanel
                recipients={recipients}
                filteredRecipients={filteredRecipients}
                selectedRecipients={selectedRecipients}
                selectedEmailSet={selectedEmailSet}
                allFilteredSelected={allFilteredSelected}
                sourceFilter={sourceFilter}
                searchQuery={searchQuery}
                manualEmails={manualEmails}
                invalidManualEmails={invalidManualEmails}
                loadingRecipients={loadingRecipients}
                onSourceFilterChange={setSourceFilter}
                onSearchQueryChange={setSearchQuery}
                onManualEmailsChange={setManualEmails}
                onToggleRecipient={toggleRecipient}
                onToggleAllFiltered={toggleAllFiltered}
                onClearSelected={() => setSelectedRecipients([])}
                onAddManualRecipients={handleAddManualRecipients}
              />
            ) : null}

            {step === "template" ? (
              <TemplateSelectStep
                templates={templates}
                loadingTemplates={loadingTemplates}
                templateId={templateId}
                onSelect={handleSelectTemplateForCompose}
              />
            ) : null}

            {step === "skin" ? (
              <SkinSelectStep
                skins={skins}
                loading={loadingSkins}
                skinId={skinId}
                onSelect={setSkinId}
              />
            ) : null}

            {step === "compose" ? (
              <ComposeCampaignPanel
                selectedTemplate={selectedTemplate}
                subject={subject}
                message={message}
                previewHtml={previewHtml}
                previewSubject={previewSubject}
                previewLoading={previewLoading}
                selectedCount={selectedRecipients.length}
                sending={sending}
                onSubjectChange={setSubject}
                onMessageChange={setMessage}
                onSend={handleSendCampaign}
              />
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#b9aca2]/50 bg-[#faf9f5] px-4 py-3">
              <div>
                {step !== "audience" ? (
                  <button
                    type="button"
                    onClick={() =>
                      setStep(
                        step === "compose"
                          ? "skin"
                          : step === "skin"
                            ? "template"
                            : "audience"
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-[#b9aca2] px-4 py-2 text-sm font-semibold text-[#5d6043] hover:bg-[#eeeae0]"
                  >
                    <AdminIcon icon={ArrowLeft01Icon} size={16} />
                    Back
                  </button>
                ) : (
                  <span className="text-sm text-[#5d6043]">
                    Select at least one recipient to continue.
                  </span>
                )}
              </div>
              <div>
                {step === "audience" ? (
                  <button
                    type="button"
                    disabled={!canGoAudienceNext}
                    onClick={() => setStep("template")}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm font-semibold text-[#faf9f5] hover:bg-[#222222] disabled:opacity-50"
                  >
                    Next: Template
                    <AdminIcon icon={ArrowRight01Icon} size={16} />
                  </button>
                ) : null}
                {step === "template" ? (
                  <button
                    type="button"
                    disabled={!canGoTemplateNext}
                    onClick={() => setStep("skin")}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm font-semibold text-[#faf9f5] hover:bg-[#222222] disabled:opacity-50"
                  >
                    Next: Skin
                    <AdminIcon icon={ArrowRight01Icon} size={16} />
                  </button>
                ) : null}
                {step === "skin" ? (
                  <button
                    type="button"
                    disabled={!canGoSkinNext}
                    onClick={() => setStep("compose")}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm font-semibold text-[#faf9f5] hover:bg-[#222222] disabled:opacity-50"
                  >
                    Next: Compose
                    <AdminIcon icon={ArrowRight01Icon} size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "templates" ? (
          <div className="space-y-6">
            {showTemplateForm ? (
              <TemplateEditorForm
                form={templateForm}
                editingTemplateId={editingTemplateId}
                saving={savingTemplate}
                onChange={setTemplateForm}
                onSave={handleSaveTemplate}
                onCancel={resetTemplateForm}
              />
            ) : null}
            <TemplateLibraryPanel
              templates={templates}
              loading={loadingTemplates}
              onEdit={beginEditTemplate}
              onArchive={handleArchiveTemplate}
              onUseInCompose={handleUseInCompose}
              onCreateNew={beginCreateTemplate}
            />
          </div>
        ) : null}

        {tab === "history" ? (
          <CampaignHistoryPanel
            campaigns={campaigns}
            loading={loadingCampaigns}
            skinNameById={skinNameById}
          />
        ) : null}
      </div>
    </AdminLayout>
  );
}
