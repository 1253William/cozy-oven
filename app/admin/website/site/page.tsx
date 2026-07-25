"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import WebsiteTabs from "../WebsiteTabs";
import cmsService, {
  FALLBACK_SITE_SETTINGS,
  SiteCampaignNavLink,
  SiteSettings,
} from "../../../services/cmsService";

const newCampaignId = () => `campaign-${Date.now().toString(36)}`;

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

export default function AdminWebsiteSitePage() {
  const [form, setForm] = useState<SiteSettings>(FALLBACK_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await cmsService.getAdminSiteSettings();
        if (active) setForm({ ...FALLBACK_SITE_SETTINGS, ...data });
      } catch (err) {
        console.error(err);
        if (active) setError("Could not load site settings.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const campaigns = useMemo(
    () => form.campaignNavLinks || [],
    [form.campaignNavLinks]
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const saved = await cmsService.saveAdminSiteSettings(form);
      setForm({ ...FALLBACK_SITE_SETTINGS, ...saved });
      setSuccess("Saved");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const updateCampaign = (id: string, patch: Partial<SiteCampaignNavLink>) => {
    setForm((prev) => ({
      ...prev,
      campaignNavLinks: (prev.campaignNavLinks || []).map((link) =>
        link.id === id ? { ...link, ...patch } : link
      ),
    }));
    setSuccess("");
  };

  const addCampaign = () => {
    setForm((prev) => ({
      ...prev,
      campaignNavLinks: [
        ...(prev.campaignNavLinks || []),
        {
          id: newCampaignId(),
          label: "Campaign",
          href: "/pages/",
          enabled: true,
          startsAt: null,
          endsAt: null,
        },
      ],
    }));
    setSuccess("");
  };

  const removeCampaign = (id: string) => {
    setForm((prev) => ({
      ...prev,
      campaignNavLinks: (prev.campaignNavLinks || []).filter((link) => link.id !== id),
    }));
    setSuccess("");
  };

  const updateExploreLink = (
    index: number,
    patch: Partial<{ label: string; href: string }>
  ) => {
    setForm((prev) => {
      const exploreLinks = [...(prev.footer.exploreLinks || [])];
      exploreLinks[index] = { ...exploreLinks[index], ...patch };
      return { ...prev, footer: { ...prev.footer, exploreLinks } };
    });
    setSuccess("");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#222222]">Website</h1>
            <div className="mt-3">
              <WebsiteTabs />
            </div>
          </div>
          <button
            type="submit"
            form="site-settings-form"
            disabled={saving || loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-[#faf9f5] transition hover:bg-[#222222] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#5d6043]" />
          </div>
        ) : (
          <form id="site-settings-form" onSubmit={handleSave} className="space-y-6">
            <section className="space-y-3 rounded-2xl border border-[#b9aca2]/60 bg-[#faf9f5] p-4 sm:p-5">
              <h2 className="text-lg font-semibold text-[#222222]">Delivery banner</h2>
              <label className="flex min-h-11 items-center gap-2 text-sm text-[#5d6043]">
                <input
                  type="checkbox"
                  checked={form.deliveryBanner.enabled !== false}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      deliveryBanner: {
                        ...prev.deliveryBanner,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                />
                Show delivery banner
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-[#5d6043]">Message</span>
                <input
                  value={form.deliveryBanner.message || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      deliveryBanner: {
                        ...prev.deliveryBanner,
                        message: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-[#b9aca2] px-3 py-3"
                />
              </label>
            </section>

            <section className="space-y-3 rounded-2xl border border-[#b9aca2]/60 bg-[#faf9f5] p-4 sm:p-5">
              <h2 className="text-lg font-semibold text-[#222222]">Footer</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["tagline", "Tagline"],
                    ["email", "Email"],
                    ["phone", "Phone"],
                    ["address", "Address"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block text-sm sm:col-span-1">
                    <span className="mb-1 block font-semibold text-[#5d6043]">{label}</span>
                    <input
                      value={form.footer[key] || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, [key]: e.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-[#b9aca2] px-3 py-3"
                    />
                  </label>
                ))}
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-semibold text-[#5d6043]">Blurb</span>
                  <textarea
                    rows={3}
                    value={form.footer.blurb || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, blurb: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-3"
                  />
                </label>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-semibold text-[#5d6043]">Explore links</h3>
                {(form.footer.exploreLinks || []).map((link, index) => (
                  <div
                    key={`${link.href}-${index}`}
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    <input
                      value={link.label}
                      onChange={(e) => updateExploreLink(index, { label: e.target.value })}
                      placeholder="Label"
                      className="w-full rounded-lg border border-[#b9aca2] px-3 py-3 text-sm"
                    />
                    <input
                      value={link.href}
                      onChange={(e) => updateExploreLink(index, { href: e.target.value })}
                      placeholder="/shop"
                      className="w-full rounded-lg border border-[#b9aca2] px-3 py-3 text-sm"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-[#b9aca2]/60 bg-[#faf9f5] p-4 sm:p-5">
              <h2 className="text-lg font-semibold text-[#222222]">Social</h2>
              <div className="grid gap-3">
                {(
                  [
                    ["whatsappUrl", "WhatsApp URL"],
                    ["instagramUrl", "Instagram URL"],
                    ["tiktokUrl", "TikTok URL"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block text-sm">
                    <span className="mb-1 block font-semibold text-[#5d6043]">{label}</span>
                    <input
                      value={form.social[key] || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          social: { ...prev.social, [key]: e.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-[#b9aca2] px-3 py-3"
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-[#b9aca2]/60 bg-[#faf9f5] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-[#222222]">Campaign nav links</h2>
                <button
                  type="button"
                  onClick={addCampaign}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043]"
                >
                  <Plus className="h-4 w-4" />
                  Add link
                </button>
              </div>
              {campaigns.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#b9aca2] px-4 py-8 text-center text-sm text-[#5d6043]">
                  No campaign links yet. Add one for Mother’s Day, sales, etc.
                </p>
              ) : (
                campaigns.map((link) => (
                  <article
                    key={link.id}
                    className="space-y-3 rounded-xl border border-[#b9aca2]/50 bg-white p-3"
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={link.label}
                        onChange={(e) => updateCampaign(link.id, { label: e.target.value })}
                        placeholder="Label"
                        className="w-full rounded-lg border border-[#b9aca2] px-3 py-3 text-sm"
                      />
                      <input
                        value={link.href}
                        onChange={(e) => updateCampaign(link.id, { href: e.target.value })}
                        placeholder="/pages/mothers-day"
                        className="w-full rounded-lg border border-[#b9aca2] px-3 py-3 text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={toDateInputValue(link.startsAt)}
                        onChange={(e) =>
                          updateCampaign(link.id, {
                            startsAt: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          })
                        }
                        className="w-full rounded-lg border border-[#b9aca2] px-3 py-3 text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={toDateInputValue(link.endsAt)}
                        onChange={(e) =>
                          updateCampaign(link.id, {
                            endsAt: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          })
                        }
                        className="w-full rounded-lg border border-[#b9aca2] px-3 py-3 text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex min-h-11 items-center gap-2 text-sm text-[#5d6043]">
                        <input
                          type="checkbox"
                          checked={link.enabled !== false}
                          onChange={(e) =>
                            updateCampaign(link.id, { enabled: e.target.checked })
                          }
                        />
                        Enabled
                      </label>
                      <button
                        type="button"
                        onClick={() => removeCampaign(link.id)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
